export type Side = 'A' | 'B'

export interface Duel {
  id: string
  slug: string
  title: string
  side_a_label: string
  side_b_label: string
  side_a_color: string
  side_b_color: string
}

export interface StateRow {
  state_uf: string
  votes_a: number
  votes_b: number
}

export interface QuizQuestionPublic {
  id: string
  statement: string
  options: string[]
  option_images: (string | null)[] | null // mesma ordem de options; null = sem foto
}

export interface AnswerResult {
  correct: boolean
  correctIndex: number
  explanation: string | null
  sourceLabel: string | null
  sourceUrl: string | null
}
