import type { ParsedAnswerKey } from './answerKeyImport';
import type { ParsedStudentResponses } from './studentResponsesImport';

export type StrictGradingStudentResult = {
  studentId: string;
  examNumber: number;
  totalQuestions: number;
  questionScores: number[];
  totalScore: number;
};

export type StrictGradingResult = {
  gradingMode: 'strict';
  students: StrictGradingStudentResult[];
};

function normalizeAnswerTokens(answer: string): string[] {
  return answer
    .split('+')
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .sort();
}

function areEquivalentAnswers(expected: string, actual: string): boolean {
  const expectedTokens = normalizeAnswerTokens(expected);
  const actualTokens = normalizeAnswerTokens(actual);

  if (expectedTokens.length !== actualTokens.length) {
    return false;
  }

  return expectedTokens.every((token, index) => token === actualTokens[index]);
}

export function runStrictGrading(
  answerKey: ParsedAnswerKey,
  studentResponses: ParsedStudentResponses,
): StrictGradingResult {
  if (answerKey.questionColumns.join(',') !== studentResponses.questionColumns.join(',')) {
    throw new Error('Strict grading requires matching answer key and response columns.');
  }

  const answerKeyByExamNumber = new Map(
    answerKey.rows.map((row) => [row.examNumber, row.answers]),
  );

  const students = studentResponses.rows.map((responseRow) => {
    const answerKeyAnswers = answerKeyByExamNumber.get(responseRow.examNumber);

    if (!answerKeyAnswers) {
      throw new Error('Strict grading requires loaded data for the same exams.');
    }

    if (answerKeyAnswers.length !== responseRow.answers.length) {
      throw new Error('Strict grading requires matching answer counts per question.');
    }

    const questionScores: number[] = answerKeyAnswers.map((expectedAnswer, index) => {
      const actualAnswer = responseRow.answers[index];
      return areEquivalentAnswers(expectedAnswer, actualAnswer) ? 1 : 0;
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
    gradingMode: 'strict',
    students,
  };
}