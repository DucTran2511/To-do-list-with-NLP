import { addDays, addWeeks, addMonths, startOfDay, format, isValid } from 'date-fns'

export type ParsedTask = {
  title: string
  dueDate?: string
  dueTime?: string
  priority?: 'low' | 'medium' | 'high'
  tags: string[]
  projectHint?: string
}

const dateTagRegex = /:d(\S+)/g  // :d2025-12-25 or :dtomorrow
const timeTagRegex = /:t(\S+)/g  // :t14:30 or :t2pm
const priorityTagRegex = /:p(low|medium|high|l|m|h|1|2|3)/g  // :phigh or :p3

const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\b/

const dateKeywords = {
  today: () => new Date(),
  tomorrow: () => addDays(new Date(), 1),
  yesterday: () => addDays(new Date(), -1),
  'next week': () => addWeeks(new Date(), 1),
  'next month': () => addMonths(new Date(), 1),
  monday: () => getNextWeekday(1),
  tuesday: () => getNextWeekday(2),
  wednesday: () => getNextWeekday(3),
  thursday: () => getNextWeekday(4),
  friday: () => getNextWeekday(5),
  saturday: () => getNextWeekday(6),
  sunday: () => getNextWeekday(0),
}

const priorityKeywords = {
  '!!!': 'high' as const,
  '!!': 'medium' as const,
  '!': 'low' as const,
  urgent: 'high' as const,
  important: 'high' as const,
  asap: 'high' as const,
}

function getNextWeekday(target: number): Date {
  const today = new Date()
  const todayDay = today.getDay()
  const daysUntilTarget = (target - todayDay + 7) % 7
  return addDays(today, daysUntilTarget === 0 ? 7 : daysUntilTarget)
}

function parseDateTag(dateStr: string): string | null {
  console.log('� Parsing date tag:', dateStr)
  
  if (dateKeywords[dateStr.toLowerCase() as keyof typeof dateKeywords]) {
    const date = dateKeywords[dateStr.toLowerCase() as keyof typeof dateKeywords]()
    return format(startOfDay(date), 'yyyy-MM-dd')
  }
  
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number)
    const date = new Date(year, month - 1, day)
    if (isValid(date)) {
      return format(date, 'yyyy-MM-dd')
    }
  }
  
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (usMatch) {
    const [, month, day, year] = usMatch
    const currentYear = new Date().getFullYear()
    const fullYear = year ? parseInt(year) : currentYear
    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day))
    if (isValid(date)) {
      return format(date, 'yyyy-MM-dd')
    }
  }
  
  return null
}

function parseTimeTag(timeStr: string): string | null {
  console.log('� Parsing time tag:', timeStr)
  
  const time24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (time24Match) {
    const [, hour, minute] = time24Match.map(Number)
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
  }
  
  const time12Match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/i)
  if (time12Match) {
    const [, hourStr, minuteStr = '00', period] = time12Match
    let hour = parseInt(hourStr)
    const minute = parseInt(minuteStr)
    
    if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12
    if (period.toLowerCase() === 'am' && hour === 12) hour = 0
    
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
  }
  
  return null
}

function parsePriorityTag(priorityStr: string): 'low' | 'medium' | 'high' | null {
  console.log('⚡ Parsing priority tag:', priorityStr)
  
  const priority = priorityStr.toLowerCase()
  
  switch (priority) {
    case 'low':
    case 'l':
    case '1':
      return 'low'
    case 'medium':
    case 'm':
    case '2':
      return 'medium'
    case 'high':
    case 'h':
    case '3':
      return 'high'
    default:
      return null
  }
}

export function parseNaturalLanguage(input: string): ParsedTask {
  let text = input.trim()
  let dueDate: string | undefined
  let dueTime: string | undefined
  let priority: 'low' | 'medium' | 'high' | undefined
  const tags: string[] = []
  let projectHint: string | undefined

  console.log('🔍 Parsing input:', text)

  const dateTagMatches = text.match(dateTagRegex)
  if (dateTagMatches) {
    for (const match of dateTagMatches) {
      const dateStr = match.slice(2) // Remove ':d'
      const parsedDate = parseDateTag(dateStr)
      if (parsedDate) {
        dueDate = parsedDate
        text = text.replace(match, '').trim()
        console.log('✅ Found date tag:', dateStr, '→', parsedDate)
        break // Use first valid date
      }
    }
  }

  const timeTagMatches = text.match(timeTagRegex)
  if (timeTagMatches) {
    for (const match of timeTagMatches) {
      const timeStr = match.slice(2) // Remove ':t'
      const parsedTime = parseTimeTag(timeStr)
      if (parsedTime) {
        dueTime = parsedTime
        text = text.replace(match, '').trim()
        console.log('✅ Found time tag:', timeStr, '→', parsedTime)
        break // Use first valid time
      }
    }
  }

  const priorityTagMatches = text.match(priorityTagRegex)
  if (priorityTagMatches) {
    for (const match of priorityTagMatches) {
      const priorityStr = match.slice(2) // Remove ':p'
      const parsedPriority = parsePriorityTag(priorityStr)
      if (parsedPriority) {
        priority = parsedPriority
        text = text.replace(match, '').trim()
        console.log('✅ Found priority tag:', priorityStr, '→', parsedPriority)
        break // Use first valid priority
      }
    }
  }

  const tagMatches = text.match(/#\w+/g)
  if (tagMatches) {
    const limitedTags = tagMatches.slice(0, 5).map(tag => tag.slice(1))
    tags.push(...limitedTags)
    text = text.replace(/#\w+/g, '').trim()
    console.log('✅ Found tags:', tags, tagMatches.length > 5 ? '(limited to 5)' : '')
  }

  const projectMatch = text.match(/@(\w+)/)
  if (projectMatch) {
    projectHint = projectMatch[1]
    text = text.replace(/@\w+/g, '').trim()
    console.log('✅ Found project:', projectHint)
  }

  if (!priority) {
    for (const [keyword, prio] of Object.entries(priorityKeywords)) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        priority = prio
        text = text.replace(new RegExp(keyword, 'gi'), '').trim()
        console.log('✅ Found priority keyword:', keyword, '→', prio)
        break
      }
    }
  }

  if (!dueTime) {
    const timeMatch = text.match(timeRegex)
    if (timeMatch) {
      const [, hourStr, minuteStr = '00', period] = timeMatch
      let hour = parseInt(hourStr)
      const minute = parseInt(minuteStr)

      if (period) {
        if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12
        if (period.toLowerCase() === 'am' && hour === 12) hour = 0
      }

      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        dueTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        text = text.replace(timeRegex, '').trim()
        console.log('✅ Found old-style time:', dueTime)
      }
    }
  }

  if (!dueDate) {
    for (const [keyword, dateFn] of Object.entries(dateKeywords)) {
      if (text.toLowerCase().includes(keyword)) {
        dueDate = format(startOfDay(dateFn()), 'yyyy-MM-dd')
        text = text.replace(new RegExp(keyword, 'gi'), '').trim()
        console.log('✅ Found date keyword:', keyword, '→', dueDate)
        break
      }
    }
  }

  const title = text.replace(/\s+/g, ' ').trim()

  const result = {
    title: title || 'Untitled task',
    dueDate,
    dueTime,
    priority,
    tags,
    projectHint
  }

  console.log('📝 Final parsed result:', result)
  return result
}
