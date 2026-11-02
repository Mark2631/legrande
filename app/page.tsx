'use client'

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, Award, BarChart3, CalendarDays, Check,
  CheckCircle2, ChevronRight, Clock3, Dumbbell, Droplets, Flame, HeartPulse,
  History, Home, Info, Moon, Plus, RotateCcw, Save, Search, ShieldCheck, Sparkles,
  Sun, Target, Timer, TrendingUp, Trophy, UserRound, Utensils, Weight, X, Zap
} from 'lucide-react'

type Goal = 'build_muscle' | 'strength' | 'fat_loss' | 'general_fitness'
type Level = 'beginner' | 'intermediate' | 'advanced'
type Units = 'metric' | 'imperial'
type Tab = 'today' | 'train' | 'progress' | 'fuel' | 'profile'
type Profile = {
  name: string
  goal: Goal
  level: Level
  weeklyTarget: number
  units: Units
  themeDark: boolean
  onboardingComplete: boolean
  heightCm: number | null
  proteinTarget: number
}
type SetEntry = { id: string; reps: number; weightKg: number; rir: number; done: boolean }
type WorkoutExercise = {
  id: string
  name: string
  muscle: string
  equipment: string
  cue: string
  sets: SetEntry[]
  restSeconds: number
}
type ActiveWorkout = {
  id: string
  title: string
  focus: string
  startedAt: number
  exercises: WorkoutExercise[]
  notes: string
}
type Session = {
  id: string
  date: string
  startedAt: number
  finishedAt: number
  title: string
  focus: string
  durationMin: number
  exercises: WorkoutExercise[]
  notes: string
}
type WeightLog = { date: string; kg: number }
type MeasurementLog = { date: string; waistCm?: number; chestCm?: number; armCm?: number; thighCm?: number }
type DailyLog = { date: string; waterCups: number; proteinGrams: number; sleepHours?: number; energy?: number; soreness?: number; note?: string }
type Store = {
  version: 2
  profile: Profile
  sessions: Session[]
  weightLogs: WeightLog[]
  measurementLogs: MeasurementLog[]
  dailyLogs: DailyLog[]
}
type ProgramExercise = { name: string; muscle: string; equipment: string; sets: number; reps: number; rest: number; cue: string }
type Program = { id: string; title: string; focus: string; level: Level; duration: number; description: string; exercises: ProgramExercise[] }

const STORE_KEY = 'legrande:member:v2'
const ACTIVE_KEY = 'legrande:active:v1'
const defaultProfile: Profile = {
  name: '', goal: 'build_muscle', level: 'beginner', weeklyTarget: 4,
  units: 'metric', themeDark: false, onboardingComplete: false,
  heightCm: null, proteinTarget: 0
}
const emptyStore: Store = {
  version: 2, profile: defaultProfile, sessions: [], weightLogs: [],
  measurementLogs: [], dailyLogs: []
}

