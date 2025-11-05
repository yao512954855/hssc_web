import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { student_no, image_name, total_time_seconds } = body as { student_no?: string; image_name?: string; total_time_seconds?: number }
    if (!student_no || !image_name || typeof total_time_seconds !== 'number') {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    }

    // 设置会话时区为北京时间，确保 TIMESTAMP 写入为本地时间
    await prisma.$executeRaw`SET time_zone = '+08:00'`

    const record = await prisma.generateRecord.findFirst({
      where: { studentNo: student_no, imageNo: { contains: image_name } },
      orderBy: { generateTime: 'desc' },
    })
    if (!record) return NextResponse.json({ error: '记录不存在' }, { status: 404 })

    // 使用 NOW() 由数据库生成提交时间（受 time_zone 影响），避免 Node/驱动的时区差异
    await prisma.$executeRaw`UPDATE generate_record SET status = ${image_name}, submit_time = CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00'), total_time_seconds = ${total_time_seconds} WHERE id = ${record.id}`
    const updated = await prisma.generateRecord.findUnique({ where: { id: record.id } })
    return NextResponse.json({ ok: true, record_id: updated!.id })
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}