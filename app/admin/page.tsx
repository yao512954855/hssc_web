"use client"
import { useEffect, useState } from 'react'

type PoetryType = { title: string; author: string; content: string; annotation: string }

export default function AdminRootPage() {
  const [logged, setLogged] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'config' | 'export'>('config')
  const [poetry, setPoetry] = useState<PoetryType>({ title: '', author: '', content: '', annotation: '' })
  const [tasks, setTasks] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    // 简易判定：是否已有admin Cookie（仅用于控制UI展示）
    setLogged(document.cookie.includes('admin='))
  }, [])

  useEffect(() => {
    if (!logged) return
    fetch('/api/config').then((r) => r.json()).then((d) => {
      setPoetry(d.poetry)
      setTasks(d.taskPrompt)
    })
  }, [logged])

  async function doLogin() {
    setMsg('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setLogged(true)
      setMsg('登录成功')
      // 刷新一下，确保中间件后续子路由访问可用
      // 这里不跳转，统一在 /admin 管理
    } else {
      const data = await res.json().catch(() => ({ error: '登录失败' }))
      setMsg(data.error || '登录失败')
    }
  }

  async function saveConfig() {
    setMsg('')
    const res = await fetch('/api/config', {
      method: 'POST',
      body: JSON.stringify({ poetry, task_prompt: tasks }),
    })
    if (res.ok) setMsg('保存成功')
    else setMsg('保存失败，请重试')
  }

  async function exportAllRecords() {
    setMsg('')
    setDownloading(true)
    const res = await fetch('/api/export')
    if (!res.ok) {
      const d = await res.json().catch(() => ({ error: '导出失败' }))
      setMsg(d.error || '导出失败')
      setDownloading(false)
      return
    }
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `export_all_${Date.now()}.csv`
    a.click()
    setDownloading(false)
  }

  async function exportAllImages() {
    setMsg('')
    setDownloading(true)
    const res = await fetch('/api/export/images')
    if (!res.ok) {
      const d = await res.json().catch(() => ({ error: '导出失败' }))
      setMsg(d.error || '导出失败')
      setDownloading(false)
      return
    }
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `images_all_${Date.now()}.zip`
    a.click()
    setDownloading(false)
  }

  return (
    <main className="min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-bold">教师管理中心</h1>
      {!logged ? (
        <section className="max-w-md space-y-3">
          <p className="text-sm">请输入管理密码以进入：默认密码 1234560</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="管理密码" className="w-full border rounded p-3" />
          <button onClick={doLogin} className="bg-blue-600 text-white px-4 py-2 rounded">登录</button>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
        </section>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button className={`px-3 py-1 rounded ${tab === 'config' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setTab('config')}>配置</button>
            <button className={`px-3 py-1 rounded ${tab === 'export' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setTab('export')}>导出</button>
          </div>

          {tab === 'config' && (
            <section className="space-y-3 mt-4">
              <h2 className="text-xl font-semibold">诗词与任务提示配置</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <input className="border rounded p-2 w-full" placeholder="标题" value={poetry.title} onChange={(e) => setPoetry({ ...poetry, title: e.target.value })} />
                  <input className="border rounded p-2 w-full" placeholder="作者" value={poetry.author} onChange={(e) => setPoetry({ ...poetry, author: e.target.value })} />
                  <textarea className="border rounded p-2 w-full h-28" placeholder="内容" value={poetry.content} onChange={(e) => setPoetry({ ...poetry, content: e.target.value })} />
                  <textarea className="border rounded p-2 w-full h-28" placeholder="注释" value={poetry.annotation} onChange={(e) => setPoetry({ ...poetry, annotation: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">任务提示</h3>
                  {tasks.map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input className="border rounded p-2 w-full" value={t} onChange={(e) => {
                        const arr = [...tasks]; arr[i] = e.target.value; setTasks(arr)
                      }} />
                      <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => { const arr = tasks.filter((_, idx) => idx !== i); setTasks(arr) }}>删</button>
                    </div>
                  ))}
                  <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setTasks([...tasks, ''])}>新增</button>
                </div>
              </div>
              <div>
                <button onClick={saveConfig} className="bg-green-600 text-white px-4 py-2 rounded">保存</button>
                {msg && <span className="ml-3 text-sm text-gray-600">{msg}</span>}
              </div>
            </section>
          )}

          {tab === 'export' && (
            <section className="space-y-3 mt-4">
              <h2 className="text-xl font-semibold">数据导出</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={exportAllRecords} disabled={downloading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{downloading ? '导出中...' : '导出全部记录'}</button>
                <button onClick={exportAllImages} disabled={downloading} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">{downloading ? '打包中...' : '导出全部图片'}</button>
              </div>
              {msg && <p className="text-sm text-gray-600">{msg}</p>}
            </section>
          )}
        </>
      )}
    </main>
  )
}