'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabaseClient'

export default function AdminLogin() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.replace('/admin/dashboard')
      router.refresh()
    } catch (err) {
      setMessage(err.message || 'Giriş sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-card">
        <div className="brand"><span className="logo-mark">OK</span><span>OK Dent Admin</span></div>
        <h1>Yönetici Girişi</h1>
        <p>Site içeriklerini yönetmek için yetkili hesabınızla giriş yapın.</p>
        <form onSubmit={handleLogin}>
          <div className="form-group"><label>E-posta</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@okdent.com" required /></div>
          <div className="form-group"><label>Şifre</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required /></div>
          <button className="btn-primary admin-btn" disabled={loading}>{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</button>
        </form>
        {message && <div className="admin-hint">{message}</div>}
      </section>
    </main>
  )
}
