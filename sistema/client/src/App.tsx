import { useEffect, useState } from 'react'
import './App.css'

type Alternative = {
  text: string
  isCorrect: boolean
}

type Question = {
  id: string
  statement: string
  alternatives: Alternative[]
}

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

      const response = await fetch('http://localhost:3001/questions')

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = (await response.json()) as Question[]
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

      const response = await fetch('http://localhost:3001/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statement,
          alternatives,
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const createdQuestion = (await response.json()) as Question
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

      const response = await fetch(`http://localhost:3001/questions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

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

      const response = await fetch(`http://localhost:3001/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statement: editStatement,
          alternatives: editAlternatives,
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const updatedQuestion = (await response.json()) as Question
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

      <ul>
        {questions.map((question) => (
          <li key={question.id}>
            {editingQuestionId === question.id ? (
              <form onSubmit={(event) => void handleEditSubmit(event, question.id)}>
                <h2>Edit Question</h2>

                <label htmlFor={`edit-statement-${question.id}`}>Statement</label>
                <input
                  id={`edit-statement-${question.id}`}
                  type="text"
                  value={editStatement}
                  onChange={(event) => setEditStatement(event.target.value)}
                />

                {editAlternatives.map((alternative, index) => (
                  <div key={`edit-alternative-${question.id}-${index}`}>
                    <label htmlFor={`edit-alternative-${question.id}-${index}`}>Alternative {index + 1}</label>
                    <input
                      id={`edit-alternative-${question.id}-${index}`}
                      type="text"
                      value={alternative.text}
                      onChange={(event) => updateEditAlternativeText(index, event.target.value)}
                    />

                    <label htmlFor={`edit-alternative-correct-${question.id}-${index}`}>Correct</label>
                    <input
                      id={`edit-alternative-correct-${question.id}-${index}`}
                      type="checkbox"
                      checked={alternative.isCorrect}
                      onChange={(event) => updateEditAlternativeCorrect(index, event.target.checked)}
                    />
                  </div>
                ))}

                <button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => cancelEditQuestion()}>
                  Cancel
                </button>

                {editValidationMessage && <p>{editValidationMessage}</p>}
              </form>
            ) : (
              <>
                <h2>{question.statement}</h2>
                <button type="button" onClick={() => startEditQuestion(question)}>
                  Edit
                </button>
                <button type="button" onClick={() => void handleRemoveQuestion(question.id)}>
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

      {removeErrorMessage && <p>{removeErrorMessage}</p>}
    </main>
  )
}

export default App
