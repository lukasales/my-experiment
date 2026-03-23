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

const questions: Question[] = [
  {
    id: 'q1',
    statement: 'What is 2 + 2?',
    alternatives: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
      { text: '5', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    statement: 'Which language is commonly used with React?',
    alternatives: [
      { text: 'TypeScript', isCorrect: true },
      { text: 'COBOL', isCorrect: false },
      { text: 'Fortran', isCorrect: false },
    ],
  },
];

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/questions', (_req, res) => {
  res.json(questions);
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
