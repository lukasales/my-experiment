export type AnswerMode = 'letters' | 'powersOfTwo'

export type Exam = {
  id: string
  title: string
  answerMode: AnswerMode
}

export type CreateExamPayload = {
  title: string
  answerMode: AnswerMode
}
