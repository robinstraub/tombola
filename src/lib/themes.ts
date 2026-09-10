export type ThemeId = 'spirit' | 'poster'

export interface ThemeMeta {
  id: ThemeId
  /** Short label shown in the theme switcher. */
  label: string
  /** One-line description for the tooltip / promo. */
  hint: string
  /** Confetti palette for this theme. */
  confetti: string[]
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'spirit',
    label: 'Cerisiers',
    hint: 'Aquarelle onirique sous les cerisiers en fleurs',
    confetti: ['#ff5fb0', '#35e6e0', '#f0c06a', '#7a1f52', '#ffffff'],
  },
  {
    id: 'poster',
    label: 'Affiche JPV',
    hint: 'Rouge & or, dans l’esprit de l’affiche',
    confetti: ['#e4342b', '#f0c040', '#ffffff', '#8a1414', '#f8e6b0'],
  },
]

export const DEFAULT_THEME: ThemeId = 'spirit'

export function confettiColorsFor(id: ThemeId): string[] {
  return (THEMES.find((t) => t.id === id) ?? THEMES[0]).confetti
}
