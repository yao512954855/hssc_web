import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const student_no = searchParams.get('student_no')
  if (!student_no) return NextResponse.json({ error: '缺少学生编号' }, { status: 400 })

  const records = await prisma.generateRecord.findMany({ where: { studentNo: student_no }, orderBy: { generateTime: 'desc' } })
  const items = records.flatMap((r) => {
    return r.imageNo.split(',').map((name) => name.trim()).filter((name) => {
      const p = path.join(process.cwd(), 'public', 'generated-images', student_no, name)
      if (!fs.existsSync(p)) return false
      try {
        const st = fs.statSync(p)
        return st.size > 0
      } catch {
        return false
      }
    }).map((name) => ({
      image_name: name,
      status: r.status,
      generate_time: r.generateTime,
      submit_time: r.submitTime,
      total_time_seconds: r.totalTimeSeconds,
    }))
  })
  return NextResponse.json({ items })
}