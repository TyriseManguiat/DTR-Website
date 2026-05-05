import type { AttendanceState, TimeLog } from '../types'

const scheduledStartMinutes = 8 * 60

export const initialAttendance: AttendanceState = {
  clockInTime: null,
  clockOutTime: null,
  breakStartTime: null,
  accumulatedBreakMs: 0,
  isClockedOut: false,
}

export type DashboardState = {
  currentDate: string
  currentTime: string
  clockButtonLabel: string
  clockButtonDisabled: boolean
  shiftHint: string
  hoursWorked: string
  hoursWorkedNote: string
  punctualityValue: string
  punctualityNote: string
  timeline: {
    primary: { color: string; title: string; detail: string; time: string }
    secondary: { color: string; title: string; detail: string; time: string }
  }
}

export type DashboardStat = {
  label: string
  value: string
  tone: 'success' | 'warning' | 'info'
}

export function buildDashboardState(attendance: AttendanceState, now: Date): DashboardState {
  const currentDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const currentTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })

  if (!attendance.clockInTime) {
    return {
      currentDate,
      currentTime,
      clockButtonLabel: 'Time In',
      clockButtonDisabled: false,
      shiftHint: '',
      hoursWorked: '00h 00m',
      hoursWorkedNote: 'Waiting for first clock in',
      punctualityValue: '--',
      punctualityNote: 'Updates after clock in',
      timeline: {
        primary: { color: '#94a3b8', title: 'Shift not started', detail: 'Clock in from the dashboard to begin tracking.', time: '--' },
        secondary: { color: '#cbd5e1', title: 'Break unavailable', detail: 'Start break becomes available after clock in.', time: '--' },
      },
    }
  }

  const activeBreakMs = attendance.breakStartTime ? now.getTime() - attendance.breakStartTime.getTime() : 0
  const totalBreakMs = attendance.accumulatedBreakMs + (attendance.isClockedOut ? 0 : activeBreakMs)
  const referenceTime = attendance.clockOutTime ?? now
  const workedMs = Math.max(0, referenceTime.getTime() - attendance.clockInTime.getTime() - totalBreakMs)
  const punctuality = buildPunctuality(attendance.clockInTime)

  if (attendance.isClockedOut) {
    return {
      currentDate,
      currentTime,
      clockButtonLabel: 'Timed Out',
      clockButtonDisabled: true,
      shiftHint: `Shift closed at ${formatTime(referenceTime)}.`,
      hoursWorked: formatDuration(workedMs),
      hoursWorkedNote: 'Daily record captured',
      punctualityValue: punctuality.value,
      punctualityNote: punctuality.note,
      timeline: {
        primary: { color: '#1fa55b', title: 'Clocked out', detail: 'Daily shift completed.', time: formatTime(referenceTime) },
        secondary: {
          color: '#1fa55b',
          title: 'Break status',
          detail: totalBreakMs > 0 ? `Total break logged: ${formatDuration(totalBreakMs)}` : 'No break recorded for this shift.',
          time: totalBreakMs > 0 ? formatDuration(totalBreakMs) : '--',
        },
      },
    }
  }

  if (attendance.breakStartTime) {
    return {
      currentDate,
      currentTime,
      clockButtonLabel: 'Time Out',
      clockButtonDisabled: false,
      shiftHint: `Break started at ${formatTime(attendance.breakStartTime)}.`,
      hoursWorked: formatDuration(workedMs),
      hoursWorkedNote: 'Work timer paused for break',
      punctualityValue: punctuality.value,
      punctualityNote: punctuality.note,
      timeline: {
        primary: { color: '#1fa55b', title: 'Clocked in', detail: 'Recorded from dashboard.', time: formatTime(attendance.clockInTime) },
        secondary: { color: '#f59e0b', title: 'Break started', detail: 'Recorded from dashboard.', time: formatTime(attendance.breakStartTime) },
      },
    }
  }

  return {
    currentDate,
    currentTime,
    clockButtonLabel: 'Time Out',
    clockButtonDisabled: false,
    shiftHint: 'Break control is now available for this shift.',
    hoursWorked: formatDuration(workedMs),
    hoursWorkedNote: 'Shift started',
    punctualityValue: punctuality.value,
    punctualityNote: punctuality.note,
    timeline: {
      primary: { color: '#1fa55b', title: 'Clocked in', detail: 'Recorded from dashboard.', time: formatTime(attendance.clockInTime) },
      secondary: { color: '#f59e0b', title: 'Break available', detail: 'Start break when you need to pause.', time: '--' },
    },
  }
}

export function buildEmployeeStats(logs: TimeLog[]): DashboardStat[] {
  const presentDays = logs.length
  const lateDays = logs.filter((log) => parseClockInMinutes(log.summary) > scheduledStartMinutes).length
  const totalMinutes = logs.reduce((sum, log) => sum + parseDurationMinutes(log.duration), 0)
  const overtimeMinutes = logs.reduce((sum, log) => {
    const durationMinutes = parseDurationMinutes(log.duration)
    return sum + Math.max(0, durationMinutes - 8 * 60)
  }, 0)
  const punctuality = presentDays === 0 ? '--' : `${Math.round(((presentDays - lateDays) / presentDays) * 100)}%`

  return [
    { label: 'Present Days', value: String(presentDays), tone: 'success' },
    { label: 'Late Days', value: String(lateDays), tone: 'warning' },
    { label: 'Total Hours', value: formatDurationFromMinutes(totalMinutes), tone: 'info' },
    { label: 'Overtime', value: formatDurationFromMinutes(overtimeMinutes), tone: 'info' },
    { label: 'Punctuality', value: punctuality, tone: 'success' },
  ]
}

function buildPunctuality(clockInTime: Date) {
  const clockInMinutes = clockInTime.getHours() * 60 + clockInTime.getMinutes()
  const difference = clockInMinutes - scheduledStartMinutes

  if (difference <= 0) {
    const label = difference === 0 ? 'Right on time' : `${Math.abs(difference)} ${Math.abs(difference) === 1 ? 'min' : 'mins'} early`
    return { value: '100%', note: label }
  }

  if (difference <= 5) {
    return { value: '99%', note: `${difference} ${difference === 1 ? 'min' : 'mins'} late` }
  }

  return { value: '96%', note: `${difference} mins late` }
}

function parseDurationMinutes(duration: string) {
  const match = duration.match(/(\d+)h\s+(\d+)m/i)
  if (!match) {
    return 0
  }

  return Number(match[1]) * 60 + Number(match[2])
}

function formatDurationFromMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
}

function parseClockInMinutes(summary: string) {
  const match = summary.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s+in/i)
  if (!match) {
    return 0
  }

  let hours = Number(match[1]) % 12
  if (match[3].toUpperCase() === 'PM') {
    hours += 12
  }

  return hours * 60 + Number(match[2])
}

function formatDuration(durationMs: number) {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
