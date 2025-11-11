import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const cwd = process.cwd()
    const dir = path.join(cwd, 'public', 'generated-images', '12')
    let listing: string[] = []
    try {
      listing = fs.readdirSync(dir)
    } catch {
      listing = []
    }
    const exists_1 = fs.existsSync(path.join(dir, '12_1.png'))
    const exists_3 = fs.existsSync(path.join(dir, '12_3.png'))
    const exists_4 = fs.existsSync(path.join(dir, '12_4.png'))
    return NextResponse.json({ cwd, dir, listing, exists_1, exists_3, exists_4 })
  } catch (e) {
    return NextResponse.json({ error: 'debug failed' }, { status: 500 })
  }
}