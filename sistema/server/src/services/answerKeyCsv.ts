import type { GeneratedExamVariant } from './examGeneration';

type AnswerMode = 'letters' | 'powersOfTwo';

type GeneratedBatchVariant = {
  examNumber: number;
  variant: GeneratedExamVariant;
};

type BuildAnswerKeyCsvInput = {
  answerMode: AnswerMode;
  generatedVariants: GeneratedBatchVariant[];
};

function formatAlternative(index: number, answerMode: AnswerMode): string {
  if (answerMode === 'letters') {
    return String.fromCharCode(65 + index);
  }

  return String(2 ** index);
}

function formatQuestionAnswerKey(
  indexes: number[],
  answerMode: AnswerMode,
): string {
  return indexes
    .map((index) => formatAlternative(index, answerMode))
    .join('+');
}

export function buildAnswerKeyCsv({
  answerMode,
  generatedVariants,
}: BuildAnswerKeyCsvInput): string {
  if (generatedVariants.length === 0) {
    return 'examNumber\n';
  }

  const questionCount = generatedVariants[0].variant.questions.length;
  const header = [
    'examNumber',
    ...Array.from({ length: questionCount }, (_, index) => `q${index + 1}`),
  ].join(',');

  const rows = generatedVariants.map(({ examNumber, variant }) => {
    const answerKeys = variant.questions.map((question) =>
      formatQuestionAnswerKey(question.correctAlternativeIndexes, answerMode),
    );

    return [String(examNumber), ...answerKeys].join(',');
  });

  return `${header}\n${rows.join('\n')}\n`;
}