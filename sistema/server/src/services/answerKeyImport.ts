export type ParsedAnswerKeyRow = {
  examNumber: number;
  answers: string[];
};

export type ParsedAnswerKey = {
  questionColumns: string[];
  rows: ParsedAnswerKeyRow[];
};

function splitCsvLine(line: string): string[] {
  return line.split(',').map((value) => value.trim());
}

export function parseAnswerKeyCsv(csvContent: string): ParsedAnswerKey {
  const normalized = csvContent.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    throw new Error('Invalid answer key CSV');
  }

  const lines = normalized.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('Invalid answer key CSV');
  }

  const header = splitCsvLine(lines[0]);

  if (header.length < 2 || header[0] !== 'examNumber') {
    throw new Error('Invalid answer key CSV');
  }

  const questionColumns = header.slice(1);
  const rows: ParsedAnswerKeyRow[] = [];

  for (const line of lines.slice(1)) {
    const values = splitCsvLine(line);

    if (values.length !== header.length) {
      throw new Error('Invalid answer key CSV');
    }

    const examNumber = Number(values[0]);

    if (!Number.isInteger(examNumber) || examNumber <= 0) {
      throw new Error('Invalid answer key CSV');
    }

    const answers = values.slice(1);

    if (answers.some((answer) => answer.length === 0)) {
      throw new Error('Invalid answer key CSV');
    }

    rows.push({ examNumber, answers });
  }

  return {
    questionColumns,
    rows,
  };
}