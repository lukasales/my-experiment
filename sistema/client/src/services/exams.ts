import type { CreateExamPayload, Exam, UpdateExamPayload } from '../types/exam'
import { buildApiUrl } from './api'

const EXAMS_API_URL = buildApiUrl('exams')
const GRADING_API_URL = buildApiUrl('grading')

export type FinalGradingReport = {
  gradingMode: 'strict' | 'lenient'
  generatedAt: string
  students: Array<{
    studentId: string
    examNumber: number
    score: number
    totalQuestions: number
  }>
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

const extractFilename = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) {
    return fallback
  }

  const match = contentDisposition.match(/filename="?([^\";]+)"?/i)
  return match?.[1] ?? fallback
}

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

export const updateExam = async (id: string, payload: UpdateExamPayload): Promise<Exam> => {
  const response = await fetch(`${EXAMS_API_URL}/${id}`, {
    method: 'PUT',
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

export const deleteExam = async (id: string): Promise<void> => {
  const response = await fetch(`${EXAMS_API_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }
}

export const downloadSingleExamPdf = async (id: string): Promise<void> => {
  const response = await fetch(`${EXAMS_API_URL}/${id}/pdf`)

  if (!response.ok) {
    throw new Error('Request failed')
  }

  const blob = await response.blob()
  const fileName = extractFilename(response.headers.get('Content-Disposition'), `${id}.pdf`)
  downloadBlob(blob, fileName)
}

export const downloadBatchExamZip = async (id: string, count: number): Promise<void> => {
  const response = await fetch(`${EXAMS_API_URL}/${id}/pdf/batch?count=${count}`)

  if (!response.ok) {
    throw new Error('Request failed')
  }

  const blob = await response.blob()
  const fileName = extractFilename(
    response.headers.get('Content-Disposition'),
    `${id}_batch.zip`,
  )
  downloadBlob(blob, fileName)
}

export const downloadAnswerKeyCsv = async (id: string): Promise<void> => {
  const response = await fetch(`${EXAMS_API_URL}/${id}/pdf/batch/answer-key.csv`)

  if (!response.ok) {
    throw new Error('Request failed')
  }

  const blob = await response.blob()
  const fileName = extractFilename(
    response.headers.get('Content-Disposition'),
    `${id}_answer_key.csv`,
  )
  downloadBlob(blob, fileName)
}

export const importAnswerKeyCsv = async (csvContent: string): Promise<void> => {
  const response = await fetch(`${GRADING_API_URL}/answer-key/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ csvContent }),
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }
}

export const importStudentResponsesCsv = async (csvContent: string): Promise<void> => {
  const response = await fetch(`${GRADING_API_URL}/student-responses/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ csvContent }),
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }
}

export const runStrictGrading = async (): Promise<void> => {
  const response = await fetch(`${GRADING_API_URL}/run/strict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }
}

export const runLenientGrading = async (): Promise<void> => {
  const response = await fetch(`${GRADING_API_URL}/run/lenient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Request failed')
  }
}

export const getFinalGradingReport = async (
  mode?: 'strict' | 'lenient',
): Promise<FinalGradingReport> => {
  const url = mode
    ? `${GRADING_API_URL}/report/final?mode=${mode}`
    : `${GRADING_API_URL}/report/final`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Request failed')
  }

  return (await response.json()) as FinalGradingReport
}
