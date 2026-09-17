import { MUSIC_LEVELS, MUSIC_STYLES, type MusicLevel, type StylePreferences } from '../lib/types'

type Props = {
  value: StylePreferences
  onChange: (next: StylePreferences) => void
}

export function MusicMatrix({ value, onChange }: Props) {
  const setLevel = (style: string, level: MusicLevel) => {
    onChange({ ...value, [style]: level })
  }

  return (
    <div className="music-matrix-wrap">
      <table className="music-matrix">
        <thead>
          <tr>
            <th>Estilo</th>
            {MUSIC_LEVELS.map((level) => <th key={level.value}>{level.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {MUSIC_STYLES.map((style) => (
            <tr key={style}>
              <td>{style}</td>
              {MUSIC_LEVELS.map((level) => (
                <td key={level.value}>
                  <label className="radio-cell" aria-label={`${style}: ${level.label}`}>
                    <input
                      type="radio"
                      name={`style-${style}`}
                      value={level.value}
                      checked={value[style] === level.value}
                      onChange={() => setLevel(style, level.value)}
                    />
                    <span />
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