const PROGRAMS: Program[] = [
  {
    id: 'full-a', title: 'Full body A', focus: 'Full body', level: 'beginner', duration: 45,
    description: 'A balanced session built around the main movement patterns.',
    exercises: [
      { name: 'Leg press', muscle: 'Quads', equipment: 'Machine', sets: 3, reps: 10, rest: 120, cue: 'Keep your lower back against the pad. Lower with control.' },
      { name: 'Machine chest press', muscle: 'Chest', equipment: 'Machine', sets: 3, reps: 10, rest: 90, cue: 'Keep shoulder blades supported and avoid locking out hard.' },
      { name: 'Lat pulldown', muscle: 'Back', equipment: 'Cable', sets: 3, reps: 10, rest: 90, cue: 'Drive elbows down. Avoid swinging your torso.' },
      { name: 'Dumbbell Romanian deadlift', muscle: 'Hamstrings', equipment: 'Dumbbells', sets: 2, reps: 10, rest: 120, cue: 'Push hips back and keep the weights close to your legs.' },
      { name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', sets: 2, reps: 30, rest: 60, cue: 'Keep ribs down and maintain a straight line from head to heels.' }
    ]
  },
  {
    id: 'full-b', title: 'Full body B', focus: 'Full body', level: 'beginner', duration: 45,
    description: 'A second full-body day with a different mix of movements.',
    exercises: [
      { name: 'Goblet squat', muscle: 'Quads', equipment: 'Dumbbell', sets: 3, reps: 10, rest: 120, cue: 'Brace before descending. Keep your whole foot grounded.' },
      { name: 'Incline dumbbell press', muscle: 'Upper chest', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 90, cue: 'Use a comfortable incline and lower the dumbbells under control.' },
      { name: 'Seated cable row', muscle: 'Back', equipment: 'Cable', sets: 3, reps: 10, rest: 90, cue: 'Lead with elbows and avoid leaning back to move the weight.' },
      { name: 'Seated leg curl', muscle: 'Hamstrings', equipment: 'Machine', sets: 2, reps: 12, rest: 75, cue: 'Move smoothly and pause briefly at the contracted position.' },
      { name: 'Dumbbell curl', muscle: 'Biceps', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Keep your elbows close to your sides.' }
    ]
  },
  {
    id: 'full-c', title: 'Full body C', focus: 'Full body', level: 'beginner', duration: 40,
    description: 'A shorter session to reinforce consistency and technique.',
    exercises: [
      { name: 'Dumbbell split squat', muscle: 'Quads', equipment: 'Dumbbells', sets: 3, reps: 8, rest: 120, cue: 'Use a stable stance and let both knees bend naturally.' },
      { name: 'Push-up', muscle: 'Chest', equipment: 'Bodyweight', sets: 3, reps: 8, rest: 75, cue: 'Keep your trunk braced. Elevate your hands to scale the movement.' },
      { name: 'Chest-supported row', muscle: 'Back', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 90, cue: 'Keep your chest on the bench and pull toward your lower ribs.' },
      { name: 'Dumbbell lateral raise', muscle: 'Shoulders', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Raise with control. Stop around shoulder height.' },
      { name: 'Dead bug', muscle: 'Core', equipment: 'Bodyweight', sets: 2, reps: 10, rest: 45, cue: 'Keep your lower back gently connected to the floor.' }
    ]
  },
  {
    id: 'push', title: 'Push day', focus: 'Chest · Shoulders · Triceps', level: 'intermediate', duration: 55,
    description: 'Pressing work for chest, shoulders and triceps.',
    exercises: [
      { name: 'Barbell bench press', muscle: 'Chest', equipment: 'Barbell', sets: 4, reps: 8, rest: 150, cue: 'Set your feet, brace, and lower the bar with control.' },
      { name: 'Incline dumbbell press', muscle: 'Upper chest', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 90, cue: 'Use a controlled range that keeps your shoulders comfortable.' },
      { name: 'Seated dumbbell shoulder press', muscle: 'Shoulders', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 90, cue: 'Keep your ribs stacked over your pelvis.' },
      { name: 'Dumbbell lateral raise', muscle: 'Side delts', equipment: 'Dumbbells', sets: 3, reps: 12, rest: 60, cue: 'Lead with elbows and avoid using momentum.' },
      { name: 'Cable triceps pushdown', muscle: 'Triceps', equipment: 'Cable', sets: 3, reps: 12, rest: 60, cue: 'Keep upper arms still and extend without swinging.' }
    ]
  },
  {
    id: 'pull', title: 'Pull day', focus: 'Back · Rear delts · Biceps', level: 'intermediate', duration: 55,
    description: 'Back and arm work with controlled pulling patterns.',
    exercises: [
      { name: 'Lat pulldown', muscle: 'Lats', equipment: 'Cable', sets: 4, reps: 10, rest: 90, cue: 'Pull elbows toward your sides without leaning far back.' },
      { name: 'Chest-supported row', muscle: 'Mid back', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 90, cue: 'Keep your chest supported and pause at the top.' },
      { name: 'Cable face pull', muscle: 'Rear delts', equipment: 'Cable', sets: 3, reps: 15, rest: 60, cue: 'Pull toward eye level and keep wrists neutral.' },
      { name: 'Dumbbell curl', muscle: 'Biceps', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 60, cue: 'Avoid swinging. Lower each repetition slowly.' },
      { name: 'Hammer curl', muscle: 'Brachialis', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Keep palms facing inward throughout the movement.' }
    ]
  },
  {
    id: 'legs', title: 'Leg day', focus: 'Quads · Hamstrings · Glutes', level: 'intermediate', duration: 60,
    description: 'A lower-body session with a squat and hinge emphasis.',
    exercises: [
      { name: 'Back squat', muscle: 'Quads', equipment: 'Barbell', sets: 4, reps: 8, rest: 150, cue: 'Brace before each rep and use a depth you can control.' },
      { name: 'Romanian deadlift', muscle: 'Hamstrings', equipment: 'Barbell', sets: 3, reps: 10, rest: 120, cue: 'Hinge at the hips and keep the bar close to your legs.' },
      { name: 'Leg press', muscle: 'Quads', equipment: 'Machine', sets: 3, reps: 12, rest: 90, cue: 'Use a pain-free range and keep your hips on the pad.' },
      { name: 'Seated leg curl', muscle: 'Hamstrings', equipment: 'Machine', sets: 3, reps: 12, rest: 75, cue: 'Control both the lifting and lowering phases.' },
      { name: 'Standing calf raise', muscle: 'Calves', equipment: 'Machine', sets: 3, reps: 15, rest: 60, cue: 'Use a full comfortable range and pause at the top.' }
    ]
  },
  {
    id: 'upper', title: 'Upper body', focus: 'Chest · Back · Arms', level: 'intermediate', duration: 50,
    description: 'A practical upper-body session for a four-day split.',
    exercises: [
      { name: 'Barbell bench press', muscle: 'Chest', equipment: 'Barbell', sets: 3, reps: 8, rest: 120, cue: 'Stay braced and keep each repetition consistent.' },
      { name: 'Seated cable row', muscle: 'Back', equipment: 'Cable', sets: 3, reps: 10, rest: 90, cue: 'Keep your torso steady as you row.' },
      { name: 'Lat pulldown', muscle: 'Lats', equipment: 'Cable', sets: 3, reps: 10, rest: 90, cue: 'Avoid shrugging and pull with your elbows.' },
      { name: 'Dumbbell lateral raise', muscle: 'Shoulders', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Use a load you can control without swinging.' },
      { name: 'Cable triceps pushdown', muscle: 'Triceps', equipment: 'Cable', sets: 2, reps: 12, rest: 60, cue: 'Keep your elbows close to your body.' }
    ]
  },
  {
    id: 'lower', title: 'Lower body', focus: 'Legs · Glutes · Core', level: 'intermediate', duration: 50,
    description: 'A second lower-body day with unilateral and machine work.',
    exercises: [
      { name: 'Leg press', muscle: 'Quads', equipment: 'Machine', sets: 3, reps: 12, rest: 100, cue: 'Keep your pelvis stable against the pad.' },
      { name: 'Dumbbell Romanian deadlift', muscle: 'Hamstrings', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 100, cue: 'Push hips back and keep a soft bend in the knees.' },
      { name: 'Dumbbell split squat', muscle: 'Quads', equipment: 'Dumbbells', sets: 2, reps: 10, rest: 90, cue: 'Hold a stable stance and lower under control.' },
      { name: 'Seated leg curl', muscle: 'Hamstrings', equipment: 'Machine', sets: 2, reps: 12, rest: 75, cue: 'Avoid bouncing through the movement.' },
      { name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', sets: 2, reps: 30, rest: 45, cue: 'Keep your hips level and breathe steadily.' }
    ]
  }
]

const EXERCISE_LIBRARY = [
  ...PROGRAMS.flatMap(p => p.exercises),
  { name: 'Dumbbell fly', muscle: 'Chest', equipment: 'Dumbbells', sets: 3, reps: 12, rest: 60, cue: 'Use a comfortable range and keep a soft bend in your elbows.' },
  { name: 'Cable chest fly', muscle: 'Chest', equipment: 'Cable', sets: 3, reps: 12, rest: 60, cue: 'Bring your hands together without shrugging.' },
  { name: 'Overhead cable triceps extension', muscle: 'Triceps', equipment: 'Cable', sets: 3, reps: 12, rest: 60, cue: 'Keep your upper arms steady as you extend.' },
  { name: 'Preacher curl', muscle: 'Biceps', equipment: 'Machine', sets: 3, reps: 10, rest: 60, cue: 'Avoid bouncing out of the bottom position.' },
  { name: 'Leg extension', muscle: 'Quads', equipment: 'Machine', sets: 3, reps: 12, rest: 60, cue: 'Move smoothly and avoid forceful locking.' },
  { name: 'Hip thrust', muscle: 'Glutes', equipment: 'Barbell', sets: 3, reps: 10, rest: 90, cue: 'Keep ribs down and pause briefly at the top.' },
  { name: 'Hanging knee raise', muscle: 'Core', equipment: 'Bodyweight', sets: 3, reps: 10, rest: 60, cue: 'Control the movement; avoid swinging.' },
  { name: 'Stationary bike', muscle: 'Conditioning', equipment: 'Cardio', sets: 1, reps: 10, rest: 0, cue: 'Start at a manageable pace and build gradually.' }
].filter((exercise, index, array) => array.findIndex(item => item.name === exercise.name) === index)

const NAV_ITEMS = [
  { id: 'today' as Tab, label: 'Overview', icon: Home },
  { id: 'train' as Tab, label: 'Training', icon: Dumbbell },
  { id: 'progress' as Tab, label: 'Progress', icon: TrendingUp },
  { id: 'fuel' as Tab, label: 'Fuel & recovery', icon: HeartPulse },
  { id: 'profile' as Tab, label: 'My profile', icon: UserRound }
]

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
function dateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}
function weekStart(date = new Date()) {
  const copy = new Date(date)
  copy.setHours(12, 0, 0, 0)
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7))
  return copy
}
function weekSessions(sessions: Session[], date = new Date()) {
  const start = weekStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const from = dateKey(start)
  const to = dateKey(end)
  return sessions.filter(session => session.date >= from && session.date < to)
}
function currentStreak(sessions: Session[], target: number) {
  const now = new Date()
  let cursor = weekStart(now)
  const currentCount = weekSessions(sessions, now).length
  if (currentCount < target && now.getDay() !== 0) cursor.setDate(cursor.getDate() - 7)
  let streak = 0
  while (weekSessions(sessions, cursor).length >= target) {
    streak += 1
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}
function bestStreak(sessions: Session[], target: number) {
  const weeks = Array.from(new Set(sessions.map(session => {
    const d = new Date(session.date + 'T12:00:00')
    return dateKey(weekStart(d))
  }))).sort()
  let best = 0
  let run = 0
  let previous = ''
  weeks.forEach(week => {
    const count = sessions.filter(session => {
      const date = new Date(session.date + 'T12:00:00')
      return dateKey(weekStart(date)) === week
    }).length
    const consecutive = previous && (new Date(week).getTime() - new Date(previous).getTime()) === 7 * 86400000
    run = count >= target ? (consecutive ? run + 1 : 1) : 0
    best = Math.max(best, run)
    previous = week
  })
  return best
}
function getProgramForDay(date: Date, target: number, level: Level = 'beginner') {
  const day = (date.getDay() + 6) % 7
  const beginnerSchedules: Record<number, { days: number[]; ids: string[] }> = {
    3: { days: [0, 2, 4], ids: ['full-a', 'full-b', 'full-c'] },
    4: { days: [0, 1, 3, 5], ids: ['full-a', 'full-b', 'full-c', 'full-a'] },
    5: { days: [0, 1, 2, 4, 5], ids: ['full-a', 'full-b', 'full-c', 'full-a', 'full-b'] },
    6: { days: [0, 1, 2, 3, 4, 5], ids: ['full-a', 'full-b', 'full-c', 'full-a', 'full-b', 'full-c'] }
  }
  const experiencedSchedules: Record<number, { days: number[]; ids: string[] }> = {
    3: { days: [0, 2, 4], ids: ['full-a', 'full-b', 'full-c'] },
    4: { days: [0, 1, 3, 5], ids: ['upper', 'lower', 'upper', 'lower'] },
    5: { days: [0, 1, 2, 4, 5], ids: ['push', 'pull', 'legs', 'upper', 'lower'] },
    6: { days: [0, 1, 2, 3, 4, 5], ids: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] }
  }
  const schedules = level === 'beginner' ? beginnerSchedules : experiencedSchedules
  const schedule = schedules[target] || schedules[4]
  const index = schedule.days.indexOf(day)
  if (index < 0) return null
  return PROGRAMS.find(program => program.id === schedule.ids[index]) || null
}
function latestSet(sessions: Session[], exerciseName: string) {
  for (const session of sessions) {
    const exercise = session.exercises.find(item => item.name === exerciseName)
    if (exercise) {
      const sets = exercise.sets.filter(set => set.done)
      if (sets.length) return sets[sets.length - 1]
    }
  }
  return null
}
function programFromSession(session: Session, level: Level): Program {
  return {
    id: 'repeat-' + session.id,
    title: 'Repeat · ' + session.title,
    focus: session.focus,
    level,
    duration: Math.max(20, session.durationMin),
    description: 'A copy of your last completed session. Previous loads will be prefilled where available.',
    exercises: session.exercises.map(exercise => ({
      name: exercise.name,
      muscle: exercise.muscle,
      equipment: exercise.equipment,
      sets: Math.max(1, exercise.sets.length),
      reps: exercise.sets.find(set => set.done)?.reps || 10,
      rest: exercise.restSeconds,
      cue: exercise.cue || 'Use a controlled range of motion and a load you can manage.'
    }))
  }
}

function buildWorkout(program: Program, sessions: Session[]): ActiveWorkout {
  return {
    id: makeId(), title: program.title, focus: program.focus, startedAt: Date.now(), notes: '',
    exercises: program.exercises.map(item => {
      const previous = latestSet(sessions, item.name)
      return {
        id: makeId(), name: item.name, muscle: item.muscle, equipment: item.equipment,
        cue: item.cue, restSeconds: item.rest,
        sets: Array.from({ length: item.sets }, () => ({
          id: makeId(), reps: previous ? previous.reps : item.reps,
          weightKg: previous ? previous.weightKg : 0, rir: 2, done: false
        }))
      }
    })
  }
}
function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return String(minutes).padStart(2, '0') + ':' + String(remainder).padStart(2, '0')
}
function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}
function prettyDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return hours ? hours + 'h ' + remaining + 'm' : remaining + ' min'
}
function totalVolume(sessions: Session[]) {
  return sessions.reduce((total, session) => total + session.exercises.reduce((sum, exercise) =>
    sum + exercise.sets.filter(set => set.done).reduce((volume, set) => volume + set.weightKg * set.reps, 0), 0), 0)
}
function displayWeight(kg: number, units: Units) {
  return units === 'imperial' ? kg * 2.20462 : kg
}
function toKg(value: string | number, units: Units) {
  const number = Number(value)
  return units === 'imperial' ? number / 2.20462 : number
}
function getDailyLog(store: Store, date = dateKey()): DailyLog {
  return store.dailyLogs.find(log => log.date === date) || { date, waterCups: 0, proteinGrams: 0 }
}
function safeReadStore(): Store {
  try {
    const current = localStorage.getItem(STORE_KEY)
    if (current) {
      const parsed = JSON.parse(current) as Partial<Store>
      return {
        version: 2,
        profile: { ...defaultProfile, ...(parsed.profile || {}) },
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        weightLogs: Array.isArray(parsed.weightLogs) ? parsed.weightLogs : [],
        measurementLogs: Array.isArray(parsed.measurementLogs) ? parsed.measurementLogs : [],
        dailyLogs: Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs : []
      }
    }
    const legacyText = localStorage.getItem('lgg:v1')
    if (legacyText) {
      const legacy = JSON.parse(legacyText) as {
        profile?: Partial<Profile>
        sessions?: Array<{ id?: string; date: string; type?: string; durationMin?: number; exercises?: Array<{ name: string; sets: Array<{ reps: number; weightKg: number }> }> }>
        weightLogs?: WeightLog[]
        measurementLogs?: MeasurementLog[]
      }
      const migratedSessions: Session[] = (legacy.sessions || []).map(item => {
        const startedAt = new Date(item.date + 'T08:00:00').getTime()
        return {
          id: item.id || makeId(), date: item.date, startedAt,
          finishedAt: startedAt + (item.durationMin || 45) * 60000,
          title: item.type === 'home' ? 'Home workout' : 'Gym session',
          focus: 'Previous session', durationMin: item.durationMin || 45,
          exercises: (item.exercises || []).map(exercise => ({
            id: makeId(), name: exercise.name, muscle: 'General', equipment: 'Previous log',
            cue: '', restSeconds: 60,
            sets: exercise.sets.map(set => ({ id: makeId(), reps: set.reps, weightKg: set.weightKg, rir: 2, done: true }))
          })), notes: ''
        }
      })
      const oldGoal = String(legacy.profile?.goal || '')
      const migratedGoal: Goal = oldGoal === 'lose_fat'
        ? 'fat_loss'
        : oldGoal === 'stay_consistent'
          ? 'general_fitness'
          : oldGoal === 'strength' || oldGoal === 'fat_loss' || oldGoal === 'general_fitness'
            ? oldGoal
            : 'build_muscle'
      const migrated: Store = {
        version: 2,
        profile: { ...defaultProfile, ...(legacy.profile || {}), goal: migratedGoal, onboardingComplete: true },
        sessions: migratedSessions,
        weightLogs: legacy.weightLogs || [],
        measurementLogs: legacy.measurementLogs || [],
        dailyLogs: []
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(migrated))
      return migrated
    }
  } catch {
    return { ...emptyStore, profile: { ...defaultProfile } }
  }
  return { ...emptyStore, profile: { ...defaultProfile } }
}

