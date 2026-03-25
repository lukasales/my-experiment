import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

type Alternative = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  statement: string;
  alternatives: Alternative[];
};

type AnswerMode = 'letters' | 'powersOfTwo';

type Exam = {
  id: string;
  title: string;
  answerMode: AnswerMode;
};

const questions: Question[] = [
  {
    id: 'q1',
    statement: 'What is 2 + 2?',
    alternatives: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
      { text: '5', isCorrect: false },
      { text: '22', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    statement: 'Which language is commonly used with React?',
    alternatives: [
      { text: 'TypeScript', isCorrect: true },
      { text: 'COBOL', isCorrect: false },
      { text: 'Fortran', isCorrect: false },
      { text: 'Pascal', isCorrect: false },
    ],
  },
];

const exams: Exam[] = [
  {
    id: 'exam-1',
    title: 'Example Exam',
    answerMode: 'letters',
  },
  {
    id: 'exam-2',
    title: 'Binary Practice Exam',
    answerMode: 'powersOfTwo',
  },
];

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/questions', (_req, res) => {
  res.json(questions);
});

app.get('/exams', (_req, res) => {
  res.json(exams);
});

app.post('/questions', (req, res) => {
  const { statement, alternatives } = req.body as {
    statement?: unknown;
    alternatives?: unknown;
  };

  const hasValidStatement =
    typeof statement === 'string' && statement.trim().length > 0;

  const hasValidAlternatives =
    Array.isArray(alternatives) &&
    alternatives.length === 4 &&
    alternatives.every(
      (alternative) =>
        typeof alternative === 'object' &&
        alternative !== null &&
        typeof (alternative as { text?: unknown }).text === 'string' &&
        (alternative as { text: string }).text.trim().length > 0 &&
        typeof (alternative as { isCorrect?: unknown }).isCorrect === 'boolean',
    );

  if (!hasValidStatement || !hasValidAlternatives) {
    res.status(400).json({
      message: 'Statement and 4 alternatives with text and correctness are required.',
    });
    return;
  }

  const question: Question = {
    id: `q${Date.now()}`,
    statement: statement.trim(),
    alternatives: alternatives.map((alternative) => ({
      text: (alternative as { text: string }).text.trim(),
      isCorrect: (alternative as { isCorrect: boolean }).isCorrect,
    })),
  };

  questions.push(question);
  res.status(201).json(question);
});

app.put('/questions/:id', (req, res) => {
  const { id } = req.params;
  const { statement, alternatives } = req.body as {
    statement?: unknown;
    alternatives?: unknown;
  };

  const hasValidStatement =
    typeof statement === 'string' && statement.trim().length > 0;

  const hasValidAlternatives =
    Array.isArray(alternatives) &&
    alternatives.length === 4 &&
    alternatives.every(
      (alternative) =>
        typeof alternative === 'object' &&
        alternative !== null &&
        typeof (alternative as { text?: unknown }).text === 'string' &&
        (alternative as { text: string }).text.trim().length > 0 &&
        typeof (alternative as { isCorrect?: unknown }).isCorrect === 'boolean',
    );

  if (!hasValidStatement || !hasValidAlternatives) {
    res.status(400).json({
      message: 'Statement and 4 alternatives with text and correctness are required.',
    });
    return;
  }

  const targetIndex = questions.findIndex((question) => question.id === id);

  if (targetIndex === -1) {
    res.status(404).json({ message: 'Unable to update question' });
    return;
  }

  const updatedQuestion: Question = {
    id,
    statement: statement.trim(),
    alternatives: alternatives.map((alternative) => ({
      text: (alternative as { text: string }).text.trim(),
      isCorrect: (alternative as { isCorrect: boolean }).isCorrect,
    })),
  };

  questions[targetIndex] = updatedQuestion;
  res.json(updatedQuestion);
});

app.delete('/questions/:id', (req, res) => {
  const { id } = req.params;
  const targetIndex = questions.findIndex((question) => question.id === id);

  if (targetIndex === -1) {
    res.status(404).json({ message: 'Unable to remove question' });
    return;
  }

  questions.splice(targetIndex, 1);
  res.status(204).send();
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
