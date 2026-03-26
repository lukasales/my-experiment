const assert = require('node:assert/strict');
const { Given, When, Then } = require('@cucumber/cucumber');

Given('the exam creation form is visible', function () {
  this.ui.currentScreen = 'exam-create';
  this.ui.examCreationFormVisible = true;
});

When('I fill the exam title', function () {
  const selectedQuestionIds = this.questions.slice(0, 1).map((question) => question.id);

  this.pendingExamDraft = {
    title: 'New Exam',
    answerMode: 'letters',
    questionIds: selectedQuestionIds,
  };
});

When('I choose an answer mode', function () {
  assert.ok(this.pendingExamDraft, 'Expected an exam draft before choosing answer mode');
  this.pendingExamDraft.answerMode = 'powersOfTwo';
});

Then('the exam should be created successfully', function () {
  assert.equal(this.lastOperation, 'exam-create-success');
  assert.ok(this.lastCreatedExamId);
});

Then('the new exam should appear in the visible exam list', function () {
  assert.ok(this.visibleExams.some((exam) => exam.id === this.lastCreatedExamId));
});

Then('the exam should not be created', function () {
  assert.notEqual(this.lastOperation, 'exam-create-success');
});

Given('the frontend is open', function () {
  this.ui.currentScreen = 'exam-list';
  this.ui.examListVisible = true;
});

Given(/^the backend returns success for GET \/exams$/, function () {
  this.backend.getExamsOutcome = 'success';
});

Given(/^GET \/exams fails$/, function () {
  this.backend.getExamsOutcome = 'error';
});

When('the exams screen loads', function () {
  this.requestLog.push('GET /exams');

  if (this.backend.getExamsOutcome === 'error') {
    this.ui.loading = false;
    this.ui.errorMessage = 'Could not load exams';
    return;
  }

  this.ui.loading = false;
  this.visibleExams = this.exams.map((exam) => ({ ...exam }));
});

Then(/^the frontend should fetch GET \/exams$/, function () {
  assert.ok(this.requestLog.includes('GET /exams'));
});

Then('it should display a list of exams', function () {
  assert.ok(Array.isArray(this.visibleExams));
  assert.ok(this.visibleExams.length >= 1);
});

Then('each exam should show its title', function () {
  assert.ok(this.visibleExams.every((exam) => typeof exam.title === 'string' && exam.title.length > 0));
});

Then('each exam should show its answer mode', function () {
  assert.ok(
    this.visibleExams.every(
      (exam) => exam.answerMode === 'letters' || exam.answerMode === 'powersOfTwo',
    ),
  );
});

Given('the exam list is visible', function () {
  this.ui.currentScreen = 'exam-list';
  this.ui.examListVisible = true;
  this.visibleExams = this.exams.map((exam) => ({ ...exam }));
});

Given('there is at least one existing exam', function () {
  if (this.exams.length === 0) {
    this.exams.push({
      id: 'exam-1',
      title: 'Example Exam',
      answerMode: 'letters',
      questionIds: [1],
    });
  }

  this.visibleExams = this.exams.map((exam) => ({ ...exam }));
});

Given('there are existing questions available', function () {
  if (this.questions.length === 0) {
    this.questions.push({
      id: 1,
      statement: 'Sample statement',
      alternatives: ['A', 'B', 'C', 'D'],
      correctAlternatives: [0],
    });
  }
});

Given('the exam edit form is visible', function () {
  this.ui.currentScreen = 'exam-edit';
  this.ui.examEditFormVisible = true;
});

When('I select questions for the exam', function () {
  const exam = this.exams[0];
  assert.ok(exam, 'Expected an exam before selecting questions');

  const selectedQuestionIds = this.questions.slice(0, 2).map((question) => question.id);
  this.pendingEditedExam = {
    ...exam,
    questionIds: selectedQuestionIds,
  };
});

When('I save the exam question selection', function () {
  const editedExam = this.pendingEditedExam;
  const hasValidSelection =
    editedExam && Array.isArray(editedExam.questionIds) && editedExam.questionIds.length > 0;

  if (!hasValidSelection) {
    this.ui.validationMessage = 'Please select at least one question.';
    this.lastOperation = 'exam-link-failed-validation';
    return;
  }

  this.exams = this.exams.map((exam) => (exam.id === editedExam.id ? { ...editedExam } : exam));
  this.visibleExams = this.exams.map((exam) => ({ ...exam }));
  this.lastUpdatedExamId = editedExam.id;
  this.lastOperation = 'exam-link-success';
});

