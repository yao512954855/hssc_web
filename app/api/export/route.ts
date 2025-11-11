import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

function formatDate(dt?: Date | null) {
  if (!dt) return ''
  // 注意：数据库使用的是 MySQL DATETIME(0)，不带时区。
  // Prisma/驱动在读取时会把其当作“本地时间”构造成 JS Date。
  // 若此处再指定 Asia/Shanghai 进行格式化，会产生二次偏移（+8小时）。
  // 因此这里按“原值”输出：使用 UTC getters 组装成字符串，避免任何时区转换。
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dt.getUTCDate()).padStart(2, '0')
  const hh = String(dt.getUTCHours()).padStart(2, '0')
  const mm = String(dt.getUTCMinutes()).padStart(2, '0')
  const ss = String(dt.getUTCSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
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
