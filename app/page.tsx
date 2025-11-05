"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [studentNo, setStudentNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const last = localStorage.getItem('student_no')
    if (last) setStudentNo(last)
  }, [])

  async function handleLogin() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ student_no: studentNo }) })
    if (res.ok) {
      localStorage.setItem('student_no', studentNo)
      localStorage.setItem('login_time', String(Date.now()))
      router.push('/learn')
    } else {
      const data = await res.json()
      setError(data.error || '登录失败')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">学生编号登录</h1>
        <input
          value={studentNo}
          onChange={(e) => setStudentNo(e.target.value)}
          placeholder="请输入学生编号"
          className="w-full border rounded p-3"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50">
          {loading ? '登录中...' : '登录'}
        </button>
      </div>
    </main>
  )
}
