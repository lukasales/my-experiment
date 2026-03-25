import type { Exam } from '../types/exam'

type ExamListProps = {
  exams: Exam[]
  loading: boolean
  error: string | null
}

export function ExamList({ exams, loading, error }: ExamListProps) {
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
