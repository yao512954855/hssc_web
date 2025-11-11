"use client"
import { useEffect, useState } from 'react'

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export default function Timer({ visible }: { visible: boolean }) {
  const [elapsed, setElapsed] = useState(0)
  const [show, setShow] = useState(visible)

  useEffect(() => {
    const startStr = localStorage.getItem('login_time')
    const start = startStr ? parseInt(startStr, 10) : Date.now()
    const id = setInterval(() => {
      setElapsed(Date.now() - start)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 bg-[#2f6f52]/80 text-white px-4 py-1 rounded shadow">
      <div className="flex items-center gap-3">
        <span aria-hidden={!show} className={show ? '' : 'hidden'}>
          当前用时：{formatTime(elapsed)}
        </span>
        <button onClick={() => setShow(!show)} className="text-xs underline">
          {show ? '隐藏' : '显示'}
        </button>
      </div>
      {!show && <div className="sr-only">{formatTime(elapsed)}</div>}
    </div>
  )
}