import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { MUSIC_LEVELS, type WeddingResponse } from '../lib/types'

const levelLabel = Object.fromEntries(MUSIC_LEVELS.map((x) => [x.value, x.label]))

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`))
}

function formatCreated(value: string) {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function escapeCsv(value: unknown) {
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [responses, setResponses] = useState<WeddingResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<WeddingResponse | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) void loadResponses()
  }, [session])

  const loadResponses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('wedding_responses')
      .select('*')
      .order('wedding_date', { ascending: true })

    if (error) {
      console.error(error)
      setResponses([])
    } else {
      setResponses((data ?? []) as WeddingResponse[])
    }
    setLoading(false)
  }

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setLoginError('Correo o contraseña incorrectos.')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return responses
    return responses.filter((r) => [r.couple_names, r.venue, r.address].some((v) => v?.toLowerCase().includes(q)))
  }, [responses, query])

  const exportCsv = () => {
    if (!responses.length) return
    const headers = Object.keys(responses[0]) as (keyof WeddingResponse)[]
    const csv = [
      headers.map(escapeCsv).join(','),
      ...responses.map((row) => headers.map((key) => escapeCsv(row[key])).join(',')),
    ].join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `respuestas-bodas-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (checking) return <main className="admin-shell"><div className="admin-card">Cargando...</div></main>

  if (!session) {
    return (
      <main className="admin-shell">
        <form className="login-card" onSubmit={login}>
          <div className="brand-kicker">ÁLVARO REDON DJ</div>
          <h1>Panel privado</h1>
          <p>Acceso exclusivo para revisar los cuestionarios enviados.</p>
          <label className="field"><span className="field-label">Correo</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="field"><span className="field-label">Contraseña</span><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {loginError && <div className="form-message error">{loginError}</div>}
          <button className="primary-button" type="submit">ENTRAR</button>
          <a className="back-link" href="/">← Volver al cuestionario</a>
        </form>
      </main>
    )
  }

  return (
    <main className="admin-shell wide">
      <header className="admin-topbar">
        <div>
          <div className="brand-kicker">ÁLVARO REDON DJ</div>
          <h1>Cuestionarios de boda</h1>
          <p>{responses.length} respuesta{responses.length === 1 ? '' : 's'} guardada{responses.length === 1 ? '' : 's'}</p>
        </div>
        <div className="admin-actions">
          <button className="secondary-button" onClick={exportCsv}>Exportar CSV</button>
          <button className="secondary-button" onClick={() => void loadResponses()}>Actualizar</button>
          <button className="danger-button" onClick={() => void supabase.auth.signOut()}>Salir</button>
        </div>
      </header>

      <div className="admin-toolbar">
        <input placeholder="Buscar por pareja, finca o dirección..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="admin-card">Cargando respuestas...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-card">No hay respuestas que coincidan.</div>
      ) : (
        <div className="response-grid">
          {filtered.map((r) => (
            <button className="response-card" key={r.id} onClick={() => setSelected(r)}>
              <span className="response-date">{r.wedding_date ? formatDate(r.wedding_date) : 'Sin fecha'}</span>
              <strong>{r.couple_names}</strong>
              <span>{r.venue || 'Lugar sin indicar'}</span>
              <small>Recibido: {formatCreated(r.created_at)}</small>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <article className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button>
            <div className="brand-kicker">CUESTIONARIO DE BODA</div>
            <h2>{selected.couple_names}</h2>
            <p className="detail-lead">{selected.wedding_date ? formatDate(selected.wedding_date) : 'Fecha no indicada'} · {selected.venue || 'Lugar no indicado'}</p>

            <DetailGroup title="1. Datos de la boda" items={[
              ['Dirección', selected.address], ['Hora enlace', selected.ceremony_time], ['Cóctel', selected.cocktail_time], ['Banquete', selected.banquet_time], ['Barra libre', selected.open_bar_time], ['Invitados', selected.guest_count]
            ]} />
            <DetailGroup title="2. Servicios y coordinación" items={[
              ['Extras contratados', selected.contracted_extras], ['Wedding planner', selected.wedding_planner]
            ]} />
            <DetailGroup title="3. Perfil de invitados" items={[
              ['Familia / mayores', selected.guests_family_older == null ? '' : `${selected.guests_family_older}%`],
              ['20-50 años', selected.guests_20_50 == null ? '' : `${selected.guests_20_50}%`],
              ['Adolescentes / jóvenes', selected.guests_young == null ? '' : `${selected.guests_young}%`]
            ]} />
            <DetailGroup title="4. Música" items={[
              ['Tienen que sonar', selected.must_play], ['A evitar', selected.avoid_songs], ['Uso de micrófono', selected.dj_microphone], ['Momentos especiales', selected.special_moments], ['Artistas preferidos', selected.favorite_artists], ['Playlist Spotify', selected.spotify_playlist], ['Última canción', selected.last_song]
            ]} />

            <section className="detail-section">
              <h3>Preferencia por estilos</h3>
              <div className="style-tags">
                {Object.entries(selected.style_preferences ?? {}).length ? (Object.entries(selected.style_preferences ?? {}) as [string, string][]).map(([style, level]) => (
                  <span className={`style-tag level-${level}`} key={style}><strong>{style}</strong> · {levelLabel[level] ?? level}</span>
                )) : <span className="muted">Sin preferencias marcadas.</span>}
              </div>
            </section>

            <DetailGroup title="5. Detalles" items={[["¿Qué más debo saber?", selected.details]]} />
          </article>
        </div>
      )}
    </main>
  )
}

type DetailValue = string | number | null | undefined
function DetailGroup({ title, items }: { title: string; items: [string, DetailValue][] }) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      <dl className="detail-list">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value !== '' && value != null ? value : <span className="muted">No indicado</span>}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