export default function Page() {
  const [store, setStore] = useState<Store | null>(null)
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null)
  const [pausedWorkout, setPausedWorkout] = useState<ActiveWorkout | null>(null)
  const [tab, setTab] = useState<Tab>('today')
  const [modal, setModal] = useState<'weight' | 'measurement' | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const loaded = safeReadStore()
    setStore(loaded)
    try {
      const active = localStorage.getItem(ACTIVE_KEY)
      if (active) setPausedWorkout(JSON.parse(active) as ActiveWorkout)
    } catch {
      localStorage.removeItem(ACTIVE_KEY)
    }
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  const persist = (next: Store) => {
    setStore(next)
    localStorage.setItem(STORE_KEY, JSON.stringify(next))
  }
  const updateDaily = (patch: Partial<DailyLog>) => {
    if (!store) return
    const today = getDailyLog(store)
    const nextLog = { ...today, ...patch, date: dateKey() }
    persist({ ...store, dailyLogs: [nextLog, ...store.dailyLogs.filter(log => log.date !== dateKey())] })
  }
  const startWorkout = (program: Program) => {
    const next = buildWorkout(program, store?.sessions || [])
    setActiveWorkout(next)
    setPausedWorkout(null)
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next))
  }
  const repeatSession = (session: Session) => {
    if (!store) return
    startWorkout(programFromSession(session, store.profile.level))
  }
  const saveActive = (next: ActiveWorkout) => {
    setActiveWorkout(next)
    setPausedWorkout(null)
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(next))
  }
  const finishWorkout = () => {
    if (!store || !activeWorkout) return
    const completedSets = activeWorkout.exercises.reduce((sum, exercise) => sum + exercise.sets.filter(set => set.done).length, 0)
    if (!completedSets) {
      setToast('Complete at least one set before finishing.')
      window.setTimeout(() => setToast(''), 2200)
      return
    }
    const finishedAt = Date.now()
    const session: Session = {
      id: activeWorkout.id, date: dateKey(new Date(activeWorkout.startedAt)),
      startedAt: activeWorkout.startedAt, finishedAt,
      title: activeWorkout.title, focus: activeWorkout.focus,
      durationMin: Math.max(1, Math.round((finishedAt - activeWorkout.startedAt) / 60000)),
      exercises: activeWorkout.exercises.map(exercise => ({
        ...exercise, sets: exercise.sets.map(set => ({ ...set }))
      })), notes: activeWorkout.notes
    }
    persist({ ...store, sessions: [session, ...store.sessions] })
    setActiveWorkout(null)
    setPausedWorkout(null)
    localStorage.removeItem(ACTIVE_KEY)
    setTab('progress')
    setToast('Workout saved. Every rep is on record.')
    window.setTimeout(() => setToast(''), 2600)
  }
  const resetData = () => {
    localStorage.removeItem(STORE_KEY)
    localStorage.removeItem(ACTIVE_KEY)
    setActiveWorkout(null)
    setStore({ ...emptyStore, profile: { ...defaultProfile } })
  }
  const importData = (next: Store) => {
    const normalized: Store = {
      version: 2, profile: { ...defaultProfile, ...next.profile },
      sessions: Array.isArray(next.sessions) ? next.sessions : [],
      weightLogs: Array.isArray(next.weightLogs) ? next.weightLogs : [],
      measurementLogs: Array.isArray(next.measurementLogs) ? next.measurementLogs : [],
      dailyLogs: Array.isArray(next.dailyLogs) ? next.dailyLogs : []
    }
    persist(normalized)
    setActiveWorkout(null)
    localStorage.removeItem(ACTIVE_KEY)
  }

  if (!store) return <div className="loading-screen"><div className="brand-mark">LF</div><p>Preparing your training space</p></div>
  if (!store.profile.onboardingComplete) return <Onboarding onComplete={(profile, firstLog) => persist({ ...emptyStore, profile, weightLogs: firstLog ? [firstLog] : [] })} />

  if (activeWorkout) {
    return <WorkoutRunner
      workout={activeWorkout}
      sessions={store.sessions}
      units={store.profile.units}
      themeDark={store.profile.themeDark}
      onChange={saveActive}
      onFinish={finishWorkout}
      onExit={() => {
        if (window.confirm('Pause this workout and return to your member space? Your sets will remain saved.')) { setPausedWorkout(activeWorkout); setActiveWorkout(null); setTab('today') }
      }}
    />
  }

  return (
    <div className={store.profile.themeDark ? 'app-shell dark' : 'app-shell light'}>
      <aside className="sidebar">
        <Brand />
        <p className="nav-caption">MEMBER SPACE</p>
        <nav className="side-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} className={tab === item.id ? 'nav-item active' : 'nav-item'} onClick={() => setTab(item.id)}>
                <Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>
                {tab === item.id && <i />}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="member-mini"><div className="avatar">{store.profile.name.slice(0, 1).toUpperCase()}</div><div><strong>{store.profile.name}</strong><span>{store.profile.level} member</span></div></div>
          <div className="offline-note"><ShieldCheck size={15} /> Your data stays on this device</div>
        </div>
      </aside>

      <div className="app-main">
        <header className="mobile-header"><Brand /><div className="avatar">{store.profile.name.slice(0, 1).toUpperCase()}</div></header>
        <div className="topline">
          <div><span className="eyebrow">LEGRANDE FITNESS CENTER</span><span className="topline-separator">/</span><span className="topline-current">{NAV_ITEMS.find(item => item.id === tab)?.label}</span></div>
          <button className="theme-button" onClick={() => persist({ ...store, profile: { ...store.profile, themeDark: !store.profile.themeDark } })}>
            {store.profile.themeDark ? <Sun size={16} /> : <Moon size={16} />} <span>{store.profile.themeDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
        <main className="page-content">
          {tab === 'today' && <Dashboard store={store} onStart={startWorkout} onWeight={() => setModal('weight')} onTrain={() => setTab('train')} pausedWorkout={pausedWorkout} onResume={workout => { setActiveWorkout(workout); setPausedWorkout(null) }} />}
          {tab === 'train' && <TrainingPage store={store} onStart={startWorkout} onRepeat={repeatSession} />}
          {tab === 'progress' && <ProgressPage store={store} onWeight={() => setModal('weight')} onMeasurement={() => setModal('measurement')} />}
          {tab === 'fuel' && <FuelPage store={store} updateDaily={updateDaily} />}
          {tab === 'profile' && <ProfilePage store={store} persist={persist} resetData={resetData} onImport={importData} />}
        </main>
      </div>

      {modal === 'weight' && <WeightModal store={store} close={() => setModal(null)} persist={persist} />}
      {modal === 'measurement' && <MeasurementModal store={store} close={() => setModal(null)} persist={persist} />}
      {toast && <div className="toast"><CheckCircle2 size={16} />{toast}</div>}
      <nav className="mobile-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><Icon size={19} /><span>{item.id === 'fuel' ? 'Fuel' : item.id === 'progress' ? 'Progress' : item.id === 'profile' ? 'Profile' : item.id === 'train' ? 'Train' : 'Today'}</span></button>
        })}
      </nav>
    </div>
  )
}

