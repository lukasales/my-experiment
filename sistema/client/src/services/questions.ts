import type { Question, QuestionInput } from '../types/question'

const QUESTIONS_API_URL = 'http://localhost:3001/questions'

export const getQuestions = async (): Promise<Question[]> => {
  const response = await fetch(QUESTIONS_API_URL)

  if (!response.ok) {
    throw new Error('Request failed')
  }

  return (await response.json()) as Question[]
}

export const createQuestion = async (input: QuestionInput): Promise<Question> => {
  const response = await fetch(QUESTIONS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }

  return (await response.json()) as Question
}

export const updateQuestion = async (id: string, input: QuestionInput): Promise<Question> => {
  const response = await fetch(`${QUESTIONS_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }

  return (await response.json()) as Question
}

export const deleteQuestion = async (id: string): Promise<void> => {
  const response = await fetch(`${QUESTIONS_API_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }
}