import type { Exam } from '../types/exam'
import type { Question } from '../types/question'
import type { AnswerMode } from '../types/exam'

type ExamListProps = {
  exams: Exam[]
  questions: Question[]
  loading: boolean
  error: string | null
  editingExamId: string | null
  editTitle: string
  editAnswerMode: AnswerMode
  selectedQuestionIds: string[]
  linkValidationMessage: string | null
  linkSubmitting: boolean
  onStartLink: (exam: Exam) => void
  onCancelLink: () => void
  onEditTitleChange: (value: string) => void
  onEditAnswerModeChange: (value: AnswerMode) => void
  onToggleQuestion: (questionId: string, checked: boolean) => void
  onSaveQuestionLinks: (examId: string) => void
  onRemoveExam: (examId: string) => void
  onDownloadSinglePdf: (examId: string) => void
  onDownloadBatchZip: (examId: string, count: number) => void
  onDownloadAnswerKeyCsv: (examId: string) => void
  batchCountByExamId: Record<string, string>
  onBatchCountChange: (examId: string, value: string) => void
}

export function ExamList({
  exams,
  questions,
  loading,
  error,
  editingExamId,
  editTitle,
  editAnswerMode,
  selectedQuestionIds,
  linkValidationMessage,
  linkSubmitting,
  onStartLink,
  onCancelLink,
  onEditTitleChange,
  onEditAnswerModeChange,
  onToggleQuestion,
  onSaveQuestionLinks,
  onRemoveExam,
  onDownloadSinglePdf,
  onDownloadBatchZip,
  onDownloadAnswerKeyCsv,
  batchCountByExamId,
  onBatchCountChange,
}: ExamListProps) {
  if (loading) {
    return <p className='status-message'>Loading exams...</p>
  }

  if (error) {
    return <p className='status-message status-error'>{error}</p>
  }

  return (
    <div className='section-gap'>
      {exams.length === 0 ? (
        <p className='status-message'>No exams available.</p>
      ) : (
        <ul className='card-list'>
          {exams.map((exam) => (
            <li key={exam.id} className='card-item section-gap'>
              <h3>{exam.title}</h3>
              <p>Answer Mode: {exam.answerMode}</p>
              <p>Question IDs: {exam.questionIds.length > 0 ? exam.questionIds.join(', ') : 'None linked'}</p>

              {editingExamId === exam.id ? (
                <div className='section-gap'>
                  <h3>Edit Exam</h3>

                  <label htmlFor={`edit-exam-title-${exam.id}`}>Title</label>
                  <input
                    id={`edit-exam-title-${exam.id}`}
                    type='text'
                    value={editTitle}
                    onChange={(event) => onEditTitleChange(event.target.value)}
                  />

                  <label htmlFor={`edit-exam-answer-mode-${exam.id}`}>Answer mode</label>
                  <select
                    id={`edit-exam-answer-mode-${exam.id}`}
                    value={editAnswerMode}
                    onChange={(event) => onEditAnswerModeChange(event.target.value as AnswerMode)}
                  >
                    <option value='letters'>letters</option>
                    <option value='powersOfTwo'>powersOfTwo</option>
                  </select>

                  <h4>Link Questions</h4>
                  {questions.map((question) => (
                    <div key={`${exam.id}-${question.id}`} className='checkbox-row'>
                      <label htmlFor={`exam-${exam.id}-question-${question.id}`}>{question.statement}</label>
                      <input
                        id={`exam-${exam.id}-question-${question.id}`}
                        type='checkbox'
                        checked={selectedQuestionIds.includes(question.id)}
                        onChange={(event) => onToggleQuestion(question.id, event.target.checked)}
                      />
                    </div>
                  ))}

                  <div className='button-row'>
                    <button type='button' onClick={() => onSaveQuestionLinks(exam.id)} disabled={linkSubmitting}>
                      {linkSubmitting ? 'Saving...' : 'Save Linked Questions'}
                    </button>
                    <button type='button' onClick={onCancelLink}>
                      Cancel
                    </button>
                  </div>

                  {linkValidationMessage && <p className='status-message status-error'>{linkValidationMessage}</p>}
                </div>
              ) : (
                <div className='section-gap'>
                  <div className='button-row'>
                    <button type='button' onClick={() => onStartLink(exam)}>
                      Edit
                    </button>
                    <button type='button' onClick={() => onRemoveExam(exam.id)}>
                      Remove
                    </button>
                    <button type='button' onClick={() => onDownloadSinglePdf(exam.id)}>
                      Download PDF
                    </button>
                  </div>

                  <div className='field-row'>
                    <label htmlFor={`batch-count-${exam.id}`}>Batch count</label>
                    <input
                      id={`batch-count-${exam.id}`}
                      type='number'
                      min={1}
                      value={batchCountByExamId[exam.id] ?? '1'}
                      onChange={(event) => onBatchCountChange(exam.id, event.target.value)}
                    />
                  </div>

                  <div className='button-row'>
                    <button
                      type='button'
                      onClick={() => onDownloadBatchZip(exam.id, Number(batchCountByExamId[exam.id] ?? '1'))}
                    >
                      Download Batch ZIP
                    </button>

                    <button type='button' onClick={() => onDownloadAnswerKeyCsv(exam.id)}>
                      Download Answer-Key CSV
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
