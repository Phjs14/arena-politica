// Ensina o TypeScript a "enxergar" o pacote do mapa (ele não traz tipos próprios).
declare module '@svg-maps/brazil' {
  const map: {
    label: string
    viewBox: string
    locations: { id: string; name: string; path: string }[]
  }
  export default map
}
