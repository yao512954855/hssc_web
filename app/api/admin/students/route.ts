import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

function requireAdmin(req: Request): boolean {
  const cookie = req.headers.get('cookie') || ''
  return cookie.includes('admin=')
}

export async function GET(req: Request) {
  try {
    if (!requireAdmin(req)) return NextResponse.json({ error: '未授权' }, { status: 401 })
    const list = await prisma.studentId.findMany({ orderBy: { id: 'asc' } })
    return NextResponse.json({
      items: list.map((s) => ({ id: s.id, student_no: s.studentNo, create_time: s.createTime })),
    })
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!requireAdmin(req)) return NextResponse.json({ error: '未授权' }, { status: 401 })
    const body = await req.json()
    const { student_no } = body as { student_no?: string }
    if (!student_no) return NextResponse.json({ error: '缺少学生编号' }, { status: 400 })
    try {
      const created = await prisma.studentId.create({ data: { studentNo: student_no } })
      return NextResponse.json({ id: created.id })
    } catch (err: any) {
      const code = err?.code
      if (code === 'P2002') {
        return NextResponse.json({ error: '编号已存在' }, { status: 409 })
      }
      return NextResponse.json({ error: '创建失败' }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    if (!requireAdmin(req)) return NextResponse.json({ error: '未授权' }, { status: 401 })
    const body = await req.json()
    const { id, student_no } = body as { id?: number; student_no?: string }
    if (typeof id !== 'number' || !student_no) return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    try {
      await prisma.studentId.update({ where: { id }, data: { studentNo: student_no } })
      return NextResponse.json({ ok: true })
    } catch (err: any) {
      const code = err?.code
      if (code === 'P2002') return NextResponse.json({ error: '编号已存在' }, { status: 409 })
      return NextResponse.json({ error: '更新失败' }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    if (!requireAdmin(req)) return NextResponse.json({ error: '未授权' }, { status: 401 })
    const body = await req.json()
    const { id } = body as { id?: number }
    if (typeof id !== 'number') return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    try {
      await prisma.studentId.delete({ where: { id } })
      return NextResponse.json({ ok: true })
    } catch (err: any) {
      return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