function Brand() {
  return <div className="brand-lockup">
    <img src="/logo.svg" alt="LeGrande Fitness Center LF logo" />
    <div><strong>LEGRANDE</strong><span>FITNESS CENTER</span></div>
  </div>
}

function Onboarding({ onComplete }: { onComplete: (profile: Profile, firstLog?: WeightLog) => void }) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<Profile>({ ...defaultProfile })
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const update = (patch: Partial<Profile>) => setProfile(current => ({ ...current, ...patch }))
  const canContinue = step === 1 ? profile.name.trim().length > 1 : step === 2 ? (!weight || Number(weight) > 0) : true
  const finish = () => {
    const firstLog: WeightLog | undefined = Number(weight) > 0
      ? { date: dateKey(), kg: toKg(weight, profile.units) }
      : undefined
    onComplete({
      ...profile,
      heightCm: Number(height) > 0 ? (profile.units === 'imperial' ? Number(height) * 2.54 : Number(height)) : null,
      onboardingComplete: true,
      goal: profile.goal || 'build_muscle'
    }, firstLog)
  }
  return <div className="onboarding-screen">
    <div className="onboarding-panel">
      <div className="onboard-brand"><Brand /><span className="onboard-step">STEP {step} OF 3</span></div>
      <div className="onboard-progress"><i style={{ width: (step / 3 * 100) + '%' }} /></div>
      {step === 1 && <>
        <span className="eyebrow">YOUR TRAINING STARTS HERE</span>
        <h1>Build a routine that <em>belongs to you.</em></h1>
        <p className="onboard-lede">A simple training space for the work you put in, the numbers you improve, and the habits you keep.</p>
        <label className="field-label">What should we call you?<input autoFocus value={profile.name} onChange={event => update({ name: event.target.value })} placeholder="Your first name" maxLength={42} /></label>
        <span className="field-label">What are you working towards?</span>
        <div className="choice-grid">
          {[
            ['build_muscle', 'Build muscle', 'Size, balance and control'],
            ['strength', 'Get stronger', 'Track the lifts that matter'],
            ['fat_loss', 'Lose body fat', 'Build repeatable habits'],
            ['general_fitness', 'Feel fitter', 'Fitness for everyday life']
          ].map(([value, title, description]) => <button key={value} className={profile.goal === value ? 'choice-card selected' : 'choice-card'} onClick={() => update({ goal: value as Goal })}><strong>{title}</strong><span>{description}</span></button>)}
        </div>
        <span className="field-label">Training experience</span>
        <div className="segmented">
          <button className={profile.level === 'beginner' ? 'selected' : ''} onClick={() => update({ level: 'beginner' })}>Beginner</button>
          <button className={profile.level === 'intermediate' ? 'selected' : ''} onClick={() => update({ level: 'intermediate' })}>Intermediate</button>
          <button className={profile.level === 'advanced' ? 'selected' : ''} onClick={() => update({ level: 'advanced' })}>Advanced</button>
        </div>
      </>}
      {step === 2 && <>
        <span className="eyebrow">A STARTING POINT, NOT A SCORE</span>
        <h1>Set your <em>baseline.</em></h1>
        <p className="onboard-lede">These details help you read your own progress. You can skip the numbers you do not want to track.</p>
        <label className="field-label">Current weight <span className="unit-label">{profile.units === 'metric' ? 'KG' : 'LB'}</span><input type="number" inputMode="decimal" value={weight} onChange={event => setWeight(event.target.value)} placeholder="e.g. 72" min="1" /></label>
        <div className="segmented"><button className={profile.units === 'metric' ? 'selected' : ''} onClick={() => update({ units: 'metric' })}>Metric · kg</button><button className={profile.units === 'imperial' ? 'selected' : ''} onClick={() => update({ units: 'imperial' })}>Imperial · lb</button></div>
        <label className="field-label">Height <span className="optional">OPTIONAL</span><input type="number" inputMode="decimal" value={height} onChange={event => setHeight(event.target.value)} placeholder={profile.units === 'metric' ? 'cm' : 'inches'} /></label>
        <div className="target-picker"><div><strong>Training days per week</strong><span>Choose a realistic rhythm. You can change this later.</span></div><div className="stepper"><button onClick={() => update({ weeklyTarget: Math.max(3, profile.weeklyTarget - 1) })}>−</button><strong>{profile.weeklyTarget}</strong><button onClick={() => update({ weeklyTarget: Math.min(6, profile.weeklyTarget + 1) })}>+</button></div></div>
      </>}
      {step === 3 && <>
        <span className="eyebrow">YOUR FIRST TRAINING BLOCK</span>
        <h1>Make the next <em>rep count.</em></h1>
        <p className="onboard-lede">Your member space is ready. Start with a plan, record your sets, and adjust the process as you learn what works.</p>
        <div className="onboard-summary">
          <div><span>MEMBER</span><strong>{profile.name}</strong></div>
          <div><span>PRIMARY GOAL</span><strong>{profile.goal.replace('_', ' ')}</strong></div>
          <div><span>TRAINING RHYTHM</span><strong>{profile.weeklyTarget} days / week</strong></div>
          <div><span>EXPERIENCE</span><strong>{profile.level}</strong></div>
        </div>
        <span className="privacy-line"><ShieldCheck size={16} /> Your profile and workouts are stored only in this browser.</span>
      </>}
      <div className="onboard-actions">
        {step > 1 && <button className="button quiet" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>}
        <button className="button primary-button" disabled={!canContinue} onClick={() => step < 3 ? setStep(step + 1) : finish()}>{step === 3 ? 'Enter member space' : 'Continue'} <ArrowRight size={16} /></button>
      </div>
    </div>
    <div className="onboard-visual"><div className="visual-label">LEGRANDE / TRAINING CULTURE</div><div className="visual-copy"><span>CONSISTENCY OVER INTENSITY.</span><h2>Strong habits.<br /><em>Stronger you.</em></h2><p>Progress is built one good session at a time.</p></div><div className="visual-foot"><span>01 — SHOW UP</span><span>02 — TRACK IT</span><span>03 — BUILD</span></div></div>
  </div>
}

