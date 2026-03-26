import type { CreateExamPayload, Exam, UpdateExamPayload } from '../types/exam'

const EXAMS_API_URL = 'http://localhost:3001/exams'

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
