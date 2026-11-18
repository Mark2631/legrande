'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
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
  const validPhone = /^[17]\d{8}$/.test(phone)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (name.trim().length < 2) { setError('Enter your full name to continue.'); return }
    if (!validPhone) { setError('Enter all nine digits after +254. Kenyan mobile numbers start with 7 or 1.'); return }
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return }

    setBusy(true)
    const normalizedPhone = '+254' + phone
    const supabase = createClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { full_name: name.trim(), phone: normalizedPhone }, emailRedirectTo: window.location.origin + '/auth/callback' },
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

  return <main className="auth-page">
    <div className="auth-topbar"><Link href="/" className="auth-back"><ArrowLeft size={16} /> Back to LeGrande</Link><span>LEGRANDE / MEMBER ACCOUNT</span></div>
    <div className="auth-layout">
      <section className="auth-visual">
        <img src="https://images.unsplash.com/photo-1758875569256-f37c438cac65?auto=format&fit=crop&w=1400&q=85" alt="Barbell training in a gym" />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-copy"><span>MAKE SPACE FOR PROGRESS</span><h1>Your work.<br />Your <em>progress.</em></h1><p>One account for your training plan, workout history and the next step in your LeGrande journey.</p><div className="auth-visual-foot">LEGRANDE FITNESS CENTER <i /> TRAIN WITH PURPOSE</div></div>
      </section>
      <section className="auth-form-side">
        <div className="auth-brand"><img src="/legrande-logo.png" alt="LeGrande Fitness Center" /><span><strong>LEGRANDE</strong><small>FITNESS CENTER</small></span></div>
        <div className="auth-card">
          {sent ? <div className="auth-success">
            <div className="success-icon"><CheckCircle2 size={24} /></div>
            <span className="eyebrow">ACCOUNT VERIFICATION</span>
            <h2>Check your<br /><em>inbox.</em></h2>
            <p>We sent a confirmation link to <strong>{email}</strong>. Confirm your email address to continue to your training profile.</p>
            <Link href="/login" className="button-primary auth-submit">Go to sign in <ArrowRight size={16} /></Link>
            <p className="auth-small-note">Didn’t receive it? Check your spam folder or try signing in again after a few minutes.</p>
          </div> : <>
            <div className="auth-step-line"><span>01</span><i /><span>CREATE ACCOUNT</span></div>
            <span className="eyebrow">START YOUR LEGRANDE JOURNEY</span>
            <h2>Create your<br /><em>account.</em></h2>
            <p className="auth-intro">A few details first. You’ll set up your training preferences after signing in.</p>
            <form onSubmit={submit} className="auth-form">
              <label className="field-label">Full name<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your full name" /></label>
              <label className="field-label" htmlFor="register-phone">Kenyan mobile number</label>
              <div className="phone-control"><span>+254</span><input id="register-phone" required type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[17][0-9]{8}" title="Enter nine digits starting with 7 or 1" aria-describedby="register-phone-help" value={phone} onChange={event => setPhone(nationalDigits(event.target.value))} placeholder="7XX XXX XXX" maxLength={9} /></div>
              <small className="field-help" id="register-phone-help">Enter the 9 digits after +254. Start with 7 or 1.</small>
              <label className="field-label">Email address<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              <label className="field-label">Password<div className="password-control"><input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
              {error && <div className="auth-error" role="alert">{error}</div>}
              <button className="button-primary auth-submit" disabled={busy}>{busy ? 'Creating your account…' : 'Create member account'} <ArrowRight size={16} /></button>
            </form>
            <div className="auth-legal"><ShieldCheck size={15} /><span>Your account details are protected. Membership access is activated separately by LeGrande after payment confirmation.</span></div>
            <div className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></div>
          </>}
        </div>
        <div className="auth-footer-note">© {new Date().getFullYear()} LEGRANDE FITNESS CENTER</div>
      </section>
    </div>
  </main>
}
