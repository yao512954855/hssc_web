import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { password } = body as { password?: string }
    const target = process.env.ADMIN_PASSWORD || '1234560'
    if (!password) return NextResponse.json({ error: '缺少密码' }, { status: 400 })
    if (password !== target) return NextResponse.json({ error: '密码错误' }, { status: 401 })

    const res = NextResponse.json({ ok: true })
    // 设置管理员 Cookie，前端不需要读取，仅供中间件校验
    res.cookies.set('admin', '1', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
    return res
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}