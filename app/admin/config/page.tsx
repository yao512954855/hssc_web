"use client"
import { useEffect, useState } from 'react'

export default function AdminConfigPage() {
  const [poetry, setPoetry] = useState({ title: '', author: '', content: '', annotation: '' })
  const [tasks, setTasks] = useState<string[]>([])
  const [preview, setPreview] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then((d) => {
      setPoetry(d.poetry)
      setTasks(d.taskPrompt)
    })
  }, [])

  async function save() {
    setMsg('')
    const res = await fetch('/api/config', { method: 'POST', body: JSON.stringify({ poetry, task_prompt: tasks }) })
    if (res.ok) setMsg('已保存并同步至学生端')
    else setMsg('保存失败')
  }

  return (
    <main className="min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">教师内容配置</h1>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h2 className="font-semibold">诗词配置</h2>
          <input className="border p-2 w-full" value={poetry.title} onChange={(e) => setPoetry({ ...poetry, title: e.target.value })} placeholder="标题" />
          <input className="border p-2 w-full" value={poetry.author} onChange={(e) => setPoetry({ ...poetry, author: e.target.value })} placeholder="作者" />
          <textarea className="border p-2 w-full h-28" value={poetry.content} onChange={(e) => setPoetry({ ...poetry, content: e.target.value })} placeholder="原文" />
          <textarea className="border p-2 w-full h-28" value={poetry.annotation} onChange={(e) => setPoetry({ ...poetry, annotation: e.target.value })} placeholder="注释" />
          <div className="flex gap-2">
            <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">保存</button>
            <button onClick={() => setPreview((p) => !p)} className="bg-gray-200 px-4 py-2 rounded">{preview ? '关闭预览' : '预览'}</button>
          </div>
          {msg && <p className="text-sm text-green-700">{msg}</p>}
        </div>
        <div>
          <h2 className="font-semibold">任务提示配置</h2>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} className="flex gap-2">
                <input className="border p-2 flex-1" value={t} onChange={(e) => setTasks(tasks.map((x, idx) => (idx === i ? e.target.value : x)))} />
                <button className="bg-red-600 text-white px-3 rounded" onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))}>删除行</button>
              </div>
            ))}
            <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => setTasks([...tasks, ''])}>新增行</button>
          </div>
        </div>
      </section>
      {preview && (
        <section className="border rounded p-4">
          <h3 className="font-semibold mb-2">学生端预览</h3>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{poetry.title}</h2>
            <p className="text-sm text-gray-600">{poetry.author}</p>
            <p className="mt-3 text-base whitespace-pre-line">{poetry.content}</p>
            <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">注释：{poetry.annotation}</p>
          </div>
          <div className="mt-4">
            <ul className="space-y-1">
              {tasks.map((t, i) => (
                <li key={i} className="text-sm">{t}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}