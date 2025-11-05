import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { generateImagesToPublic } from '@/src/lib/imageGenerator'

async function getNextIndices(studentNo: string): Promise<number[]> {
  const records = await prisma.generateRecord.findMany({ where: { studentNo: studentNo } })
  let maxIdx = 0
  for (const r of records) {
    for (const part of r.imageNo.split(',')) {
      const m = part.trim().match(/_(\d+)\.png$/)
      if (m) {
        const n = parseInt(m[1], 10)
        if (n > maxIdx) maxIdx = n
      }
    }
  }
  return [maxIdx + 1, maxIdx + 2]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { student_no, prompt_text } = body as { student_no?: string; prompt_text?: string }
    if (!student_no || !prompt_text) return NextResponse.json({ error: '缺少参数' }, { status: 400 })

    // 会话层设置 MySQL 时区为北京时间，确保 TIMESTAMP 写入显示为本地时间
    await prisma.$executeRaw`SET time_zone = '+08:00'`

    const student = await prisma.studentId.findUnique({ where: { studentNo: student_no } })
    if (!student) return NextResponse.json({ error: '编号错误，请重试' }, { status: 401 })

    // 仅保存用户输入的提示词：移除可能包含的默认风格与比例
    function stripDefaults(s: string) {
      return s
        .replace(/生成一组共2张连贯插画[，,]?\s*/g, '')
        .replace(/请生成两张连贯的中国风画面/g, '')
        .replace(/图片风格：?中国风[，,]?\s*/g, '')
        .replace(/风格：?中国风[，,]?\s*/g, '')
        .replace(/比例：?\s*4\s*[:：]\s*3/g, '')
        .trim()
    }

    const purePrompt = stripDefaults(prompt_text)

    const indices = await getNextIndices(student_no)
    const result = await generateImagesToPublic(student_no, indices, purePrompt)

    const record = await prisma.generateRecord.create({
      data: {
        studentNo: student_no,
        promptText: purePrompt,
        imageNo: result.filenames.join(','),
        status: '',
      },
    })

    // 统一将生成时间写为北京时间（东八区），避免会话时区与连接池导致的偏差
    await prisma.$executeRaw`UPDATE generate_record SET generate_time = CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', '+08:00') WHERE id = ${record.id}`

    return NextResponse.json({ ok: true, images: result.urls, filenames: result.filenames, record_id: record.id })
  } catch (e) {
    return NextResponse.json({ error: '生成失败，请重试' }, { status: 500 })
  }
}