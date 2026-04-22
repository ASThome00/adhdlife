import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24)
}

export function formatDueDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isToday(date))    return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEE MMM d')
}

export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return isPast(startOfDay(date)) && !isToday(date)
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name}! 👋`
}

export function getStreakMessage(streak: number): string {
  if (streak === 0)  return 'Start today!'
  if (streak === 1)  return 'Day 1 — great start!'
  if (streak < 7)    return `${streak} days going! 🔥`
  if (streak < 30)   return `${streak} days — on fire! 🔥`
  return `${streak} days — incredible! 🏆`
}

export const PRIORITY_CONFIG = {
  HIGH:   { label: 'High',   dot: 'bg-red-400',   text: 'text-red-500'   },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-400',  text: 'text-amber-500' },
  LOW:    { label: 'Low',    dot: 'bg-gray-300',   text: 'text-gray-400'  },
} as const
