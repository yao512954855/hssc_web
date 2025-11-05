import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'
// @ts-ignore
import archiver from 'archiver'

function zipDirectoryToFile(srcDir: string, zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    output.on('close', () => resolve())
    output.on('error', (err) => reject(err))
    archive.on('error', (err: any) => reject(err))
    archive.pipe(output)
    archive.directory(srcDir, false)
    archive.finalize()
  })
}

export async function GET() {
  const publicDir = path.join(process.cwd(), 'public', 'generated-images')
  const exists = fs.existsSync(publicDir)
  if (!exists) {
    return NextResponse.json({ error: '暂无图片可导出' }, { status: 404 })
  }

  const zipName = `images_all_${Date.now()}.zip`
  const zipPath = path.join(os.tmpdir(), zipName)
  await zipDirectoryToFile(publicDir, zipPath)
  const buf = await fs.promises.readFile(zipPath)
  // 可选清理临时文件
  try { fs.unlinkSync(zipPath) } catch {}

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipName}"`,
      'Content-Length': String(buf.length),
    },
  })
}