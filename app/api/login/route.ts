import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { student_no } = body as { student_no?: string }
    if (!student_no) return NextResponse.json({ error: '缺少学生编号' }, { status: 400 })

    const student = await prisma.studentId.findUnique({ where: { studentNo: student_no } })
    if (!student) return NextResponse.json({ error: '编号错误，请重试' }, { status: 401 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}