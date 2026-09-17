export const MUSIC_STYLES = [
  'Pasodoble / pachangueo',
  'Flamenco / rumba',
  'Pop español 80s / 90s / 00s',
  'Rock español / internacional',
  'Indie',
  'Salsa / bachata / merengue',
  'Reggaeton antiguo',
  'Reggaeton actual',
  'Electrolatino',
  'Tech-house / Techno',
  'Breakbeat',
  'Remember electrónica 90s / 00s',
  'Hits actuales',
] as const

export const MUSIC_LEVELS = [
  { value: 'mucho', label: '🔥 Mucho' },
  { value: 'si', label: '✓ Sí' },
  { value: 'poco', label: '≈ Poco' },
  { value: 'evitar', label: '✕ Evitar' },
] as const

export type MusicLevel = (typeof MUSIC_LEVELS)[number]['value']
export type StylePreferences = Record<string, MusicLevel | ''>

export type WeddingFormData = {
  wedding_date: string
  venue: string
  address: string
  ceremony_time: string
  cocktail_time: string
  banquet_time: string
  open_bar_time: string
  guest_count: string
  couple_names: string
  contracted_extras: string
  wedding_planner: string
  guests_family_older: string
  guests_20_50: string
  guests_young: string
  must_play: string
  avoid_songs: string
  style_preferences: StylePreferences
  dj_microphone: string
  special_moments: string
  favorite_artists: string
  spotify_playlist: string
  last_song: string
  details: string
}

export type WeddingResponse = Omit<WeddingFormData, 'guest_count' | 'guests_family_older' | 'guests_20_50' | 'guests_young'> & {
  id: string
  created_at: string
  guest_count: number | null
  guests_family_older: number | null
  guests_20_50: number | null
  guests_young: number | null
}
