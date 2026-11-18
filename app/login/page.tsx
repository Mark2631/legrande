'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { error: loginError } = await createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (loginError) {
      setError(loginError.message === 'Invalid login credentials' ? 'That email and password combination was not recognised.' : loginError.message)
      setBusy(false)
      return
    }
    const destination = new URLSearchParams(window.location.search).get('next')
    router.replace(destination === '/admin' ? '/admin' : '/member')
    router.refresh()
  }

  return <main className="auth-page">
    <div className="auth-topbar"><Link href="/" className="auth-back"><ArrowLeft size={16} /> Back to LeGrande</Link><span>LEGRANDE / MEMBER ACCOUNT</span></div>
    <div className="auth-layout">
      <section className="auth-visual">
        <img src="https://images.unsplash.com/photo-1775993167571-cd1ff4cadada?auto=format&fit=crop&w=1400&q=85" alt="Training equipment in a modern gym" />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-copy"><span>GOOD TO HAVE YOU BACK</span><h1>Pick up<br />where you <em>left off.</em></h1><p>Your sessions, routines and progress are waiting in your member space.</p><div className="auth-visual-foot">LEGRANDE FITNESS CENTER <i /> TRAIN WITH PURPOSE</div></div>
      </section>
      <section className="auth-form-side">
        <div className="auth-brand"><img src="/legrande-logo.png" alt="LeGrande Fitness Center" /><span><strong>LEGRANDE</strong><small>FITNESS CENTER</small></span></div>
        <div className="auth-card">
          <div className="auth-step-line"><span>MEMBER ACCESS</span><i /><span>SECURE SIGN IN</span></div>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Good to see<br /><em>you again.</em></h2>
          <p className="auth-intro">Sign in to open your training plan and continue where you left off.</p>
          <form onSubmit={submit} className="auth-form">
            <label className="field-label">Email address<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label className="field-label">Password<div className="password-control"><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Your password" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="button-primary auth-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to member space'} <ArrowRight size={16} /></button>
          </form>
          <div className="auth-legal"><ShieldCheck size={15} /><span>Your account and training history are private to you.</span></div>
          <div className="auth-switch">New to LeGrande? <Link href="/register">Create your account</Link></div>
          <div className="auth-enquiry">Not a member yet? <Link href="/join">Send a membership enquiry <ArrowUpRight size={13} /></Link></div>
        </div>
        <div className="auth-footer-note">© {new Date().getFullYear()} LEGRANDE FITNESS CENTER</div>
      </section>
    </div>
  </main>
}
