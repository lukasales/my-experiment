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
}: ExamListProps) {
  if (loading) {
    return <p>Loading exams...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div>
      <h1>Exams</h1>
      {exams.length === 0 ? (
        <p>No exams available.</p>
      ) : (
        <ul>
          {exams.map((exam) => (
            <li key={exam.id}>
              <h2>{exam.title}</h2>
              <p>Answer Mode: {exam.answerMode}</p>
              <p>Question IDs: {exam.questionIds.length > 0 ? exam.questionIds.join(', ') : 'None linked'}</p>

              {editingExamId === exam.id ? (
                <>
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
                    <div key={`${exam.id}-${question.id}`}>
                      <label htmlFor={`exam-${exam.id}-question-${question.id}`}>{question.statement}</label>
                      <input
                        id={`exam-${exam.id}-question-${question.id}`}
                        type='checkbox'
                        checked={selectedQuestionIds.includes(question.id)}
                        onChange={(event) => onToggleQuestion(question.id, event.target.checked)}
                      />
                    </div>
                  ))}

                  <button type='button' onClick={() => onSaveQuestionLinks(exam.id)} disabled={linkSubmitting}>
                    {linkSubmitting ? 'Saving...' : 'Save Linked Questions'}
                  </button>
                  <button type='button' onClick={onCancelLink}>
                    Cancel
                  </button>

                  {linkValidationMessage && <p>{linkValidationMessage}</p>}
                </>
              ) : (
                <>
                  <button type='button' onClick={() => onStartLink(exam)}>
                    Edit
                  </button>
                  <button type='button' onClick={() => onRemoveExam(exam.id)}>
                    Remove
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
