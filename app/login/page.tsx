'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function LoginPage(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const router=useRouter(), params=useSearchParams()
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('')
  const supabase=createClient()
  const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password})
  if(error){setError(error.message);setBusy(false);return}
  router.replace(params.get('next')==='/member'?'/member':'/member');router.refresh()
 }
 return <main className="auth-shell"><Link href="/" className="auth-back"><ArrowLeft size={15}/> Back to LeGrande</Link><section className="auth-card"><span className="eyebrow">LEGRANDE MEMBER SPACE</span><h1>Welcome<br/><em>back.</em></h1><p>Sign in to continue your training and review your progress.</p><form onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/></label>{error&&<div className="form-error">{error}</div>}<button disabled={busy}>{busy?'Signing in…':'Sign in'} <ArrowRight size={16}/></button></form><div className="auth-switch">New to LeGrande? <Link href="/join">Enquire about membership</Link></div></section><div className="auth-foot">LEGRANDE FITNESS CENTER · TRAIN WITH PURPOSE</div></main>
}
