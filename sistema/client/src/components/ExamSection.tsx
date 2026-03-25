import { useEffect, useState } from 'react'
import { createExam, getExams, updateExam } from '../services/exams'
import { getQuestions } from '../services/questions'
import type { AnswerMode, Exam } from '../types/exam'
import type { Question } from '../types/question'
import { ExamList } from './ExamList'

export function ExamSection() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [title, setTitle] = useState('')
  const [answerMode, setAnswerMode] = useState<AnswerMode>('letters')
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
  const [linkValidationMessage, setLinkValidationMessage] = useState<string | null>(null)
  const [linkSubmitting, setLinkSubmitting] = useState(false)

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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions()
        setQuestions(data)
      } catch {
        setQuestions([])
      }
    }

    void fetchQuestions()
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

  const handleStartLink = (exam: Exam) => {
    setEditingExamId(exam.id)
    setSelectedQuestionIds(exam.questionIds)
    setLinkValidationMessage(null)
  }

  const handleCancelLink = () => {
    setEditingExamId(null)
    setSelectedQuestionIds([])
    setLinkValidationMessage(null)
  }

  const handleToggleQuestion = (questionId: string, checked: boolean) => {
    setSelectedQuestionIds((previous) => {
      if (checked) {
        return previous.includes(questionId) ? previous : [...previous, questionId]
      }

      return previous.filter((id) => id !== questionId)
    })
  }

  const handleSaveQuestionLinks = async (examId: string) => {
    if (selectedQuestionIds.length === 0) {
      setLinkValidationMessage('Please select at least one question.')
      return
    }

    try {
      setLinkSubmitting(true)
      setLinkValidationMessage(null)

      const updatedExam = await updateExam(examId, {
        questionIds: selectedQuestionIds,
      })

      setExams((previous) => previous.map((exam) => (exam.id === examId ? updatedExam : exam)))
      handleCancelLink()
    } catch {
      setLinkValidationMessage('Could not save question selection. Please try again.')
    } finally {
      setLinkSubmitting(false)
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

      <ExamList
        exams={exams}
        questions={questions}
        loading={loading}
        error={error}
        editingExamId={editingExamId}
        selectedQuestionIds={selectedQuestionIds}
        linkValidationMessage={linkValidationMessage}
        linkSubmitting={linkSubmitting}
        onStartLink={handleStartLink}
        onCancelLink={handleCancelLink}
        onToggleQuestion={handleToggleQuestion}
        onSaveQuestionLinks={handleSaveQuestionLinks}
      />
    </section>
  )
}