// Generates the fixed daily slot grid: 7:00 AM – 7:00 PM, every 30 minutes,
// open all seven days a week. Booked slots (and same-day slots inside the
// minimum lead time) are filtered out by the caller.

export function generateSlots() {
  const slots = []
  let hour = 7
  let minute = 0
  while (hour < 19 || (hour === 19 && minute === 0)) {
    const h24 = hour
    const displayHour = h24 % 12 === 0 ? 12 : h24 % 12
    const period = h24 < 12 ? 'AM' : 'PM'
    const label = `${displayHour}:${minute === 0 ? '00' : minute} ${period}`
    const value = `${String(h24).padStart(2, '0')}:${minute === 0 ? '00' : minute}`
    slots.push({ value, label })

    if (hour === 19 && minute === 0) break
    minute += 30
    if (minute === 60) {
      minute = 0
      hour += 1
    }
  }
  return slots
}

// Today's calendar date in the business's own timezone (Los Angeles),
// as 'yyyy-MM-dd' — independent of the visitor's own local timezone.
export function getPacificDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// The earliest bookable "HH:MM" slot value for TODAY in Pacific time —
// current Pacific time plus a 4-hour lead time, rounded up to the next
// 30-minute slot. Only relevant when the selected date is today.
export function getMinimumLeadTimeValue() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date())

  const hour = Number(parts.find((p) => p.type === 'hour').value)
  const minute = Number(parts.find((p) => p.type === 'minute').value)

  let totalMinutes = hour * 60 + minute + 4 * 60
  const remainder = totalMinutes % 30
  if (remainder !== 0) totalMinutes += 30 - remainder

  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}