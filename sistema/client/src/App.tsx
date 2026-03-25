import { useEffect, useState } from 'react'
import './App.css'
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

    if (missingRequiredData) {
      setValidationMessage('Please fill in the statement and all four alternatives.')
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

    if (missingRequiredData) {
      setEditValidationMessage('Please fill in the statement and all four alternatives.')
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

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <main>
      <h1>Closed Questions</h1>

      <form onSubmit={handleSubmit}>
        <h2>Create Question</h2>

        <label htmlFor="statement">Statement</label>
        <input
          id="statement"
          type="text"
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
        />

        {alternatives.map((alternative, index) => (
          <div key={`new-alternative-${index}`}>
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

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Question'}
        </button>

        {validationMessage && <p>{validationMessage}</p>}
      </form>

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

      {removeErrorMessage && <p>{removeErrorMessage}</p>}
    </main>
  )
}

export default App
