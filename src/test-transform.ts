import { generateMockEvents } from './calendar/mock.js'
import { transformEvents } from './calendar/transform.js'

const events = generateMockEvents()
console.log(`Generated ${events.length} mock events`)

const result = transformEvents(events)

console.log('\n=== Summary ===')
console.log(`Total events: ${result.summary.totalEvents}`)
console.log(`Total minutes: ${result.summary.totalMinutes}`)
console.log(`Total hours: ${Math.round(result.summary.totalMinutes / 60 * 10) / 10}`)
console.log(`Recurring: ${result.summary.recurringCount} (${Math.round(result.recurringRatio * 100)}%)`)
console.log(`Unique attendees: ${result.summary.uniqueAttendees}`)

console.log('\n=== Daily ===')
for (const day of result.dailyEvents) {
  console.log(`${day.date}: ${day.events.length} events, ${day.totalMinutes} min`)
}

console.log('\n=== Top Attendees ===')
for (const att of result.attendeeStats.slice(0, 5)) {
  console.log(`${att.displayName ?? att.email}: ${att.count} events`)
}

console.log('\n=== Event Titles ===')
console.log(result.eventTitles.join(', '))
