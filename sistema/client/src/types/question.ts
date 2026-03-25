export type Alternative = {
  text: string
  isCorrect: boolean
}

export type Question = {
  id: string
  statement: string
  alternatives: Alternative[]
}

export type QuestionInput = {
  statement: string
  alternatives: Alternative[]
}