// The daily start-time grid: 8:00 AM – 5:00 PM, every 30 minutes, every day.
// Must match TIME_SLOTS in worker/worker.js. The value sent to the Worker is the
// label itself ("8:00 AM"), the same format the shared bookings table uses.
// Booked slots (and same-day slots inside the 2-hour lead time) come back from
// /api/availability as `booked` and are filtered out by the caller.

export const LEAD_MINUTES = 120

export function generateSlots() {
  const slots = []
  for (let mins = 8 * 60; mins <= 17 * 60; mins += 30) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    const hour12 = h % 12 === 0 ? 12 : h % 12
    const label = `${hour12}:${m === 0 ? '00' : m} ${h >= 12 ? 'PM' : 'AM'}`
    slots.push({ value: label, label, minutes: mins })
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

// Minutes since midnight of the earliest bookable start TODAY in Pacific time
// (now + the 2-hour lead time). Only relevant when the selected date is today.
export function getMinimumLeadMinutes() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date())

  const hour = Number(parts.find((p) => p.type === 'hour').value)
  const minute = Number(parts.find((p) => p.type === 'minute').value)
  return hour * 60 + minute + LEAD_MINUTES
}
