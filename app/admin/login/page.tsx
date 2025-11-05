"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PLACEHOLDER) {
      // Not used; fallback to serverless cookie via client redirect
    }
    document.cookie = `admin=1; path=/` // naive gate for demo
    router.push('/admin/config')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">教师管理登录</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入管理密码"
          className="w-full border rounded p-3"
        />
        <button onClick={login} className="w-full bg-blue-600 text-white py-2 rounded">登录</button>
      </div>
    </main>
  )
}