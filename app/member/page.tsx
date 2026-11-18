'use client'

import { Fragment, useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Activity, ArrowLeft, ArrowRight, Award, BarChart3, CalendarDays, Check,
  CheckCircle2, ChevronRight, Clock3, Dumbbell, Flame,
  History, Home, Info, Moon, Plus, RotateCcw, Save, Search, ShieldCheck,
  Sun, Target, Timer, TrendingUp, Trophy, UserRound, Weight, X, Zap
} from 'lucide-react'

type Goal = 'build_muscle' | 'strength' | 'fat_loss' | 'general_fitness'
type Level = 'beginner' | 'intermediate' | 'advanced'
type Units = 'metric' | 'imperial'
type Tab = 'today' | 'train' | 'progress' | 'profile'
type MemberType = 'new' | 'existing'
type SplitStyle = 'focused' | 'ppl' | 'upper_lower'
type Gender = 'woman' | 'man'
type PackageType = 'daily' | 'weekly' | 'monthly' | 'semester'
type Profile = {
  name: string
  phone: string
  gender: Gender
  bodyweightKg: number | null
  memberType: MemberType
  packageType: PackageType
  packageStart: string
  packageEnd: string
  sessionStartTime: string
  splitStyle: SplitStyle
  goal: Goal
  level: Level
  weeklyTarget: number
  units: Units
  themeDark: boolean
  onboardingComplete: boolean
  heightCm: number | null
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
  phase?: 'warmup' | 'main' | 'cooldown'
  durationSec?: number
}
type ActiveWorkout = {
  id: string
  title: string
  focus: string
  startedAt: number
  mode?: 'gym' | 'home'
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
  mode?: 'gym' | 'home'
  durationMin: number
  exercises: WorkoutExercise[]
  notes: string
}
type WeightLog = { date: string; kg: number }
type MeasurementLog = { date: string; waistCm?: number; chestCm?: number; armCm?: number; thighCm?: number }
type Store = {
  version: 2
  profile: Profile
  sessions: Session[]
  weightLogs: WeightLog[]
  measurementLogs: MeasurementLog[]
}
type ProgramExercise = { name: string; muscle: string; equipment: string; sets: number; reps: number; rest: number; cue: string; phase?: 'warmup' | 'main' | 'cooldown'; durationSec?: number }
type Program = { id: string; title: string; focus: string; level: Level; duration: number; description: string; mode?: 'gym' | 'home'; exercises: ProgramExercise[] }

