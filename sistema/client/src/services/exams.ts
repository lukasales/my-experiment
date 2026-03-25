import type { CreateExamPayload, Exam } from '../types/exam'

const EXAMS_API_URL = 'http://localhost:3001/exams'

export const getExams = async (): Promise<Exam[]> => {
  const response = await fetch(EXAMS_API_URL)

  if (!response.ok) {
    throw new Error('Request failed')
  }

  return (await response.json()) as Exam[]
}

export const createExam = async (payload: CreateExamPayload): Promise<Exam> => {
  const response = await fetch(EXAMS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }

  return (await response.json()) as Exam
}
