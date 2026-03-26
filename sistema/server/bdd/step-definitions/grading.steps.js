const assert = require('node:assert/strict');
const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const { app } = require('../../dist/server');

Given('an answer key CSV file is available', function () {
  this.api = request(app);
  this.answerKeyCsv = 'examNumber,q1,q2\n1,B,C\n';
  this.lastResponse = null;
});

Given('an invalid answer key CSV file is available', function () {
  this.api = request(app);
  this.answerKeyCsv = 'invalidHeader,q1\nabc,B\n';
  this.lastResponse = null;
});

When('I import the answer key CSV', async function () {
  assert.ok(this.api, 'Expected grading API client to be available');
  this.lastResponse = await this.api
    .post('/grading/answer-key/import')
    .send({ csvContent: this.answerKeyCsv });
});

Then('the system should parse the answer key successfully', function () {
  assert.ok(this.lastResponse, 'Expected response from answer key import');
  assert.equal(this.lastResponse.status, 201);
  assert.equal(this.lastResponse.body.importedExams, 1);
});

Then('the parsed answer key data should be available for grading', async function () {
  const strictRun = await this.api.post('/grading/run/strict').send({});
  assert.equal(strictRun.status, 400);
  assert.match(strictRun.body.message, /student responses/i);
});

Then('the system should show a simple import error', function () {
  assert.ok(this.lastResponse, 'Expected response from CSV import');
  assert.equal(this.lastResponse.status, 400);
  assert.equal(typeof this.lastResponse.body.message, 'string');
  assert.ok(this.lastResponse.body.message.length > 0);
});

Given('a student responses CSV file is available', function () {
  this.api = request(app);
  this.studentResponsesCsv = 'studentId,examNumber,q1,q2\ns1,1,B,C\n';
  this.lastResponse = null;
});

Given('an invalid student responses CSV file is available', function () {
  this.api = request(app);
  this.studentResponsesCsv = 'student,exam,q1\ns1,wrong,B\n';
  this.lastResponse = null;
});

When('I import the student responses CSV', async function () {
  assert.ok(this.api, 'Expected grading API client to be available');
  this.lastResponse = await this.api
    .post('/grading/student-responses/import')
    .send({ csvContent: this.studentResponsesCsv });
});

Then('the system should parse the student responses successfully', function () {
  assert.ok(this.lastResponse, 'Expected response from student responses import');
  assert.equal(this.lastResponse.status, 201);
  assert.equal(this.lastResponse.body.importedResponses, 1);
});

Then('the parsed response data should be available for grading', async function () {
  await this.api
    .post('/grading/answer-key/import')
    .send({ csvContent: 'examNumber,q1,q2\n1,B,C\n' });

  const strictRun = await this.api.post('/grading/run/strict').send({});
  assert.equal(strictRun.status, 200);
  assert.equal(strictRun.body.gradingMode, 'strict');
});

Given('a valid answer key and valid student responses are loaded', async function () {
  this.api = request(app);

  await this.api
    .post('/grading/answer-key/import')
    .send({ csvContent: 'examNumber,q1,q2\n1,B+C,C\n' });

  await this.api
    .post('/grading/student-responses/import')
    .send({ csvContent: 'studentId,examNumber,q1,q2\ns1,1,B,C\ns2,1,B+D,D\n' });
});

When('I run strict grading', async function () {
  this.lastResponse = await this.api.post('/grading/run/strict').send({});
});

Then(
  'the system should apply the rule that a wrong alternative makes the question score zero',
  function () {
    assert.equal(this.lastResponse.status, 200);

    const studentWithWrongAnswer = this.lastResponse.body.students.find(
      (student) => student.studentId === 's2',
    );

    assert.ok(studentWithWrongAnswer);
    assert.equal(studentWithWrongAnswer.questionScores[1], 0);
  },
);

Then('the grading result should be available for reporting', async function () {
  const report = await this.api.get('/grading/report/final').query({ mode: 'strict' });
  assert.equal(report.status, 200);
  assert.equal(report.body.gradingMode, 'strict');
  assert.ok(Array.isArray(report.body.students));
});

When('I run lenient grading', async function () {
  this.lastResponse = await this.api.post('/grading/run/lenient').send({});
});

Then('the system should apply the chosen proportional scoring rule', function () {
  assert.equal(this.lastResponse.status, 200);
  assert.equal(this.lastResponse.body.gradingMode, 'lenient');
  assert.equal(
    this.lastResponse.body.scoringRule,
    'perQuestion = matchedExpectedAlternatives / expectedAlternatives',
  );

  const firstStudent = this.lastResponse.body.students.find((student) => student.studentId === 's1');
  assert.ok(firstStudent);
  assert.equal(firstStudent.questionScores[0], 0.5);
});

Given('grading results are available', async function () {
  this.api = request(app);

  await this.api
    .post('/grading/answer-key/import')
    .send({ csvContent: 'examNumber,q1,q2\n1,B,C\n' });

  await this.api
    .post('/grading/student-responses/import')
    .send({ csvContent: 'studentId,examNumber,q1,q2\ns1,1,B,C\n' });

  await this.api.post('/grading/run/strict').send({});
});

When('I generate the final grading report', async function () {
  this.lastResponse = await this.api.get('/grading/report/final').query({ mode: 'strict' });
});

Then('the system should produce a report with student scores', function () {
  assert.equal(this.lastResponse.status, 200);
  assert.ok(Array.isArray(this.lastResponse.body.students));
  assert.ok(this.lastResponse.body.students.length > 0);

  const firstStudent = this.lastResponse.body.students[0];
  assert.equal(typeof firstStudent.score, 'number');
  assert.equal(typeof firstStudent.studentId, 'string');
});

Then('the report should identify the grading mode used', function () {
  assert.equal(this.lastResponse.status, 200);
  assert.ok(
    this.lastResponse.body.gradingMode === 'strict' ||
      this.lastResponse.body.gradingMode === 'lenient',
  );
});
