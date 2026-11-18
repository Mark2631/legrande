import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Check, Clock3, Dumbbell, LineChart, ShieldCheck } from 'lucide-react'

const plans = [
  { name: 'Day pass', duration: '01 day', note: 'A single day to get started', code: 'daily' },
  { name: 'Weekly', duration: '07 days', note: 'A focused week of training', code: 'weekly' },
  { name: 'Monthly', duration: '30 days', note: 'A month to build momentum', code: 'monthly' },
  { name: 'Semester', duration: '120 days', note: 'A longer training commitment', code: 'semester' },
]

export const metadata = {
  title: 'LeGrande Fitness Center | Train with purpose',
  description: 'A considered place to train, build strength and keep your progress moving. Explore LeGrande membership and the member training space.',
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className={compact ? 'site-brand compact' : 'site-brand'}>
    <img src="/legrande-logo.png" alt="LeGrande Fitness Center" />
    <span><strong>LEGRANDE</strong><small>FITNESS CENTER</small></span>
  </Link>
}

export default function Home() {
  return <main className="public-site">
    <header className="site-header">
      <Brand />
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#approach">The approach</a>
        <a href="#member-space">Member space</a>
        <a href="#membership">Membership</a>
      </nav>
      <div className="site-header-actions">
        <Link href="/login" className="login-link">Member sign in</Link>
        <Link href="/join" className="header-cta">Join LeGrande <ArrowUpRight size={15} /></Link>
      </div>
    </header>

    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow-line"><span className="eyebrow-dot" /> LEGRANDE FITNESS CENTER <span className="eyebrow-divider">/</span> TRAINING CULTURE</div>
        <h1>Make strength<br />part of your <em>life.</em></h1>
        <p className="hero-lede">A place to train with purpose, build a routine that lasts and see the work add up. Start where you are. Keep moving forward.</p>
        <div className="hero-actions">
          <Link href="/join" className="button-primary">Explore membership <ArrowRight size={16} /></Link>
          <Link href="/login" className="button-quiet">I’m already a member</Link>
        </div>
        <div className="hero-note"><span className="note-mark">01</span><span>SHOW UP</span><i /> <span>TRAIN WITH INTENT</span><i /> <span>RETURN STRONGER</span></div>
      </div>
      <div className="hero-visual">
        <img src="https://images.unsplash.com/photo-1758875569256-f37c438cac65?auto=format&fit=crop&w=1600&q=85" alt="Athlete training with a barbell in a gym" />
        <div className="hero-image-shade" />
        <div className="hero-image-caption"><span>THE WORK IS YOURS.</span><strong>01 / TRAINING</strong></div>
        <div className="hero-side-label">DISCIPLINE · CONSISTENCY · PROGRESS</div>
      </div>
      <div className="hero-bottom-mark"><span>01</span><i /><span>04</span></div>
    </section>

    <section className="statement-band" aria-label="LeGrande training statement">
      <span>TRAIN WITH PURPOSE</span><i /><p>Progress is built on the days you choose to come back.</p><i /><span>LEGRANDE / THE LONG GAME</span>
    </section>

    <section className="approach-section section-wrap" id="approach">
      <div className="section-side">
        <span className="section-index">01 / OUR APPROACH</span>
        <span className="section-side-note">A BETTER ROUTINE STARTS HERE</span>
      </div>
      <div className="approach-main">
        <div className="approach-heading">
          <h2>Training should<br />feel <em>intentional.</em></h2>
          <p>Less guesswork between sessions. More clarity about what to do, what you have done and where you are heading.</p>
        </div>
        <div className="approach-grid">
          <article className="approach-card">
            <div className="approach-card-icon"><Dumbbell size={19} strokeWidth={1.6} /></div>
            <span>01 — PLAN</span><h3>A plan to follow</h3>
            <p>Structured training programmes with clear exercises, sets, reps and rest guidance.</p>
          </article>
          <article className="approach-card">
            <div className="approach-card-icon"><Clock3 size={19} strokeWidth={1.6} /></div>
            <span>02 — PRACTICE</span><h3>Sessions that count</h3>
            <p>Log your gym or home sessions, keep your place and build a history of consistent work.</p>
          </article>
          <article className="approach-card">
            <div className="approach-card-icon"><LineChart size={19} strokeWidth={1.6} /></div>
            <span>03 — PROGRESS</span><h3>See the difference</h3>
            <p>Review completed workouts, track body measurements and understand your progress over time.</p>
          </article>
        </div>
      </div>
    </section>

    <section className="member-feature" id="member-space">
      <div className="member-feature-image">
        <img src="https://images.unsplash.com/photo-1775993167571-cd1ff4cadada?auto=format&fit=crop&w=1400&q=85" alt="Strength and cardio equipment in a modern training space" />
        <span className="image-credit">TRAINING ENVIRONMENT / VISUAL REFERENCE</span>
      </div>
      <div className="member-feature-copy">
        <span className="eyebrow">02 / YOUR MEMBER SPACE</span>
        <h2>Your training,<br />all in <em>one place.</em></h2>
        <p>Keep your plan, workout log and progress history close. The LeGrande member space is designed to make each session easier to follow and easier to remember.</p>
        <ul>
          <li><Check size={15} /> Guided gym and home programmes</li>
          <li><Check size={15} /> Live workout logging and session history</li>
          <li><Check size={15} /> Bodyweight and measurement tracking</li>
          <li><Check size={15} /> Personal training preferences</li>
        </ul>
        <Link href="/register" className="text-link">Create your member account <ArrowRight size={16} /></Link>
      </div>
      <div className="member-preview" aria-label="Member space preview">
        <div className="preview-top"><span>LEGRANDE / MEMBER</span><span className="preview-status"><i /> MEMBER SPACE</span></div>
        <div className="preview-greeting"><small>YOUR TRAINING PLAN</small><strong>Built around you</strong><span>Gym and home routines</span></div>
        <div className="preview-progress"><div><span>YOUR PROGRESS</span><strong>Sessions <small>· Bodyweight · Streaks</small></strong></div><div className="preview-bars" aria-hidden="true"><i /><i /><i /><b /></div></div>
        <div className="preview-row"><span><Dumbbell size={15} /> Training plan</span><ArrowUpRight size={15} /></div>
        <div className="preview-row"><span><LineChart size={15} /> Progress history</span><ArrowUpRight size={15} /></div>
        <div className="preview-footer">A LITTLE BETTER THAN LAST TIME.</div>
      </div>
    </section>

    <section className="quote-section">
      <div className="quote-rule"><span>03 / A TRAINING NOTE</span><i /></div>
      <blockquote>“A strong routine is built one session at a time. Progress comes from returning.”</blockquote>
      <div className="quote-credit"><span /> LEGRANDE / THE LONG GAME</div>
    </section>

    <section className="membership-section section-wrap" id="membership">
      <div className="section-side">
        <span className="section-index">04 / MEMBERSHIP</span>
        <span className="section-side-note">CHOOSE YOUR RHYTHM</span>
      </div>
      <div className="membership-main">
        <div className="membership-heading">
          <div><span className="eyebrow">A PLACE FOR YOUR NEXT SESSION</span><h2>Find your <em>pace.</em></h2></div>
          <p>Choose the membership period that suits you. The LeGrande team will confirm current rates, payment and activation.</p>
        </div>
        <div className="membership-list">
          {plans.map((plan, index) => <article key={plan.code} className="membership-row">
            <span className="membership-number">0{index + 1}</span>
            <div className="membership-plan-name"><h3>{plan.name}</h3><p>{plan.note}</p></div>
            <strong className="membership-duration">{plan.duration}</strong>
            <Link href={'/join?plan=' + plan.code} aria-label={'Enquire about ' + plan.name} className="membership-arrow"><ArrowUpRight size={18} /></Link>
          </article>)}
        </div>
        <div className="membership-footnote"><ShieldCheck size={15} /><span>Membership is activated by the LeGrande team after payment confirmation. No payment is collected on this website.</span></div>
      </div>
    </section>


    <section className="faq-section section-wrap" id="before-you-join">
      <div className="section-side">
        <span className="section-index">05 / GOOD TO KNOW</span>
        <span className="section-side-note">BEFORE YOUR FIRST SESSION</span>
      </div>
      <div className="faq-main">
        <div className="faq-heading">
          <div><span className="eyebrow">A FEW USEFUL DETAILS</span><h2>Before you<br /><em>get started.</em></h2></div>
          <p>Clear answers about getting in touch, setting up your account and activating membership.</p>
        </div>
        <div className="faq-list">
          <details open>
            <summary><span>01</span><strong>What happens after I send a membership enquiry?</strong><i /></summary>
            <p>The LeGrande team follows up using the contact details you provide to discuss the current rate, payment and next steps.</p>
          </details>
          <details>
            <summary><span>02</span><strong>When does my gym access become active?</strong><i /></summary>
            <p>Membership access is activated by LeGrande after payment is confirmed. Your member account then reflects the issued membership dates.</p>
          </details>
          <details>
            <summary><span>03</span><strong>What can I do in the member space?</strong><i /></summary>
            <p>Build a training profile, follow gym and home programmes, record workouts and review your training and bodyweight history.</p>
          </details>
          <details>
            <summary><span>04</span><strong>Do I need to create an account before enquiring?</strong><i /></summary>
            <p>No. You can send a membership enquiry first. Your member account is a separate step for keeping your training profile and history.</p>
          </details>
        </div>
        <div className="faq-cta"><span>STILL HAVE A QUESTION?</span><Link href="/join">Speak to the LeGrande team <ArrowUpRight size={14} /></Link></div>
      </div>
    </section>

    <section className="closing-section">
      <div className="closing-copy">
        <span className="eyebrow">YOUR NEXT SESSION STARTS WITH A DECISION</span>
        <h2>Ready to get<br />back to <em>work?</em></h2>
        <Link href="/join" className="button-primary button-light">Start a membership enquiry <ArrowRight size={16} /></Link>
      </div>
      <div className="closing-image"><img src="https://images.unsplash.com/photo-1758875568651-85952a0e0ce8?auto=format&fit=crop&w=1100&q=85" alt="A member lifting weights during a gym session" /></div>
    </section>

    <footer className="site-footer">
      <div className="footer-main">
        <Brand compact />
        <p>TRAIN WITH PURPOSE.<br />RETURN WITH PROGRESS.</p>
        <div className="footer-links"><Link href="/join">Membership enquiry</Link><Link href="/login">Member sign in</Link><a href="#approach">The approach</a></div>
        <div className="footer-contact"><span>QUESTIONS ABOUT VISITING?</span><Link href="/join">Contact the LeGrande team <ArrowUpRight size={13} /></Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} LEGRANDE FITNESS CENTER</span><span>TRAINING IS A PRACTICE.</span><Link href="/admin" className="staff-link">Staff access</Link><span className="stock-credit">Visual references: Unsplash</span></div>
    </footer>
  </main>
}
