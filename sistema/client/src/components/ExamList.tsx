import type { Exam } from '../types/exam'
import type { Question } from '../types/question'

type ExamListProps = {
  exams: Exam[]
  questions: Question[]
  loading: boolean
  error: string | null
  editingExamId: string | null
  selectedQuestionIds: string[]
  linkValidationMessage: string | null
  linkSubmitting: boolean
  onStartLink: (exam: Exam) => void
  onCancelLink: () => void
  onToggleQuestion: (questionId: string, checked: boolean) => void
  onSaveQuestionLinks: (examId: string) => void
}

export function ExamList({
  exams,
  questions,
  loading,
  error,
  editingExamId,
  selectedQuestionIds,
  linkValidationMessage,
  linkSubmitting,
  onStartLink,
  onCancelLink,
  onToggleQuestion,
  onSaveQuestionLinks,
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
                  <h3>Link Questions</h3>
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
                <button type='button' onClick={() => onStartLink(exam)}>
                  Link Questions
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
