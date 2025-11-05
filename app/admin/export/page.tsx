"use client"
import { useState } from 'react'

export default function AdminExportPage() {
  const [downloading, setDownloading] = useState(false)

  async function exportAllRecords() {
    setDownloading(true)
    const res = await fetch('/api/export')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `export_all_${Date.now()}.csv`
    a.click()
    setDownloading(false)
  }

  async function exportAllImages() {
    setDownloading(true)
    const res = await fetch('/api/export/images')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `images_all_${Date.now()}.zip`
    a.click()
    setDownloading(false)
  }

  return (
    <main className="min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-bold">数据导出</h1>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={exportAllRecords} disabled={downloading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{downloading ? '导出中...' : '导出全部记录'}</button>
        <button onClick={exportAllImages} disabled={downloading} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">{downloading ? '打包中...' : '导出全部图片'}</button>
      </div>
    </main>
  )
}