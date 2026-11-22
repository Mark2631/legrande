import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Clock3, Dumbbell, Flame, MessageCircle, Target } from 'lucide-react'

export const metadata = {
  title: 'LeGrande Fitness Center',
  description: 'Your campus gym. Straightforward membership, practical training plans and progress you can keep building.',
}

function Brand() {
  return <Link href="/" className="campus-brand" aria-label="LeGrande Fitness Center home">
    <img src="/legrande-logo.png" alt="LeGrande Fitness Center" />
  </Link>
}

const plans = [
  { code: 'daily', name: 'Day pass', detail: 'One day at a time' },
  { code: 'weekly', name: 'Weekly', detail: 'A full week of training' },
  { code: 'monthly', name: 'Monthly', detail: 'Build a steady routine' },
  { code: 'semester', name: 'Semester', detail: 'For the long run' },
]

export default function Home() {
  return <main className="campus-site">
    <header className="campus-header">
      <Brand />
      <nav aria-label="Main navigation">
        <a href="#about">About the gym</a>
        <a href="#membership">Membership</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="campus-header-actions">
        <Link href="/login" className="campus-signin">Member sign in</Link>
        <Link href="/join" className="campus-button campus-button-dark">Join the gym <ArrowUpRight size={15} /></Link>
      </div>
    </header>

    <section className="campus-hero">
      <div className="campus-hero-copy">
        <span className="campus-kicker"><i /> YOUR CAMPUS GYM</span>
        <h1>Show up.<br />Put in the work.</h1>
        <p>A straightforward place to lift, move and build a routine. Come as you are. Train at your pace. Keep getting stronger.</p>
        <div className="campus-hero-actions">
          <Link href="/join" className="campus-button campus-button-dark">Get started <ArrowRight size={16} /></Link>
          <Link href="/login" className="campus-text-link">Already a member? Sign in</Link>
        </div>
        <div className="campus-quick-points">
          <span><Dumbbell size={15} /> Practical workouts</span>
          <span><Clock3 size={15} /> Guided rest breaks</span>
          <span><Target size={15} /> Track your progress</span>
        </div>
      </div>
      <div className="campus-hero-image">
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=85" alt="Gym floor with strength training equipment" />
        <div className="campus-photo-label"><span>LEGRANDE FITNESS CENTER</span><strong>MAKE TODAY COUNT.</strong></div>
      </div>
    </section>

    <section className="campus-intro" id="about">
      <div><span className="campus-section-label">THE GYM</span><h2>Good training.<br /><span>No fuss.</span></h2></div>
      <p>You do not need a complicated plan to get started. Choose a workout, follow the movements, take your rest breaks and record the work you complete. The goal is to make it easier to come back for your next session.</p>
    </section>

    <section className="campus-features">
      <article><span className="campus-feature-icon"><Dumbbell size={20} /></span><span className="campus-section-label">01 / TRAIN</span><h3>Know what to do.</h3><p>Simple gym and no-equipment routines with movement photos, sets and reps.</p></article>
      <article><span className="campus-feature-icon"><Clock3 size={20} /></span><span className="campus-section-label">02 / KEEP YOUR PACE</span><h3>Take your rest breaks.</h3><p>Use the built-in workout timer and recovery countdown between sets.</p></article>
      <article><span className="campus-feature-icon"><Flame size={20} /></span><span className="campus-section-label">03 / KEEP GOING</span><h3>See your progress.</h3><p>Save sessions, build consistency and see how far your training has come.</p></article>
    </section>

    <section className="campus-membership" id="membership">
      <div className="campus-membership-heading">
        <div><span className="campus-section-label">MEMBERSHIP</span><h2>Pick your <span>pace.</span></h2></div>
        <p>Not sure which option suits you? Send an enquiry and the gym team can explain the current student rates and how to get started.</p>
      </div>
      <div className="campus-plan-grid">
        {plans.map(plan => <Link href={'/join?plan=' + plan.code} key={plan.code} className="campus-plan"><span>{plan.name}</span><small>{plan.detail}</small><ArrowUpRight size={18} /></Link>)}
      </div>
      <p className="campus-membership-note">Rates and payment are confirmed by the gym team. No payment is collected on this website.</p>
    </section>

    <section className="campus-contact" id="contact">
      <div className="campus-contact-image"><img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1a?auto=format&fit=crop&w=1300&q=85" alt="Athlete training with weights" /></div>
      <div className="campus-contact-copy">
        <span className="campus-section-label">NEED A HAND?</span>
        <h2>Questions before<br />you <span>join?</span></h2>
        <p>Ask about membership, visiting the gym or getting started with a workout. Send a quick message and the team can get back to you.</p>
        <Link href="/join" className="campus-button campus-button-light">Talk to the gym team <MessageCircle size={16} /></Link>
      </div>
    </section>

    <footer className="campus-footer">
      <Brand /><span>TRAIN AT YOUR PACE. KEEP SHOWING UP.</span>
      <div><Link href="/join">Join the gym</Link><Link href="/login">Member sign in</Link><Link href="/admin">Staff access</Link></div>
      <small>© {new Date().getFullYear()} LeGrande Fitness Center</small>
    </footer>
  </main>
}