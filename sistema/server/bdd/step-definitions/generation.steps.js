const assert = require('node:assert/strict');
const { After, Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const AdmZip = require('adm-zip');
const { PDFDocument } = require('pdf-lib');
const { app } = require('../../dist/server');

function binaryParser(response, callback) {
  response.setEncoding('binary');
  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    callback(null, Buffer.from(data, 'binary'));
  });
}

After(function () {
  if (this.originalMathRandom) {
    Math.random = this.originalMathRandom;
    this.originalMathRandom = null;
  }
});

Given('the generation API client is available', function () {
  this.api = request(app);
  this.lastResponse = null;
  this.lastBatchZipBuffer = null;
  this.lastCsvText = '';
});

Given(
  'exam {string} is configured with answer mode {string} and question ids {string}',
  async function (examId, answerMode, questionIdsCsv) {
    assert.ok(this.api, 'Expected API client to be available');

    const examsResponse = await this.api.get('/exams');
    assert.equal(examsResponse.status, 200);

    const exam = examsResponse.body.find((currentExam) => currentExam.id === examId);
    assert.ok(exam, `Exam not found in test setup: ${examId}`);

    const questionIds = questionIdsCsv.split(',').map((value) => value.trim());
    const updateResponse = await this.api.put(`/exams/${examId}`).send({
      title: exam.title,
      answerMode,
      questionIds,
    });

    assert.equal(updateResponse.status, 200);
  },
);

Given('I force deterministic randomization with zero sequence', function () {
  this.originalMathRandom = Math.random;
  Math.random = () => 0;
});

When('I request single exam PDF for {string}', async function (examId) {
  assert.ok(this.api, 'Expected API client to be available');

  this.lastResponse = await this.api
    .get(`/exams/${examId}/pdf`)
    .buffer(true)
    .parse(binaryParser);
});

When(
  'I request batch exam ZIP for {string} with count {int}',
  async function (examId, count) {
    assert.ok(this.api, 'Expected API client to be available');

    this.lastResponse = await this.api
      .get(`/exams/${examId}/pdf/batch`)
      .query({ count })
      .buffer(true)
      .parse(binaryParser);

    this.lastBatchZipBuffer = this.lastResponse.body;
  },
);

When('I request answer-key CSV for {string}', async function (examId) {
  assert.ok(this.api, 'Expected API client to be available');

  this.lastResponse = await this.api.get(`/exams/${examId}/pdf/batch/answer-key.csv`);
  this.lastCsvText = this.lastResponse.text;
});

Then('the generation response should be successful', function () {
  assert.ok(this.lastResponse, 'Expected a response from generation API');
  assert.equal(this.lastResponse.status, 200);
});

Then('the generation response should be a non-empty PDF artifact', function () {
  assert.ok(this.lastResponse, 'Expected a response from generation API');

  const contentType = this.lastResponse.headers['content-type'] ?? '';
  assert.ok(contentType.includes('application/pdf'));
  assert.ok(Buffer.isBuffer(this.lastResponse.body));
  assert.ok(this.lastResponse.body.length > 0);
  assert.equal(this.lastResponse.body.subarray(0, 4).toString('utf-8'), '%PDF');
});

Then('the PDF should contain at least one page', async function () {
  assert.ok(this.lastResponse, 'Expected a response from generation API');
  const pdf = await PDFDocument.load(this.lastResponse.body);
  assert.ok(pdf.getPageCount() >= 1);
});

Then(
  'the response should provide a downloadable filename ending with {string}',
  function (suffix) {
    assert.ok(this.lastResponse, 'Expected a response from generation API');
    const contentDisposition = this.lastResponse.headers['content-disposition'] ?? '';
    assert.ok(contentDisposition.includes('attachment;'));
    assert.ok(contentDisposition.toLowerCase().includes(suffix.toLowerCase()));
  },
);

Then('the generation response should be a non-empty ZIP artifact', function () {
  assert.ok(this.lastResponse, 'Expected a response from generation API');

  const contentType = this.lastResponse.headers['content-type'] ?? '';
  assert.ok(contentType.includes('application/zip'));
  assert.ok(Buffer.isBuffer(this.lastResponse.body));
  assert.ok(this.lastResponse.body.length > 0);
});

Then('the ZIP should contain exactly {int} PDF files', function (expectedCount) {
  assert.ok(this.lastBatchZipBuffer, 'Expected stored ZIP buffer from batch request');

  const zip = new AdmZip(this.lastBatchZipBuffer);
  const pdfEntries = zip
    .getEntries()
    .filter((entry) => !entry.isDirectory && entry.entryName.endsWith('.pdf'));

  assert.equal(pdfEntries.length, expectedCount);
});

Then('every PDF entry in the ZIP should be a valid non-empty PDF', async function () {
  assert.ok(this.lastBatchZipBuffer, 'Expected stored ZIP buffer from batch request');

  const zip = new AdmZip(this.lastBatchZipBuffer);
  const pdfEntries = zip
    .getEntries()
    .filter((entry) => !entry.isDirectory && entry.entryName.endsWith('.pdf'));

  assert.ok(pdfEntries.length > 0);

  for (const entry of pdfEntries) {
    const buffer = entry.getData();
    assert.ok(buffer.length > 0);
    assert.equal(buffer.subarray(0, 4).toString('utf-8'), '%PDF');

    const pdf = await PDFDocument.load(buffer);
    assert.ok(pdf.getPageCount() >= 1);
  }
});

Then('the generation response should be a non-empty CSV artifact', function () {
  assert.ok(this.lastResponse, 'Expected a response from generation API');

  const contentType = this.lastResponse.headers['content-type'] ?? '';
  assert.ok(contentType.includes('text/csv'));
  assert.ok(typeof this.lastCsvText === 'string');
  assert.ok(this.lastCsvText.length > 0);
});

Then('the CSV header should be {string}', function (expectedHeader) {
  const [header] = this.lastCsvText.trim().split('\n');
  assert.equal(header, expectedHeader);
});

Then('the CSV should contain exactly {int} data rows', function (expectedRows) {
  const lines = this.lastCsvText.trim().split('\n');
  const dataRows = lines.slice(1);
  assert.equal(dataRows.length, expectedRows);
});

Then('each CSV data row should start with a numeric exam number', function () {
  const lines = this.lastCsvText.trim().split('\n');
  const dataRows = lines.slice(1);

  dataRows.forEach((row) => {
    const [examNumber] = row.split(',');
    assert.ok(/^\d+$/.test(examNumber));
  });
});

Then('the first CSV data row should not equal {string}', function (unexpectedRow) {
  const lines = this.lastCsvText.trim().split('\n');
  const firstDataRow = lines[1];
  assert.notEqual(firstDataRow, unexpectedRow);
});
