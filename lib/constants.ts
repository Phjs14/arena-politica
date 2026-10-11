// As 27 UFs com posição no "tile grid map" (cartograma) do Brasil.
// col/row definem onde o estado aparece no SVG. Para trocar por um mapa
// geográfico real, basta substituir o <rect> por <path d="..."> mantendo o id = uf.
export const UFS = [
  { uf: 'RR', name: 'Roraima', col: 3, row: 0 },
  { uf: 'AP', name: 'Amapá', col: 5, row: 0 },
  { uf: 'AM', name: 'Amazonas', col: 2, row: 1 },
  { uf: 'PA', name: 'Pará', col: 4, row: 1 },
  { uf: 'MA', name: 'Maranhão', col: 5, row: 1 },
  { uf: 'CE', name: 'Ceará', col: 6, row: 1 },
  { uf: 'RN', name: 'Rio Grande do Norte', col: 7, row: 1 },
  { uf: 'AC', name: 'Acre', col: 1, row: 2 },
  { uf: 'RO', name: 'Rondônia', col: 2, row: 2 },
  { uf: 'TO', name: 'Tocantins', col: 4, row: 2 },
  { uf: 'PI', name: 'Piauí', col: 5, row: 2 },
  { uf: 'PE', name: 'Pernambuco', col: 6, row: 2 },
  { uf: 'PB', name: 'Paraíba', col: 7, row: 2 },
  { uf: 'MT', name: 'Mato Grosso', col: 3, row: 3 },
  { uf: 'GO', name: 'Goiás', col: 4, row: 3 },
  { uf: 'BA', name: 'Bahia', col: 5, row: 3 },
  { uf: 'SE', name: 'Sergipe', col: 6, row: 3 },
  { uf: 'AL', name: 'Alagoas', col: 7, row: 3 },
  { uf: 'MS', name: 'Mato Grosso do Sul', col: 3, row: 4 },
  { uf: 'DF', name: 'Distrito Federal', col: 4, row: 4 },
  { uf: 'MG', name: 'Minas Gerais', col: 5, row: 4 },
  { uf: 'ES', name: 'Espírito Santo', col: 6, row: 4 },
  { uf: 'SP', name: 'São Paulo', col: 4, row: 5 },
  { uf: 'RJ', name: 'Rio de Janeiro', col: 5, row: 5 },
  { uf: 'PR', name: 'Paraná', col: 4, row: 6 },
  { uf: 'SC', name: 'Santa Catarina', col: 4, row: 7 },
  { uf: 'RS', name: 'Rio Grande do Sul', col: 4, row: 8 },
] as const

export const UF_SET = new Set<string>(UFS.map((u) => u.uf))
export const UF_NAME: Record<string, string> = Object.fromEntries(UFS.map((u) => [u.uf, u.name]))
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