function Dashboard({ store, onStart, onWeight, onTrain, pausedWorkout, onResume }: { store: Store; onStart: (program: Program) => void; onWeight: () => void; onTrain: () => void; pausedWorkout: ActiveWorkout | null; onResume: (workout: ActiveWorkout) => void }) {
  const today = new Date()
  const firstName = store.profile.name.trim().split(/\s+/)[0]
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const scheduled = getProgramForDay(today, store.profile.weeklyTarget, store.profile.level)
  const week = weekSessions(store.sessions)
  const progress = Math.min(100, week.length / store.profile.weeklyTarget * 100)
  const streak = currentStreak(store.sessions, store.profile.weeklyTarget)
  const recent = store.sessions.slice(0, 3)
  const daily = getDailyLog(store)
  return <>
    <div className="welcome-header"><div><span className="eyebrow">{formatDate(today).toUpperCase()}</span><h1>{greeting}, {firstName}.</h1><p>One session at a time. Keep building.</p></div><div className="welcome-mark"><span>LF</span><small>MEMBER</small></div></div>
    <section className="hero-card">
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-kicker"><i /> {scheduled ? 'YOUR TRAINING PLAN' : 'RECOVERY IS TRAINING TOO'}</span>
        <p className="hero-label">{scheduled ? scheduled.focus.toUpperCase() + ' · ' + scheduled.duration + ' MIN' : 'REST & RESET'}</p>
        <h2>{scheduled ? scheduled.title : 'Make room to recover.'}</h2>
        <p>{scheduled ? scheduled.description : 'Your plan has a rest day today. Eat well, move gently, and let your work settle.'}</p>
        <button className="button primary-button" onClick={scheduled ? () => onStart(scheduled) : onTrain}>{scheduled ? <><Dumbbell size={17} /> Start this session</> : <>Browse training plans <ArrowRight size={17} /></>}</button>
      </div>
      <div className="hero-side-note"><span>TRAINING / {String(today.getDate()).padStart(2, '0')}</span><strong>SHOW UP<br />FOR YOURSELF.</strong></div>
    </section>

    {pausedWorkout && <div className="resume-banner"><div><span className="eyebrow">SESSION PAUSED</span><strong>{pausedWorkout.title}</strong><small>Your sets are saved on this device.</small></div><button className="button primary-button" onClick={() => onResume(pausedWorkout)}>Resume workout <ArrowRight size={15} /></button></div>}

    <div className="metric-row">
      <div className="metric-card"><div className="metric-icon"><CalendarDays size={17} /></div><span>Sessions this week</span><strong>{week.length}<small> / {store.profile.weeklyTarget}</small></strong><div className="metric-progress"><i style={{ width: progress + '%' }} /></div></div>
      <div className="metric-card"><div className="metric-icon"><Flame size={17} /></div><span>Consistency streak</span><strong>{streak}<small> {streak === 1 ? 'week' : 'weeks'}</small></strong><p>{streak ? 'You have a rhythm. Protect it.' : 'Start with one good week.'}</p></div>
      <div className="metric-card"><div className="metric-icon"><TrendingUp size={17} /></div><span>Total sessions</span><strong>{store.sessions.length}<small> logged</small></strong><p>Every session has a place.</p></div>
      <div className="metric-card"><div className="metric-icon"><Zap size={17} /></div><span>Training volume</span><strong>{Math.round(totalVolume(store.sessions)).toLocaleString()}<small> kg</small></strong><p>Completed sets only.</p></div>
    </div>

    <div className="content-grid">
      <section className="panel week-panel">
        <div className="section-heading"><div><span className="eyebrow">YOUR RHYTHM</span><h2>This week</h2></div><span className="subtle">{week.length} of {store.profile.weeklyTarget} sessions</span></div>
        <div className="week-days">{Array.from({ length: 7 }, (_, index) => {
          const day = weekStart(today)
          day.setDate(day.getDate() + index)
          const key = dateKey(day)
          const done = store.sessions.some(session => session.date === key)
          const isToday = key === dateKey(today)
          return <div key={key} className={isToday ? 'week-day today' : 'week-day'}><span>{day.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1)}</span><i className={done ? 'done' : ''}>{done ? <Check size={13} /> : day.getDate()}</i><small>{done ? 'Done' : isToday ? 'Today' : day.toLocaleDateString('en', { weekday: 'short' })}</small></div>
        })}</div>
        <div className="week-footer"><span>{Math.max(0, store.profile.weeklyTarget - week.length)} sessions left to reach your weekly target</span><div className="progress-track"><i style={{ width: progress + '%' }} /></div></div>
      </section>
      <section className="panel focus-panel">
        <div className="section-heading"><div><span className="eyebrow">TODAY'S CHECK-IN</span><h2>Look after the basics</h2></div><HeartPulse size={19} /></div>
        <div className="daily-check"><div className="check-symbol"><Droplets size={18} /></div><div><strong>Hydration</strong><span>{daily.waterCups} of 8 cups logged</span></div><div className="check-track"><i style={{ width: Math.min(100, daily.waterCups / 8 * 100) + '%' }} /></div></div>
        <div className="daily-check"><div className="check-symbol"><Utensils size={18} /></div><div><strong>Protein</strong><span>{daily.proteinGrams ? daily.proteinGrams + ' g recorded' : 'No log yet'}</span></div><button className="text-action" onClick={onTrain}>View plan</button></div>
        <div className="focus-note"><Info size={15} /><span>Track what helps you recover. Your routine should fit real life, not the other way around.</span></div>
      </section>
    </div>

    <section className="section-block">
      <div className="section-heading"><div><span className="eyebrow">THE WORK ADDS UP</span><h2>Recent sessions</h2></div><button className="text-action" onClick={onTrain}>Explore training <ArrowRight size={15} /></button></div>
      {recent.length ? <div className="recent-list">{recent.map(session => <div className="recent-item" key={session.id}><div className="recent-symbol"><Dumbbell size={17} /></div><div className="recent-main"><strong>{session.title}</strong><span>{session.focus} · {new Date(session.startedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></div><div className="recent-data"><strong>{prettyDuration(session.durationMin)}</strong><span>{session.exercises.reduce((sum, exercise) => sum + exercise.sets.filter(set => set.done).length, 0)} sets</span></div><CheckCircle2 className="recent-check" size={17} /></div>)}</div> : <div className="empty-state"><div className="empty-icon"><Dumbbell size={23} /></div><strong>Your training history starts here.</strong><span>Finish a workout to see your sessions, set counts and progress build up.</span><button className="button secondary-button" onClick={onTrain}>Explore your first workout</button></div>}
    </section>
    <section className="quote-strip"><Sparkles size={18} /><p><strong>Remember:</strong> a session you can repeat beats a perfect plan you cannot sustain.</p><button onClick={onWeight}>Log bodyweight <ArrowRight size={15} /></button></section>
  </>
}

function TrainingPage({ store, onStart, onRepeat }: { store: Store; onStart: (program: Program) => void; onRepeat: (session: Session) => void }) {
  const [view, setView] = useState<'plans' | 'library'>('plans')
  const [focus, setFocus] = useState('All')
  const [query, setQuery] = useState('')
  const categories = ['All', 'Full body', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
  const filteredExercises = EXERCISE_LIBRARY.filter(exercise => (focus === 'All' || exercise.muscle.toLowerCase().includes(focus.toLowerCase())) && (exercise.name.toLowerCase().includes(query.toLowerCase()) || exercise.equipment.toLowerCase().includes(query.toLowerCase())))
  return <>
    <div className="page-intro"><div><span className="eyebrow">THE TRAINING FLOOR</span><h1>Train with purpose.</h1><p>Choose a session, log your working sets, and make your next session a little more informed.</p></div><div className="intro-stamp"><Dumbbell size={23} /><span>LF / TRAIN</span></div></div>
    <div className="view-tabs"><button className={view === 'plans' ? 'selected' : ''} onClick={() => setView('plans')}>Training plans</button><button className={view === 'library' ? 'selected' : ''} onClick={() => setView('library')}>Exercise library</button></div>
    {view === 'plans' ? <>
      {store.sessions[0] && <div className="repeat-card"><div className="repeat-mark"><RotateCcw size={18} /></div><div className="repeat-copy"><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><strong>{store.sessions[0].title}</strong><small>Last trained {store.sessions[0].date} · {store.sessions[0].exercises.length} movements</small></div><button className="button primary-button" onClick={() => onRepeat(store.sessions[0])}>Repeat session <ArrowRight size={15} /></button></div>}
      <div className="section-heading"><div><span className="eyebrow">BUILT AROUND YOUR WEEK</span><h2>Your suggested schedule</h2></div><span className="subtle">{store.profile.weeklyTarget} training days</span></div>
      <div className="schedule-card">
        <div className="schedule-intro"><span>YOUR GOAL</span><strong>{store.profile.goal.replace('_', ' ')}</strong><span>EXPERIENCE</span><strong>{store.profile.level}</strong></div>
        <div className="schedule-days">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
          const program = getProgramForDay(new Date(2026, 0, 5 + index), store.profile.weeklyTarget, store.profile.level)
          return <div key={day} className={program ? 'schedule-day planned' : 'schedule-day'}><span>{day}</span><i>{program ? <Dumbbell size={14} /> : '—'}</i><small>{program ? program.focus.split(' · ')[0] : 'Recovery'}</small></div>
        })}</div>
      </div>
      <div className="program-grid">{PROGRAMS.map(program => {
        const completed = store.sessions.filter(session => session.title === program.title).length
        return <article className="program-card" key={program.id}>
          <div className={'program-art art-' + program.id}><span>{program.focus.toUpperCase()}</span><div className="art-number">{String(PROGRAMS.indexOf(program) + 1).padStart(2, '0')}</div></div>
          <div className="program-body"><div className="program-meta"><span>{program.level}</span><span><Clock3 size={13} /> {program.duration} min</span></div><h3>{program.title}</h3><p>{program.description}</p><div className="program-foot"><span>{program.exercises.length} movements · {completed} completed</span><button className="button primary-button" onClick={() => onStart(program)}>Start <ArrowRight size={15} /></button></div></div>
        </article>
      })}</div>
      <section className="research-panel">
        <div className="research-heading"><div><span className="eyebrow">EVIDENCE, NOT GYM MYTHS</span><h2>How to make the work count</h2></div><span className="research-source">ACSM · 2026</span></div>
        <div className="research-points">
          <article><strong>01 / Show up consistently</strong><p>Train the major muscle groups at least twice a week. A repeatable schedule is more useful than a perfect plan you abandon.</p></article>
          <article><strong>02 / Build volume gradually</strong><p>For muscle growth, around 10 weekly sets per muscle group is a useful longer-term reference—not a starting requirement. Build towards more work as you adapt.</p></article>
          <article><strong>03 / Leave room to recover</strong><p>You do not need to reach failure on every set. Controlled reps with a few good repetitions left can be productive.</p></article>
          <article><strong>04 / Progress with evidence</strong><p>Use your previous loads and reps. When the work feels controlled and repeatable, add a small amount of load or one rep—not both at once.</p></article>
        </div>
        <p className="research-footnote">Based on the 2026 American College of Sports Medicine resistance-training position stand. General guidance for healthy adults; adjust for your ability, health and coaching advice.</p>
      </section>
      <div className="training-reminder"><Info size={17} /><p>These routines are flexible templates, not medical prescriptions. Choose movements you can perform comfortably and ask a qualified trainer to check unfamiliar technique.</p></div>
    </> : <>
      <div className="library-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search movements or equipment" /></div><span className="subtle">{filteredExercises.length} movements</span></div>
      <div className="filter-chips">{categories.map(category => <button key={category} className={focus === category ? 'selected' : ''} onClick={() => setFocus(category)}>{category}</button>)}</div>
      <div className="exercise-library">{filteredExercises.map((exercise, index) => <article className="library-item" key={exercise.name}><div className="library-index">{String(index + 1).padStart(2, '0')}</div><div className="library-desc"><strong>{exercise.name}</strong><span>{exercise.muscle} · {exercise.equipment}</span><p>{exercise.cue}</p></div><div className="library-prescription"><strong>{exercise.sets} × {exercise.reps}</strong><span>{exercise.rest ? exercise.rest + ' sec rest' : 'Continuous'}</span></div></article>)}</div>
      {!filteredExercises.length && <div className="empty-state"><strong>No movement found.</strong><span>Try another exercise name or muscle group.</span></div>}
    </>}
  </>
}

