import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Division, EventStat, Season } from './types'
import { getLegSlug, getSeasonSlug } from './tournament-slugs'
import type { LandingVideo } from '#/components/landing/videos'

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

export function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/,
  )
  return match?.[1] ?? null
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

export function youtubeEmbedUrl(youtubeId: string, autoplay = false): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
  })
  if (autoplay) params.set('autoplay', '1')
  return `https://www.youtube.com/embed/${youtubeId}?${params}`
}

export function formatVideoDate(value: string | null): string {
  if (!value) return 'Date TBC'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Date TBC'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function collectVideos(seasons: Season[]): LandingVideo[] {
  const videos: LandingVideo[] = []

  for (const season of seasons) {
    const seasonSlug = getSeasonSlug(season)
    const divisions = [...season.divisions].sort((a, b) => a.order - b.order)

    for (const division of divisions) {
      pushVideo(videos, season, seasonSlug, division, 'day1', 'Day 1')
      pushVideo(videos, season, seasonSlug, division, 'day2', 'Day 2')
    }
  }

  return videos
}

function pushVideo(
  videos: LandingVideo[],
  season: Season,
  seasonSlug: string,
  division: Division,
  dayKey: 'day1' | 'day2',
  dayLabel: string,
) {
  const url =
    dayKey === 'day1' ? division.day1_video_url : division.day2_video_url
  if (!url) return

  videos.push({
    id: `${division.id}-${dayKey}`,
    url,
    seasonName: season.name,
    divisionName: division.name,
    seasonSlug,
    legSlug: getLegSlug(division),
    date: division.date_from,
    dayLabel,
    thumbnailUrl: getYouTubeThumbnail(url),
  })
}

export function formatApiError(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback

  const body = error as {
    detail?: unknown
    message?: unknown
    error?: unknown
  }

  if (typeof body.detail === 'string') return body.detail
  if (typeof body.message === 'string') return body.message
  if (typeof body.error === 'string') return body.error

  // Django/DRF field errors: { field: ["msg"] } or detail: [{ msg, loc }]
  if (Array.isArray(body.detail)) {
    const parts = body.detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg)
        }
        return null
      })
      .filter(Boolean)
    if (parts.length) return parts.join(' ')
  }

  const fieldMessages = Object.entries(body)
    .flatMap(([key, value]) => {
      if (key === 'detail' || key === 'message' || key === 'error') return []
      if (typeof value === 'string') return [`${key}: ${value}`]
      if (Array.isArray(value)) return value.map((v) => `${key}: ${String(v)}`)
      return []
    })
    .filter(Boolean)

  if (fieldMessages.length) return fieldMessages.join(' ')

  return fallback
}
