export type ParsedStudentResponseRow = {
  studentId: string;
  examNumber: number;
  answers: string[];
};

export type ParsedStudentResponses = {
  questionColumns: string[];
  rows: ParsedStudentResponseRow[];
};

function splitCsvLine(line: string): string[] {
  return line.split(',').map((value) => value.trim());
}

export function parseStudentResponsesCsv(csvContent: string): ParsedStudentResponses {
  const normalized = csvContent.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    throw new Error('Invalid student responses CSV');
  }

  const lines = normalized.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('Invalid student responses CSV');
  }

  const header = splitCsvLine(lines[0]);

  if (header.length < 3 || header[0] !== 'studentId' || header[1] !== 'examNumber') {
    throw new Error('Invalid student responses CSV');
  }

  const questionColumns = header.slice(2);
  const rows: ParsedStudentResponseRow[] = [];

  for (const line of lines.slice(1)) {
    const values = splitCsvLine(line);

    if (values.length !== header.length) {
      throw new Error('Invalid student responses CSV');
    }

    const studentId = values[0];
    const examNumber = Number(values[1]);

    if (studentId.length === 0 || !Number.isInteger(examNumber) || examNumber <= 0) {
      throw new Error('Invalid student responses CSV');
    }

    const answers = values.slice(2);

    if (answers.some((answer) => answer.length === 0)) {
      throw new Error('Invalid student responses CSV');
    }

    rows.push({
      studentId,
      examNumber,
      answers,
    });
  }

  return {
    questionColumns,
    rows,
  };
}