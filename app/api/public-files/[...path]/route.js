import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request, context) {
  try {
    // Next 16 可能传 Promise，需要兼容处理
    let params = context?.params
    if (params && typeof params.then === 'function') {
      params = await params
    }
    const segments = Array.isArray(params?.path) ? params.path : []
    const rel = segments.join('/')

    // 仅允许访问 generated-images 目录下的文件
    const baseDir = path.join(process.cwd(), 'public', 'generated-images')
    const filePath = path.join(baseDir, rel)
    const absResolved = path.resolve(filePath)
    if (!absResolved.startsWith(baseDir)) {
      return new NextResponse('forbidden', { status: 403 })
    }
    if (!fs.existsSync(absResolved)) {
      return new NextResponse('not found', { status: 404 })
    }
    const buf = await fs.promises.readFile(absResolved)
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'image/png',
        // 避免 404 缓存，保证新文件即时可见
        'Cache-Control': 'public, max-age=0, no-store',
      },
    })
  } catch (e) {
    return new NextResponse('server error', { status: 500 })
  }
}

export async function HEAD(request, context) {
  try {
    let params = context?.params
    if (params && typeof params.then === 'function') {
      params = await params
    }
    const segments = Array.isArray(params?.path) ? params.path : []
    const rel = segments.join('/')

    const baseDir = path.join(process.cwd(), 'public', 'generated-images')
    const filePath = path.join(baseDir, rel)
    const absResolved = path.resolve(filePath)
    if (!absResolved.startsWith(baseDir)) {
      return new NextResponse(null, { status: 403 })
    }
    if (!fs.existsSync(absResolved)) {
      return new NextResponse(null, { status: 404 })
    }
    return new NextResponse(null, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=0, no-store',
      },
    })
  } catch (e) {
    return new NextResponse(null, { status: 500 })
  }
}