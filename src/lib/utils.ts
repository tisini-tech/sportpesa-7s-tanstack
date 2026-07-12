import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { EventStat } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStat = (arry: EventStat[], name: string) => {
  const event = Object.values(arry).find(
    (item) => item.event_name.toString() === name,
  )

  return Number(event?.total ?? 0)
}

export const getEvent = (array: EventStat[], eventId: string): number => {
  const event = Object.values(array).find(
    (item) => item.event_id.toString() === eventId,
  )

  return Number(event?.total ?? 0)
}

export const getSubEvent = (
  array: EventStat[],
  eventId: string,
  subEventId: string,
): number => {
  const event = Object.values(array).find(
    (item) => item.event_id.toString() === eventId,
  )

  const subEvent = event?.['sub_events']?.find(
    (item) => item.sub_event_id.toString() === subEventId,
  )

  return Number(subEvent?.total ?? 0)
}
