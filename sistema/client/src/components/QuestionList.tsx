import type { FormEvent } from 'react'
import type { Alternative, Question } from '../types/question'

type QuestionListProps = {
  questions: Question[]
  editingQuestionId: string | null
  editStatement: string
  editAlternatives: Alternative[]
  editValidationMessage: string | null
  editSubmitting: boolean
  onStartEdit: (question: Question) => void
  onCancelEdit: () => void
  onEditStatementChange: (value: string) => void
  onEditAlternativeTextChange: (index: number, text: string) => void
  onEditAlternativeCorrectChange: (index: number, isCorrect: boolean) => void
  onEditSubmit: (event: FormEvent<HTMLFormElement>, questionId: string) => void
  onRemoveQuestion: (questionId: string) => void
}

export function QuestionList({
  questions,
  editingQuestionId,
  editStatement,
  editAlternatives,
  editValidationMessage,
  editSubmitting,
  onStartEdit,
  onCancelEdit,
  onEditStatementChange,
  onEditAlternativeTextChange,
  onEditAlternativeCorrectChange,
  onEditSubmit,
  onRemoveQuestion,
}: QuestionListProps) {
  return (
    <ul>
      {questions.map((question) => (
        <li key={question.id}>
          {editingQuestionId === question.id ? (
            <form onSubmit={(event) => onEditSubmit(event, question.id)}>
              <h2>Edit Question</h2>

              <label htmlFor={`edit-statement-${question.id}`}>Statement</label>
              <input
                id={`edit-statement-${question.id}`}
                type="text"
                value={editStatement}
                onChange={(event) => onEditStatementChange(event.target.value)}
              />

              {editAlternatives.map((alternative, index) => (
                <div key={`edit-alternative-${question.id}-${index}`}>
                  <label htmlFor={`edit-alternative-${question.id}-${index}`}>Alternative {index + 1}</label>
                  <input
                    id={`edit-alternative-${question.id}-${index}`}
                    type="text"
                    value={alternative.text}
                    onChange={(event) => onEditAlternativeTextChange(index, event.target.value)}
                  />

                  <label htmlFor={`edit-alternative-correct-${question.id}-${index}`}>Correct</label>
                  <input
                    id={`edit-alternative-correct-${question.id}-${index}`}
                    type="checkbox"
                    checked={alternative.isCorrect}
                    onChange={(event) => onEditAlternativeCorrectChange(index, event.target.checked)}
                  />
                </div>
              ))}

              <button type="submit" disabled={editSubmitting}>
                {editSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={onCancelEdit}>
                Cancel
              </button>

              {editValidationMessage && <p>{editValidationMessage}</p>}
            </form>
          ) : (
            <>
              <h2>{question.statement}</h2>
              <button type="button" onClick={() => onStartEdit(question)}>
                Edit
              </button>
              <button type="button" onClick={() => onRemoveQuestion(question.id)}>
                Remove
              </button>

              <ul>
                {question.alternatives.map((alternative, index) => (
                  <li key={`${question.id}-${index}`}>{alternative.text}</li>
                ))}
              </ul>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}