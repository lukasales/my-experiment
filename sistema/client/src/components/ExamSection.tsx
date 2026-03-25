import { useEffect, useState } from 'react'
import { createExam, getExams } from '../services/exams'
import type { AnswerMode, Exam } from '../types/exam'
import { ExamList } from './ExamList'

export function ExamSection() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [answerMode, setAnswerMode] = useState<AnswerMode>('letters')
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchExams = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getExams()
      setExams(data)
    } catch {
      setError('Failed to load exams.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchExams()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (title.trim().length === 0) {
      setValidationMessage('Please fill in all required fields.')
      return
    }

    try {
      setSubmitting(true)
      setValidationMessage(null)

      const createdExam = await createExam({
        title,
        answerMode,
      })

      setExams((previous) => [...previous, createdExam])
      setTitle('')
      setAnswerMode('letters')
    } catch {
      setValidationMessage('Could not create exam. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <h1>Create Exam</h1>

        <label htmlFor='exam-title'>Title</label>
        <input
          id='exam-title'
          type='text'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor='exam-answer-mode'>Answer mode</label>
        <select
          id='exam-answer-mode'
          value={answerMode}
          onChange={(event) => setAnswerMode(event.target.value as AnswerMode)}
        >
          <option value='letters'>letters</option>
          <option value='powersOfTwo'>powersOfTwo</option>
        </select>

        <button type='submit' disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Exam'}
        </button>

        {validationMessage && <p>{validationMessage}</p>}
      </form>

      <ExamList exams={exams} loading={loading} error={error} />
    </section>
  )
}