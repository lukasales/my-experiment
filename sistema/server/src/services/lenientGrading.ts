import type { ParsedAnswerKey } from './answerKeyImport';
import type { ParsedStudentResponses } from './studentResponsesImport';

export type LenientGradingStudentResult = {
  studentId: string;
  examNumber: number;
  totalQuestions: number;
  questionScores: number[];
  totalScore: number;
};

export type LenientGradingResult = {
  gradingMode: 'lenient';
  scoringRule: string;
  students: LenientGradingStudentResult[];
};

function normalizeAnswerTokens(answer: string): string[] {
  return answer
    .split('+')
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

export function runLenientGrading(
  answerKey: ParsedAnswerKey,
  studentResponses: ParsedStudentResponses,
): LenientGradingResult {
  if (answerKey.questionColumns.join(',') !== studentResponses.questionColumns.join(',')) {
    throw new Error('Lenient grading requires matching answer key and response columns.');
  }

  const answerKeyByExamNumber = new Map(
    answerKey.rows.map((row) => [row.examNumber, row.answers]),
  );

  const students = studentResponses.rows.map((responseRow) => {
    const answerKeyAnswers = answerKeyByExamNumber.get(responseRow.examNumber);

    if (!answerKeyAnswers) {
      throw new Error('Lenient grading requires loaded data for the same exams.');
    }

    if (answerKeyAnswers.length !== responseRow.answers.length) {
      throw new Error('Lenient grading requires matching answer counts per question.');
    }

    // Proportional rule: score = matched expected alternatives / total expected alternatives.
    const questionScores = answerKeyAnswers.map((expectedAnswer, index) => {
      const expectedTokens = normalizeAnswerTokens(expectedAnswer);
      const actualTokens = normalizeAnswerTokens(responseRow.answers[index]);
      const actualTokenSet = new Set(actualTokens);

      const matchedCount = expectedTokens.filter((token) => actualTokenSet.has(token)).length;
      return expectedTokens.length === 0 ? 0 : matchedCount / expectedTokens.length;
    });

    const totalScore = questionScores.reduce((sum, questionScore) => sum + questionScore, 0);

    return {
      studentId: responseRow.studentId,
      examNumber: responseRow.examNumber,
      totalQuestions: questionScores.length,
      questionScores,
      totalScore,
    };
  });

  return {
    gradingMode: 'lenient',
    scoringRule: 'perQuestion = matchedExpectedAlternatives / expectedAlternatives',
    students,
  };
}