import { PDFDocument, StandardFonts } from 'pdf-lib';

type ExamPdfQuestion = {
  statement: string;
  alternatives: string[];
};

type BuildSingleExamPdfInput = {
  examId: string;
  examTitle: string;
  answerMode: 'letters' | 'powersOfTwo';
  examNumber: number;
  questions: ExamPdfQuestion[];
};

function formatAlternativeLabel(
  alternativeIndex: number,
  answerMode: 'letters' | 'powersOfTwo',
): string {
  if (answerMode === 'powersOfTwo') {
    return String(2 ** alternativeIndex);
  }

  return String.fromCharCode(65 + alternativeIndex);
}

export async function buildSingleExamPdf({
  examId,
  examTitle,
  answerMode,
  examNumber,
  questions,
}: BuildSingleExamPdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 18;

  const drawFooter = (targetPage: ReturnType<typeof pdfDoc.addPage>) => {
    targetPage.drawText(`Exam Number: ${examNumber}`, {
      x: margin,
      y: 24,
      size: 10,
      font,
    });
  };

  const createPage = () => {
    const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
    drawFooter(newPage);
    return newPage;
  };

  let page = createPage();
  let y = pageHeight - margin;

  const drawLine = (text: string, size = 12) => {
    if (y < margin + 20) {
      page = createPage();
      y = pageHeight - margin;
    }

    page.drawText(text, {
      x: margin,
      y,
      size,
      font,
    });

    y -= lineHeight;
  };

  drawLine('Discipline: ________________________________');
  drawLine('Professor: _________________________________');
  drawLine('Date: ____/____/________');
  drawLine(`Title: ${examTitle}`, 16);
  drawLine(`Exam ID: ${examId}`);
  drawLine(`Answer Mode: ${answerMode}`);
  drawLine('');

  questions.forEach((question, questionIndex) => {
    drawLine(`${questionIndex + 1}. ${question.statement}`);

    question.alternatives.forEach((alternative, alternativeIndex) => {
      const alternativeLabel = formatAlternativeLabel(alternativeIndex, answerMode);
      drawLine(`   ${alternativeLabel}) ${alternative}`);
    });

    if (answerMode === 'letters') {
      drawLine('   Answer (letters): ________________________________');
    } else {
      drawLine('   Answer (sum): ________________________________');
    }

    drawLine('');
  });

  drawLine('Student Name: ________________________________');
  drawLine('CPF: _________________________________________');

  return pdfDoc.save();
}