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
  const targetMs = 10 * 60 * 1000 // 10 分钟
  const [warningClosed, setWarningClosed] = useState(false)

  useEffect(() => {
    const startStr = localStorage.getItem('login_time')
    const start = startStr ? parseInt(startStr, 10) : Date.now()
    // 初始化一次，避免已超时情况下显示超长时间
    setElapsed(Math.min(Date.now() - start, targetMs))

    const id = setInterval(() => {
      const next = Date.now() - start
      if (next >= targetMs) {
        setElapsed(targetMs)
        clearInterval(id) // 达到10分钟后停止计时
      } else {
        setElapsed(next)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <div className="fixed top-2 right-2 bg-[#2f6f52]/80 text-white px-4 py-1 rounded shadow">
        <div className="flex items-center gap-3">
          <span aria-hidden={!show} className={`${show ? '' : 'hidden'} text-red-600`}>
            当前用时：{formatTime(elapsed)}（目标 10:00）
          </span>
          <button onClick={() => setShow(!show)} className="text-xs underline">
            {show ? '隐藏' : '显示'}
          </button>
        </div>
        {!show && <div className="sr-only">{formatTime(elapsed)}</div>}
      </div>

      {/* 到 9 分 30 秒至 10 分钟期间显示提醒，不强制退出；可关闭 */}
      {elapsed >= (targetMs - 30 * 1000) && elapsed < targetMs && !warningClosed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" aria-hidden="true"></div>
          <div className="relative bg-yellow-500 text-black px-6 py-4 rounded shadow max-w-xl text-center mx-4">
            <button
              className="absolute top-2 right-2 bg-black/20 hover:bg-black/30 text-black rounded w-6 h-6 leading-6"
              onClick={() => setWarningClosed(true)}
              aria-label="关闭提醒"
              title="关闭"
            >
              ×
            </button>
            时间即将结束，请尽快选择你认为最符合古诗内容的一副图片并提交
          </div>
        </div>
      )}
    </>
  )
}
