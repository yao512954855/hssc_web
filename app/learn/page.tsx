"use client"
import { useEffect, useState } from 'react'
import Timer from '@/components/Timer'
import Poetry from '@/components/Poetry'
import TaskPrompt from '@/components/TaskPrompt'
import PromptInput from '@/components/PromptInput'
import GeneratedImages from '@/components/GeneratedImages'
import ImageGallery from '@/components/ImageGallery'
import { useRouter } from 'next/navigation'

type PoetryType = { title: string; author: string; content: string; annotation: string }

export default function LearnPage() {
  const router = useRouter()
  const [poetry, setPoetry] = useState<PoetryType | null>(null)
  const [tasks, setTasks] = useState<string[]>([])
  const [currentImages, setCurrentImages] = useState<{ url: string; name: string }[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [studentNo, setStudentNo] = useState('')

  useEffect(() => {
    const no = localStorage.getItem('student_no')
    if (!no) {
      router.replace('/')
      return
    }
    setStudentNo(no)
    fetch('/api/config').then((r) => r.json()).then((d) => {
      setPoetry(d.poetry)
      setTasks(d.taskPrompt)
    })
    fetch(`/api/images/history?student_no=${no}`).then((r) => r.json()).then((d) => setHistory(d.items))
  }, [router])

  async function handleGenerate(text: string) {
    const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ student_no: studentNo, prompt_text: text }) })
    if (!res.ok) {
      alert('生成失败，请重试')
      return
    }
    const data = await res.json()
    setCurrentImages(data.filenames.map((f: string, i: number) => ({ name: f, url: data.images[i] })))
    const hRes = await fetch(`/api/images/history?student_no=${studentNo}`)
    const hData = await hRes.json()
    setHistory(hData.items)
  }

  async function handleSubmit(name: string) {
    const start = localStorage.getItem('login_time')
    const totalSeconds = Math.floor(((Date.now()) - (start ? parseInt(start, 10) : Date.now())) / 1000)
    const res = await fetch('/api/submit', { method: 'POST', body: JSON.stringify({ student_no: studentNo, image_name: name, total_time_seconds: totalSeconds }) })
    if (res.ok) {
      // Clear local and redirect to login page
      localStorage.removeItem('login_time')
      localStorage.removeItem('student_no')
      localStorage.removeItem('prompt_draft')
      router.replace('/')
    } else {
      alert('提交失败，请重试')
    }
  }

  return (
    <main className="min-h-screen p-4">
      <Timer visible={true} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-10">
        <div className="border rounded">
          {poetry && <Poetry poetry={poetry} />}
        </div>

        <div className="border rounded">
          <TaskPrompt tasks={tasks} />
        </div>
        <div className="border rounded lg:col-span-1">
          <PromptInput onGenerate={handleGenerate} />
        </div>
        <div className="border rounded lg:col-span-1">
          <GeneratedImages images={currentImages} />
        </div>
        <div className="border rounded lg:col-span-2">
          <ImageGallery items={history} onSubmit={handleSubmit} />
        </div>
      </div>
    </main>
  )
}