const STORE_KEY = 'legrande:member:v2'
const ACTIVE_KEY = 'legrande:active:v1'
const defaultProfile: Profile = {
  name: '', phone: '', gender: 'man', bodyweightKg: null, memberType: 'new',
  packageType: 'daily', packageStart: '', packageEnd: '', sessionStartTime: '08:00', splitStyle: 'upper_lower',
  goal: 'build_muscle', level: 'beginner', weeklyTarget: 4, units: 'metric', themeDark: false, onboardingComplete: false, heightCm: null
}
const emptyStore: Store = {
  version: 2, profile: defaultProfile, sessions: [], weightLogs: [], measurementLogs: []
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
      { name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', sets: 2, reps: 30, rest: 60, cue: 'Keep ribs down and maintain a straight line from head to heels.', durationSec: 30 }
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
    id: 'upper', title: 'Upper body', focus: 'Chest · Back · Shoulders · Arms', level: 'intermediate', duration: 60,
    description: 'A balanced upper-body session. In a four-day Upper / Lower plan, repeat it twice weekly with recovery between sessions.',
    exercises: [
      { name: 'Barbell bench press', muscle: 'Chest', equipment: 'Barbell', sets: 3, reps: 8, rest: 120, cue: 'Stay braced and keep each repetition consistent.' },
      { name: 'Incline dumbbell press', muscle: 'Upper chest', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 90, cue: 'Keep your shoulder blades supported. Lower the dumbbells slowly to a comfortable depth.' },
      { name: 'Seated cable row', muscle: 'Back', equipment: 'Cable', sets: 3, reps: 10, rest: 90, cue: 'Keep your torso steady as you row.' },
      { name: 'Lat pulldown', muscle: 'Lats', equipment: 'Cable', sets: 3, reps: 10, rest: 90, cue: 'Avoid shrugging and pull with your elbows.' },
      { name: 'Dumbbell lateral raise', muscle: 'Shoulders', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Use a load you can control without swinging.' },
      { name: 'Dumbbell curl', muscle: 'Biceps', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Keep your elbows near your sides. Lower each dumbbell without swinging.' },
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
      { name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', sets: 2, reps: 30, rest: 45, cue: 'Keep your hips level and breathe steadily.', durationSec: 30 }
    ]
  }
  ,{
    id: 'chest', title: 'Chest day', focus: 'Chest · Triceps', level: 'beginner', duration: 45,
    description: 'A focused chest session with a small amount of triceps assistance.',
    exercises: [
      { name: 'Machine chest press', muscle: 'Chest', equipment: 'Machine', sets: 3, reps: 10, rest: 90, cue: 'Set the handles around mid-chest. Keep your shoulders down and press without bouncing.' },
      { name: 'Incline dumbbell press', muscle: 'Upper chest', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 90, cue: 'Keep your shoulder blades supported. Lower the dumbbells slowly to a comfortable depth.' },
      { name: 'Cable chest fly', muscle: 'Chest', equipment: 'Cable', sets: 2, reps: 12, rest: 60, cue: 'Keep a soft bend in your elbows and bring your hands together in a wide arc.' },
      { name: 'Cable triceps pushdown', muscle: 'Triceps', equipment: 'Cable', sets: 2, reps: 12, rest: 60, cue: 'Keep your elbows close to your ribs. Move your forearms, not your shoulders.' }
    ]
  },
  {
    id: 'back', title: 'Back day', focus: 'Back · Biceps', level: 'beginner', duration: 45,
    description: 'A pulling-focused session for your lats, mid-back and biceps.',
    exercises: [
      { name: 'Lat pulldown', muscle: 'Lats', equipment: 'Cable', sets: 3, reps: 10, rest: 90, cue: 'Start with arms long, then drive your elbows down. Avoid leaning far back.' },
      { name: 'Seated cable row', muscle: 'Mid back', equipment: 'Cable', sets: 3, reps: 10, rest: 90, cue: 'Sit tall, pull toward your lower ribs and return the handle slowly.' },
      { name: 'Chest-supported row', muscle: 'Mid back', equipment: 'Dumbbells', sets: 2, reps: 10, rest: 75, cue: 'Keep your chest on the bench and pull your elbows toward your hips.' },
      { name: 'Dumbbell curl', muscle: 'Biceps', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Keep your elbows near your sides. Lower each dumbbell without swinging.' }
    ]
  },
  {
    id: 'shoulders', title: 'Shoulder day', focus: 'Shoulders · Rear delts', level: 'beginner', duration: 40,
    description: 'A controlled shoulder session for pressing strength and side-delt development.',
    exercises: [
      { name: 'Seated dumbbell shoulder press', muscle: 'Shoulders', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 90, cue: 'Keep your back supported and ribs down. Press smoothly without forcing the lockout.' },
      { name: 'Dumbbell lateral raise', muscle: 'Side delts', equipment: 'Dumbbells', sets: 3, reps: 12, rest: 60, cue: 'Lead with your elbows. Raise to about shoulder height without swinging your torso.' },
      { name: 'Cable face pull', muscle: 'Rear delts', equipment: 'Cable', sets: 2, reps: 15, rest: 60, cue: 'Pull the rope toward eye level and separate your hands at the finish.' },
      { name: 'Reverse dumbbell fly', muscle: 'Rear delts', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Hinge forward with a neutral back. Open your arms without shrugging.' }
    ]
  },
  {
    id: 'arms', title: 'Arms day', focus: 'Biceps · Triceps', level: 'beginner', duration: 40,
    description: 'A dedicated arm day with direct biceps and triceps work.',
    exercises: [
      { name: 'Dumbbell curl', muscle: 'Biceps', equipment: 'Dumbbells', sets: 3, reps: 10, rest: 60, cue: 'Keep upper arms still and lower the weights slowly.' },
      { name: 'Hammer curl', muscle: 'Brachialis', equipment: 'Dumbbells', sets: 2, reps: 12, rest: 60, cue: 'Keep palms facing inward and avoid swinging.' },
      { name: 'Cable triceps pushdown', muscle: 'Triceps', equipment: 'Cable', sets: 3, reps: 12, rest: 60, cue: 'Pin your elbows near your sides and straighten your arms under control.' },
      { name: 'Overhead dumbbell triceps extension', muscle: 'Triceps', equipment: 'Dumbbell', sets: 2, reps: 10, rest: 60, cue: 'Keep your elbows pointing forward. Lower behind your head only as far as comfortable.' }
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
  { name: 'Stationary bike', muscle: 'Conditioning', equipment: 'Cardio', sets: 1, reps: 10, rest: 0, cue: 'Start at a manageable pace and build gradually.', durationSec: 600 }
].filter((exercise, index, array) => array.findIndex(item => item.name === exercise.name) === index)


const HOME_PROGRAMS: Program[] = [
  {
    id: 'home-full', title: '10-minute full body', focus: 'Full body · No equipment', level: 'beginner', duration: 10, mode: 'home',
    description: 'A short, simple circuit for days when time is limited.',
    exercises: [
      { name: 'March in place', muscle: 'Warm-up', equipment: 'No equipment', sets: 1, reps: 45, rest: 15, cue: 'Stand tall and march briskly, lifting your knees comfortably.' },
      { name: 'Bodyweight squat', muscle: 'Legs', equipment: 'No equipment', sets: 2, reps: 12, rest: 20, cue: 'Sit your hips back, keep your whole foot planted and stand tall.' },
      { name: 'Incline push-up', muscle: 'Chest', equipment: 'Wall or stable counter', sets: 2, reps: 10, rest: 20, cue: 'Place hands on a stable raised surface. Keep your body in one straight line as you lower your chest.' },
      { name: 'Glute bridge', muscle: 'Glutes', equipment: 'Floor mat', sets: 2, reps: 12, rest: 20, cue: 'Lie on your back, bend your knees and lift your hips by squeezing your glutes.' },
      { name: 'Bird dog', muscle: 'Core', equipment: 'Floor mat', sets: 2, reps: 8, rest: 20, cue: 'On hands and knees, extend opposite arm and leg without rotating your hips.' }
    ]
  },
  {
    id: 'home-chest', title: 'Chest at home', focus: 'Chest · Triceps · No equipment', level: 'beginner', duration: 20, mode: 'home',
    description: 'A chest-focused session with floor and incline push-up variations.',
    exercises: [
      { name: 'Arm circles', muscle: 'Warm-up', equipment: 'No equipment', sets: 1, reps: 30, rest: 15, cue: 'Make small controlled circles, then gradually widen them.' },
      { name: 'Incline push-up', muscle: 'Chest', equipment: 'Wall or stable counter', sets: 3, reps: 10, rest: 45, cue: 'Use a stable counter or bench. Keep your body straight and lower your chest toward your hands.' },
      { name: 'Standard push-up', muscle: 'Chest', equipment: 'Floor mat', sets: 3, reps: 8, rest: 60, cue: 'Hands just wider than shoulders. Brace your body and lower as one unit; use knees if needed.' },
      { name: 'Close-grip push-up', muscle: 'Triceps', equipment: 'Floor mat', sets: 2, reps: 6, rest: 60, cue: 'Place hands slightly inside shoulder width. Keep elbows angled back and use a comfortable range.' }
    ]
  },
  {
    id: 'home-back', title: 'Back at home', focus: 'Back · Core · No equipment', level: 'beginner', duration: 20, mode: 'home',
    description: 'A no-equipment back and posture session using controlled floor movements.',
    exercises: [
      { name: 'Cat-cow', muscle: 'Warm-up', equipment: 'Floor mat', sets: 1, reps: 10, rest: 15, cue: 'On hands and knees, gently round and extend your spine without forcing the range.' },
      { name: 'Superman hold', muscle: 'Back', equipment: 'Floor mat', sets: 3, reps: 20, rest: 35, cue: 'Lie face down and lift arms and legs slightly. Keep your neck neutral; a small lift is enough.' },
      { name: 'Reverse snow angel', muscle: 'Upper back', equipment: 'Floor mat', sets: 3, reps: 10, rest: 35, cue: 'Lie face down, lift your hands slightly and sweep your arms from your sides toward overhead.' },
      { name: 'Bird dog', muscle: 'Core', equipment: 'Floor mat', sets: 2, reps: 8, rest: 30, cue: 'Extend opposite arm and leg while keeping your trunk still.' }
    ]
  },
  {
    id: 'home-legs', title: 'Legs at home', focus: 'Quads · Glutes · No equipment', level: 'beginner', duration: 20, mode: 'home',
    description: 'A lower-body day built around squats, lunges and glute work.',
    exercises: [
      { name: 'March in place', muscle: 'Warm-up', equipment: 'No equipment', sets: 1, reps: 45, rest: 15, cue: 'March at an easy pace and gradually increase the rhythm.' },
      { name: 'Bodyweight squat', muscle: 'Quads', equipment: 'No equipment', sets: 3, reps: 12, rest: 45, cue: 'Keep your heels down, sit between your hips and stand by pushing through the whole foot.' },
      { name: 'Reverse lunge', muscle: 'Quads · Glutes', equipment: 'No equipment', sets: 2, reps: 8, rest: 45, cue: 'Step back, lower both knees comfortably and push through the front foot to stand.' },
      { name: 'Glute bridge', muscle: 'Glutes', equipment: 'Floor mat', sets: 3, reps: 12, rest: 35, cue: 'Lift your hips until shoulders, hips and knees form a line. Do not over-arch your lower back.' },
      { name: 'Standing calf raise', muscle: 'Calves', equipment: 'No equipment', sets: 2, reps: 15, rest: 30, cue: 'Rise onto the balls of your feet, pause, then lower slowly.' }
    ]
  },
  {
    id: 'home-shoulders', title: 'Shoulders at home', focus: 'Shoulders · Core · No equipment', level: 'beginner', duration: 20, mode: 'home',
    description: 'Shoulder stability and bodyweight pressing without gym machines.',
    exercises: [
      { name: 'Arm circles', muscle: 'Warm-up', equipment: 'No equipment', sets: 1, reps: 30, rest: 15, cue: 'Move through small circles first, then slightly larger circles.' },
      { name: 'Pike push-up', muscle: 'Shoulders', equipment: 'Floor mat', sets: 3, reps: 6, rest: 60, cue: 'Start in an inverted V. Bend your elbows and lower your head between your hands; shorten the range if needed.' },
      { name: 'Plank shoulder tap', muscle: 'Shoulders · Core', equipment: 'Floor mat', sets: 3, reps: 12, rest: 45, cue: 'In a high plank, tap the opposite shoulder while keeping your hips as still as possible.' },
      { name: 'Reverse snow angel', muscle: 'Rear delts', equipment: 'Floor mat', sets: 2, reps: 10, rest: 35, cue: 'Lie face down and sweep your arms slowly while keeping them just off the floor.' }
    ]
  },
  {
    id: 'home-arms', title: 'Arms at home', focus: 'Biceps · Triceps · No equipment', level: 'beginner', duration: 20, mode: 'home',
    description: 'Arm-focused bodyweight movements using push-up variations and self-resisted curls. No weights or machines.',
    exercises: [
      { name: 'Arm circles', muscle: 'Warm-up', equipment: 'No equipment', sets: 1, reps: 30, rest: 15, cue: 'Warm the shoulders with small, steady circles.' },
      { name: 'Close-grip push-up', muscle: 'Triceps', equipment: 'Floor mat', sets: 3, reps: 6, rest: 60, cue: 'Keep hands just inside shoulder width and lower slowly. Use an incline to make it easier.' },
      { name: 'Self-resisted biceps curl', muscle: 'Biceps', equipment: 'No equipment', sets: 3, reps: 10, rest: 40, cue: 'Curl one arm while the opposite hand gently resists the movement. Change sides each set.' },
      { name: 'Incline close-grip push-up', muscle: 'Triceps', equipment: 'Wall or stable counter', sets: 2, reps: 10, rest: 45, cue: 'Place hands slightly inside shoulder width on a stable counter or wall. Keep elbows angled back and lower under control.' }
    ]
  }
];

// Give every home routine a clear opening, six focused work movements and a short cool-down.
const HOME_EXTRAS: Record<string, ProgramExercise[]> = {
  'home-full': [
    { name: 'Sit-up', muscle: 'Core', equipment: 'Floor', sets: 1, reps: 12, rest: 20, cue: 'Lie on your back with knees bent. Curl your torso up smoothly without pulling your neck.' },
    { name: 'Mountain climber', muscle: 'Core · Cardio', equipment: 'Floor', sets: 1, reps: 20, rest: 20, cue: 'Start in a high plank and alternate bringing each knee forward while keeping your shoulders over your hands.' },
    { name: 'Reverse lunge', muscle: 'Legs', equipment: 'No equipment', sets: 1, reps: 8, rest: 15, cue: 'Step back and lower under control. Alternate legs.' },
    { name: 'Wall push-up', muscle: 'Chest', equipment: 'Wall', sets: 1, reps: 12, rest: 15, cue: 'Place hands on a wall, lean in with a straight body, then press away.' }
  ],
  'home-chest': [
    { name: 'Wide push-up', muscle: 'Chest', equipment: 'Floor mat', sets: 1, reps: 8, rest: 20, cue: 'Place hands slightly wider than shoulders and lower as one unit.' },
    { name: 'Plank shoulder tap', muscle: 'Chest · Core', equipment: 'Floor mat', sets: 1, reps: 12, rest: 20, cue: 'In a high plank, tap opposite shoulders while keeping hips steady.' }
  ],
  'home-back': [
    { name: 'Prone W raise', muscle: 'Upper back', equipment: 'Floor mat', sets: 1, reps: 10, rest: 20, cue: 'Lie face down, bend elbows into a W and lift hands and elbows slightly.' },
    { name: 'Scapular push-up', muscle: 'Upper back', equipment: 'Floor mat', sets: 1, reps: 10, rest: 20, cue: 'Hold a high plank and move only your shoulder blades, keeping elbows straight.' },
    { name: 'Prone cobra hold', muscle: 'Upper back', equipment: 'Floor mat', sets: 1, reps: 20, rest: 20, cue: 'Lie face down, lift chest slightly and draw shoulder blades down and back.' }
  ],
  'home-legs': [
    { name: 'Wall sit', muscle: 'Quads', equipment: 'Wall', sets: 1, reps: 30, rest: 20, cue: 'Slide down a wall to a comfortable knee bend and hold with your back supported.' },
    { name: 'Squat pulse', muscle: 'Quads · Glutes', equipment: 'No equipment', sets: 1, reps: 12, rest: 20, cue: 'Stay in a comfortable partial squat and make small controlled pulses.' }
  ],
  'home-shoulders': [
    { name: 'Wall slide', muscle: 'Shoulders', equipment: 'Wall', sets: 1, reps: 10, rest: 20, cue: 'Keep forearms against a wall and slide your arms upward without shrugging.' },
    { name: 'Prone Y raise', muscle: 'Rear delts', equipment: 'Floor mat', sets: 1, reps: 10, rest: 20, cue: 'Lie face down and lift your arms in a Y shape with thumbs pointing upward.' },
    { name: 'Bear plank shoulder tap', muscle: 'Shoulders · Core', equipment: 'Floor mat', sets: 1, reps: 10, rest: 20, cue: 'Hover knees just above the floor and tap the opposite shoulder without rocking.' }
  ],
  'home-arms': [
    { name: 'Diamond push-up', muscle: 'Triceps', equipment: 'Floor mat', sets: 1, reps: 6, rest: 25, cue: 'Bring hands closer beneath your chest. Use an incline if the floor version is too difficult.' },
    { name: 'Reverse plank hold', muscle: 'Arms · Core', equipment: 'Floor mat', sets: 1, reps: 20, rest: 20, cue: 'Sit with hands behind you, lift hips and keep shoulders comfortable.' },
    { name: 'Incline close-grip push-up', muscle: 'Triceps', equipment: 'Stable counter', sets: 1, reps: 10, rest: 20, cue: 'Use a stable counter and keep elbows angled back as you lower.' }
  ]
};
const HOME_COOLDOWNS: Record<string, ProgramExercise[]> = {
  'home-full': [
    { name: 'Standing forward fold', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Soften your knees and fold forward only as far as comfortable.' },
    { name: 'Chest opener stretch', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Clasp hands behind your back or place them on your hips and gently open your chest.' }
  ],
  'home-chest': [
    { name: 'Doorway chest stretch', muscle: 'Cool-down', equipment: 'Door frame', sets: 1, reps: 30, rest: 0, cue: 'Rest a forearm against a door frame and turn gently away until you feel a mild chest stretch.' },
    { name: 'Overhead triceps stretch', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Reach one arm overhead, bend the elbow and gently guide it with the other hand.' }
  ],
  'home-back': [
    { name: 'Child’s pose', muscle: 'Cool-down', equipment: 'Floor mat', sets: 1, reps: 35, rest: 0, cue: 'Sit hips toward heels and reach arms forward. Breathe comfortably.' },
    { name: 'Sphinx stretch', muscle: 'Cool-down', equipment: 'Floor mat', sets: 1, reps: 30, rest: 0, cue: 'Lie face down and prop on forearms, keeping the stretch gentle.' }
  ],
  'home-legs': [
    { name: 'Standing quad stretch', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Hold a support, bring heel toward glutes and keep knees close.' },
    { name: 'Hamstring stretch', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Place one heel forward and hinge gently at the hips with a long back.' }
  ],
  'home-shoulders': [
    { name: 'Cross-body shoulder stretch', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Bring one arm across your chest and guide it gently with the opposite hand.' },
    { name: 'Chest opener stretch', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Open your chest gently while keeping shoulders relaxed and down.' }
  ],
  'home-arms': [
    { name: 'Overhead triceps stretch', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Reach one arm overhead, bend the elbow and guide gently with your other hand.' },
    { name: 'Cross-body shoulder stretch', muscle: 'Cool-down', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Bring one arm across your chest and hold a comfortable stretch.' }
  ]
};
const HOME_WARMUPS: ProgramExercise[] = [
  { name: 'March in place', muscle: 'Warm-up', equipment: 'No equipment', sets: 1, reps: 40, rest: 10, cue: 'Stand tall and march briskly, lifting each knee comfortably.', phase: 'warmup', durationSec: 45 },
  { name: 'Arm circles', muscle: 'Warm-up', equipment: 'No equipment', sets: 1, reps: 30, rest: 10, cue: 'Make small controlled circles, then gradually widen them.', phase: 'warmup', durationSec: 45 }
];
HOME_PROGRAMS.forEach(program => {
  const warmups = program.id === 'home-back'
    ? [{ name: 'Cat-cow', muscle: 'Warm-up', equipment: 'Floor mat', sets: 1, reps: 10, rest: 10, cue: 'On hands and knees, gently round and extend your spine without forcing the range.', phase: 'warmup' as const, durationSec: 45 }, HOME_WARMUPS[1]]
    : HOME_WARMUPS;
  const main = [...program.exercises, ...(HOME_EXTRAS[program.id] || [])];
  const cooldowns = HOME_COOLDOWNS[program.id] || HOME_COOLDOWNS['home-full'];
  const sequence = [...warmups, ...main, ...cooldowns];
  program.exercises = sequence.map((exercise, index) => ({
    ...exercise,
    sets: 1,
    phase: index < warmups.length ? 'warmup' : index >= sequence.length - cooldowns.length ? 'cooldown' : 'main',
    durationSec: exercise.durationSec || (index < warmups.length ? 45 : index >= sequence.length - cooldowns.length ? 35 : 40)
  }));
});

// Exact movement references: curated Unsplash photographs where the pose is a direct match,
// plus Free Exercise DB step-by-step photos for the remaining movements.
const UNSPLASH_MOVEMENT_IMAGES: Record<string, string> = {
  'barbell bench press': 'https://images.unsplash.com/photo-1598575435247-2572be03bf6d?auto=format&fit=crop&w=1200&q=82',
  'lat pulldown': 'https://images.unsplash.com/photo-1745329532611-03818982ed31?auto=format&fit=crop&w=1200&q=82',
  'back squat': 'https://images.unsplash.com/photo-1683147778229-e8479ec374ff?auto=format&fit=crop&w=1200&q=82',
  'goblet squat': 'https://images.unsplash.com/photo-1635863823065-6188cb5c2358?auto=format&fit=crop&w=1200&q=82',
  'leg press': 'https://images.unsplash.com/photo-1744551612249-655d096b9f95?auto=format&fit=crop&w=1200&q=82',
  'dumbbell shoulder press': 'https://images.unsplash.com/photo-1772450014048-ec6dc611be2b?auto=format&fit=crop&w=1200&q=82',
  'seated dumbbell shoulder press': 'https://images.unsplash.com/photo-1772450014048-ec6dc611be2b?auto=format&fit=crop&w=1200&q=82',
  'dumbbell curl': 'https://images.unsplash.com/photo-1704223523321-7b0b44a1a0b9?auto=format&fit=crop&w=1200&q=82',
  'treadmill walk': 'https://images.unsplash.com/photo-1675026482188-8102367ecc16?auto=format&fit=crop&w=1200&q=82',
  'walking, treadmill': 'https://images.unsplash.com/photo-1675026482188-8102367ecc16?auto=format&fit=crop&w=1200&q=82',
  'standard push-up': 'https://images.unsplash.com/photo-1758599878868-52cced2f8154?auto=format&fit=crop&w=1200&q=82',
  'push-up': 'https://images.unsplash.com/photo-1758599878868-52cced2f8154?auto=format&fit=crop&w=1200&q=82',
  'plank': 'https://images.unsplash.com/photo-1758599878908-596c2042f563?auto=format&fit=crop&w=1200&q=82',
  'overhead stretch': 'https://images.unsplash.com/photo-1770026136858-6f12670dd131?auto=format&fit=crop&w=1200&q=82'
};
const EXERCISE_IMAGES: Record<string, string> = {
  'machine chest press': 'Leverage_Chest_Press', 'incline dumbbell press': 'Incline_Dumbbell_Press',
  'seated cable row': 'Seated_Cable_Rows', 'bent over barbell row': 'Bent_Over_Barbell_Row',
  'close-grip front lat pulldown': 'Close-Grip_Front_Lat_Pulldown',
  'dumbbell romanian deadlift': 'Romanian_Deadlift', 'romanian deadlift': 'Romanian_Deadlift',
  'seated leg curl': 'Seated_Leg_Curl', 'standing calf raise': 'Standing_Calf_Raises',
  'dumbbell lateral raise': 'Side_Lateral_Raise', 'cable face pull': 'Face_Pull',
  'seated dumbbell curl': 'Seated_Dumbbell_Curl', 'hammer curl': 'Hammer_Curls',
  'cable triceps pushdown': 'Triceps_Pushdown', 'overhead cable triceps extension': 'Cable_Rope_Overhead_Triceps_Extension',
  'overhead dumbbell triceps extension': 'Standing_Dumbbell_Triceps_Extension',
  'dumbbell fly': 'Dumbbell_Flyes', 'cable chest fly': 'Cable_Crossover',
  'leg extension': 'Leg_Extensions', 'hip thrust': 'Barbell_Hip_Thrust',
  'dead bug': 'Dead_Bug', 'stationary bike': 'Bicycling_Stationary', 'bicycling, stationary': 'Bicycling_Stationary',
  'bodyweight squat': 'Bodyweight_Squat', 'incline push-up': 'Incline_Push-Up',
  'incline close-grip push-up': 'Incline_Push-Up_Close-Grip', 'close-grip push-up': 'Incline_Push-Up_Close-Grip',
  'arm circles': 'Arm_Circles', 'sit-up': 'Sit-Up', 'mountain climber': 'Mountain_Climbers',
  'superman hold': 'Superman', 'dumbbell split squat': 'Split_Squat_with_Dumbbells',
  'reverse dumbbell fly': 'Dumbbell_Lying_Rear_Lateral_Raise', 'calf press on the leg press machine': 'Calf_Press_On_The_Leg_Press_Machine',
  'standing quadriceps stretch': 'Quad_Stretch', 'standing quad stretch': 'Quad_Stretch',
  'standing hamstring and calf stretch': 'Standing_Hamstring_and_Calf_Stretch',
  'calf wall stretch': 'Calf_Stretch_Hands_Against_Wall', 'child’s pose': 'Childs_Pose', "child's pose": 'Childs_Pose',
  'cross body shoulder stretch': 'Shoulder_Stretch', 'overhead triceps stretch': 'Triceps_Stretch',
  'biceps wall stretch': 'Standing_Biceps_Stretch', 'wrist flexor stretch': 'Kneeling_Forearm_Stretch',
  'doorway chest stretch': 'Chest_And_Front_Of_Shoulder_Stretch', 'chest opener stretch': 'Chest_And_Front_Of_Shoulder_Stretch',
  'cat-cow': 'Cat_Stretch', 'cat stretch': 'Cat_Stretch',
  'upper back stretch': 'Upper_Back_Stretch', 'lat stretch on bench': 'Upper_Back_Stretch'
};
function exerciseImage(name: string) {
  const key = name.trim().toLowerCase();
  const curated = UNSPLASH_MOVEMENT_IMAGES[key];
  if (curated) return curated;
  const slug = EXERCISE_IMAGES[key];
  return slug ? 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/' + slug + '/0.jpg' : '';
}
function programImage(program: Program) {
  const firstMain = program.exercises.find(item => item.phase === 'main') || program.exercises[0];
  return firstMain ? exerciseImage(firstMain.name) : '';
}
function TrainingPhoto({ name, alt, className }: { name: string; mode?: 'gym' | 'home'; gender?: Gender; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = exerciseImage(name);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return <div className={'training-photo-fallback ' + (className || '')} role='img' aria-label={alt}><Dumbbell size={20} /><strong>{name}</strong><span>PHOTO GUIDE UNAVAILABLE</span></div>;
  return <img src={src} alt={alt} className={className || ''} loading='lazy' decoding='async' onError={() => setFailed(true)} />;
}
const NAV_ITEMS = [
  { id: 'today' as Tab, label: 'Today', icon: Home },
  { id: 'train' as Tab, label: 'Train', icon: Dumbbell },
  { id: 'progress' as Tab, label: 'Progress', icon: TrendingUp },
  { id: 'profile' as Tab, label: 'Profile', icon: UserRound }
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
function normalizeKenyanPhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('254')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return '+254' + digits.slice(0, 9);
}
function phoneNationalPart(value: string) { return value ? normalizeKenyanPhone(value).slice(4) : ''; }
function isValidKenyanPhone(value: string) { return /^\+254[17]\d{8}$/.test(normalizeKenyanPhone(value)); }
function packageDurationDays(type: PackageType) { return type === 'daily' ? 1 : type === 'weekly' ? 7 : type === 'monthly' ? 30 : 120; }
function createPackageWindow(type: PackageType, startDate = dateKey()) {
  const end = new Date(startDate + 'T12:00:00'); end.setDate(end.getDate() + packageDurationDays(type));
  return { packageStart: startDate, packageEnd: dateKey(end) };
}
function isPackageActive(profile: Profile, date = dateKey()) { return Boolean(profile.packageStart && profile.packageEnd && date >= profile.packageStart && date < profile.packageEnd); }
function packageName(type: PackageType) { return type === 'daily' ? 'Daily pass' : type === 'weekly' ? 'Weekly pass' : type === 'monthly' ? 'Monthly membership' : 'Full semester'; }
function packageEndLabel(profile: Profile) {
  if (!profile.packageEnd) return 'Not activated';
  const end = new Date(profile.packageEnd + 'T12:00:00'); end.setDate(end.getDate() - 1);
  return end.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDayLabel(date: Date) { return date.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' }); }
function formatSessionWindow(startTime: string) {
  const [hours, minutes] = (startTime || '08:00').split(':').map(Number);
  const start = new Date(); start.setHours(hours || 8, minutes || 0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return start.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' }) + ' – ' + end.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit' });
}
function latestBodyweight(store: Store) { return store.profile.bodyweightKg ?? store.weightLogs[store.weightLogs.length - 1]?.kg ?? null; }

function gymWarmupForFocus(focus: string): ProgramExercise[] {
  const lower = /leg|lower/i.test(focus);
  return [
    { name: lower ? 'Stationary bike' : 'Treadmill walk', muscle: 'General warm-up', equipment: lower ? 'Stationary bike' : 'Treadmill', sets: 1, reps: 5, rest: 0, cue: 'Move easily for five minutes. Build temperature gradually before lifting.', phase: 'warmup', durationSec: 300 },
    { name: 'Arm circles', muscle: 'Shoulders', equipment: 'No equipment', sets: 1, reps: 10, rest: 0, cue: 'Make small controlled circles forwards and backwards.', phase: 'warmup', durationSec: 30 },
    lower
      ? { name: 'Bodyweight squat', muscle: 'Quads · Glutes', equipment: 'No equipment', sets: 1, reps: 10, rest: 0, cue: 'Rehearse your squat pattern in a comfortable range.', phase: 'warmup', durationSec: 40 }
      : { name: 'Scapular wall slides', muscle: 'Upper back · Shoulders', equipment: 'Wall', sets: 1, reps: 10, rest: 0, cue: 'Keep your ribs down and slide your arms up the wall.', phase: 'warmup', durationSec: 40 }
  ];
}
function gymCooldownForFocus(focus: string): ProgramExercise[] {
  const lower = /leg|lower/i.test(focus), back = /back|pull/i.test(focus), shoulders = /shoulder/i.test(focus), arms = /arm|biceps|triceps/i.test(focus);
  if (lower) return [
    { name: 'Standing quadriceps stretch', muscle: 'Quads', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Hold a support if needed. Bring your heel toward your glutes gently.', phase: 'cooldown', durationSec: 30 },
    { name: 'Standing hamstring stretch', muscle: 'Hamstrings', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Place one heel forward and hinge gently at the hips. Do not bounce.', phase: 'cooldown', durationSec: 30 },
    { name: 'Calf wall stretch', muscle: 'Calves', equipment: 'Wall', sets: 1, reps: 30, rest: 0, cue: 'Keep the back heel down and lean forward gently.', phase: 'cooldown', durationSec: 30 }
  ];
  if (back) return [
    { name: 'Child’s pose', muscle: 'Back', equipment: 'Floor mat', sets: 1, reps: 30, rest: 0, cue: 'Sit your hips gently toward your heels and reach forward.', phase: 'cooldown', durationSec: 30 },
    { name: 'Upper back stretch', muscle: 'Upper back · Lats', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Reach both arms forward, gently round the upper back and breathe into the stretch.', phase: 'cooldown', durationSec: 30 },
    { name: 'Cross-body shoulder stretch', muscle: 'Rear delts', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Bring one arm across your chest and guide it gently.', phase: 'cooldown', durationSec: 30 }
  ];
  if (shoulders) return [
    { name: 'Cross-body shoulder stretch', muscle: 'Shoulders', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Bring one arm across your chest and hold a comfortable stretch.', phase: 'cooldown', durationSec: 30 },
    { name: 'Overhead triceps stretch', muscle: 'Triceps', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Raise one arm overhead, bend the elbow and guide lightly.', phase: 'cooldown', durationSec: 30 },
    { name: 'Chest opener stretch', muscle: 'Chest', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Open your chest gently with shoulders relaxed.', phase: 'cooldown', durationSec: 30 }
  ];
  if (arms) return [
    { name: 'Overhead triceps stretch', muscle: 'Triceps', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Raise one arm overhead, bend the elbow and guide lightly.', phase: 'cooldown', durationSec: 30 },
    { name: 'Biceps wall stretch', muscle: 'Biceps · Chest', equipment: 'Wall', sets: 1, reps: 30, rest: 0, cue: 'Place your palm against a wall and rotate gently away.', phase: 'cooldown', durationSec: 30 },
    { name: 'Wrist flexor stretch', muscle: 'Forearms', equipment: 'No equipment', sets: 1, reps: 20, rest: 0, cue: 'Extend one arm and gently draw the fingers back.', phase: 'cooldown', durationSec: 20 }
  ];
  return [
    { name: 'Doorway chest stretch', muscle: 'Chest', equipment: 'Door frame', sets: 1, reps: 30, rest: 0, cue: 'Rest a forearm on a door frame and turn gently away.', phase: 'cooldown', durationSec: 30 },
    { name: 'Overhead triceps stretch', muscle: 'Triceps', equipment: 'No equipment', sets: 1, reps: 30, rest: 0, cue: 'Raise one arm overhead, bend the elbow and guide lightly.', phase: 'cooldown', durationSec: 30 },
    { name: 'Child’s pose', muscle: 'Back', equipment: 'Floor mat', sets: 1, reps: 30, rest: 0, cue: 'Sit your hips toward your heels and reach forward.', phase: 'cooldown', durationSec: 30 }
  ];
}
function personaliseGymProgram(base: Program, level: Level, goal: Goal): Program {
  const main = base.exercises.filter(item => item.phase !== 'warmup' && item.phase !== 'cooldown').map(exercise => {
    const compound = /press|squat|deadlift|row|pulldown|leg press|split squat/i.test(exercise.name);
    const beginner = level === 'beginner', advanced = level === 'advanced';
    const sets = goal === 'strength' ? (beginner ? (compound ? 3 : 2) : advanced ? (compound ? 5 : 3) : (compound ? 4 : 3))
      : goal === 'build_muscle' ? (beginner ? 2 : advanced ? 4 : 3) : (beginner ? 2 : advanced ? 3 : 3);
    const reps = goal === 'strength' ? (compound ? 5 : 7) : goal === 'build_muscle' ? (compound ? 8 : 12) : (compound ? 10 : 12);
    const rest = goal === 'strength' ? (compound ? 180 : 120) : goal === 'build_muscle' ? (compound ? 120 : 75) : goal === 'fat_loss' ? (compound ? 75 : 45) : (compound ? 90 : 60);
    return { ...exercise, phase: 'main' as const, sets, reps, rest };
  });
  if (goal === 'fat_loss') main.push({ name: 'Treadmill walk', muscle: 'Conditioning', equipment: 'Treadmill', sets: 1, reps: 8, rest: 0, cue: 'Walk at a brisk but sustainable pace. Keep breathing controlled and reduce speed if needed.', phase: 'main', durationSec: 480 });
  const goalCopy: Record<Goal, string> = { build_muscle: 'Muscle-building volume with controlled repetitions and enough rest to maintain good form.', strength: 'Strength-focused sets use lower repetitions and longer rests. Choose a load you can lift cleanly.', fat_loss: 'Strength work is paired with a short, timed conditioning block. Progress comes from consistent training and broader lifestyle habits.', general_fitness: 'Moderate repetitions and balanced movement patterns build a sustainable base.' };
  return { ...base, level, description: goalCopy[goal], duration: base.duration + (goal === 'fat_loss' ? 18 : 10), exercises: [...gymWarmupForFocus(base.focus), ...main, ...gymCooldownForFocus(base.focus)] };
}

function getProgramForDay(date: Date, target: number, level: Level = 'beginner', splitStyle: SplitStyle = 'focused', goal: Goal = 'build_muscle') {
  const day = (date.getDay() + 6) % 7;
  const schedules: Record<SplitStyle, Record<number, { days: number[]; ids: string[] }>> = {
    focused: {
      3: { days: [0, 2, 4], ids: ['push', 'pull', 'legs'] },
      4: { days: [0, 1, 3, 5], ids: ['chest', 'back', 'legs', 'shoulders'] },
      5: { days: [0, 1, 2, 3, 5], ids: ['chest', 'back', 'legs', 'shoulders', 'arms'] },
      6: { days: [0, 1, 2, 3, 4, 5], ids: ['chest', 'back', 'legs', 'shoulders', 'arms', 'push'] }
    },
    ppl: {
      3: { days: [0, 2, 4], ids: ['push', 'pull', 'legs'] },
      4: { days: [0, 1, 3, 5], ids: ['push', 'pull', 'legs', 'upper'] },
      5: { days: [0, 1, 2, 4, 5], ids: ['push', 'pull', 'legs', 'push', 'pull'] },
      6: { days: [0, 1, 2, 3, 4, 5], ids: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] }
    },
    upper_lower: {
      3: { days: [0, 2, 4], ids: ['upper', 'lower', 'upper'] },
      4: { days: [0, 1, 3, 5], ids: ['upper', 'lower', 'upper', 'lower'] },
      5: { days: [0, 1, 2, 4, 5], ids: ['upper', 'lower', 'push', 'pull', 'legs'] },
      6: { days: [0, 1, 2, 3, 4, 5], ids: ['upper', 'lower', 'upper', 'lower', 'upper', 'lower'] }
    }
  };
  const schedule = schedules[splitStyle]?.[target] || schedules.focused[4];
  const index = schedule.days.indexOf(day);
  if (index < 0) return null;
  const base = PROGRAMS.find(program => program.id === schedule.ids[index]);
  if (!base) return null;
  let sessionBase = base;
  if (splitStyle === 'focused' && target === 4 && base.id === 'shoulders') {
    const armProgram = PROGRAMS.find(program => program.id === 'arms');
    const biceps = armProgram?.exercises.find(item => item.muscle === 'Biceps');
    const triceps = armProgram?.exercises.find(item => item.muscle === 'Triceps');
    sessionBase = {
      ...base,
      title: 'Shoulders & arms',
      focus: 'Shoulders · Biceps · Triceps',
      description: 'Your four-day focused split combines shoulder work with direct biceps and triceps accessories.',
      exercises: [...base.exercises, ...(biceps ? [biceps] : []), ...(triceps ? [triceps] : [])]
    };
  }
  return personaliseGymProgram(sessionBase, level, goal);
}
function getHomeProgramForDay(date: Date, profile: Profile) {
  const gymPlan = getProgramForDay(date, profile.weeklyTarget, profile.level, profile.splitStyle, profile.goal);
  if (!gymPlan) return null;
  const id = /leg|lower/i.test(gymPlan.focus) ? 'home-legs'
    : /back|pull/i.test(gymPlan.focus) ? 'home-back'
      : /chest|push/i.test(gymPlan.focus) ? 'home-chest'
        : /shoulder/i.test(gymPlan.focus) ? 'home-shoulders'
          : /arm|biceps|triceps/i.test(gymPlan.focus) ? 'home-arms' : 'home-full';
  return HOME_PROGRAMS.find(program => program.id === id) || HOME_PROGRAMS[0];
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
    mode: session.mode || 'gym',
    duration: Math.max(20, session.durationMin),
    description: 'A copy of your last completed session. Previous loads will be prefilled where available.',
    exercises: session.exercises.map(exercise => ({
      name: exercise.name,
      muscle: exercise.muscle,
      equipment: exercise.equipment,
      sets: Math.max(1, exercise.sets.length),
      reps: exercise.sets.find(set => set.done)?.reps || 10,
      rest: exercise.restSeconds,
      cue: exercise.cue || 'Use a controlled range of motion and a load you can manage.',
      phase: exercise.phase, durationSec: exercise.durationSec
    }))
  }
}

function buildWorkout(program: Program, sessions: Session[]): ActiveWorkout {
  return {
    id: makeId(), title: program.title, focus: program.focus, startedAt: Date.now(), mode: program.mode || 'gym', notes: '',
    exercises: program.exercises.map(item => {
      const previous = latestSet(sessions, item.name)
      return {
        id: makeId(), name: item.name, muscle: item.muscle, equipment: item.equipment,
        cue: item.cue, restSeconds: item.rest, phase: item.phase, durationSec: item.durationSec,
        sets: Array.from({ length: program.mode === 'home' ? 1 : item.sets }, () => ({
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

function safeReadStore(): Store {
  try {
    const current = localStorage.getItem(STORE_KEY);
    if (current) {
      const parsed = JSON.parse(current) as Partial<Store>;
      const saved = (parsed.profile || {}) as Partial<Profile>;
      const phone = saved.phone ? normalizeKenyanPhone(saved.phone) : '';
      const packageType = saved.packageType || 'daily';
      const completed = Boolean(saved.onboardingComplete && isValidKenyanPhone(phone));
      const packageWindow = saved.packageStart && saved.packageEnd ? { packageStart: saved.packageStart, packageEnd: saved.packageEnd }
        : completed ? createPackageWindow(packageType) : { packageStart: '', packageEnd: '' };
      const profile: Profile = { ...defaultProfile, ...saved, phone, packageType,
        gender: saved.gender === 'woman' ? 'woman' : 'man', bodyweightKg: Number(saved.bodyweightKg) > 0 ? Number(saved.bodyweightKg) : null,
        sessionStartTime: saved.sessionStartTime || '08:00', ...packageWindow, onboardingComplete: completed };
      return { version: 2, profile, sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        weightLogs: Array.isArray(parsed.weightLogs) ? parsed.weightLogs : [], measurementLogs: Array.isArray(parsed.measurementLogs) ? parsed.measurementLogs : [] };
    }
    const legacyText = localStorage.getItem('lgg:v1');
    if (legacyText) {
      const legacy = JSON.parse(legacyText) as {
        profile?: Partial<Profile> & { goal?: string };
        sessions?: Array<{ id?: string; date: string; type?: string; durationMin?: number; exercises?: Array<{ name: string; sets: Array<{ reps: number; weightKg: number }> }> }>;
        weightLogs?: WeightLog[]; measurementLogs?: MeasurementLog[];
      };
      const migratedSessions: Session[] = (legacy.sessions || []).map(item => {
        const startedAt = new Date(item.date + 'T08:00:00').getTime();
        return { id: item.id || makeId(), date: item.date, startedAt, finishedAt: startedAt + (item.durationMin || 45) * 60000,
          title: item.type === 'home' ? 'Home workout' : 'Gym session', focus: 'Previous session', mode: item.type === 'home' ? 'home' : 'gym', durationMin: item.durationMin || 45,
          exercises: (item.exercises || []).map(exercise => ({ id: makeId(), name: exercise.name, muscle: 'General', equipment: 'Previous log', cue: '', restSeconds: 60,
            sets: (exercise.sets || []).map(set => ({ id: makeId(), reps: set.reps, weightKg: set.weightKg, rir: 2, done: true })) })), notes: '' };
      });
      const oldGoal = String(legacy.profile?.goal || '');
      const migratedGoal: Goal = oldGoal === 'lose_fat' ? 'fat_loss' : oldGoal === 'stay_consistent' ? 'general_fitness'
        : oldGoal === 'strength' || oldGoal === 'fat_loss' || oldGoal === 'general_fitness' ? oldGoal : 'build_muscle';
      const phone = legacy.profile?.phone ? normalizeKenyanPhone(legacy.profile.phone) : '';
      const packageType = legacy.profile?.packageType || 'daily';
      const packageWindow = isValidKenyanPhone(phone) ? createPackageWindow(packageType) : { packageStart: '', packageEnd: '' };
      const profile: Profile = { ...defaultProfile, ...(legacy.profile || {}), goal: migratedGoal, phone,
        memberType: legacy.profile?.memberType || 'existing', splitStyle: legacy.profile?.splitStyle || 'focused',
        gender: legacy.profile?.gender === 'woman' ? 'woman' : 'man', bodyweightKg: Number(legacy.profile?.bodyweightKg) > 0 ? Number(legacy.profile?.bodyweightKg) : null,
        packageType, sessionStartTime: legacy.profile?.sessionStartTime || '08:00', ...packageWindow, onboardingComplete: isValidKenyanPhone(phone) };
      const migrated: Store = { version: 2, profile, sessions: migratedSessions, weightLogs: legacy.weightLogs || [], measurementLogs: legacy.measurementLogs || [] };
      localStorage.setItem(STORE_KEY, JSON.stringify(migrated)); return migrated;
    }
  } catch { return { ...emptyStore, profile: { ...defaultProfile } }; }
  return { ...emptyStore, profile: { ...defaultProfile } };
}

export default function Page() {
  const [store, setStore] = useState<Store | null>(null)
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null)
  const [pausedWorkout, setPausedWorkout] = useState<ActiveWorkout | null>(null)
  const [tab, setTab] = useState<Tab>('today')
  const [trainView, setTrainView] = useState<'plans' | 'home' | 'library'>('plans')
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
  const startWorkout = (program: Program) => {
    if (!store || !isPackageActive(store.profile)) {
      setToast('Your membership has ended. Choose a package in Profile to continue.');
      window.setTimeout(() => setToast(''), 3200);
      return;
    }
    const next = buildWorkout(program, store.sessions)
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
      title: activeWorkout.title, focus: activeWorkout.focus, mode: activeWorkout.mode || 'gym',
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
    setToast(store.profile.packageType === 'daily' ? 'Workout saved. Your daily pass is active until midnight.' : 'Workout saved. Every rep is on record.')
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
      version: 2, profile: { ...defaultProfile, ...next.profile, phone: next.profile?.phone ? normalizeKenyanPhone(next.profile.phone) : '', gender: next.profile?.gender === 'woman' ? 'woman' : 'man', packageType: next.profile?.packageType || 'daily', memberType: next.profile?.memberType || 'existing', splitStyle: next.profile?.splitStyle || 'focused', onboardingComplete: Boolean(next.profile?.onboardingComplete && isValidKenyanPhone(String(next.profile?.phone || ''))), ...((next.profile?.packageStart && next.profile?.packageEnd) ? {} : createPackageWindow(next.profile?.packageType || 'daily')) },
      sessions: Array.isArray(next.sessions) ? next.sessions : [],
      weightLogs: Array.isArray(next.weightLogs) ? next.weightLogs : [],
      measurementLogs: Array.isArray(next.measurementLogs) ? next.measurementLogs : [],
    }
    persist(normalized)
    setActiveWorkout(null)
    localStorage.removeItem(ACTIVE_KEY)
  }

  if (!store) return <div className="loading-screen"><div className="brand-mark">LF</div><p>Preparing your training space</p></div>
  if (!store.profile.onboardingComplete) return <Onboarding initialProfile={store.profile} onComplete={(profile, firstLog) => persist({ ...store, profile, weightLogs: firstLog ? [...store.weightLogs.filter(item => item.date !== firstLog.date), firstLog].sort((a, b) => a.date.localeCompare(b.date)) : store.weightLogs })} />

  if (activeWorkout?.mode === 'home') {
    return <HomeWorkoutPlayer workout={activeWorkout} themeDark={store.profile.themeDark} gender={store.profile.gender} onChange={saveActive} onFinish={finishWorkout} onExit={() => { if (window.confirm('Pause this home workout and return to your member space? Your progress will remain saved.')) { setPausedWorkout(activeWorkout); setActiveWorkout(null); setTab('today'); } }} />
  }

  if (activeWorkout) {
    return <WorkoutRunner
      workout={activeWorkout}
      sessions={store.sessions}
      units={store.profile.units}
      themeDark={store.profile.themeDark}
      gender={store.profile.gender}
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
          {tab === 'today' && <Dashboard store={store} onStart={startWorkout} onTrain={() => { setTrainView('plans'); setTab('train'); }} onHome={() => { setTrainView('home'); setTab('train'); }} pausedWorkout={pausedWorkout} onResume={workout => { setActiveWorkout(workout); setPausedWorkout(null) }} />}
          {tab === 'train' && <TrainingPage store={store} onStart={startWorkout} onRepeat={repeatSession} initialView={trainView} gender={store.profile.gender} />}
          {tab === 'progress' && <ProgressPage store={store} onWeight={() => setModal('weight')} onMeasurement={() => setModal('measurement')} />}
          {tab === 'profile' && <ProfilePage store={store} persist={persist} resetData={resetData} onImport={importData} />}
        </main>
      </div>

      {modal === 'weight' && <WeightModal store={store} close={() => setModal(null)} persist={persist} />}
      {modal === 'measurement' && <MeasurementModal store={store} close={() => setModal(null)} persist={persist} />}
      {toast && <div className="toast"><CheckCircle2 size={16} />{toast}</div>}
      <nav className="mobile-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          return <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}><Icon size={19} /><span>{item.id === 'progress' ? 'Progress' : item.id === 'profile' ? 'Profile' : item.id === 'train' ? 'Train' : 'Today'}</span></button>
        })}
      </nav>
    </div>
  )
}

function Brand() {
  return <div className="brand-lockup brand-lockup-real">
    <img src="/legrande-logo.png" alt="LeGrande Fitness Center logo" />
  </div>
}

function Onboarding({ onComplete, initialProfile = defaultProfile }: { onComplete: (profile: Profile, firstLog?: WeightLog) => void; initialProfile?: Profile }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Profile>({ ...defaultProfile, ...initialProfile });
  const [weight, setWeight] = useState(initialProfile.bodyweightKg ? String(displayWeight(initialProfile.bodyweightKg, initialProfile.units)) : '');
  const [height, setHeight] = useState(initialProfile.heightCm ? String(initialProfile.heightCm) : '');
  const update = (patch: Partial<Profile>) => setProfile(current => ({ ...current, ...patch }));
  const validPhone = isValidKenyanPhone(profile.phone);
  const canContinue = step === 1 ? profile.name.trim().length > 1 && validPhone
    : step === 2 ? (!weight || Number(weight) > 0) && (!height || Number(height) > 0)
      : true;
  const finish = () => {
    const firstLog: WeightLog | undefined = Number(weight) > 0 ? { date: dateKey(), kg: toKg(weight, profile.units) } : undefined;
    const packageWindow = createPackageWindow(profile.packageType);
    onComplete({
      ...profile,
      phone: normalizeKenyanPhone(profile.phone),
      bodyweightKg: firstLog?.kg ?? profile.bodyweightKg,
      heightCm: Number(height) > 0 ? (profile.units === 'imperial' ? Number(height) * 2.54 : Number(height)) : profile.heightCm,
      ...packageWindow,
      onboardingComplete: true,
      goal: profile.goal || 'build_muscle'
    }, firstLog);
  };
  return <div className="onboarding-screen">
    <div className="onboarding-panel">
      <div className="onboard-brand"><Brand /><span className="onboard-step">STEP {step} OF 4</span></div>
      <div className="onboard-progress"><i style={{ width: (step / 4 * 100) + '%' }} /></div>
      {step === 1 && <>
        <span className="eyebrow">LEGRANDE MEMBER REGISTRATION</span>
        <h1>Your training starts <em>here.</em></h1>
        <p className="onboard-lede">Set up your member profile. Current members can bring their existing routine; new members get a guided schedule.</p>
        <label className="field-label">Full name<input autoFocus value={profile.name} onChange={event => update({ name: event.target.value })} placeholder="Your name" maxLength={60} /></label>
        <label className="field-label">Kenyan mobile number</label>
        <div className="ke-phone-field"><span>+254</span><input type="tel" inputMode="numeric" autoComplete="tel-national" value={phoneNationalPart(profile.phone)} onChange={event => update({ phone: normalizeKenyanPhone(event.target.value) })} placeholder="7XX XXX XXX" maxLength={9} /></div>
        <span className="field-label">Your membership</span>
        <div className="member-type-grid">
          <button type="button" className={profile.memberType === 'existing' ? 'choice-card selected' : 'choice-card'} onClick={() => update({ memberType: 'existing' })}><strong>Current member</strong><span>I already train at LeGrande.</span></button>
          <button type="button" className={profile.memberType === 'new' ? 'choice-card selected' : 'choice-card'} onClick={() => update({ memberType: 'new' })}><strong>Joining now</strong><span>I am setting up my first routine.</span></button>
        </div>
        {profile.phone.length > 4 && !validPhone && <p className="input-hint">Enter all nine digits after +254. Mobile numbers start with 7 or 1.</p>}
      </>}
      {step === 2 && <>
        <span className="eyebrow">YOUR MEMBER PROFILE</span>
        <h1>Build a plan around <em>you.</em></h1>
        <p className="onboard-lede">Your goal, experience and baseline help us set a sensible starting plan. Bodyweight is not used to guess a dumbbell weight.</p>
        <span className="field-label">Gender</span>
        <div className="gender-choice-grid">
          {([
            ['man', 'Man'], ['woman', 'Woman']
          ] as [Gender, string][]).map(([value, label]) => <button type="button" key={value} className={profile.gender === value ? 'choice-card selected' : 'choice-card'} onClick={() => update({ gender: value })}><strong>{label}</strong></button>)}
        </div>
        <span className="field-label">Main goal</span>
        <div className="choice-grid">
          {[
            ['build_muscle', 'Build muscle', 'Size, strength and control'],
            ['strength', 'Get stronger', 'Progress your main lifts'],
            ['fat_loss', 'Lose body fat', 'Maintain strength and consistency'],
            ['general_fitness', 'Feel fitter', 'Fitness for everyday life']
          ].map(([value, title, description]) => <button type="button" key={value} className={profile.goal === value ? 'choice-card selected' : 'choice-card'} onClick={() => update({ goal: value as Goal })}><strong>{title}</strong><span>{description}</span></button>)}
        </div>
        <span className="field-label">Training experience</span>
        <div className="segmented">
          <button type="button" className={profile.level === 'beginner' ? 'selected' : ''} onClick={() => update({ level: 'beginner' })}>Beginner</button>
          <button type="button" className={profile.level === 'intermediate' ? 'selected' : ''} onClick={() => update({ level: 'intermediate' })}>Intermediate</button>
          <button type="button" className={profile.level === 'advanced' ? 'selected' : ''} onClick={() => update({ level: 'advanced' })}>Advanced</button>
        </div>
        <div className="baseline-grid">
          <label className="field-label">Current weight <span className="optional">OPTIONAL</span><input type="number" inputMode="decimal" value={weight} onChange={event => setWeight(event.target.value)} placeholder={profile.units === 'metric' ? 'kg' : 'lb'} min="1" /></label>
          <label className="field-label">Height <span className="optional">OPTIONAL</span><input type="number" inputMode="decimal" value={height} onChange={event => setHeight(event.target.value)} placeholder={profile.units === 'metric' ? 'cm' : 'inches'} min="1" /></label>
        </div>
        <div className="segmented"><button type="button" className={profile.units === 'metric' ? 'selected' : ''} onClick={() => update({ units: 'metric' })}>Metric · kg</button><button type="button" className={profile.units === 'imperial' ? 'selected' : ''} onClick={() => update({ units: 'imperial' })}>Imperial · lb</button></div>
      </>}
      {step === 3 && <>
        <span className="eyebrow">YOUR TRAINING WEEK</span>
        <h1>Make the week <em>work for you.</em></h1>
        <p className="onboard-lede">Choose your training rhythm. Your gym sessions are prepared automatically, with rest days built into the plan.</p>
        <div className="target-picker"><div><strong>Gym days per week</strong><span>Choose a sustainable schedule.</span></div><div className="stepper"><button type="button" onClick={() => update({ weeklyTarget: Math.max(3, profile.weeklyTarget - 1) })}>−</button><strong>{profile.weeklyTarget}</strong><button type="button" onClick={() => update({ weeklyTarget: Math.min(6, profile.weeklyTarget + 1) })}>+</button></div></div>
        <div className="split-choice-grid">
          <button type="button" className={profile.splitStyle === 'focused' ? 'choice-card selected' : 'choice-card'} onClick={() => update({ splitStyle: 'focused' })}><strong>Focused muscle days</strong><span>Chest · Back · Legs · Shoulders · Arms</span></button>
          <button type="button" className={profile.splitStyle === 'ppl' ? 'choice-card selected' : 'choice-card'} onClick={() => update({ splitStyle: 'ppl' })}><strong>Push / Pull / Legs</strong><span>Pressing · Pulling · Lower body</span></button>
          <button type="button" className={profile.splitStyle === 'upper_lower' ? 'choice-card selected' : 'choice-card'} onClick={() => update({ splitStyle: 'upper_lower' })}><strong>Upper / Lower</strong><span>Alternate upper-body and leg sessions</span></button>
        </div>
        <label className="field-label">Preferred gym start time<input type="time" value={profile.sessionStartTime} onChange={event => update({ sessionStartTime: event.target.value })} /></label>
        <div className="split-preview"><strong>Your usual session window</strong><span>{formatSessionWindow(profile.sessionStartTime)}</span></div>
      </>}
      {step === 4 && <>
        <span className="eyebrow">LEGRANDE MEMBERSHIP</span>
        <h1>Choose your <em>package.</em></h1>
        <p className="onboard-lede">This is a demo selection. The management portal will handle payment and confirm the actual membership dates.</p>
        <div className="package-choice-grid">
          {([
            ['daily', 'Daily', 'One day of access'],
            ['weekly', 'Weekly', '7 consecutive days'],
            ['monthly', 'Monthly', '30 days in this preview'],
            ['semester', 'Full semester', '120 days in this preview']
          ] as [PackageType, string, string][]).map(([value, title, description]) => <button type="button" key={value} className={profile.packageType === value ? 'package-choice selected' : 'package-choice'} onClick={() => update({ packageType: value })}><strong>{title}</strong><span>{description}</span></button>)}
        </div>
        <div className="onboard-summary">
          <div><span>MEMBER</span><strong>{profile.name}</strong></div><div><span>GOAL</span><strong>{profile.goal.replace('_', ' ')}</strong></div>
          <div><span>EXPERIENCE</span><strong>{profile.level}</strong></div><div><span>TRAINING DAYS</span><strong>{profile.weeklyTarget} / week</strong></div>
          <div><span>PACKAGE</span><strong>{packageName(profile.packageType)}</strong></div><div><span>GYM WINDOW</span><strong>{formatSessionWindow(profile.sessionStartTime)}</strong></div>
        </div>
        <p className="privacy-line"><ShieldCheck size={16} /> Profile details and session history stay in this browser. No payment is taken here.</p>
      </>}
      <div className="onboard-actions">
        {step > 1 && <button className="button quiet" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>}
        <button className="button primary-button" disabled={!canContinue} onClick={() => step < 4 ? setStep(step + 1) : finish()}>{step === 4 ? 'Create member profile' : 'Continue'} <ArrowRight size={16} /></button>
      </div>
    </div>
    <div className="onboard-visual"><div className="visual-label">LEGRANDE / TRAINING CULTURE</div><div className="visual-copy"><span>CONSISTENCY OVER INTENSITY.</span><h2>One plan.<br /><em>Every next rep.</em></h2><p>Know what to do when you walk onto the floor.</p></div><div className="visual-foot"><span>01 — SHOW UP</span><span>02 — TRAIN WITH FOCUS</span><span>03 — BUILD</span></div></div>
  </div>;
}

function getNextGymSession(profile: Profile, sessions: Session[], from = new Date()) {
  if (!isPackageActive(profile, dateKey(from))) return null;
  const start = new Date(from); start.setHours(12, 0, 0, 0);
  for (let offset = 0; offset < 14; offset++) {
    const date = new Date(start); date.setDate(date.getDate() + offset);
    const key = dateKey(date);
    if (!isPackageActive(profile, key)) break;
    let program = getProgramForDay(date, profile.weeklyTarget, profile.level, profile.splitStyle, profile.goal);
    if (!program && profile.packageType === 'daily' && offset === 0) {
      const rotation = ['chest', 'back', 'legs', 'shoulders', 'arms'];
      const dayIndex = Math.floor(date.getTime() / 86400000) % rotation.length;
      program = PROGRAMS.find(item => item.id === rotation[dayIndex]) || null;
    }
    if (!program) continue;
    const completed = sessions.some(session => session.date === key && (session.mode || 'gym') === 'gym');
    if (!completed) return { date, program, isToday: key === dateKey(from) };
  }
  return null;
}
function Dashboard({ store, onStart, onTrain, onHome, pausedWorkout, onResume }: {
  store: Store; onStart: (program: Program) => void; onTrain: () => void; onHome: () => void;
  pausedWorkout: ActiveWorkout | null; onResume: (workout: ActiveWorkout) => void
}) {
  const today = new Date();
  const firstName = store.profile.name.trim().split(/\s+/)[0];
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayKey = dateKey(today);
  const todayDone = store.sessions.some(session => session.date === todayKey && (session.mode || 'gym') === 'gym');
  const next = getNextGymSession(store.profile, store.sessions, today);
  const week = weekSessions(store.sessions);
  const progress = Math.min(100, week.length / store.profile.weeklyTarget * 100);
  const streak = currentStreak(store.sessions, store.profile.weeklyTarget);
  const recent = store.sessions.slice(0, 2);
  const packageActive = isPackageActive(store.profile);
  const packageEnd = store.profile.packageEnd ? new Date(store.profile.packageEnd + 'T12:00:00') : null;
  const daysLeft = packageEnd ? Math.max(0, Math.ceil((packageEnd.getTime() - new Date(todayKey + 'T12:00:00').getTime()) / 86400000)) : 0;
  const mainMoves = next?.program.exercises.filter(item => item.phase !== 'warmup' && item.phase !== 'cooldown') || [];
  const heroMove = mainMoves[0]?.name || 'Lat pulldown';
  const schedule = Array.from({ length: 7 }, (_, index) => {
    const date = weekStart(today); date.setDate(date.getDate() + index);
    const key = dateKey(date);
    const done = store.sessions.some(session => session.date === key && (session.mode || 'gym') === 'gym');
    const plan = getProgramForDay(date, store.profile.weeklyTarget, store.profile.level, store.profile.splitStyle, store.profile.goal);
    return { date, key, done, plan, isToday: key === todayKey };
  });
  return <>
    <header className='dashboard-welcome'>
      <div><span className='eyebrow'>{formatDate(today).toUpperCase()}</span><h1>{greeting}, <em>{firstName}</em>.</h1><p>Your next session is ready when you are.</p></div>
      <div className='dashboard-member-badge'><span className='dashboard-avatar'>{firstName.slice(0, 1).toUpperCase()}</span><div><strong>{store.profile.name}</strong><small>{store.profile.level} member</small></div></div>
    </header>
    <div className='dashboard-membership-line'>
      <span className={packageActive ? 'membership-dot active' : 'membership-dot'} />
      <span>{packageActive ? packageName(store.profile.packageType) + ' · ' + daysLeft + (daysLeft === 1 ? ' day left' : ' days left') : 'Membership expired'}</span>
      <span className='membership-line-spacer' />
      <span className='membership-state'>{packageActive ? 'ACTIVE' : 'RENEW'}</span>
    </div>
    {!packageActive && <section className='dashboard-renew-note'><div><strong>Your membership has ended.</strong><span>Your workout history is saved. Renew in Profile to start another session.</span></div></section>}
    {pausedWorkout && <div className='resume-banner'><div><span className='eyebrow'>SESSION PAUSED</span><strong>{pausedWorkout.title}</strong><small>Your sets are saved on this device.</small></div><button className='button primary-button' onClick={() => onResume(pausedWorkout)}>Resume session <ArrowRight size={15} /></button></div>}
    {next ? <section className='dashboard-hero'>
      <TrainingPhoto name={heroMove} className='dashboard-hero-photo' mode='gym' gender={store.profile.gender} alt={heroMove + ' exercise in the gym'} />
      <div className='dashboard-hero-shade' />
      <div className='dashboard-hero-copy'>
        <span className='dashboard-hero-kicker'><i /> {next.isToday ? (todayDone ? 'TODAY’S SESSION COMPLETE' : 'TODAY’S GYM SESSION') : 'YOUR NEXT GYM SESSION'}</span>
        <p className='dashboard-hero-date'>{formatDayLabel(next.date).toUpperCase()} · {next.program.focus.toUpperCase()}</p>
        <h2>{next.program.title}</h2>
        <p className='dashboard-hero-description'>{next.program.description}</p>
        <div className='dashboard-hero-meta'><span><Clock3 size={14} /> {next.program.duration} min</span><span><Dumbbell size={14} /> {mainMoves.length} movements</span><span><Activity size={14} /> {store.profile.level}</span></div>
        <div className='dashboard-hero-actions'><button className='button dashboard-start-button' onClick={() => onStart(next.program)}><Dumbbell size={16} /> {next.isToday && todayDone ? 'Review next workout' : 'Start workout'} <ArrowRight size={15} /></button><span>{formatSessionWindow(store.profile.sessionStartTime)}</span></div>
      </div>
      <div className='dashboard-hero-index'>LEGRANDE <b>FITNESS</b></div>
    </section> : <section className='dashboard-rest-card'><div className='dashboard-rest-icon'><CheckCircle2 size={20} /></div><div><span className='eyebrow'>{todayDone ? 'SESSION COMPLETE' : 'RECOVERY DAY'}</span><h2>{todayDone ? 'Good work today.' : 'No gym session is scheduled today.'}</h2><p>{store.profile.packageType === 'daily' ? 'Your daily pass is for today. Choose another pass when you return.' : 'Rest is part of a consistent training plan. Your next scheduled session appears automatically.'}</p></div></section>}
    <div className='dashboard-stat-grid'>
      <article className='dashboard-stat-card'><span className='dashboard-stat-icon'><CalendarDays size={16} /></span><div><small>THIS WEEK</small><strong>{week.length}<i> / {store.profile.weeklyTarget}</i></strong><span>sessions completed</span></div><div className='dashboard-stat-track'><i style={{ width: progress + '%' }} /></div></article>
      <article className='dashboard-stat-card'><span className='dashboard-stat-icon'><Flame size={16} /></span><div><small>CONSISTENCY</small><strong>{streak}<i> {streak === 1 ? 'week' : 'weeks'}</i></strong><span>current training streak</span></div><div className='dashboard-stat-gold-line' /></article>
      <article className='dashboard-stat-card'><span className='dashboard-stat-icon'><Trophy size={16} /></span><div><small>TRAINING HISTORY</small><strong>{store.sessions.length}<i> total</i></strong><span>sessions recorded</span></div><div className='dashboard-stat-gold-line' /></article>
    </div>
    <section className='dashboard-week-panel'>
      <div className='dashboard-section-heading'><div><span className='eyebrow'>YOUR TRAINING RHYTHM</span><h2>This week</h2></div><span className='dashboard-week-count'>{week.length} / {store.profile.weeklyTarget} sessions</span></div>
      <div className='dashboard-week-days'>{schedule.map(item => <div key={item.key} className={['dashboard-week-day', item.done ? 'done' : '', item.isToday ? 'today' : '', item.plan ? 'planned' : ''].filter(Boolean).join(' ')}><span>{item.date.toLocaleDateString('en-KE', { weekday: 'short' })}</span><i>{item.done ? <Check size={13} /> : item.plan ? <Dumbbell size={12} /> : '·'}</i><small>{item.done ? 'Done' : item.isToday ? 'Today' : item.plan ? item.plan.focus.split(' · ')[0] : 'Rest'}</small></div>)}</div>
    </section>
    <div className='dashboard-quick-actions'>
      <button onClick={onHome}><span><Home size={17} /></span><div><strong>Home workout</strong><small>No equipment needed</small></div><ChevronRight size={16} /></button>
      <button onClick={onTrain}><span><Plus size={17} /></span><div><strong>Build your session</strong><small>Add movements you want to train</small></div><ChevronRight size={16} /></button>
    </div>
    <section className='dashboard-recent-section'>
      <div className='dashboard-section-heading'><div><span className='eyebrow'>KEEP YOUR MOMENTUM</span><h2>Recent sessions</h2></div><span className='dashboard-week-count'>{store.sessions.length} logged</span></div>
      {recent.length ? <div className='dashboard-recent-list'>{recent.map(session => <article className='dashboard-recent-item' key={session.id}><span className='dashboard-recent-icon'><Dumbbell size={16} /></span><div><strong>{session.title}</strong><small>{session.focus} · {new Date(session.date + 'T12:00:00').toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</small></div><span className='dashboard-recent-duration'>{prettyDuration(session.durationMin)}</span></article>)}</div> : <div className='dashboard-empty-recent'>Your first completed session will appear here.</div>}
    </section>
  </>;
}
function TrainingPage({ store, onStart, onRepeat, initialView = 'plans', gender }: { store: Store; onStart: (program: Program) => void; onRepeat: (session: Session) => void; initialView?: 'plans' | 'home' | 'library'; gender: Gender }) {
  const [view, setView] = useState<'plans' | 'home' | 'library'>(initialView);
  const [focus, setFocus] = useState('All');
  const [query, setQuery] = useState('');
  const [homeDuration, setHomeDuration] = useState(20);
  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
  const filteredExercises = EXERCISE_LIBRARY.filter(exercise => (focus === 'All' || exercise.muscle.toLowerCase().includes(focus.toLowerCase())) && (exercise.name.toLowerCase().includes(query.toLowerCase()) || exercise.equipment.toLowerCase().includes(query.toLowerCase())));
  const today = new Date();
  const currentWeek = weekStart(today);
  const todayGymPlan = getProgramForDay(today, store.profile.weeklyTarget, store.profile.level, store.profile.splitStyle, store.profile.goal);
  const todayHomePlan = getHomeProgramForDay(today, store.profile);
  const startCustomSession = () => onStart({ id: 'open-gym-session', title: 'My own gym session', focus: 'Flexible training', level: store.profile.level, duration: 45, description: 'Build a session from the movement library.', mode: 'gym', exercises: [] });
  const gymPrograms = PROGRAMS.filter(program => !program.id.startsWith('full-'));
  const homePrograms = HOME_PROGRAMS.filter(program => program.duration <= homeDuration);
  return <>
    <div className="page-intro"><div><span className="eyebrow">YOUR TRAINING SPACE</span><h1>Train with purpose.</h1><p>Gym plans, no-equipment home sessions, and clear movement instructions.</p></div><div className="intro-stamp"><Dumbbell size={23} /><span>LF / TRAIN</span></div></div>
    <div className="view-tabs training-mode-tabs">
      <button className={view === 'plans' ? 'selected' : ''} onClick={() => setView('plans')}>Gym workouts</button>
      <button className={view === 'home' ? 'selected' : ''} onClick={() => setView('home')}>Home workouts</button>
      <button className={view === 'library' ? 'selected' : ''} onClick={() => setView('library')}>Exercise library</button>
    </div>
    {view === 'plans' && <>
      <div className="custom-session-row"><div><span className="eyebrow">YOUR ROUTINE</span><strong>Today: {todayGymPlan ? todayGymPlan.title : 'Rest day'}</strong><small>{todayGymPlan ? todayGymPlan.focus + ' · ' + todayGymPlan.duration + ' min' : 'No gym session scheduled today.'}</small></div><button className="button secondary-button" onClick={startCustomSession}><Plus size={15} /> Build a session</button></div>
      <div className="schedule-card">
        <div className="schedule-intro"><span>YOUR TRAINING GOAL</span><strong>{store.profile.goal.replace('_', ' ')}</strong><span>YOUR SPLIT</span><strong>{store.profile.splitStyle === 'focused' ? 'Focused muscle days' : store.profile.splitStyle === 'ppl' ? 'Push / Pull / Legs' : 'Upper / Lower'}</strong></div>
        <div className="schedule-days">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
          const program = getProgramForDay((() => { const date = new Date(currentWeek); date.setDate(date.getDate() + index); return date; })(), store.profile.weeklyTarget, store.profile.level, store.profile.splitStyle, store.profile.goal);
          return <div key={day} className={program ? 'schedule-day planned' : 'schedule-day'}><span>{day}</span><i>{program ? <Dumbbell size={14} /> : '—'}</i><small>{program ? program.title.replace(' day', '') : 'Rest'}</small></div>;
        })}</div>
      </div>
      <div className="section-heading"><div><span className="eyebrow">FOCUSED PROGRAMS</span><h2>Choose a session</h2></div><span className="subtle">{store.profile.weeklyTarget} days / week</span></div>
      <div className="program-grid">{gymPrograms.map(program => {
        const plan = getProgramForDay(today, store.profile.weeklyTarget, store.profile.level, store.profile.splitStyle, store.profile.goal);
        const selected = plan?.id === program.id;
        const completed = store.sessions.filter(session => session.title === program.title).length;
        return <article className={selected ? 'program-card recommended-program' : 'program-card'} key={program.id}>
          <div className="program-art"><TrainingPhoto name={program.exercises[0]?.name || program.title} mode="gym" gender={gender} alt={program.title + ' gym training'} /><span>{program.focus.toUpperCase()}</span><div className="art-number">{String(gymPrograms.indexOf(program) + 1).padStart(2, '0')}</div></div>
          <div className="program-body"><div className="program-meta"><span>{program.level}</span><span><Clock3 size={13} /> {program.duration} min</span></div><h3>{program.title}</h3><p>{program.description}</p><div className="program-foot"><span>{program.exercises.length} movements · {completed} completed</span><button className="button primary-button" onClick={() => onStart(personaliseGymProgram(program, store.profile.level, store.profile.goal))}>{selected ? 'Start today' : 'Start'} <ArrowRight size={15} /></button></div></div>
        </article>;
      })}</div>
    </>}
    {view === 'home' && <>
      <div className="home-workout-hero"><TrainingPhoto name="push-up" mode="home" gender={gender} alt="No-equipment bodyweight workout at home" /><div><span className="eyebrow">NO GYM REQUIRED</span><h2>Keep your schedule wherever you are.</h2><p>Your home plan follows the same muscle-group focus as your gym week, with bodyweight alternatives and movement guidance.</p><strong>{todayHomePlan ? 'Today: ' + todayHomePlan.title : 'Today is a scheduled rest day'}</strong>{todayHomePlan && <button className="button primary-button" onClick={() => onStart(todayHomePlan)}>Start today at home <ArrowRight size={15} /></button>}</div></div>
      <div className="home-equipment-note"><strong>Bodyweight only.</strong><span>No dumbbells, machines, cables or resistance bands. Pull-ups need a bar, so they are not included in these no-equipment plans.</span></div>
      <div className="home-schedule-panel"><div className="section-heading"><div><span className="eyebrow">HOME TRAINING CALENDAR</span><h2>Your home workout week</h2></div><span className="subtle">Same split · no equipment</span></div>
        <div className="schedule-days">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
          const plan = getHomeProgramForDay((() => { const date = new Date(currentWeek); date.setDate(date.getDate() + index); return date; })(), store.profile);
          return <div key={day} className={plan ? 'schedule-day planned' : 'schedule-day'}><span>{day}</span><i>{plan ? <Home size={14} /> : '—'}</i><small>{plan ? plan.focus.split(' · ')[0] : 'Rest'}</small></div>;
        })}</div>
      </div>
      <div className="duration-filter"><span>SESSION LENGTH</span>{[10, 20, 30].map(value => <button key={value} className={homeDuration === value ? 'selected' : ''} onClick={() => setHomeDuration(value)}>{value} min</button>)}</div>
      <div className="home-program-grid">{homePrograms.map(program => <article className="home-program-card" key={program.id}>
        <div className="home-program-image"><TrainingPhoto name={program.exercises.find(item => item.phase === 'main')?.name || program.exercises[0]?.name || program.title} mode="home" gender={gender} alt={program.title + ' bodyweight workout'} /><span>{program.duration} MIN</span></div>
        <div className="home-program-copy"><span className="eyebrow">BODYWEIGHT PLAN</span><h3>{program.title}</h3><p>{program.description}</p><div className="home-move-list">{program.exercises.slice(0, 4).map(exercise => <span key={exercise.name}>{exercise.name}</span>)}</div><button className="button primary-button" onClick={() => onStart(program)}>Start home workout <ArrowRight size={15} /></button></div>
      </article>)}</div>
    </>}
    {view === 'library' && <>
      <div className="library-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search exercises or equipment" /></div><span className="subtle">{filteredExercises.length} movements</span></div>
      <div className="filter-chips">{categories.map(category => <button key={category} className={focus === category ? 'selected' : ''} onClick={() => setFocus(category)}>{category}</button>)}</div>
      <div className="exercise-library">{filteredExercises.map((exercise, index) => <article className="library-item" key={exercise.name}><TrainingPhoto className="library-photo" name={exercise.name} mode="gym" gender={gender} alt={exercise.name + ' gym exercise'} /><div className="library-index">{String(index + 1).padStart(2, '0')}</div><div className="library-desc"><strong>{exercise.name}</strong><span>{exercise.muscle} · {exercise.equipment}</span><p>{exercise.cue}</p></div><div className="library-prescription"><strong>{exercise.sets} × {exercise.reps}</strong><span>{exercise.rest ? exercise.rest + ' sec rest' : 'Continuous'}</span></div></article>)}</div>
      {!filteredExercises.length && <div className="empty-state"><strong>No movement found.</strong><span>Try another exercise name or muscle group.</span></div>}
    </>}
    {view === 'home' && !todayHomePlan && <p className="panel-caption">It is your planned rest day. You can still choose a short optional session above when you feel ready.</p>}
  </>;
}

function HomeWorkoutPlayer({ workout, themeDark, gender, onChange, onFinish, onExit }: {
  workout: ActiveWorkout; themeDark: boolean; gender: Gender; onChange: (workout: ActiveWorkout) => void; onFinish: () => void; onExit: () => void
}) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(workout.exercises[0]?.durationSec || 40);
  const [phase, setPhase] = useState<'move' | 'rest'>('move');
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const [completedMoves, setCompletedMoves] = useState<number[]>([]);
  const current = workout.exercises[index];
  const total = workout.exercises.length;
  const progress = total ? completedMoves.length / total * 100 : 0;
  const markMove = (moveIndex: number) => {
    const exercise = workout.exercises[moveIndex];
    if (!exercise || completedMoves.includes(moveIndex)) return;
    setCompletedMoves(items => items.includes(moveIndex) ? items : [...items, moveIndex]);
    onChange({
      ...workout,
      exercises: workout.exercises.map((item, itemIndex) => itemIndex === moveIndex
        ? { ...item, sets: item.sets.map(set => ({ ...set, done: true })) }
        : item)
    });
  };
  const skipMove = () => {
    markMove(index);
    if (index >= total - 1) {
      setFinished(true);
      setRunning(false);
      return;
    }
    setIndex(index + 1);
    setPhase('move');
    setRemaining(workout.exercises[index + 1]?.durationSec || 40);
  };
  useEffect(() => {
    if (!running || finished) return;
    const timer = window.setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, finished]);
  useEffect(() => {
    if (remaining !== 0 || finished) return;
    if (phase === 'move') {
      markMove(index);
      if (index >= total - 1) {
        setFinished(true);
        setRunning(false);
      } else {
        setPhase('rest');
        setRemaining(10);
      }
    } else {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setPhase('move');
      setRemaining(workout.exercises[nextIndex]?.durationSec || 40);
    }
  }, [remaining, phase, index, finished, total, workout.exercises]);
  if (!current) return <div className="home-player-shell"><p>No movements in this routine.</p><button className="button primary-button" onClick={onExit}>Return</button></div>;
  return <div className={themeDark ? 'home-player-shell dark' : 'home-player-shell'}>
    <header className="home-player-header"><button className="home-player-back" onClick={onExit}><ArrowLeft size={18} /></button><div><strong>LEGRANDE / HOME SESSION</strong><span>{workout.focus}</span></div><span className="home-player-count">{Math.min(completedMoves.length + (phase === 'move' ? 1 : 0), total)} / {total}</span></header>
    <main className="home-player-main">
      <div className="home-player-topline"><span className="eyebrow">{finished ? 'SESSION COMPLETE' : phase === 'rest' ? 'SHORT REST' : (current.phase || 'main').toUpperCase()}</span><span className="subtle">{workout.title}</span></div>
      <div className="home-player-progress"><i style={{ width: progress + '%' }} /></div>
      {finished ? <section className="home-player-complete"><div className="home-player-complete-mark"><Check size={30} /></div><span className="eyebrow">ALL MOVEMENTS COMPLETE</span><h1>Good work.</h1><p>Your home session is ready to be saved to your training history.</p><button className="button primary-button" onClick={onFinish}>Save completed workout <CheckCircle2 size={17} /></button></section> : <>
        <div className="home-player-stage">
          {phase === 'move' ? <TrainingPhoto name={current.name} mode="home" gender={gender} alt={current.name + ' bodyweight movement reference'} /> : <div className="home-player-rest-art"><Timer size={46} /><span>RESET YOUR POSITION</span></div>}
          <div className="home-player-stage-label">{phase === 'rest' ? 'REST · RESET YOUR BREATH' : 'MOVE ' + String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')}</div>
        </div>
        <div className="home-player-timer"><strong>{phase === 'rest' ? 'REST' : current.name}</strong><span>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</span><small>{phase === 'rest' ? 'Get ready for the next movement' : 'Work at a controlled pace · target ' + (current.sets[0]?.reps ?? 0) + ' reps'}</small></div>
        {phase === 'move' && <div className="home-player-instruction"><span className="eyebrow">HOW TO DO IT</span><p>{current.cue}</p><div><span>{current.equipment}</span><span>{current.muscle}</span></div></div>}
        <div className="home-player-controls"><button className="button secondary-button" onClick={() => { setRunning(!running); }}><span>{running ? 'Pause' : 'Resume'}</span></button><button className="button primary-button" onClick={phase === 'rest' ? () => { const nextIndex = index + 1; if (nextIndex < total) { setIndex(nextIndex); setPhase('move'); setRemaining(workout.exercises[nextIndex]?.durationSec || 40); } } : skipMove}>{phase === 'rest' ? 'Skip rest' : 'Skip movement'} <ArrowRight size={15} /></button></div>
      </>}
    </main>
  </div>;
}

function MovementTimer({ durationSec }: { durationSec: number }) {
  const [remaining, setRemaining] = useState(durationSec);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running || remaining <= 0) return; const interval = window.setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000); return () => window.clearInterval(interval); }, [running, remaining]);
  useEffect(() => { if (remaining === 0 && running) { setRunning(false); if ('vibrate' in navigator) navigator.vibrate([180, 80, 180]); } }, [remaining, running]);
  return <div className='movement-timer'><div><span className='eyebrow'>TIMED MOVEMENT</span><strong>{formatTime(remaining)}</strong></div><div className='movement-timer-actions'><button type='button' onClick={() => setRunning(value => !value)}>{running ? 'Pause timer' : remaining === 0 ? 'Done' : 'Start timer'}</button><button type='button' onClick={() => { setRemaining(durationSec); setRunning(false); }}>Reset</button></div></div>;
}
function WorkoutRunner({ workout, sessions, units, themeDark, gender, onChange, onFinish, onExit }: {
  workout: ActiveWorkout; sessions: Session[]; units: Units; themeDark: boolean; gender: Gender;
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
      cue: item.cue, restSeconds: item.rest, phase: item.phase || 'main', durationSec: item.durationSec,
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
        const phaseLabel = exercise.phase === 'warmup' ? '01 · WARM-UP' : exercise.phase === 'cooldown' ? '03 · STRETCH & COOL-DOWN' : '02 · MAIN WORKOUT';
        const previousPhase = workout.exercises[exerciseIndex - 1]?.phase || 'main';
        return <Fragment key={exercise.id}>{(exerciseIndex === 0 || previousPhase !== (exercise.phase || 'main')) && <div className="exercise-phase-divider"><span>{phaseLabel}</span><i /></div>}<article className="active-exercise">
          <div className="active-exercise-head"><TrainingPhoto className="runner-exercise-photo" name={exercise.name} mode="gym" gender={gender} alt={exercise.name + ' gym movement'} /><span className="exercise-count">{String(exerciseIndex + 1).padStart(2, '0')}</span><div className="active-exercise-title"><h2>{exercise.name}</h2><span>{exercise.muscle} · {exercise.equipment}</span></div><div className={done === exercise.sets.length ? 'exercise-status complete' : 'exercise-status'}>{done}/{exercise.sets.length} <Check size={13} /></div></div>
          <p className="form-cue">{exercise.cue}{exercise.durationSec ? ' · ' + (exercise.durationSec >= 60 ? Math.round(exercise.durationSec / 60) + ' min' : exercise.durationSec + ' sec') + ' timed target' : ''}</p>
          {exercise.durationSec && <MovementTimer durationSec={exercise.durationSec} />}
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
          <p className="set-help"><strong>RIR means “reps in reserve”.</strong> Estimate how many more good-form reps you could have completed. Use 2 if you are unsure; it is a guide, not a test.</p>
          <div className="exercise-actions"><button onClick={() => addSet(exercise)}><Plus size={14} /> Add set</button><button onClick={() => setRestUntil(Date.now() + exercise.restSeconds * 1000)}><Timer size={14} /> Rest {exercise.restSeconds}s</button></div>
        </article></Fragment>
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


function ProfilePage({ store, persist, resetData, onImport }: { store: Store; persist: (store: Store) => void; resetData: () => void; onImport: (store: Store) => void }) {
  const profile = store.profile;
  const updateProfile = (patch: Partial<Profile>) => persist({ ...store, profile: { ...profile, ...patch } });
  const updatePackage = (type: PackageType) => updateProfile({ packageType: type, ...createPackageWindow(type) });
  const exportData = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'legrande-training-backup-' + dateKey() + '.json'; anchor.click(); URL.revokeObjectURL(url);
  };
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Store;
      if (!parsed || !parsed.profile || !Array.isArray(parsed.sessions)) throw new Error('Invalid backup');
      onImport(parsed); window.alert('Training backup imported.');
    } catch { window.alert('That file is not a valid LeGrande training backup.'); }
    event.target.value = '';
  };
  const bodyweight = latestBodyweight(store);
  return <>
    <div className="page-intro"><div><span className="eyebrow">MEMBER SETTINGS</span><h1>Your profile.</h1><p>Keep your details and training split aligned with your goals.</p></div><div className="intro-stamp"><UserRound size={23} /><span>LF / PROFILE</span></div></div>
    <div className="profile-layout">
      <section className="panel profile-panel">
        <div className="profile-identity"><div className="profile-avatar">{profile.name.slice(0, 1).toUpperCase()}</div><div><span className="eyebrow">LEGRANDE MEMBER</span><h2>{profile.name}</h2><p>{profile.memberType === 'existing' ? 'Current member' : 'New member'} · {profile.phone}</p></div></div>
        <div className="profile-fields">
          <label className="field-label">Full name<input value={profile.name} onChange={event => updateProfile({ name: event.target.value })} /></label>
          <label className="field-label">Kenyan mobile number</label>
          <div className="ke-phone-field"><span>+254</span><input type="tel" inputMode="numeric" value={phoneNationalPart(profile.phone)} onChange={event => updateProfile({ phone: normalizeKenyanPhone(event.target.value) })} maxLength={9} /></div>
          <label className="field-label">Member status<select value={profile.memberType} onChange={event => updateProfile({ memberType: event.target.value as MemberType })}><option value="existing">Current LeGrande member</option><option value="new">Joining LeGrande</option></select></label>
          <label className="field-label">Gender<select value={profile.gender} onChange={event => updateProfile({ gender: event.target.value as Gender })}><option value="man">Man</option><option value="woman">Woman</option></select></label>
          <label className="field-label">Primary goal<select value={profile.goal} onChange={event => updateProfile({ goal: event.target.value as Goal })}><option value="build_muscle">Build muscle</option><option value="strength">Get stronger</option><option value="fat_loss">Lose body fat</option><option value="general_fitness">General fitness</option></select></label>
          <label className="field-label">Training experience<select value={profile.level} onChange={event => updateProfile({ level: event.target.value as Level })}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
          <label className="field-label">Training split<select value={profile.splitStyle} onChange={event => updateProfile({ splitStyle: event.target.value as SplitStyle })}><option value="focused">Focused muscle days</option><option value="ppl">Push / Pull / Legs</option><option value="upper_lower">Upper / Lower</option></select></label>
          <div className="profile-setting"><div><strong>Training days</strong><span>Sessions per week</span></div><div className="stepper"><button onClick={() => updateProfile({ weeklyTarget: Math.max(3, profile.weeklyTarget - 1) })}>−</button><strong>{profile.weeklyTarget}</strong><button onClick={() => updateProfile({ weeklyTarget: Math.min(6, profile.weeklyTarget + 1) })}>+</button></div></div>
          <label className="field-label">Current bodyweight ({profile.units === 'metric' ? 'kg' : 'lb'})<input type="number" min="1" step="0.1" value={bodyweight ? displayWeight(bodyweight, profile.units).toFixed(1) : ''} placeholder="Add current weight" onChange={event => { const kg = toKg(event.target.value, profile.units); if (kg > 0) persist({ ...store, profile: { ...profile, bodyweightKg: kg }, weightLogs: [...store.weightLogs.filter(item => item.date !== dateKey()), { date: dateKey(), kg }].sort((a, b) => a.date.localeCompare(b.date)) }); }} /></label>
          <label className="field-label">Preferred gym start time<input type="time" value={profile.sessionStartTime} onChange={event => updateProfile({ sessionStartTime: event.target.value })} /></label>
          <div className="profile-setting"><div><strong>Membership package</strong><span>Demo selection · payment handled by management</span></div><select value={profile.packageType} onChange={event => updatePackage(event.target.value as PackageType)}><option value="daily">Daily pass</option><option value="weekly">Weekly pass</option><option value="monthly">Monthly membership</option><option value="semester">Full semester</option></select></div>
          <div className="privacy-stat"><span>Package valid through</span><strong>{packageEndLabel(profile)}</strong></div>
          <div className="profile-setting"><div><strong>Measurement units</strong><span>Bodyweight and set loads</span></div><div className="segmented small"><button className={profile.units === 'metric' ? 'selected' : ''} onClick={() => updateProfile({ units: 'metric' })}>kg</button><button className={profile.units === 'imperial' ? 'selected' : ''} onClick={() => updateProfile({ units: 'imperial' })}>lb</button></div></div>
          <div className="profile-setting"><div><strong>Appearance</strong><span>Light or dark member space</span></div><button className="theme-button in-panel" onClick={() => updateProfile({ themeDark: !profile.themeDark })}>{profile.themeDark ? <Sun size={15} /> : <Moon size={15} />}{profile.themeDark ? 'Light' : 'Dark'}</button></div>
        </div>
      </section>
      <section className="panel privacy-panel"><div className="section-heading"><div><span className="eyebrow">DEVICE & PRIVACY</span><h2>Local member profile</h2></div><ShieldCheck size={20} /></div>
        <p>Profile and training history stay in this browser. The Kenyan mobile number is stored but not verified. The management portal will confirm package payment and exact entitlement dates.</p>
         <p className="photo-credit">Photography: <a href="https://unsplash.com/license" target="_blank" rel="noreferrer">Unsplash contributors</a>. Exercise reference images: <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">Free Exercise DB</a>.</p>
        <div className="privacy-stat"><span>Storage mode</span><strong>On this device</strong></div><div className="privacy-stat"><span>Phone verification</span><strong>Not connected</strong></div>
        <button className="button secondary-button full-width" onClick={exportData}><Save size={16} /> Export my backup</button>
        <label className="button secondary-button full-width import-button"><RotateCcw size={16} /> Import a backup<input type="file" accept="application/json,.json" onChange={importFile} /></label>
        <div className="danger-zone"><strong>Reset member data</strong><p>This removes your profile, workout history, weigh-ins and measurements from this browser.</p><button className="danger-button" onClick={() => { if (window.confirm('Permanently remove all LeGrande data saved in this browser? Export a backup first if you need one.')) resetData(); }}>Reset this device</button></div>
      </section>
    </div>
  </>;
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
