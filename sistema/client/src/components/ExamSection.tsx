import { useEffect, useState } from 'react'
import {
  createExam,
  deleteExam,
  downloadAnswerKeyCsv,
  downloadBatchExamZip,
  downloadSingleExamPdf,
  getExams,
  updateExam,
} from '../services/exams'
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
  const [editTitle, setEditTitle] = useState('')
  const [editAnswerMode, setEditAnswerMode] = useState<AnswerMode>('letters')
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
  const [linkValidationMessage, setLinkValidationMessage] = useState<string | null>(null)
  const [linkSubmitting, setLinkSubmitting] = useState(false)
  const [removeErrorMessage, setRemoveErrorMessage] = useState<string | null>(null)
  const [generationErrorMessage, setGenerationErrorMessage] = useState<string | null>(null)
  const [batchCountByExamId, setBatchCountByExamId] = useState<Record<string, string>>({})

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

  const fetchQuestions = async (): Promise<Question[]> => {
    try {
      const data = await getQuestions()
      setQuestions(data)
      return data
    } catch {
      setQuestions([])
      return []
    }
  }

  useEffect(() => {
    void fetchExams()
  }, [])

  useEffect(() => {
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

  const handleStartLink = async (exam: Exam) => {
    const latestQuestions = await fetchQuestions()
    const existingQuestionIds = new Set(latestQuestions.map((question) => question.id))
    const filteredQuestionIds = exam.questionIds.filter((questionId) => existingQuestionIds.has(questionId))

    setEditingExamId(exam.id)
    setEditTitle(exam.title)
    setEditAnswerMode(exam.answerMode)
    setSelectedQuestionIds(filteredQuestionIds)
    setLinkValidationMessage(null)
  }

  const handleCancelLink = () => {
    setEditingExamId(null)
    setEditTitle('')
    setEditAnswerMode('letters')
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
    if (editTitle.trim().length === 0) {
      setLinkValidationMessage('Please fill in all required fields.')
      return
    }

    try {
      setLinkSubmitting(true)
      setLinkValidationMessage(null)

      const updatedExam = await updateExam(examId, {
        title: editTitle,
        answerMode: editAnswerMode,
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

  const handleRemoveExam = async (examId: string) => {
    try {
      setRemoveErrorMessage(null)
      await deleteExam(examId)

      setExams((previous) => previous.filter((exam) => exam.id !== examId))

      if (editingExamId === examId) {
        handleCancelLink()
      }
    } catch {
      setRemoveErrorMessage('Unable to remove exam.')
    }
  }

  const handleBatchCountChange = (examId: string, value: string) => {
    setBatchCountByExamId((previous) => ({
      ...previous,
      [examId]: value,
    }))
  }

  const handleDownloadSinglePdf = async (examId: string) => {
    try {
      setGenerationErrorMessage(null)
      await downloadSingleExamPdf(examId)
    } catch {
      setGenerationErrorMessage('Unable to download single PDF.')
    }
  }

  const handleDownloadBatchZip = async (examId: string, count: number) => {
    if (!Number.isInteger(count) || count < 1) {
      setGenerationErrorMessage('Batch count must be a positive integer.')
      return
    }

    try {
      setGenerationErrorMessage(null)
      await downloadBatchExamZip(examId, count)
    } catch {
      setGenerationErrorMessage('Unable to download batch ZIP.')
    }
  }

  const handleDownloadAnswerKeyCsv = async (examId: string) => {
    try {
      setGenerationErrorMessage(null)
      await downloadAnswerKeyCsv(examId)
    } catch {
      setGenerationErrorMessage('Unable to download answer-key CSV. Generate a batch first.')
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
        editTitle={editTitle}
        editAnswerMode={editAnswerMode}
        selectedQuestionIds={selectedQuestionIds}
        linkValidationMessage={linkValidationMessage}
        linkSubmitting={linkSubmitting}
        onStartLink={handleStartLink}
        onCancelLink={handleCancelLink}
        onEditTitleChange={setEditTitle}
        onEditAnswerModeChange={setEditAnswerMode}
        onToggleQuestion={handleToggleQuestion}
        onSaveQuestionLinks={handleSaveQuestionLinks}
        onRemoveExam={handleRemoveExam}
        onDownloadSinglePdf={handleDownloadSinglePdf}
        onDownloadBatchZip={handleDownloadBatchZip}
        onDownloadAnswerKeyCsv={handleDownloadAnswerKeyCsv}
        batchCountByExamId={batchCountByExamId}
        onBatchCountChange={handleBatchCountChange}
      />

      {removeErrorMessage && <p>{removeErrorMessage}</p>}
      {generationErrorMessage && <p>{generationErrorMessage}</p>}
    </section>
  )
}