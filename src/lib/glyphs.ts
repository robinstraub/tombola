/**
 * Glyphs shown on the spinning reels. A mix of hiragana, katakana and a few
 * "real word" kanji so people who can read Japanese get a little wink — all in
 * the spirit of the trip: 旅 (trip), 桜 (cherry blossom), 道 (the "do" of dojo),
 * 福 (fortune), 勝 (victory)…
 */
export const REEL_GLYPHS: readonly string[] = [
  // Auspicious / theme kanji
  '福',
  '桜',
  '旅',
  '道',
  '勝',
  '運',
  '夢',
  '光',
  '心',
  '和',
  '力',
  '花',
  '春',
  '星',
  '祭',
  // Katakana
  'ア',
  'カ',
  'サ',
  'タ',
  'ナ',
  'ハ',
  'マ',
  'ヤ',
  'ラ',
  'ワ',
  // Hiragana
  'あ',
  'き',
  'さ',
  'つ',
  'の',
  'ほ',
  'ゆ',
  'ろ',
]

/** Short real Japanese words flashed subtly for readers, kana-annotated. */
export const THEME_WORDS: readonly { jp: string; romaji: string; fr: string }[] = [
  { jp: '大当たり', romaji: 'ōatari', fr: 'gros lot' },
  { jp: '幸運', romaji: 'kōun', fr: 'chance' },
  { jp: '当選', romaji: 'tōsen', fr: 'gagné' },
  { jp: 'おめでとう', romaji: 'omedetō', fr: 'félicitations' },
]

/** Deterministic pseudo-random glyph for a given cell, so reels look varied. */
export function glyphAt(seed: number): string {
  const index = Math.abs(Math.floor(seed)) % REEL_GLYPHS.length
  return REEL_GLYPHS[index]
}
