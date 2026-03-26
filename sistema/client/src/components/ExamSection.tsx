import { useEffect, useState } from 'react'
import {
  createExam,
  deleteExam,
  downloadAnswerKeyCsv,
  downloadBatchExamZip,
  downloadSingleExamPdf,
  getFinalGradingReport,
  getExams,
  importAnswerKeyCsv,
  importStudentResponsesCsv,
  runStrictGrading,
  runLenientGrading,
  type FinalGradingReport,
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
  const [reportMode, setReportMode] = useState<'strict' | 'lenient'>('strict')
  const [finalReport, setFinalReport] = useState<FinalGradingReport | null>(null)
  const [reportErrorMessage, setReportErrorMessage] = useState<string | null>(null)
  const [answerKeyContent, setAnswerKeyContent] = useState<string>('')
  const [studentResponsesContent, setStudentResponsesContent] = useState<string>('')
  const [gradingMessage, setGradingMessage] = useState<string | null>(null)
  const [gradingSubmitting, setGradingSubmitting] = useState(false)
  const [gradingHasRun, setGradingHasRun] = useState(false)

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

  const handleImportAnswerKey = async () => {
    if (answerKeyContent.trim().length === 0) {
      setGradingMessage('Please provide answer-key CSV content.')
      return
    }

    try {
      setGradingSubmitting(true)
      setGradingMessage(null)
      await importAnswerKeyCsv(answerKeyContent)
      setGradingMessage('Answer key imported successfully.')
    } catch {
      setGradingMessage('Unable to import answer key CSV.')
    } finally {
      setGradingSubmitting(false)
    }
  }

  const handleImportStudentResponses = async () => {
    if (studentResponsesContent.trim().length === 0) {
      setGradingMessage('Please provide student responses CSV content.')
      return
    }

    try {
      setGradingSubmitting(true)
      setGradingMessage(null)
      await importStudentResponsesCsv(studentResponsesContent)
      setGradingMessage('Student responses imported successfully.')
    } catch {
      setGradingMessage('Unable to import student responses CSV.')
    } finally {
      setGradingSubmitting(false)
    }
  }

  const handleRunGrading = async (mode: 'strict' | 'lenient') => {
    try {
      setGradingSubmitting(true)
      setGradingMessage(null)
      if (mode === 'strict') {
        await runStrictGrading()
      } else {
        await runLenientGrading()
      }
      setGradingHasRun(true)
      setGradingMessage(`${mode.charAt(0).toUpperCase() + mode.slice(1)} grading completed successfully.`)
    } catch {
      setGradingMessage(`Unable to run ${mode} grading.`)
    } finally {
      setGradingSubmitting(false)
    }
  }

  const handleGenerateFinalReport = async () => {
    if (!gradingHasRun) {
      setReportErrorMessage('Please run grading before generating the report.')
      return
    }

    try {
      setReportErrorMessage(null)
      const report = await getFinalGradingReport(reportMode)
      setFinalReport(report)
    } catch {
      setReportErrorMessage('Unable to generate final grading report. Run grading first.')
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

      <section>
        <h2>Grading Workflow</h2>

        <div>
          <h3>Step 1: Import Answer Key</h3>
          <label htmlFor='answer-key-content'>Answer Key CSV (paste content below)</label>
          <textarea
            id='answer-key-content'
            value={answerKeyContent}
            onChange={(event) => setAnswerKeyContent(event.target.value)}
            rows={4}
            placeholder='examNumber,q1,q2,q3,...'
          />
          <button
            type='button'
            onClick={handleImportAnswerKey}
            disabled={gradingSubmitting}
          >
            {gradingSubmitting ? 'Importing...' : 'Import Answer Key'}
          </button>
        </div>

        <div>
          <h3>Step 2: Import Student Responses</h3>
          <label htmlFor='student-responses-content'>Student Responses CSV (paste content below)</label>
          <textarea
            id='student-responses-content'
            value={studentResponsesContent}
            onChange={(event) => setStudentResponsesContent(event.target.value)}
            rows={4}
            placeholder='studentId,examNumber,q1,q2,q3,...'
          />
          <button
            type='button'
            onClick={handleImportStudentResponses}
            disabled={gradingSubmitting}
          >
            {gradingSubmitting ? 'Importing...' : 'Import Student Responses'}
          </button>
        </div>

        <div>
          <h3>Step 3: Run Grading</h3>
          <label htmlFor='grading-mode'>Grading mode</label>
          <select
            id='grading-mode'
            value={reportMode}
            onChange={(event) => setReportMode(event.target.value as 'strict' | 'lenient')}
          >
            <option value='strict'>Strict (all-or-nothing)</option>
            <option value='lenient'>Lenient (proportional)</option>
          </select>
          <button
            type='button'
            onClick={() => handleRunGrading(reportMode)}
            disabled={gradingSubmitting}
          >
            {gradingSubmitting ? 'Running...' : 'Run Grading'}
          </button>
        </div>

        {gradingMessage && <p><strong>Grading:</strong> {gradingMessage}</p>}

        <div>
          <h3>Step 4: Generate Final Report</h3>
          <button
            type='button'
            onClick={handleGenerateFinalReport}
            disabled={!gradingHasRun}
          >
            Generate Final Report
          </button>
          {!gradingHasRun && <p><em>Run grading first to enable report generation.</em></p>}
        </div>

        {reportErrorMessage && <p><strong>Report Error:</strong> {reportErrorMessage}</p>}

        {finalReport && (
          <div>
            <p><strong>Mode:</strong> {finalReport.gradingMode}</p>
            <p><strong>Generated At:</strong> {finalReport.generatedAt}</p>
            <ul>
              {finalReport.students.map((student) => (
                <li key={`${student.studentId}-${student.examNumber}`}>
                  {student.studentId} | Exam {student.examNumber} | Score {student.score} / {student.totalQuestions}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </section>
  )
}