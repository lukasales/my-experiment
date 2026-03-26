import express from 'express';
import cors from 'cors';
import AdmZip from 'adm-zip';
import {
  generateRandomizedExamVariant,
  type GeneratedExamVariant,
} from './services/examGeneration';
import {
  parseAnswerKeyCsv,
  type ParsedAnswerKey,
} from './services/answerKeyImport';
import {
  parseStudentResponsesCsv,
  type ParsedStudentResponses,
} from './services/studentResponsesImport';
import {
  runStrictGrading,
  type StrictGradingResult,
} from './services/strictGrading';
import {
  runLenientGrading,
  type LenientGradingResult,
} from './services/lenientGrading';
import { buildAnswerKeyCsv } from './services/answerKeyCsv';
import { buildSingleExamPdf } from './services/examPdf';

export const app = express();

const frontendUrl = process.env.FRONTEND_URL;

app.use(
  cors(
    frontendUrl
      ? {
          origin: frontendUrl,
        }
      : undefined,
  ),
);
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
  questionIds: string[];
};

type GeneratedBatchRecord = {
  answerMode: AnswerMode;
  generatedVariants: Array<{
    examNumber: number;
    variant: GeneratedExamVariant;
  }>;
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
    questionIds: ['q1'],
  },
  {
    id: 'exam-2',
    title: 'Binary Practice Exam',
    answerMode: 'powersOfTwo',
    questionIds: ['q2'],
  },
];

const lastGeneratedBatchByExamId = new Map<string, GeneratedBatchRecord>();
let importedAnswerKey: ParsedAnswerKey | null = null;
let importedStudentResponses: ParsedStudentResponses | null = null;
let strictGradingResult: StrictGradingResult | null = null;
let lenientGradingResult: LenientGradingResult | null = null;

type FinalGradingReport = {
  gradingMode: 'strict' | 'lenient';
  generatedAt: string;
  students: Array<{
    studentId: string;
    examNumber: number;
    score: number;
    totalQuestions: number;
  }>;
};

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/questions', (_req, res) => {
  res.json(questions);
});

app.get('/exams', (_req, res) => {
  res.json(exams);
});

app.get('/exams/:id/pdf', async (req, res) => {
  const { id } = req.params;
  const exam = exams.find((currentExam) => currentExam.id === id);

  if (!exam) {
    res.status(404).json({ message: 'Exam not found.' });
    return;
  }

  const examQuestions = exam.questionIds
    .map((questionId) => questions.find((question) => question.id === questionId))
    .filter((question): question is Question => Boolean(question));

  const generatedVariant = generateRandomizedExamVariant(
    examQuestions.map((question) => ({
      id: question.id,
      statement: question.statement,
      alternatives: question.alternatives.map((alternative) => ({
        text: alternative.text,
        isCorrect: alternative.isCorrect,
      })),
    })),
  );

  const pdfBytes = await buildSingleExamPdf({
    examId: exam.id,
    examTitle: exam.title,
    answerMode: exam.answerMode,
    examNumber: 1,
    questions: generatedVariant.questions.map((question) => ({
      statement: question.statement,
      alternatives: question.alternatives.map((alternative) => alternative.text),
    })),
  });

  const safeFileName = exam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFileName || id}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});

app.get('/exams/:id/pdf/batch', async (req, res) => {
  const { id } = req.params;
  const count = Number(req.query.count);
  const exam = exams.find((currentExam) => currentExam.id === id);

  if (!exam) {
    res.status(404).json({ message: 'Exam not found.' });
    return;
  }

  const hasValidCount = Number.isInteger(count) && count > 0;

  if (!hasValidCount) {
    res.status(400).json({ message: 'A positive integer count is required.' });
    return;
  }

  const examQuestions = exam.questionIds
    .map((questionId) => questions.find((question) => question.id === questionId))
    .filter((question): question is Question => Boolean(question));

  const safeFileName = exam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || id;
  const zip = new AdmZip();
  const generatedVariants: GeneratedBatchRecord['generatedVariants'] = [];

  for (let examNumber = 1; examNumber <= count; examNumber += 1) {
    const generatedVariant = generateRandomizedExamVariant(
      examQuestions.map((question) => ({
        id: question.id,
        statement: question.statement,
        alternatives: question.alternatives.map((alternative) => ({
          text: alternative.text,
          isCorrect: alternative.isCorrect,
        })),
      })),
    );

    const pdfBytes = await buildSingleExamPdf({
      examId: exam.id,
      examTitle: exam.title,
      answerMode: exam.answerMode,
      examNumber,
      questions: generatedVariant.questions.map((question) => ({
        statement: question.statement,
        alternatives: question.alternatives.map((alternative) => alternative.text),
      })),
    });

    zip.addFile(`exam-${examNumber}.pdf`, Buffer.from(pdfBytes));
    generatedVariants.push({ examNumber, variant: generatedVariant });
  }

  lastGeneratedBatchByExamId.set(exam.id, {
    answerMode: exam.answerMode,
    generatedVariants,
  });

  const zipBuffer = zip.toBuffer();

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}_batch.zip"`);
  res.send(zipBuffer);
});