function WorkoutRunner({ workout, sessions, units, themeDark, onChange, onFinish, onExit }: {
  workout: ActiveWorkout; sessions: Session[]; units: Units; themeDark: boolean;
  onChange: (workout: ActiveWorkout) => void; onFinish: () => void; onExit: () => void
}) {
  const [now, setNow] = useState(Date.now())
  const [restUntil, setRestUntil] = useState<number | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const elapsed = Math.max(0, Math.floor((now - workout.startedAt) / 1000))
  const completed = workout.exercises.reduce((sum, exercise) => sum + exercise.sets.filter(set => set.done).length, 0)
  const total = workout.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)
  const restRemaining = restUntil ? Math.max(0, Math.ceil((restUntil - now) / 1000)) : 0
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!restUntil) return
    if (restUntil <= Date.now()) { setRestUntil(null); return }
    const timer = window.setInterval(() => {
      if (restUntil <= Date.now()) { if ('vibrate' in navigator) navigator.vibrate([180, 80, 180]); setRestUntil(null); window.clearInterval(timer) }
    }, 500)
    return () => window.clearInterval(timer)
  }, [restUntil])
  const patchExercise = (exerciseId: string, patch: Partial<WorkoutExercise>) => onChange({
    ...workout, exercises: workout.exercises.map(exercise => exercise.id === exerciseId ? { ...exercise, ...patch } : exercise)
  })
  const patchSet = (exerciseId: string, setId: string, patch: Partial<SetEntry>) => onChange({
    ...workout, exercises: workout.exercises.map(exercise => exercise.id === exerciseId ? {
      ...exercise, sets: exercise.sets.map(set => set.id === setId ? { ...set, ...patch } : set)
    } : exercise)
  })
  const addSet = (exercise: WorkoutExercise) => {
    const last = exercise.sets[exercise.sets.length - 1]
    patchExercise(exercise.id, { sets: [...exercise.sets, { id: makeId(), reps: last?.reps || 10, weightKg: last?.weightKg || 0, rir: 2, done: false }] })
  }
  const addExercise = (item: ProgramExercise) => {
    const previous = latestSet(sessions, item.name)
    onChange({ ...workout, exercises: [...workout.exercises, {
      id: makeId(), name: item.name, muscle: item.muscle, equipment: item.equipment,
      cue: item.cue, restSeconds: item.rest,
      sets: Array.from({ length: item.sets }, () => ({ id: makeId(), reps: previous?.reps || item.reps, weightKg: previous?.weightKg || 0, rir: 2, done: false }))
    }] })
    setShowPicker(false)
  }
  const pickerItems = EXERCISE_LIBRARY.filter(item => item.name.toLowerCase().includes(search.toLowerCase()) || item.muscle.toLowerCase().includes(search.toLowerCase()))
  return <div className={themeDark ? 'workout-screen dark-workout' : 'workout-screen'}>
    <header className="workout-topbar"><button className="icon-action" onClick={onExit}><ArrowLeft size={18} /></button><div><strong>LEGRANDE / SESSION</strong><span>{workout.focus}</span></div><div className="session-clock"><Clock3 size={15} /> {formatTime(elapsed)}</div></header>
    <div className="workout-container">
      <div className="workout-heading"><div><span className="eyebrow">IN PROGRESS · {new Date(workout.startedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} START</span><h1>{workout.title}</h1><p>Focus on clean reps. Record what you actually do.</p></div><div className="workout-counter"><strong>{completed}<small> / {total}</small></strong><span>SETS DONE</span></div></div>
      <div className="workout-progress"><i style={{ width: (total ? completed / total * 100 : 0) + '%' }} /></div>
      {restRemaining > 0 && <div className="rest-banner"><div><Timer size={17} /><span>REST TIMER</span></div><strong>{formatTime(restRemaining)}</strong><button onClick={() => setRestUntil(null)}>Skip rest</button></div>}
      <div className="active-exercises">{workout.exercises.map((exercise, exerciseIndex) => {
        const previous = latestSet(sessions, exercise.name)
        const done = exercise.sets.filter(set => set.done).length
        return <article className="active-exercise" key={exercise.id}>
          <div className="active-exercise-head"><span className="exercise-count">{String(exerciseIndex + 1).padStart(2, '0')}</span><div className="active-exercise-title"><h2>{exercise.name}</h2><span>{exercise.muscle} · {exercise.equipment}</span></div><div className={done === exercise.sets.length ? 'exercise-status complete' : 'exercise-status'}>{done}/{exercise.sets.length} <Check size={13} /></div></div>
          <p className="form-cue">{exercise.cue}</p>
          {previous && <div className="previous-set"><History size={13} /> Last recorded: {displayWeight(previous.weightKg, units).toFixed(1)} {units === 'metric' ? 'kg' : 'lb'} × {previous.reps} reps</div>}
          {(() => {
            const previousSession = sessions.find(session => session.exercises.some(item => item.name === exercise.name))
            const previousExercise = previousSession?.exercises.find(item => item.name === exercise.name)
            const completedPrevious = previousExercise?.sets.filter(set => set.done) || []
            if (!completedPrevious.length) return null
            const completedEverySet = previousExercise?.sets.length === completedPrevious.length
            const averageRir = completedPrevious.reduce((sum, set) => sum + set.rir, 0) / completedPrevious.length
            return <div className="progression-note"><Target size={14} /><span>{completedEverySet && averageRir >= 2 ? 'You completed every set last time with some reps in reserve. If technique stayed consistent, consider a small load increase or one extra rep.' : 'Aim to match your last clean set first. Add load only when you can keep the same controlled technique.'}</span></div>
          })()}
          <div className="set-table">
            <div className="set-table-head"><span>SET</span><span>{units === 'metric' ? 'KG' : 'LB'}</span><span>REPS</span><span>RIR</span><span>DONE</span></div>
            {exercise.sets.map((set, setIndex) => <div className={set.done ? 'set-row completed' : 'set-row'} key={set.id}>
              <span className="set-num">{String(setIndex + 1).padStart(2, '0')}</span>
              <input aria-label={exercise.name + ' set ' + (setIndex + 1) + ' weight'} type="number" min="0" step="0.5" value={displayWeight(set.weightKg, units) || ''} placeholder="0" onChange={event => patchSet(exercise.id, set.id, { weightKg: toKg(event.target.value, units) || 0 })} />
              <input aria-label={exercise.name + ' set ' + (setIndex + 1) + ' reps'} type="number" min="1" value={set.reps} onChange={event => patchSet(exercise.id, set.id, { reps: Math.max(1, Number(event.target.value)) })} />
              <select aria-label={exercise.name + ' set ' + (setIndex + 1) + ' reps in reserve'} value={set.rir} onChange={event => patchSet(exercise.id, set.id, { rir: Number(event.target.value) })}>{[0, 1, 2, 3, 4, 5].map(value => <option value={value} key={value}>{value}</option>)}</select>
              <button className={set.done ? 'set-check checked' : 'set-check'} aria-label={set.done ? 'Mark set incomplete' : 'Mark set complete'} onClick={() => {
                const nextDone = !set.done
                patchSet(exercise.id, set.id, { done: nextDone })
                if (nextDone && exercise.restSeconds > 0) setRestUntil(Date.now() + exercise.restSeconds * 1000)
              }}>{set.done ? <Check size={15} /> : <span />}</button>
            </div>)}
          </div>
          <div className="exercise-actions"><button onClick={() => addSet(exercise)}><Plus size={14} /> Add set</button><button onClick={() => setRestUntil(Date.now() + exercise.restSeconds * 1000)}><Timer size={14} /> Rest {exercise.restSeconds}s</button></div>
        </article>
      })}</div>
      <button className="add-exercise" onClick={() => setShowPicker(true)}><Plus size={17} /> Add another exercise</button>
      <label className="field-label session-notes">Session notes<textarea value={workout.notes} onChange={event => onChange({ ...workout, notes: event.target.value })} placeholder="How did the session feel? Any changes to remember next time?" rows={3} /></label>
      <div className="finish-row"><div><strong>{completed} working sets</strong><span>{prettyDuration(Math.max(1, Math.floor(elapsed / 60)))} elapsed</span></div><button className="button primary-button" onClick={onFinish}>Finish & save session <CheckCircle2 size={17} /></button></div>
    </div>
    {showPicker && <div className="modal-backdrop" onClick={() => setShowPicker(false)}><div className="modal-card exercise-picker" onClick={event => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">EXERCISE LIBRARY</span><h2>Add movement</h2></div><button className="icon-action" onClick={() => setShowPicker(false)}><X size={18} /></button></div><div className="search-field"><Search size={16} /><input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name or muscle" /></div><div className="picker-list">{pickerItems.map(item => <button key={item.name} onClick={() => addExercise(item)}><div><strong>{item.name}</strong><span>{item.muscle} · {item.equipment}</span></div><Plus size={16} /></button>)}</div></div></div>}
  </div>
}

function ProgressPage({ store, onWeight, onMeasurement }: { store: Store; onWeight: () => void; onMeasurement: () => void }) {
  const [range, setRange] = useState(30)
  const sorted = [...store.weightLogs].sort((a, b) => a.date.localeCompare(b.date))
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - range)
  const points = sorted.filter(point => new Date(point.date + 'T12:00:00') >= cutoff)
  const latest = sorted[sorted.length - 1]
  const previous = sorted[sorted.length - 2]
  const difference = latest && previous ? latest.kg - previous.kg : null
  const volume = totalVolume(store.sessions)
  const records = store.sessions.flatMap(session => session.exercises.flatMap(exercise => exercise.sets.filter(set => set.done && set.weightKg > 0).map(set => ({ name: exercise.name, kg: set.weightKg, reps: set.reps, date: session.date }))))
  const personalRecords = Array.from(new Set(records.map(record => record.name))).map(name => {
    const entries = records.filter(record => record.name === name)
    return entries.reduce((best, item) => item.kg > best.kg ? item : best, entries[0])
  }).sort((a, b) => b.kg - a.kg).slice(0, 5)
  const best = bestStreak(store.sessions, store.profile.weeklyTarget)
  return <>
    <div className="page-intro"><div><span className="eyebrow">YOUR WORK, MEASURED</span><h1>Progress, not pressure.</h1><p>Look for useful trends over time. A single weigh-in or session does not tell the whole story.</p></div><div className="intro-stamp"><BarChart3 size={23} /><span>LF / DATA</span></div></div>
    <div className="progress-metrics">
      <div className="metric-card"><span>Sessions recorded</span><strong>{store.sessions.length}</strong><small>Since you joined</small></div>
      <div className="metric-card"><span>Total training volume</span><strong>{Math.round(volume).toLocaleString()} <small>kg</small></strong><small>Completed reps × load</small></div>
      <div className="metric-card"><span>Best consistency run</span><strong>{best} <small>{best === 1 ? 'week' : 'weeks'}</small></strong><small>Weekly target met</small></div>
      <div className="metric-card"><span>Latest bodyweight</span><strong>{latest ? displayWeight(latest.kg, store.profile.units).toFixed(1) : '—'} <small>{store.profile.units === 'metric' ? 'kg' : 'lb'}</small></strong><small>{latest ? 'Recorded ' + latest.date : 'No weigh-in yet'}</small></div>
    </div>
    <section className="panel chart-panel">
      <div className="section-heading"><div><span className="eyebrow">BODYWEIGHT HISTORY</span><h2>Weight trend</h2></div><div className="chart-actions"><div className="segmented small"><button className={range === 30 ? 'selected' : ''} onClick={() => setRange(30)}>30D</button><button className={range === 90 ? 'selected' : ''} onClick={() => setRange(90)}>90D</button><button className={range === 365 ? 'selected' : ''} onClick={() => setRange(365)}>1Y</button></div><button className="button secondary-button" onClick={onWeight}><Plus size={15} /> Log weight</button></div></div>
      {points.length ? <WeightChart points={points} units={store.profile.units} /> : <div className="chart-empty"><TrendingUp size={25} /><strong>Your trend appears here.</strong><span>Record a few weigh-ins over time to see the direction, not just the daily number.</span><button className="text-action" onClick={onWeight}>Add first weigh-in <ArrowRight size={14} /></button></div>}
      {difference !== null && <div className="weight-delta"><span>Change since previous weigh-in</span><strong className={difference <= 0 ? 'neutral-change' : 'neutral-change'}>{difference > 0 ? '+' : ''}{displayWeight(difference, store.profile.units).toFixed(1)} {store.profile.units === 'metric' ? 'kg' : 'lb'}</strong></div>}
    </section>
    <div className="content-grid">
      <section className="panel"><div className="section-heading"><div><span className="eyebrow">STRENGTH HISTORY</span><h2>Personal bests</h2></div><Trophy size={19} /></div>
        {personalRecords.length ? <div className="record-list">{personalRecords.map(record => <div key={record.name}><div className="record-icon"><Award size={16} /></div><div className="record-name"><strong>{record.name}</strong><span>{record.reps} reps · {record.date}</span></div><strong>{displayWeight(record.kg, store.profile.units).toFixed(1)} {store.profile.units === 'metric' ? 'kg' : 'lb'}</strong></div>)}</div> : <div className="inline-empty">Complete and log weighted sets to build a personal record history.</div>}
      </section>
      <section className="panel"><div className="section-heading"><div><span className="eyebrow">BODY MEASUREMENTS</span><h2>Beyond the scale</h2></div><button className="text-action" onClick={onMeasurement}>Add entry <Plus size={14} /></button></div>
        {store.measurementLogs.length ? <div className="measurement-history">{store.measurementLogs.slice(0, 4).map(item => <div key={item.date}><span>{item.date}</span><strong>{item.waistCm ? 'Waist ' + item.waistCm + ' cm' : item.chestCm ? 'Chest ' + item.chestCm + ' cm' : item.armCm ? 'Arm ' + item.armCm + ' cm' : 'Measurement'}</strong></div>)}</div> : <div className="inline-empty">Measurements can help add context to your progress. Record them occasionally, not obsessively.</div>}
      </section>
    </div>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">RECENT TRAINING</span><h2>Session history</h2></div><span className="subtle">{store.sessions.length} total</span></div>
      {store.sessions.length ? <div className="recent-list">{store.sessions.slice(0, 8).map(session => <div className="recent-item" key={session.id}><div className="recent-symbol"><Dumbbell size={17} /></div><div className="recent-main"><strong>{session.title}</strong><span>{session.focus} · {session.date}</span></div><div className="recent-data"><strong>{prettyDuration(session.durationMin)}</strong><span>{session.exercises.reduce((sum, exercise) => sum + exercise.sets.filter(set => set.done).length, 0)} sets</span></div><CheckCircle2 className="recent-check" size={17} /></div>)}</div> : <div className="empty-state"><strong>No sessions logged yet.</strong><span>Your completed workouts will appear here.</span></div>}
    </section>
  </>
}

