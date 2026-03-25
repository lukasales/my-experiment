import type { Exam } from '../types/exam'

const EXAMS_API_URL = 'http://localhost:3001/exams'

export const getExams = async (): Promise<Exam[]> => {
  const response = await fetch(EXAMS_API_URL)

  if (!response.ok) {
    throw new Error('Request failed')
  }

  return (await response.json()) as Exam[]
}
