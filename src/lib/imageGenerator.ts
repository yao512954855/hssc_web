import fs from 'fs'
import path from 'path'

type GenerateResult = { filenames: string[]; filepaths: string[]; urls: string[] }

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status} while downloading ${url}`)
  const ct = res.headers.get('content-type') || ''
  if (!ct.startsWith('image/')) throw new Error(`Not an image content-type for ${url}: ${ct}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.promises.writeFile(dest, buf)
}

async function generateWithArk(prompt: string, count: number): Promise<Buffer[]> {
  const apiKey = process.env.ARK_API_KEY || process.env.OPENAI_API_KEY || process.env.SEEDREAM_API_KEY
  const baseUrl = process.env.ARK_BASE_URL || process.env.SEEDREAM_API_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3'
  if (!apiKey) throw new Error('Missing ARK_API_KEY/OPENAI_API_KEY')

  // OpenAI风格端点；部分Ark环境仅支持其中之一
  const endpoints = ['images', 'images/generations']

  async function requestOnce(n: number) {
    const body = {
      model: 'doubao-seedream-4-0-250828',
      prompt,
      size: '2K',
      response_format: 'b64_json',
      stream: false,
      n,
    }
    let data: any = null
    for (const ep of endpoints) {
      const url = `${baseUrl.replace(/\/$/, '')}/${ep}`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        data = await res.json()
        break
      }
    }
    if (!data) return []
    const items: string[] = Array.isArray(data?.data)
      ? (data.data as any[])
          .map((d) => (typeof d?.b64_json === 'string' ? d.b64_json : null))
          .filter((x): x is string => !!x)
      : []
    return items.map((b64) => Buffer.from(b64, 'base64'))
  }

  const outputs: Buffer[] = []
  let attempts = 0
  while (outputs.length < count && attempts < 3) {
    attempts++
    const need = count - outputs.length
    const bufs = await requestOnce(need)
    if (bufs.length === 0) break
    outputs.push(...bufs)
  }

  if (outputs.length < count) {
    throw new Error('Ark returned insufficient images')
  }
  return outputs.slice(0, count)
}

export async function generateImagesToPublic(studentNo: string, nextIndices: number[], promptText?: string): Promise<GenerateResult> {
  const publicDir = path.join(process.cwd(), 'public', 'generated-images', studentNo)
  fs.mkdirSync(publicDir, { recursive: true })

  const filenames = nextIndices.map((i) => `${studentNo}_${i}.png`)
  const filepaths = filenames.map((f) => path.join(publicDir, f))

  // Compose prompt with user's text and enforce style & aspect ratio
  const defaultSuffix = '图片风格：中国风，比例：4:3'
  const base = promptText && promptText.trim().length > 0 ? promptText.trim() : '请生成两张连贯的中国风画面'
  const hasStyle = /风格：?\s*中国风/.test(base)
  const hasRatio = /比例：?\s*4\s*[:：]\s*3/.test(base)
  const suffix = hasStyle && hasRatio ? '' : defaultSuffix
  const prompt = suffix ? `${base}\n${suffix}` : base

  try {
    // 等待豆包生成两张图片后再一次性写入并返回
    const bufs = await generateWithArk(prompt, filepaths.length)
    await Promise.all(bufs.map((buf, idx) => fs.promises.writeFile(filepaths[idx], buf)))
  } catch (err) {
    // Fallback to placeholder PNGs to keep class flow uninterrupted
    const placeholderUrls = [
      'https://placehold.co/800x600.png?text=Poem+1',
      'https://placehold.co/800x600.png?text=Poem+2',
    ]
    await Promise.all(filepaths.map((fp, idx) => downloadToFile(placeholderUrls[idx % placeholderUrls.length], fp)))
  }

  const urls = filenames.map((f) => `/generated-images/${studentNo}/${f}`)
  return { filenames, filepaths, urls }
}