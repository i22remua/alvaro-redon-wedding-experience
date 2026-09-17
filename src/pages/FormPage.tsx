import { useMemo, useState, type FormEvent } from 'react'
import { Field } from '../components/Field'
import { MusicMatrix } from '../components/MusicMatrix'
import { Section } from '../components/Section'
import { supabase } from '../lib/supabase'
import { MUSIC_STYLES, type StylePreferences, type WeddingFormData } from '../lib/types'

const emptyStyles: StylePreferences = Object.fromEntries(MUSIC_STYLES.map((style) => [style, '']))

const initialForm: WeddingFormData = {
  wedding_date: '',
  venue: '',
  address: '',
  ceremony_time: '',
  cocktail_time: '',
  banquet_time: '',
  open_bar_time: '',
  guest_count: '',
  couple_names: '',
  contracted_extras: '',
  wedding_planner: '',
  guests_family_older: '',
  guests_20_50: '',
  guests_young: '',
  must_play: '',
  avoid_songs: '',
  style_preferences: emptyStyles,
  dj_microphone: '',
  special_moments: '',
  favorite_artists: '',
  spotify_playlist: '',
  last_song: '',
  details: '',
}

function numberOrNull(value: string) {
  if (value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function FormPage() {
  const [form, setForm] = useState<WeddingFormData>(initialForm)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')

  const profileTotal = useMemo(() => {
    return [form.guests_family_older, form.guests_20_50, form.guests_young]
      .map((v) => Number(v) || 0)
      .reduce((a, b) => a + b, 0)
  }, [form.guests_family_older, form.guests_20_50, form.guests_young])

  const update = (key: keyof WeddingFormData, value: string | StylePreferences) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (website) return

    if (!form.couple_names.trim() || !form.wedding_date) {
      setStatus('error')
      setMessage('Indicad al menos el nombre de la pareja y la fecha de la boda.')
      return
    }

    setStatus('sending')
    setMessage('')

    const payload = {
      ...form,
      ceremony_time: form.ceremony_time || null,
      cocktail_time: form.cocktail_time || null,
      banquet_time: form.banquet_time || null,
      open_bar_time: form.open_bar_time || null,
      guest_count: numberOrNull(form.guest_count),
      guests_family_older: numberOrNull(form.guests_family_older),
      guests_20_50: numberOrNull(form.guests_20_50),
      guests_young: numberOrNull(form.guests_young),
      style_preferences: Object.fromEntries(
        Object.entries(form.style_preferences).filter(([, level]) => Boolean(level))
      ),
    }

    const { error } = await supabase.from('wedding_responses').insert(payload)

    if (error) {
      console.error(error)
      setStatus('error')
      setMessage('No se ha podido enviar el cuestionario. Intentadlo de nuevo en unos minutos.')
      return
    }

    setStatus('success')
    setMessage('¡Gracias! He recibido vuestra historia musical. Ya puedo empezar a preparar vuestra boda.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (status === 'success') {
    return (
      <main className="page-shell success-page">
        <div className="success-card">
          <div className="brand-kicker">ÁLVARO REDON DJ · EXPERIENCIA MUSICAL DE BODA</div>
          <h1>¡Cuestionario recibido!</h1>
          <p>{message}</p>
          <p className="muted">Podéis cerrar esta página. Álvaro tendrá guardadas vuestras respuestas.</p>
          <button className="secondary-button" onClick={() => { setForm(initialForm); setStatus('idle'); setMessage('') }}>
            Enviar otro cuestionario
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="brand-kicker">ÁLVARO REDON DJ · EXPERIENCIA MUSICAL DE BODA</div>
        <h1>ÁLVARO REDON</h1>
        <p className="subtitle">DJ · FORMATO ABIERTO</p>
        <h2>VUESTRA BODA, VUESTRA BANDA SONORA</h2>
        <p className="hero-copy">Contadme cómo sois, qué queréis escuchar y qué preferís evitar. Con estas respuestas prepararé una sesión hecha a vuestra medida.</p>
      </header>

      <form onSubmit={submit}>
        <div className="honeypot" aria-hidden="true">
          <label>Web<input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" /></label>
        </div>

        <Section number={1} title="DATOS DE LA BODA">
          <div className="grid two-cols">
            <Field label="Fecha de la boda *" type="date" required value={form.wedding_date} onChange={(e) => update('wedding_date', e.target.value)} />
            <Field label="Nombre de la pareja *" placeholder="Ej. Marta & Carlos" required value={form.couple_names} onChange={(e) => update('couple_names', e.target.value)} />
            <Field label="Lugar / finca / salón" placeholder="Nombre del lugar" value={form.venue} onChange={(e) => update('venue', e.target.value)} />
            <Field label="Dirección" placeholder="Dirección completa" value={form.address} onChange={(e) => update('address', e.target.value)} />
            <Field label="Hora del enlace" type="time" value={form.ceremony_time} onChange={(e) => update('ceremony_time', e.target.value)} />
            <Field label="Hora comienzo cóctel" type="time" value={form.cocktail_time} onChange={(e) => update('cocktail_time', e.target.value)} />
            <Field label="Hora comienzo banquete" type="time" value={form.banquet_time} onChange={(e) => update('banquet_time', e.target.value)} />
            <Field label="Hora prevista barra libre" type="time" value={form.open_bar_time} onChange={(e) => update('open_bar_time', e.target.value)} />
            <Field label="Nº aproximado de invitados" type="number" min="0" inputMode="numeric" value={form.guest_count} onChange={(e) => update('guest_count', e.target.value)} />
          </div>
        </Section>

        <Section number={2} title="SERVICIOS Y COORDINACIÓN">
          <div className="grid two-cols">
            <Field label="Extras contratados" placeholder="Fotomatón, iluminación, saxofonista..." value={form.contracted_extras} onChange={(e) => update('contracted_extras', e.target.value)} />
            <Field label="Wedding planner / coordinador/a" placeholder="Nombre o empresa" value={form.wedding_planner} onChange={(e) => update('wedding_planner', e.target.value)} />
          </div>
        </Section>

        <Section number={3} title="PERFIL DE INVITADOS Y PISTA">
          <p className="section-intro">Indicad un porcentaje aproximado de cada grupo. Lo ideal es que el total ronde el 100%.</p>
          <div className="grid three-cols">
            <Field label="Familia / mayores (%)" type="number" min="0" max="100" inputMode="numeric" value={form.guests_family_older} onChange={(e) => update('guests_family_older', e.target.value)} />
            <Field label="20-50 años (%)" type="number" min="0" max="100" inputMode="numeric" value={form.guests_20_50} onChange={(e) => update('guests_20_50', e.target.value)} />
            <Field label="Adolescentes / jóvenes (%)" type="number" min="0" max="100" inputMode="numeric" value={form.guests_young} onChange={(e) => update('guests_young', e.target.value)} />
          </div>
          <div className={`profile-total ${profileTotal === 100 ? 'ok' : ''}`}>Total aproximado: <strong>{profileTotal}%</strong></div>
        </Section>

        <Section number={4} title="CANCIONES IMPRESCINDIBLES Y PROHIBIDAS">
          <div className="grid two-cols">
            <Field textarea label="¡TIENEN QUE SONAR!" rows={5} placeholder="Canciones, artistas, versiones concretas..." value={form.must_play} onChange={(e) => update('must_play', e.target.value)} />
            <Field textarea label="¡A EVITAR SÍ O SÍ!" rows={5} placeholder="Canciones, estilos o artistas que no queréis escuchar..." value={form.avoid_songs} onChange={(e) => update('avoid_songs', e.target.value)} />
          </div>
          <h3 className="subheading">Preferencia por estilos</h3>
          <p className="section-intro">Marcada una opción por estilo. Si alguno os da igual, podéis dejarlo sin marcar.</p>
          <MusicMatrix value={form.style_preferences} onChange={(next) => update('style_preferences', next)} />

          <h3 className="subheading space-top">Preferencias</h3>
          <div className="grid two-cols">
            <Field textarea label="Uso de micrófono del DJ" rows={3} placeholder="Mucho, solo momentos puntuales, preferimos discreción..." value={form.dj_microphone} onChange={(e) => update('dj_microphone', e.target.value)} />
            <Field textarea label="Canciones sorpresa / Momentos especiales" rows={3} placeholder="Entradas, regalos, sorpresas, cumpleaños..." value={form.special_moments} onChange={(e) => update('special_moments', e.target.value)} />
            <Field textarea label="Artistas preferidos" rows={3} placeholder="Vuestros imprescindibles" value={form.favorite_artists} onChange={(e) => update('favorite_artists', e.target.value)} />
            <Field label="Playlist de Spotify de referencia" type="url" placeholder="https://open.spotify.com/..." value={form.spotify_playlist} onChange={(e) => update('spotify_playlist', e.target.value)} />
            <Field label="Última canción de la boda" placeholder="Si queréis elegirla" value={form.last_song} onChange={(e) => update('last_song', e.target.value)} />
          </div>
        </Section>

        <Section number={5} title="DETALLES">
          <Field textarea label="¿Qué más debo saber?" rows={7} placeholder="Tradiciones, grupos de amigos, canciones con historia, sorpresas, límites, ideas..." value={form.details} onChange={(e) => update('details', e.target.value)} />
        </Section>

        <section className="closing-card">
          <h2>GRACIAS POR CONTARME VUESTRA HISTORIA MUSICAL</h2>
          <p>Con esta información podré preparar una sesión con identidad propia, manteniendo margen para leer la pista y hacer que la música encaje con lo que esté ocurriendo en cada momento.</p>
          {status === 'error' && <div className="form-message error">{message}</div>}
          <button className="primary-button" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Enviando...' : 'ENVIAR CUESTIONARIO'}
          </button>
          <p className="privacy-note">Las respuestas se utilizan únicamente para preparar musicalmente vuestra boda.</p>
        </section>
      </form>

      <footer className="footer">ÁLVARO REDON · DJ / OPEN FORMAT</footer>
    </main>
  )
}