function WeightChart({ points, units }: { points: WeightLog[]; units: Units }) {
  const values = points.map(point => displayWeight(point.kg, units))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max((max - min) * 0.25, 0.5)
  const width = 720
  const height = 210
  const x = (index: number) => points.length === 1 ? width / 2 : 22 + index / (points.length - 1) * (width - 44)
  const y = (value: number) => height - 18 - ((value - (min - padding)) / ((max + padding) - (min - padding))) * (height - 36)
  const polyline = points.map((point, index) => x(index) + ',' + y(displayWeight(point.kg, units))).join(' ')
  const area = 'M ' + x(0) + ' ' + (height - 18) + ' L ' + points.map((point, index) => x(index) + ' ' + y(displayWeight(point.kg, units))).join(' L ') + ' L ' + x(points.length - 1) + ' ' + (height - 18) + ' Z'
  return <div className="weight-chart">
    <div className="chart-summary"><strong>{values[values.length - 1].toFixed(1)} <small>{units === 'metric' ? 'kg' : 'lb'}</small></strong><span>{points.length} entries · {points[0].date} to {points[points.length - 1].date}</span></div>
    <svg viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label="Bodyweight trend line chart">
      {[0, 1, 2, 3].map(line => <line key={line} x1="0" x2={width} y1={22 + line * 54} y2={22 + line * 54} className="chart-grid-line" />)}
      <path d={area} className="chart-area" />
      {points.length > 1 && <polyline points={polyline} className="chart-line" />}
      {points.map((point, index) => <circle key={point.date + index} cx={x(index)} cy={y(displayWeight(point.kg, units))} r="4.5" className="chart-dot" />)}
    </svg>
    <div className="chart-foot"><span>{points[0].date}</span><span>{points[points.length - 1].date}</span></div>
  </div>
}

function FuelPage({ store, updateDaily }: { store: Store; updateDaily: (patch: Partial<DailyLog>) => void }) {
  const daily = getDailyLog(store)
  const [protein, setProtein] = useState(String(daily.proteinGrams || ''))
  const [sleep, setSleep] = useState(String(daily.sleepHours || ''))
  const [energy, setEnergy] = useState(daily.energy || 3)
  const [soreness, setSoreness] = useState(daily.soreness || 3)
  const [note, setNote] = useState(daily.note || '')
  const proteinProgress = store.profile.proteinTarget > 0 ? Math.min(100, daily.proteinGrams / store.profile.proteinTarget * 100) : 0
  const saveRecovery = () => updateDaily({ sleepHours: Number(sleep) || undefined, energy, soreness, note })
  return <>
    <div className="page-intro"><div><span className="eyebrow">THE FOUNDATION</span><h1>Fuel the work.</h1><p>Training is one part of the process. Recovery, food and hydration help you show up again.</p></div><div className="intro-stamp"><HeartPulse size={23} /><span>LF / RECOVER</span></div></div>
    <div className="content-grid fuel-grid">
      <section className="panel fuel-panel"><div className="section-heading"><div><span className="eyebrow">HYDRATION</span><h2>Water check</h2></div><Droplets size={19} /></div><div className="water-total"><strong>{daily.waterCups}</strong><span>/ 8 cups today</span></div><div className="water-cups">{Array.from({ length: 8 }, (_, index) => <button aria-label={'Water cup ' + (index + 1)} className={index < daily.waterCups ? 'filled' : ''} key={index} onClick={() => updateDaily({ waterCups: index < daily.waterCups ? index : index + 1 })}><Droplets size={20} /></button>)}</div><p className="panel-caption">Use this as a simple reminder, not a fixed medical target. Adjust for your body, activity and conditions.</p><div className="inline-actions"><button className="button primary-button" onClick={() => updateDaily({ waterCups: Math.min(20, daily.waterCups + 1) })}><Plus size={15} /> Add a cup</button><button className="text-action" onClick={() => updateDaily({ waterCups: 0 })}>Reset</button></div></section>
      <section className="panel fuel-panel"><div className="section-heading"><div><span className="eyebrow">PROTEIN NOTES</span><h2>Keep a simple count</h2></div><Utensils size={19} /></div><div className="protein-progress"><div><strong>{daily.proteinGrams} <small>g</small></strong><span>{store.profile.proteinTarget ? 'of ' + store.profile.proteinTarget + ' g target' : 'recorded today'}</span></div><div className="progress-track"><i style={{ width: proteinProgress + '%' }} /></div></div><label className="field-label">Protein so far today (grams)<input type="number" min="0" inputMode="numeric" value={protein} onChange={event => setProtein(event.target.value)} placeholder="e.g. 90" /></label><div className="inline-actions"><button className="button primary-button" onClick={() => updateDaily({ proteinGrams: Math.max(0, Number(protein) || 0) })}><Save size={15} /> Save today's total</button><span className="subtle">Target is optional</span></div><p className="panel-caption">Use a target recommended for your needs by a qualified professional. This tracker does not calculate dietary requirements.</p></section>
    </div>
    <section className="panel recovery-panel"><div className="section-heading"><div><span className="eyebrow">DAILY RECOVERY CHECK-IN</span><h2>How are you feeling?</h2></div><HeartPulse size={19} /></div><div className="recovery-grid">
      <label className="field-label">Sleep last night <span className="field-suffix">HOURS</span><input type="number" min="0" max="24" step="0.5" inputMode="decimal" value={sleep} onChange={event => setSleep(event.target.value)} placeholder="e.g. 7.5" /></label>
      <div className="rating-field"><strong>Energy today</strong><span>1 = low · 5 = high</span><div>{[1, 2, 3, 4, 5].map(value => <button className={energy === value ? 'selected' : ''} onClick={() => setEnergy(value)} key={value}>{value}</button>)}</div></div>
      <div className="rating-field"><strong>Muscle soreness</strong><span>1 = none · 5 = high</span><div>{[1, 2, 3, 4, 5].map(value => <button className={soreness === value ? 'selected' : ''} onClick={() => setSoreness(value)} key={value}>{value}</button>)}</div></div>
    </div><label className="field-label">Anything worth remembering?<textarea rows={3} value={note} onChange={event => setNote(event.target.value)} placeholder="Sleep, stress, appetite, unusual fatigue, or how training felt..." /></label><div className="recovery-footer"><span className="subtle">Your check-in stays private on this device.</span><button className="button primary-button" onClick={saveRecovery}><Save size={15} /> Save check-in</button></div></section>
    <div className="training-reminder"><Info size={17} /><p>Recovery signals are personal. A workout should not be pushed through sharp pain, dizziness or unusual symptoms. Rest and seek appropriate professional advice when needed.</p></div>
  </>
}

