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

  useEffect(() => {
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

    void fetchQuestions()
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <main>
      <h1>Closed Questions</h1>

      <ul>
        {questions.map((question) => (
          <li key={question.id}>
            <h2>{question.statement}</h2>

            <ul>
              {question.alternatives.map((alternative, index) => (
                <li key={`${question.id}-${index}`}>{alternative.text}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