app.get('/exams/:id/pdf/batch/answer-key.csv', (req, res) => {
  const { id } = req.params;
  const exam = exams.find((currentExam) => currentExam.id === id);

  if (!exam) {
    res.status(404).json({ message: 'Exam not found.' });
    return;
  }

  const generationRecord = lastGeneratedBatchByExamId.get(exam.id);

  if (!generationRecord || generationRecord.generatedVariants.length === 0) {
    res.status(404).json({
      message: 'Generate a batch first to export the answer key CSV.',
    });
    return;
  }

  const csv = buildAnswerKeyCsv({
    answerMode: generationRecord.answerMode,
    generatedVariants: generationRecord.generatedVariants,
  });

  const safeFileName = exam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || id;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safeFileName}_answer_key.csv"`,
  );
  res.send(Buffer.from(csv, 'utf-8'));
});

app.post('/grading/answer-key/import', (req, res) => {
  const { csvContent } = req.body as {
    csvContent?: unknown;
  };

  if (typeof csvContent !== 'string') {
    res.status(400).json({ message: 'Invalid answer key CSV' });
    return;
  }

  try {
    const parsed = parseAnswerKeyCsv(csvContent);
    importedAnswerKey = parsed;

    res.status(201).json({
      questionColumns: parsed.questionColumns,
      importedExams: parsed.rows.length,
      message: 'Answer key imported successfully.',
    });
  } catch {
    res.status(400).json({ message: 'Invalid answer key CSV' });
  }
});

app.post('/grading/student-responses/import', (req, res) => {
  const { csvContent } = req.body as {
    csvContent?: unknown;
  };

  if (typeof csvContent !== 'string') {
    res.status(400).json({ message: 'Invalid student responses CSV' });
    return;
  }

  try {
    const parsed = parseStudentResponsesCsv(csvContent);
    importedStudentResponses = parsed;

    res.status(201).json({
      questionColumns: parsed.questionColumns,
      importedResponses: parsed.rows.length,
      message: 'Student responses imported successfully.',
    });
  } catch {
    res.status(400).json({ message: 'Invalid student responses CSV' });
  }
});

app.post('/grading/run/strict', (_req, res) => {
  if (!importedAnswerKey || !importedStudentResponses) {
    res.status(400).json({
      message: 'Load answer key and student responses before strict grading.',
    });
    return;
  }

  try {
    const result = runStrictGrading(importedAnswerKey, importedStudentResponses);
    strictGradingResult = result;

    res.json({
      gradingMode: result.gradingMode,
      students: result.students,
      message: 'Strict grading completed successfully.',
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to run strict grading.',
    });
  }
});

app.post('/grading/run/lenient', (_req, res) => {
  if (!importedAnswerKey || !importedStudentResponses) {
    res.status(400).json({
      message: 'Load answer key and student responses before lenient grading.',
    });
    return;
  }

  try {
    const result = runLenientGrading(importedAnswerKey, importedStudentResponses);
    lenientGradingResult = result;

    res.json({
      gradingMode: result.gradingMode,
      scoringRule: result.scoringRule,
      students: result.students,
      message: 'Lenient grading completed successfully.',
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to run lenient grading.',
    });
  }
});

app.get('/grading/report/final', (req, res) => {
  const requestedMode = req.query.mode;
  const mode =
    requestedMode === 'strict' || requestedMode === 'lenient'
      ? requestedMode
      : undefined;

  const selectedResult =
    mode === 'strict'
      ? strictGradingResult
      : mode === 'lenient'
        ? lenientGradingResult
        : strictGradingResult ?? lenientGradingResult;

  if (!selectedResult) {
    res.status(400).json({
      message: 'Run grading before generating the final report.',
    });
    return;
  }

  const report: FinalGradingReport = {
    gradingMode: selectedResult.gradingMode,
    generatedAt: new Date().toISOString(),
    students: selectedResult.students.map((student) => ({
      studentId: student.studentId,
      examNumber: student.examNumber,
      score: student.totalScore,
      totalQuestions: student.totalQuestions,
    })),
  };

  res.json(report);
});