function ProfilePage({ store, persist, resetData, onImport }: { store: Store; persist: (store: Store) => void; resetData: () => void; onImport: (store: Store) => void }) {
  const profile = store.profile
  const updateProfile = (patch: Partial<Profile>) => persist({ ...store, profile: { ...profile, ...patch } })
  const exportData = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'legrande-training-backup-' + dateKey() + '.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as Store
      if (!parsed || !parsed.profile || !Array.isArray(parsed.sessions)) throw new Error('Invalid backup')
      onImport(parsed)
      window.alert('Training backup imported.')
    } catch {
      window.alert('That file is not a valid LeGrande training backup.')
    }
    event.target.value = ''
  }
  return <>
    <div className="page-intro"><div><span className="eyebrow">YOUR MEMBER DETAILS</span><h1>Make it yours.</h1><p>Adjust your preferences and manage the data saved on this device.</p></div><div className="intro-stamp"><UserRound size={23} /><span>LF / PROFILE</span></div></div>
    <div className="profile-layout">
      <section className="panel profile-panel"><div className="profile-identity"><div className="profile-avatar">{profile.name.slice(0, 1).toUpperCase()}</div><div><span className="eyebrow">LEGRANDE MEMBER</span><h2>{profile.name}</h2><p>{profile.goal.replace('_', ' ')} · {profile.level}</p></div></div>
        <div className="profile-fields">
          <label className="field-label">Name<input value={profile.name} onChange={event => updateProfile({ name: event.target.value })} /></label>
          <label className="field-label">Primary goal<select value={profile.goal} onChange={event => updateProfile({ goal: event.target.value as Goal })}><option value="build_muscle">Build muscle</option><option value="strength">Get stronger</option><option value="fat_loss">Lose body fat</option><option value="general_fitness">General fitness</option></select></label>
          <label className="field-label">Training experience<select value={profile.level} onChange={event => updateProfile({ level: event.target.value as Level })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
          <div className="profile-setting"><div><strong>Training days</strong><span>Target per week</span></div><div className="stepper"><button onClick={() => updateProfile({ weeklyTarget: Math.max(3, profile.weeklyTarget - 1) })}>−</button><strong>{profile.weeklyTarget}</strong><button onClick={() => updateProfile({ weeklyTarget: Math.min(6, profile.weeklyTarget + 1) })}>+</button></div></div>
          <div className="profile-setting"><div><strong>Measurement units</strong><span>Weight and exercise loads</span></div><div className="segmented small"><button className={profile.units === 'metric' ? 'selected' : ''} onClick={() => updateProfile({ units: 'metric' })}>kg</button><button className={profile.units === 'imperial' ? 'selected' : ''} onClick={() => updateProfile({ units: 'imperial' })}>lb</button></div></div>
          <label className="field-label">Optional protein target (g)<input type="number" min="0" value={profile.proteinTarget || ''} placeholder="Leave blank to skip" onChange={event => updateProfile({ proteinTarget: Math.max(0, Number(event.target.value) || 0) })} /></label>
          <div className="profile-setting"><div><strong>Appearance</strong><span>Choose the training space theme</span></div><button className="theme-button in-panel" onClick={() => updateProfile({ themeDark: !profile.themeDark })}>{profile.themeDark ? <Sun size={15} /> : <Moon size={15} />}{profile.themeDark ? 'Light' : 'Dark'}</button></div>
        </div>
      </section>
      <section className="panel privacy-panel"><div className="section-heading"><div><span className="eyebrow">DATA & PRIVACY</span><h2>Your data, your device.</h2></div><ShieldCheck size={20} /></div><p>LeGrande currently stores your member profile, workout history, bodyweight and daily check-ins in this browser's local storage. Nothing is sent to a Supabase database.</p><div className="privacy-stat"><span>Storage mode</span><strong>On this device only</strong></div><div className="privacy-stat"><span>Cloud account</span><strong>Not connected</strong></div><button className="button secondary-button full-width" onClick={exportData}><Save size={16} /> Export my backup</button><label className="button secondary-button full-width import-button"><RotateCcw size={16} /> Import a backup<input type="file" accept="application/json,.json" onChange={importFile} /></label><div className="danger-zone"><strong>Reset member data</strong><p>This removes your local profile, workouts, weigh-ins and check-ins from this browser.</p><button className="danger-button" onClick={() => { if (window.confirm('Permanently remove all LeGrande data saved in this browser? Export a backup first if you need one.')) resetData() }}>Reset this device</button></div></section>
    </div>
  </>
}

function WeightModal({ store, close, persist }: { store: Store; close: () => void; persist: (store: Store) => void }) {
  const latest = store.weightLogs[store.weightLogs.length - 1]
  const [value, setValue] = useState(latest ? String(displayWeight(latest.kg, store.profile.units).toFixed(1)) : '')
  const [date, setDate] = useState(dateKey())
  const save = () => {
    const kg = toKg(value, store.profile.units)
    if (!Number.isFinite(kg) || kg <= 0) return
    const logs = store.weightLogs.filter(item => item.date !== date).concat({ date, kg }).sort((a, b) => a.date.localeCompare(b.date))
    persist({ ...store, weightLogs: logs })
    close()
  }
  return <div className="modal-backdrop" onClick={close}><div className="modal-card" onClick={event => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">BODYWEIGHT LOG</span><h2>Record a weigh-in</h2></div><button className="icon-action" onClick={close}><X size={18} /></button></div><p className="modal-copy">Use similar conditions when comparing entries. Normal day-to-day changes are expected.</p><label className="field-label">Weight ({store.profile.units === 'metric' ? 'kg' : 'lb'})<input autoFocus type="number" min="1" step="0.1" value={value} onChange={event => setValue(event.target.value)} placeholder="e.g. 74.5" /></label><label className="field-label">Date<input type="date" value={date} max={dateKey()} onChange={event => setDate(event.target.value)} /></label><button className="button primary-button full-width" disabled={!Number(value) || Number(value) <= 0} onClick={save}>Save weigh-in <Check size={16} /></button></div></div>
}

function MeasurementModal({ store, close, persist }: { store: Store; close: () => void; persist: (store: Store) => void }) {
  const [date, setDate] = useState(dateKey())
  const [waist, setWaist] = useState('')
  const [chest, setChest] = useState('')
  const [arm, setArm] = useState('')
  const [thigh, setThigh] = useState('')
  const save = () => {
    const entry: MeasurementLog = { date }
    if (Number(waist) > 0) entry.waistCm = Number(waist)
    if (Number(chest) > 0) entry.chestCm = Number(chest)
    if (Number(arm) > 0) entry.armCm = Number(arm)
    if (Number(thigh) > 0) entry.thighCm = Number(thigh)
    if (Object.keys(entry).length < 2) return
    const logs = [entry, ...store.measurementLogs.filter(item => item.date !== date)].sort((a, b) => b.date.localeCompare(a.date))
    persist({ ...store, measurementLogs: logs })
    close()
  }
  return <div className="modal-backdrop" onClick={close}><div className="modal-card" onClick={event => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">BODY MEASUREMENTS</span><h2>Add a check-in</h2></div><button className="icon-action" onClick={close}><X size={18} /></button></div><p className="modal-copy">All values are in centimetres. Add only the measurements you want to track.</p><div className="measurement-inputs"><label className="field-label">Waist<input type="number" value={waist} onChange={event => setWaist(event.target.value)} placeholder="cm" /></label><label className="field-label">Chest<input type="number" value={chest} onChange={event => setChest(event.target.value)} placeholder="cm" /></label><label className="field-label">Arm<input type="number" value={arm} onChange={event => setArm(event.target.value)} placeholder="cm" /></label><label className="field-label">Thigh<input type="number" value={thigh} onChange={event => setThigh(event.target.value)} placeholder="cm" /></label></div><label className="field-label">Date<input type="date" value={date} max={dateKey()} onChange={event => setDate(event.target.value)} /></label><button className="button primary-button full-width" disabled={![waist, chest, arm, thigh].some(value => Number(value) > 0)} onClick={save}>Save measurements <Check size={16} /></button></div></div>
}
