'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const plans = [
  { code: 'daily', title: 'Day pass', duration: '01 day', description: 'A single day of training' },
  { code: 'weekly', title: 'Weekly', duration: '07 days', description: 'A focused week of training' },
  { code: 'monthly', title: 'Monthly', duration: '30 days', description: 'Build a consistent routine' },
  { code: 'semester', title: 'Semester', duration: '120 days', description: 'A longer training commitment' },
]

function nationalDigits(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('254')) digits = digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 9)
}

export default function Join() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('monthly')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('plan')
    if (requested && plans.some(item => item.code === requested)) setPlan(requested)
  }, [])

  const validPhone = /^[17]\d{8}$/.test(phone)
  const canContinue = name.trim().length > 1 && validPhone

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canContinue) { setStep(1); setStatus('Enter your name and a valid Kenyan mobile number.'); return }
    setBusy(true)
    setStatus('')
    const { error } = await createClient().from('lead_inquiries').insert({
      name: name.trim(), phone: '+254' + phone, email: email.trim().toLowerCase() || null,
      plan_code: plan, message: message.trim(),
    })
    if (error) {
      setStatus('We could not send your enquiry. Please check your connection and try again.')
      setBusy(false)
      return
    }
    setStatus('success')
    setBusy(false)
  }

  return <main className="auth-page">
    <div className="auth-topbar"><Link href="/" className="auth-back"><ArrowLeft size={16} /> Back to LeGrande</Link><span>LEGRANDE / MEMBERSHIP</span></div>
    <div className="auth-layout join-layout">
      <section className="auth-visual">
        <img src="https://images.unsplash.com/photo-1758875569256-f37c438cac65?auto=format&fit=crop&w=1400&q=85" alt="Athlete training in a gym" />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-copy"><span>YOUR NEXT CHAPTER STARTS HERE</span><h1>Make room<br />for <em>progress.</em></h1><p>Tell us a little about yourself. The LeGrande team will help you take the next step.</p><div className="auth-visual-foot">LEGRANDE FITNESS CENTER <i /> MEMBERSHIP ENQUIRY</div></div>
      </section>
      <section className="auth-form-side">
        <div className="auth-brand"><img src="/legrande-logo.png" alt="LeGrande Fitness Center" /><span><strong>LEGRANDE</strong><small>FITNESS CENTER</small></span></div>
        <div className="auth-card">
          {status === 'success' ? <div className="auth-success">
            <div className="success-icon"><CheckCircle2 size={24} /></div><span className="eyebrow">ENQUIRY RECEIVED</span>
            <h2>We’ll take it<br /><em>from here.</em></h2>
            <p>Your membership enquiry has been sent. The LeGrande team can follow up using the contact details you provided.</p>
            <Link href="/" className="button-primary auth-submit">Back to LeGrande <ArrowRight size={16} /></Link>
          </div> : <>
            <div className="auth-step-line"><span>STEP 0{step} / 02</span><i /><span>{step === 1 ? 'YOUR DETAILS' : 'MEMBERSHIP'}</span></div>
            <div className="step-progress"><i style={{ width: step === 1 ? '50%' : '100%' }} /></div>
            <span className="eyebrow">MEMBERSHIP ENQUIRY</span>
            <h2>{step === 1 ? <>Let’s get to<br /><em>know you.</em></> : <>Choose your<br /><em>membership.</em></>}</h2>
            <p className="auth-intro">{step === 1 ? 'Share the best way for the team to reach you.' : 'Choose a starting point. Current rates and payment are confirmed by the team.'}</p>
            <form onSubmit={step === 1 ? event => { event.preventDefault(); if (canContinue) { setStatus(''); setStep(2) } else setStatus('Enter your name and all nine digits after +254.') } : submit} className="auth-form">
              {step === 1 ? <>
                <label className="field-label">Full name<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Your full name" /></label>
                <label className="field-label" htmlFor="enquiry-phone">Kenyan mobile number</label>
                <div className="phone-control"><span>+254</span><input id="enquiry-phone" required type="tel" inputMode="numeric" autoComplete="tel-national" aria-describedby="enquiry-phone-help" value={phone} onChange={event => setPhone(nationalDigits(event.target.value))} placeholder="7XX XXX XXX" maxLength={9} /></div>
                <small className="field-help" id="enquiry-phone-help">Enter 9 digits after +254. Start with 7 or 1.</small>
                <label className="field-label">Email address <span className="optional">(optional)</span><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              </> : <>
                <div className="plan-choice-list">{plans.map(item => <button type="button" key={item.code} onClick={() => setPlan(item.code)} className={plan === item.code ? 'plan-choice selected' : 'plan-choice'}><span className="plan-choice-radio" /><span className="plan-choice-copy"><strong>{item.title}</strong><small>{item.description}</small></span><b>{item.duration}</b></button>)}</div>
                <label className="field-label">Anything else we should know? <span className="optional">(optional)</span><textarea rows={3} maxLength={500} value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask about a visit, membership or getting started…" /></label>
                <div className="enquiry-review"><span>YOUR DETAILS</span><strong>{name}</strong><small>+254 {phone} {email ? '· ' + email : ''}</small><button type="button" onClick={() => setStep(1)}>Edit details</button></div>
              </>}
              {status && status !== 'success' && <div className="auth-error" role="alert">{status}</div>}
              <div className="auth-form-actions">
                {step === 2 && <button type="button" className="button-quiet" onClick={() => { setStatus(''); setStep(1) }}>Back</button>}
                <button className="button-primary auth-submit" disabled={busy || (step === 2 && !canContinue)}>{busy ? 'Sending enquiry…' : step === 1 ? 'Continue' : 'Send membership enquiry'} <ArrowRight size={16} /></button>
              </div>
            </form>
            <div className="auth-legal"><ShieldCheck size={15} /><span>Your information is used to respond to this enquiry. No payment is taken here.</span></div>
            <div className="auth-switch">Already a member? <Link href="/login">Sign in</Link></div>
          </>}
        </div>
        <div className="auth-footer-note">© {new Date().getFullYear()} LEGRANDE FITNESS CENTER</div>
      </section>
    </div>
  </main>
}
