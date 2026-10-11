/**
 * Escolhe texto preto ou branco conforme a cor de fundo (luminância WCAG).
 * Assim um lado amarelo ganha texto preto e um lado vermelho ganha texto branco,
 * sem você precisar mexer no código ao trocar as cores no banco.
 */
export function readableText(hex: string): '#000000' | '#ffffff' {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const L = 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255)
  return L > 0.4 ? '#000000' : '#ffffff'
}
