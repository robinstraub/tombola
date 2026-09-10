import { THEMES, type ThemeId } from '../lib/themes'

interface ThemeSwitcherProps {
  value: ThemeId
  onChange: (theme: ThemeId) => void
}

/** Small segmented control (top-right) to switch the visual theme live. */
export function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switch" role="group" aria-label="Choix du thème">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          className={`theme-switch__btn${value === theme.id ? ' theme-switch__btn--active' : ''}`}
          onClick={() => onChange(theme.id)}
          title={theme.hint}
          aria-pressed={value === theme.id}
        >
          {theme.label}
        </button>
      ))}
    </div>
  )
}
