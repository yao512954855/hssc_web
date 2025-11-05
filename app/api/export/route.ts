import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

function formatDate(dt?: Date | null) {
  if (!dt) return ''
  // 使用亚洲/上海时区格式化，输出为 YYYY-MM-DD HH:MM:SS
  // 采用 sv-SE 区域避免斜杠并确保到秒（常用技巧）
  return dt.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai', hour12: false })
}

function formatTime(seconds?: number | null) {
  if (!seconds && seconds !== 0) return ''
  const s = seconds as number
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export async function GET(req: Request) {
  // 直接导出整表 generate_record，不做日期过滤
  const records = await prisma.generateRecord.findMany({ orderBy: { submitTime: 'desc' } })

  // 直接导出 generate_record 原始字段，简化开发与分析
  const lines: string[] = []
  lines.push('id,student_no,prompt_text,image_no,status,generate_time,submit_time,total_time_seconds')
  for (const r of records) {
    lines.push([
      csvEscape(r.id),
      csvEscape(r.studentNo),
      csvEscape(r.promptText),
      csvEscape(r.imageNo),
      csvEscape(r.status),
      csvEscape(formatDate(r.generateTime)),
      csvEscape(formatDate(r.submitTime)),
      csvEscape(r.totalTimeSeconds ?? ''),
    ].join(','))
  }

  const csv = lines.join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="export_${Date.now()}.csv"`,
    },
  })
}