app.post('/exams', (req, res) => {
  const { title, answerMode, questionIds } = req.body as {
    title?: unknown;
    answerMode?: unknown;
    questionIds?: unknown;
  };

  const hasValidTitle = typeof title === 'string' && title.trim().length > 0;
  const hasValidAnswerMode =
    answerMode === 'letters' || answerMode === 'powersOfTwo';
  const hasValidQuestionIds =
    Array.isArray(questionIds) &&
    questionIds.length > 0 &&
    questionIds.every((questionId) => typeof questionId === 'string');

  if (!hasValidTitle || !hasValidAnswerMode || !hasValidQuestionIds) {
    res.status(400).json({
      message: 'Title, answer mode, and at least one valid question id are required.',
    });
    return;
  }

  const allQuestionsExist = questionIds.every((questionId) =>
    questions.some((question) => question.id === questionId),
  );

  if (!allQuestionsExist) {
    res.status(400).json({ message: 'Question selection contains unknown ids.' });
    return;
  }

  const exam: Exam = {
    id: `exam-${Date.now()}`,
    title: title.trim(),
    answerMode,
    questionIds,
  };

  exams.push(exam);
  res.status(201).json(exam);
});

app.put('/exams/:id', (req, res) => {
  const { id } = req.params;
  const { title, answerMode, questionIds } = req.body as {
    title?: unknown;
    answerMode?: unknown;
    questionIds?: unknown;
  };

  const hasValidTitle = typeof title === 'string' && title.trim().length > 0;
  const hasValidAnswerMode =
    answerMode === 'letters' || answerMode === 'powersOfTwo';

  const hasValidQuestionIds =
    Array.isArray(questionIds) &&
    questionIds.every((questionId) => typeof questionId === 'string');

  if (!hasValidTitle || !hasValidAnswerMode || !hasValidQuestionIds) {
    res.status(400).json({
      message: 'Title, answer mode, and valid question ids are required.',
    });
    return;
  }

  const allQuestionsExist = questionIds.every((questionId) =>
    questions.some((question) => question.id === questionId),
  );

  if (!allQuestionsExist) {
    res.status(400).json({ message: 'Question selection contains unknown ids.' });
    return;
  }

  const targetIndex = exams.findIndex((exam) => exam.id === id);

  if (targetIndex === -1) {
    res.status(404).json({ message: 'Unable to update exam' });
    return;
  }

  const updatedExam: Exam = {
    ...exams[targetIndex],
    title: title.trim(),
    answerMode,
    questionIds,
  };

  exams[targetIndex] = updatedExam;
  res.json(updatedExam);
});

app.delete('/exams/:id', (req, res) => {
  const { id } = req.params;
  const targetIndex = exams.findIndex((exam) => exam.id === id);

  if (targetIndex === -1) {
    res.status(404).json({ message: 'Unable to remove exam' });
    return;
  }

  exams.splice(targetIndex, 1);
  res.status(204).send();
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

  const hasAtLeastOneCorrectAlternative =
    Array.isArray(alternatives) &&
    alternatives.some(
      (alternative) =>
        typeof alternative === 'object' &&
        alternative !== null &&
        (alternative as { isCorrect?: unknown }).isCorrect === true,
    );

  if (!hasValidStatement || !hasValidAlternatives || !hasAtLeastOneCorrectAlternative) {
    res.status(400).json({
      message:
        'Statement and 4 alternatives with text and correctness are required, with at least one correct alternative.',
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

  const hasAtLeastOneCorrectAlternative =
    Array.isArray(alternatives) &&
    alternatives.some(
      (alternative) =>
        typeof alternative === 'object' &&
        alternative !== null &&
        (alternative as { isCorrect?: unknown }).isCorrect === true,
    );

  if (!hasValidStatement || !hasValidAlternatives || !hasAtLeastOneCorrectAlternative) {
    res.status(400).json({
      message:
        'Statement and 4 alternatives with text and correctness are required, with at least one correct alternative.',
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

const configuredPort = Number(process.env.PORT);
const PORT = Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
