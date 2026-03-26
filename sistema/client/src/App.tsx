import { useEffect, useState } from 'react'
import './App.css'
import { ExamSection } from './components/ExamSection'
import { QuestionList } from './components/QuestionList'
import { createQuestion, deleteQuestion, getQuestions, updateQuestion } from './services/questions'
import type { Alternative, Question } from './types/question'

function App() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statement, setStatement] = useState('')
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [removeErrorMessage, setRemoveErrorMessage] = useState<string | null>(null)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editStatement, setEditStatement] = useState('')
  const [editAlternatives, setEditAlternatives] = useState<Alternative[]>([])
  const [editValidationMessage, setEditValidationMessage] = useState<string | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getQuestions()
      setQuestions(data)
    } catch {
      setError('Failed to load questions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchQuestions()
  }, [])

  const updateAlternativeText = (index: number, text: string) => {
    setAlternatives((previous) =>
      previous.map((alternative, currentIndex) =>
        currentIndex === index ? { ...alternative, text } : alternative,
      ),
    )
  }

  const updateAlternativeCorrect = (index: number, isCorrect: boolean) => {
    setAlternatives((previous) =>
      previous.map((alternative, currentIndex) =>
        currentIndex === index ? { ...alternative, isCorrect } : alternative,
      ),
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const missingRequiredData =
      statement.trim().length === 0 || alternatives.some((alternative) => alternative.text.trim().length === 0)
    const hasAtLeastOneCorrectAlternative = alternatives.some((alternative) => alternative.isCorrect)

    if (missingRequiredData) {
      setValidationMessage('Please fill in the statement and all four alternatives.')
      return
    }

    if (!hasAtLeastOneCorrectAlternative) {
      setValidationMessage('Please mark at least one correct alternative.')
      return
    }

    try {
      setSubmitting(true)
      setValidationMessage(null)

      const createdQuestion = await createQuestion({
        statement,
        alternatives,
      })
      setQuestions((previous) => [...previous, createdQuestion])
      setStatement('')
      setAlternatives([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ])
    } catch {
      setValidationMessage('Could not create question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveQuestion = async (id: string) => {
    try {
      setRemoveErrorMessage(null)

      await deleteQuestion(id)

      setQuestions((previous) => previous.filter((question) => question.id !== id))
    } catch {
      setRemoveErrorMessage('Unable to remove question.')
    }
  }

  const startEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id)
    setEditStatement(question.statement)
    setEditAlternatives([...question.alternatives])
    setEditValidationMessage(null)
  }

  const cancelEditQuestion = () => {
    setEditingQuestionId(null)
    setEditStatement('')
    setEditAlternatives([])
    setEditValidationMessage(null)
  }

  const updateEditAlternativeText = (index: number, text: string) => {
    setEditAlternatives((previous) =>
      previous.map((alternative, currentIndex) =>
        currentIndex === index ? { ...alternative, text } : alternative,
      ),
    )
  }

  const updateEditAlternativeCorrect = (index: number, isCorrect: boolean) => {
    setEditAlternatives((previous) =>
      previous.map((alternative, currentIndex) =>
        currentIndex === index ? { ...alternative, isCorrect } : alternative,
      ),
    )
  }

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>, questionId: string) => {
    event.preventDefault()

    const missingRequiredData =
      editStatement.trim().length === 0 || editAlternatives.some((alternative) => alternative.text.trim().length === 0)
    const hasAtLeastOneCorrectAlternative = editAlternatives.some((alternative) => alternative.isCorrect)

    if (missingRequiredData) {
      setEditValidationMessage('Please fill in the statement and all four alternatives.')
      return
    }

    if (!hasAtLeastOneCorrectAlternative) {
      setEditValidationMessage('Please mark at least one correct alternative.')
      return
    }

    try {
      setEditSubmitting(true)
      setEditValidationMessage(null)

      const updatedQuestion = await updateQuestion(questionId, {
        statement: editStatement,
        alternatives: editAlternatives,
      })
      setQuestions((previous) =>
        previous.map((question) => (question.id === questionId ? updatedQuestion : question)),
      )
      cancelEditQuestion()
    } catch {
      setEditValidationMessage('Could not update question. Please try again.')
    } finally {
      setEditSubmitting(false)
    }
  }

  return (
    <main className="page-shell">
      <ExamSection questionSyncKey={questions.length} />

      <section className="panel section-gap">
        <h1 className="section-title">Closed Questions</h1>

        {loading ? (
          <p className="status-message">Loading...</p>
        ) : error ? (
          <p className="status-message status-error">{error}</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="panel section-gap form-grid">
              <h2 className="subsection-title">Create Question</h2>

              <label htmlFor="statement">Statement</label>
              <input
                id="statement"
                type="text"
                value={statement}
                onChange={(event) => setStatement(event.target.value)}
              />

              {alternatives.map((alternative, index) => (
                <div key={`new-alternative-${index}`} className="field-row">
                  <label htmlFor={`alternative-${index}`}>Alternative {index + 1}</label>
                  <input
                    id={`alternative-${index}`}
                    type="text"
                    value={alternative.text}
                    onChange={(event) => updateAlternativeText(index, event.target.value)}
                  />

                  <label htmlFor={`alternative-correct-${index}`}>Correct</label>
                  <input
                    id={`alternative-correct-${index}`}
                    type="checkbox"
                    checked={alternative.isCorrect}
                    onChange={(event) => updateAlternativeCorrect(index, event.target.checked)}
                  />
                </div>
              ))}

              <div className="button-row">
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Question'}
                </button>
              </div>

              {validationMessage && <p className="status-message status-error">{validationMessage}</p>}
            </form>

            <section className="panel section-gap">
              <h2 className="subsection-title">Question List</h2>
              <QuestionList
                questions={questions}
                editingQuestionId={editingQuestionId}
                editStatement={editStatement}
                editAlternatives={editAlternatives}
                editValidationMessage={editValidationMessage}
                editSubmitting={editSubmitting}
                onStartEdit={startEditQuestion}
                onCancelEdit={cancelEditQuestion}
                onEditStatementChange={setEditStatement}
                onEditAlternativeTextChange={updateEditAlternativeText}
                onEditAlternativeCorrectChange={updateEditAlternativeCorrect}
                onEditSubmit={(event, questionId) => void handleEditSubmit(event, questionId)}
                onRemoveQuestion={(questionId) => void handleRemoveQuestion(questionId)}
              />
            </section>

            {removeErrorMessage && <p className="status-message status-error">{removeErrorMessage}</p>}
          </>
        )}
      </section>
    </main>
  )
}

export default App
