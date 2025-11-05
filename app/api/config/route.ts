import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  let cfg = await prisma.config.findFirst()
  if (!cfg) {
    cfg = await prisma.config.create({
      data: {
        poetry: {
          title: '静夜思',
          author: '李白',
          content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
          annotation: '本诗表达了诗人夜思乡愁之情。',
        },
        taskPrompt: [
          '阅读古诗理解诗意',
          '撰写提示词引导AI生成符合意境的中国风画面',
        ],
      },
    })
  }
  return NextResponse.json(cfg)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { poetry, task_prompt } = body as { poetry: any; task_prompt: any }
    if (!poetry || !task_prompt) return NextResponse.json({ error: '缺少配置字段' }, { status: 400 })

    let cfg = await prisma.config.findFirst()
    if (!cfg) {
      cfg = await prisma.config.create({ data: { poetry, taskPrompt: task_prompt } })
    } else {
      cfg = await prisma.config.update({ where: { id: cfg.id }, data: { poetry, taskPrompt: task_prompt, updateTime: new Date() } })
    }
    return NextResponse.json(cfg)
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}