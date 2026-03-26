export type SourceAlternative = {
  text: string;
  isCorrect: boolean;
};

export type SourceQuestion = {
  id: string;
  statement: string;
  alternatives: SourceAlternative[];
};

export type GeneratedQuestion = {
  id: string;
  statement: string;
  alternatives: SourceAlternative[];
  correctAlternativeIndexes: number[];
};

export type GeneratedExamVariant = {
  questions: GeneratedQuestion[];
};

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  return shuffled;
}

export function generateRandomizedExamVariant(
  questions: SourceQuestion[],
): GeneratedExamVariant {
  const randomizedQuestions = shuffleArray(questions).map((question) => {
    const randomizedAlternatives = shuffleArray(question.alternatives);
    const correctAlternativeIndexes = randomizedAlternatives
      .map((alternative, index) => (alternative.isCorrect ? index : -1))
      .filter((index) => index >= 0);

    return {
      id: question.id,
      statement: question.statement,
      alternatives: randomizedAlternatives,
      correctAlternativeIndexes,
    };
  });

  return {
    questions: randomizedQuestions,
  };
}