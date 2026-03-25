import { useEffect, useState } from 'react'
import { getExams } from '../services/exams'
import type { Exam } from '../types/exam'
import { ExamList } from './ExamList'

export function ExamSection() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

    void fetchExams()
  }, [])

  return <ExamList exams={exams} loading={loading} error={error} />
}