'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const plans = [
  { code: 'daily', title: 'Day pass' },
  { code: 'weekly', title: 'Weekly' },
  { code: 'monthly', title: 'Monthly' },
  { code: 'semester', title: 'Semester' },
]

function nationalDigits(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('254')) digits = digits.slice(3)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 9)
}

export default function Join() {
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
    const prefill = async () => {
      try {
        const { data: { user } } = await createClient().auth.getUser()
        if (!user) return
        const metadata = user.user_metadata || {}
        setName(current => current || metadata.full_name || '')
        setPhone(current => current || nationalDigits(metadata.phone || ''))
        setEmail(current => current || user.email || '')
      } catch {
        // A visitor can still complete the enquiry manually.
      }
    }
    void prefill()
  }, [])

  const validPhone = /^[17]\d{8}$/.test(phone)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    if (name.trim().length < 2) { setStatus('Please enter your name.'); return }
    if (!validPhone) { setStatus('Enter a valid Kenyan mobile number.'); return }

    setBusy(true)
    try {
      const { error } = await createClient().from('lead_inquiries').insert({
        name: name.trim(),
        phone: '+254' + phone,
        email: email.trim().toLowerCase() || null,
        plan_code: plan,
        message: message.trim(),
      })
      if (error) throw error
      setStatus('success')
    } catch {
      setStatus('We could not send your message. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="campus-form-page">
    <header className="campus-form-header">
      <Link href="/" className="campus-form-back"><ArrowLeft size={16} /> Back to LeGrande</Link>
      <Link href="/" className="campus-form-logo"><img src="/legrande-logo.png" alt="LeGrande Fitness Center" /></Link>
      <Link href="/login" className="campus-form-member">Member sign in</Link>
    </header>
    <div className="campus-form-layout">
      <section className="campus-form-intro">
        <span className="campus-section-label">LEGRANDE / MEMBERSHIP</span>
        <h1>Let’s get you<br /><span>started.</span></h1>
        <p>Send your details once. The gym team will follow up about current rates, payment and your first visit.</p>
        <div className="campus-form-photo"><img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85" alt="Strength training equipment inside a gym" /></div>
        <div className="campus-form-tip"><MessageCircle size={16} /><span>No account or payment needed to ask a question.</span></div>
      </section>
      <section className="campus-form-card">
        {status === 'success' ? <div className="campus-form-success">
          <span className="campus-success-icon"><CheckCircle2 size={25} /></span>
          <span className="campus-section-label">MESSAGE SENT</span>
          <h2>We’ll be<br /><span>in touch.</span></h2>
          <p>Your enquiry has been sent to the LeGrande team. They can follow up using the contact details you provided.</p>
          <Link href="/" className="campus-button campus-button-dark">Back to LeGrande <ArrowRight size={16} /></Link>
        </div> : <>
          <span className="campus-section-label">A QUICK ENQUIRY</span>
          <h2>How can we<br /><span>reach you?</span></h2>
          <p className="campus-form-lede">Just the essentials. You can ask a question in the message box too.</p>
          <form onSubmit={submit} className="campus-enquiry-form">
            <label>Your name<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Full name" /></label>
            <label>Mobile number<div className="campus-phone-field"><span>+254</span><input required type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[17][0-9]{8}" maxLength={9} value={phone} onChange={event => setPhone(nationalDigits(event.target.value))} placeholder="7XX XXX XXX" /></div></label>
            <label>Email <span className="campus-optional">OPTIONAL</span><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label>Membership option<select value={plan} onChange={event => setPlan(event.target.value)}>{plans.map(item => <option value={item.code} key={item.code}>{item.title}</option>)}</select></label>
            <label>Message <span className="campus-optional">OPTIONAL</span><textarea rows={3} maxLength={500} value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask about rates, visiting or getting started…" /></label>
            {status && status !== 'success' && <div className="campus-form-error" role="alert">{status}</div>}
            <button className="campus-button campus-button-dark campus-submit" disabled={busy}>{busy ? 'Sending…' : 'Send enquiry'} <ArrowRight size={16} /></button>
          </form>
          <div className="campus-form-footnote">No payment is taken here. The gym team confirms your membership directly.</div>
        </>}
      </section>
    </div>
    <footer className="campus-form-footer">LEGRANDE FITNESS CENTER <span>·</span> TRAIN AT YOUR PACE</footer>
  </main>
}