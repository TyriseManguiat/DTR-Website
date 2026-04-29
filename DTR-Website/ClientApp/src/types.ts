export type TabId = 'dashboard' | 'logs' | 'requests' | 'insights'

export type ModalView =
  | { type: 'account' }
  | { type: 'leave' }
  | { type: 'correction' }
  | { type: 'request-details'; requestId: string }

export type TimeLog = {
  id: string
  dayLabel: string
  dateNumber: string
  monthLabel: string
  dateTitle: string
  summary: string
  duration: string
  accent: string
  accentSoft: string
}

export type RequestItem = {
  id: string
  title: string
  status: 'Pending' | 'Approved'
  statusColor: string
  statusSoft: string
  summary: string
  accent: string
  accentSoft: string
  details: Array<{ label: string; value: string; emphasis?: boolean }>
}

export type AttendanceState = {
  clockInTime: Date | null
  clockOutTime: Date | null
  breakStartTime: Date | null
  accumulatedBreakMs: number
  isClockedOut: boolean
}
