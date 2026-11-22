'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function nationalDigits(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('254')) digits = digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 9)
}

export default function Register() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (name.trim().length < 2) { setError('Enter your name to continue.'); return }
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return }

    setBusy(true)
    const normalizedPhone = phone.length === 9 ? '+254' + phone : ''
    const { data, error: signupError } = await createClient().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim(), phone: normalizedPhone, gender: 'man' },
        emailRedirectTo: window.location.origin + '/auth/callback',
      },
    })

    if (signupError) {
      setError(signupError.message)
      setBusy(false)
      return
    }
    if (data.session) {
      router.replace('/member')
      router.refresh()
    } else {
      setSent(true)
    }
    setBusy(false)
  }

  return <main className="campus-form-page">
    <header className="campus-form-header">
      <Link href="/" className="campus-form-back"><ArrowLeft size={16} /> Back to LeGrande</Link>
      <Link href="/" className="campus-form-logo"><img src="/legrande-logo.png" alt="LeGrande Fitness Center" /></Link>
      <Link href="/login" className="campus-form-member">Member sign in</Link>
    </header>
    <div className="campus-form-layout">
      <section className="campus-form-intro">
        <span className="campus-section-label">MEMBER SPACE</span>
        <h1>Your training.<br /><span>Your progress.</span></h1>
        <p>Create your account to save workouts, follow the training plans and keep your progress in one place.</p>
        <div className="campus-form-photo"><img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1a?auto=format&fit=crop&w=1200&q=85" alt="Athlete training with weights" /></div>
        <div className="campus-form-tip"><CheckCircle2 size={16} /><span>Your workout profile can be completed later. No long setup before your first session.</span></div>
      </section>
      <section className="campus-form-card">
        {sent ? <div className="campus-form-success">
          <span className="campus-success-icon"><CheckCircle2 size={25} /></span>
          <span className="campus-section-label">ONE LAST STEP</span>
          <h2>Check your<br /><span>email.</span></h2>
          <p>We sent a confirmation link to <strong>{email}</strong>. Confirm your address, then sign in to open your member space.</p>
          <Link href="/login" className="campus-button campus-button-dark">Go to sign in <ArrowRight size={16} /></Link>
        </div> : <>
          <span className="campus-section-label">CREATE AN ACCOUNT</span>
          <h2>Start with<br /><span>the basics.</span></h2>
          <p className="campus-form-lede">Three details and you are in. Your training preferences can be adjusted later.</p>
          <form onSubmit={submit} className="campus-enquiry-form">
            <label>Full name<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your name" /></label>
            <label>Email address<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label>Mobile number <span className="campus-optional">OPTIONAL</span><div className="campus-phone-field"><span>+254</span><input type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[17][0-9]{8}" maxLength={9} value={phone} onChange={event => setPhone(nationalDigits(event.target.value))} placeholder="7XX XXX XXX" /></div></label>
            <label>Password<div className="campus-password-field"><input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <div className="campus-form-error" role="alert">{error}</div>}
            <button className="campus-button campus-button-dark campus-submit" disabled={busy}>{busy ? 'Creating account…' : 'Create member account'} <ArrowRight size={16} /></button>
          </form>
          <div className="campus-form-footnote">Already have an account? <Link href="/login">Sign in</Link></div>
        </>}
      </section>
    </div>
    <footer className="campus-form-footer">LEGRANDE FITNESS CENTER <span>·</span> TRAIN AT YOUR PACE</footer>
  </main>
}