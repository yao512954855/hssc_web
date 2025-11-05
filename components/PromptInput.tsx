"use client"
import { useState } from 'react'

export default function PromptInput({ onGenerate }: { onGenerate: (text: string) => Promise<void> }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!text.trim()) return
    setLoading(true)
    // 仅将用户输入传递到后端；风格与比例由后端/生成器统一添加
    await onGenerate(text.trim())
    setLoading(false)
  }

  return (
    <section className="p-4">
      <p className="text-sm mb-2">请在下方输入你对古诗的理解，AI 会根据你输入的内容生成诗意图片，输入完成就可以点击“生成图像”。</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-[220px] border rounded p-2 resize-y overflow-auto"
        placeholder="在此输入提示词..."
      />
      <div className="mt-2">
        <button disabled={loading} onClick={submit} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {loading ? '生成中...' : '生成图像'}
        </button>
      </div>
    </section>
  )
}