When('I submit an invalid question selection', function () {
  const exam = this.exams[0];
  assert.ok(exam, 'Expected an exam before invalid selection');

  this.pendingEditedExam = {
    ...exam,
    questionIds: [],
  };
  this.ui.validationMessage = 'Please select at least one question.';
  this.lastOperation = 'exam-link-failed-validation';
});

When('I edit the exam title or answer mode', function () {
  const exam = this.exams[0];
  assert.ok(exam, 'Expected at least one existing exam before editing');

  this.pendingEditedExam = {
    ...exam,
    title: `${exam.title} (edited)`,
    answerMode: exam.answerMode === 'letters' ? 'powersOfTwo' : 'letters',
  };
});

When('I save the updated exam', function () {
  const editedExam = this.pendingEditedExam;
  const hasRequiredData =
    editedExam &&
    typeof editedExam.title === 'string' &&
    editedExam.title.trim().length > 0 &&
    (editedExam.answerMode === 'letters' || editedExam.answerMode === 'powersOfTwo') &&
    Array.isArray(editedExam.questionIds);

  if (!hasRequiredData) {
    this.ui.validationMessage = 'Please fill in all required fields.';
    this.lastOperation = 'exam-edit-failed-validation';
    return;
  }

  this.exams = this.exams.map((exam) => (exam.id === editedExam.id ? { ...editedExam } : exam));
  this.visibleExams = this.exams.map((exam) => ({ ...exam }));
  this.lastUpdatedExamId = editedExam.id;
  this.lastOperation = 'exam-edit-success';
});

When('I submit missing required exam data', function () {
  const exam = this.exams[0];
  assert.ok(exam, 'Expected at least one existing exam before invalid exam submit');

  this.pendingEditedExam = {
    ...exam,
    title: '',
  };
  this.ui.validationMessage = 'Please fill in all required fields.';
  this.lastOperation = 'exam-edit-failed-validation';
});

When('I request removal of an exam', function () {
  const exam = this.exams[0];
  assert.ok(exam, 'Expected at least one existing exam before removal');

  if (this.backend.removeExamOutcome === 'error') {
    this.ui.errorMessage = 'Unable to remove exam.';
    this.lastOperation = 'exam-remove-failed';
    return;
  }

  this.exams = this.exams.filter((currentExam) => currentExam.id !== exam.id);
  this.visibleExams = this.exams.map((currentExam) => ({ ...currentExam }));
  this.lastRemovedExamId = exam.id;
  this.lastOperation = 'exam-remove-success';
});

When('the exam removal request fails', function () {
  this.backend.removeExamOutcome = 'error';
  this.ui.errorMessage = 'Unable to remove exam.';
  this.lastOperation = 'exam-remove-failed';
});

Then('the exam should store the selected question ids', function () {
  assert.equal(this.lastOperation, 'exam-link-success');

  const updatedExam = this.exams.find((exam) => exam.id === this.lastUpdatedExamId);
  assert.ok(updatedExam);
  assert.ok(Array.isArray(updatedExam.questionIds));
  assert.ok(updatedExam.questionIds.length > 0);
});

Then('the updated exam should appear in the visible list', function () {
  const updatedExam = this.visibleExams.find((exam) => exam.id === this.lastUpdatedExamId);
  assert.ok(updatedExam);
});

Then('the exam question selection should not be updated', function () {
  assert.notEqual(this.lastOperation, 'exam-link-success');
});

Then('the exam should be updated successfully', function () {
  assert.equal(this.lastOperation, 'exam-edit-success');

  const updatedExam = this.exams.find((exam) => exam.id === this.lastUpdatedExamId);
  assert.ok(updatedExam);
  assert.ok(updatedExam.title.includes('(edited)'));
  assert.ok(updatedExam.answerMode === 'letters' || updatedExam.answerMode === 'powersOfTwo');
});

Then('the exam should not be updated', function () {
  assert.notEqual(this.lastOperation, 'exam-edit-success');
});

Then('the exam should be removed successfully', function () {
  assert.equal(this.lastOperation, 'exam-remove-success');
  assert.ok(this.lastRemovedExamId);
});

Then('it should no longer appear in the visible exam list', function () {
  assert.ok(this.visibleExams.every((exam) => exam.id !== this.lastRemovedExamId));
});

Then('the exam should remain visible', function () {
  assert.ok(this.visibleExams.length > 0);
});
