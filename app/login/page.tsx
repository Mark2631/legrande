'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
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
    const { error: loginError } = await createClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (loginError) {
      setError(loginError.message === 'Invalid login credentials' ? 'That email and password combination was not recognised.' : loginError.message)
      setBusy(false)
      return
    }
    const destination = new URLSearchParams(window.location.search).get('next')
    router.replace(destination === '/admin' ? '/admin' : '/member')
    router.refresh()
  }

  return <main className="campus-form-page">
    <header className="campus-form-header">
      <Link href="/" className="campus-form-back"><ArrowLeft size={16} /> Back to LeGrande</Link>
      <Link href="/" className="campus-form-logo"><img src="/legrande-logo.png" alt="LeGrande Fitness Center" /></Link>
      <Link href="/register" className="campus-form-member">Create account</Link>
    </header>
    <div className="campus-form-layout">
      <section className="campus-form-intro">
        <span className="campus-section-label">WELCOME BACK</span>
        <h1>Pick up where<br /><span>you left off.</span></h1>
        <p>Your training plan, completed sessions and progress are waiting in your member space.</p>
        <div className="campus-form-photo"><img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=85" alt="Athlete working through a strength exercise" /></div>
        <div className="campus-form-tip"><ArrowRight size={16} /><span>One session at a time. Keep building.</span></div>
      </section>
      <section className="campus-form-card">
        <span className="campus-section-label">MEMBER SIGN IN</span>
        <h2>Good to see<br /><span>you again.</span></h2>
        <p className="campus-form-lede">Sign in to continue your training.</p>
        <form onSubmit={submit} className="campus-enquiry-form">
          <label>Email address<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <label>Password<div className="campus-password-field"><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Your password" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {error && <div className="campus-form-error" role="alert">{error}</div>}
          <button className="campus-button campus-button-dark campus-submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to member space'} <ArrowRight size={16} /></button>
        </form>
        <div className="campus-form-footnote">New to LeGrande? <Link href="/register">Create your member account</Link></div>
        <div className="campus-form-footnote">Need membership information? <Link href="/join">Contact the gym team</Link></div>
      </section>
    </div>
    <footer className="campus-form-footer">LEGRANDE FITNESS CENTER <span>·</span> TRAIN AT YOUR PACE</footer>
  </main>
}
