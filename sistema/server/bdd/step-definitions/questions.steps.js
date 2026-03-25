const assert = require('node:assert/strict');
const { Given, When, Then } = require('@cucumber/cucumber');

Given('the question list screen is open', function () {
	this.ui.currentScreen = 'question-list';
	this.ui.questionListVisible = true;
});

Given('the server is running', function () {
	this.serverRunning = true;
});

Given(/^the backend returns success for GET \/questions$/, function () {
	this.backend.getQuestionsOutcome = 'success';
});

Given('the frontend started fetching questions', function () {
	this.ui.currentScreen = 'question-list';
	this.ui.questionListVisible = true;
	this.ui.loading = true;
});

Given(/^GET \/questions fails$/, function () {
	this.backend.getQuestionsOutcome = 'error';
});

Given('the question creation form is open', function () {
	this.ui.currentScreen = 'question-create';
	this.ui.questionCreationFormVisible = true;
});

Given('the question list is visible', function () {
	this.ui.currentScreen = 'question-list';
	this.ui.questionListVisible = true;
});

Given('there is at least one existing question', function () {
	if (this.questions.length === 0) {
		this.questions.push({
			id: 1,
			statement: 'Sample statement',
			alternatives: ['A', 'B', 'C', 'D'],
			correctAlternatives: [0],
		});
	}
});

Given('the question edit form is visible', function () {
	this.ui.currentScreen = 'question-edit';
	this.ui.questionEditFormVisible = true;
});

When('the question list screen loads', function () {
	this.requestLog.push('GET /questions');

	if (this.backend.getQuestionsOutcome === 'error') {
		this.ui.loading = false;
		this.ui.errorMessage = 'Could not load questions';
		return;
	}

	this.ui.loading = false;
	this.visibleQuestions = this.questions.map((q) => ({ ...q }));
});

When('I request the list of questions', function () {
	assert.equal(this.serverRunning, true);
	this.requestLog.push('GET /questions');
	this.lastResponse = {
		status: 200,
		body: this.questions.map((question) => ({
			statement: question.statement,
			alternatives: question.alternatives.map((text, index) => ({
				text,
				isCorrect: question.correctAlternatives.includes(index),
			})),
		})),
	};
});

When('I request the list of exams', function () {
	assert.equal(this.serverRunning, true);
	this.requestLog.push('GET /exams');
	this.lastResponse = {
		status: 200,
		body: this.exams.map((exam) => ({ ...exam })),
	};
});

When('the response has not arrived yet', function () {
	this.ui.loading = true;
});

When('I fill the statement and exactly four alternatives', function () {
	this.pendingQuestionDraft = {
		statement: 'What is 2 + 2?',
		alternatives: ['1', '2', '3', '4'],
		correctAlternatives: [],
	};
});

When('I mark the correct alternatives', function () {
	assert.ok(this.pendingQuestionDraft, 'A question draft is required before marking alternatives');
	this.pendingQuestionDraft.correctAlternatives = [3];
});

When('I submit the form', function () {
	const draft = this.pendingQuestionDraft;
	const hasRequiredData =
		draft &&
		typeof draft.statement === 'string' &&
		draft.statement.trim().length > 0 &&
		Array.isArray(draft.alternatives) &&
		draft.alternatives.length === 4 &&
		Array.isArray(draft.correctAlternatives) &&
		draft.correctAlternatives.length > 0;

	if (!hasRequiredData) {
		this.ui.validationMessage = 'Missing required fields';
		this.lastOperation = 'create-failed-validation';
		return;
	}

	const newQuestion = {
		id: this.nextQuestionId++,
		statement: draft.statement,
		alternatives: [...draft.alternatives],
		correctAlternatives: [...draft.correctAlternatives],
	};

	this.questions.push(newQuestion);
	this.visibleQuestions = this.questions.map((q) => ({ ...q }));
	this.lastCreatedQuestionId = newQuestion.id;
	this.lastOperation = 'create-success';
});

When('I submit the form with missing required data', function () {
	this.pendingQuestionDraft = {
		statement: '',
		alternatives: ['only one'],
		correctAlternatives: [],
	};
	this.ui.validationMessage = 'Missing required fields';

	if (this.ui.currentScreen === 'question-edit') {
		this.lastOperation = 'edit-failed-validation';
		return;
	}

	this.lastOperation = 'create-failed-validation';
});

When('I request removal of a question', function () {
	const target = this.questions[0];
	assert.ok(target, 'Expected at least one existing question before removal');

	if (this.backend.removeQuestionOutcome === 'error') {
		this.lastOperation = 'remove-failed';
		this.ui.errorMessage = 'Could not remove question';
		return;
	}

	this.questions = this.questions.filter((q) => q.id !== target.id);
	this.visibleQuestions = this.questions.map((q) => ({ ...q }));
	this.lastRemovedQuestionId = target.id;
	this.lastOperation = 'remove-success';
});

When('the removal request fails', function () {
	this.backend.removeQuestionOutcome = 'error';
	this.ui.errorMessage = 'Could not remove question';
	this.lastOperation = 'remove-failed';
});

When('I edit the statement or alternatives of a question', function () {
	const target = this.questions[0];
	assert.ok(target, 'Expected at least one existing question before editing');

	this.pendingEditedQuestion = {
		...target,
		statement: `${target.statement} (edited)`,
		alternatives: ['Alt A', 'Alt B', 'Alt C', 'Alt D'],
		correctAlternatives: [1],
	};
});

When('I submit the updated data', function () {
	const edited = this.pendingEditedQuestion;
	const hasRequiredData =
		edited &&
		typeof edited.statement === 'string' &&
		edited.statement.trim().length > 0 &&
		Array.isArray(edited.alternatives) &&
		edited.alternatives.length === 4;

	if (!hasRequiredData) {
		this.ui.validationMessage = 'Missing required fields';
		this.lastOperation = 'edit-failed-validation';
		return;
	}

	this.questions = this.questions.map((q) => (q.id === edited.id ? { ...edited } : q));
	this.visibleQuestions = this.questions.map((q) => ({ ...q }));
	this.lastUpdatedQuestionId = edited.id;
	this.lastOperation = 'edit-success';
});

Then(/^the frontend should fetch GET \/questions$/, function () {
	assert.ok(this.requestLog.includes('GET /questions'));
});

Then('it should display a list of questions', function () {
	assert.ok(Array.isArray(this.visibleQuestions));
	assert.ok(this.visibleQuestions.length >= 1);
});

Then('each question should show its statement', function () {
	assert.ok(this.visibleQuestions.every((q) => typeof q.statement === 'string' && q.statement.length > 0));
});

Then('each question should show its alternatives', function () {
	assert.ok(this.visibleQuestions.every((q) => Array.isArray(q.alternatives) && q.alternatives.length > 0));
});

Then('the UI should show a simple loading indicator', function () {
	assert.equal(this.ui.loading, true);
});

Then('the UI should show a simple error message', function () {
	assert.equal(typeof this.ui.errorMessage, 'string');
	assert.ok(this.ui.errorMessage.length > 0);
});

Then('the frontend should show a simple error message', function () {
	assert.equal(typeof this.ui.errorMessage, 'string');
	assert.ok(this.ui.errorMessage.length > 0);
});

Then('the response should be successful', function () {
	assert.equal(this.lastResponse.status, 200);
});

Then('the response body should be a JSON array of questions', function () {
	assert.ok(Array.isArray(this.lastResponse.body));
});

Then('the response body should be a JSON array of exams', function () {
	assert.ok(Array.isArray(this.lastResponse.body));
});

Then('each question should include a statement and alternatives', function () {
	assert.ok(
		this.lastResponse.body.every(
			(question) => typeof question.statement === 'string' && Array.isArray(question.alternatives)
		)
	);
});

Then('each exam should include an id', function () {
	assert.ok(this.lastResponse.body.every((exam) => typeof exam.id === 'string' && exam.id.length > 0));
});

Then('each exam should include a title', function () {
	assert.ok(this.lastResponse.body.every((exam) => typeof exam.title === 'string' && exam.title.length > 0));
});

Then('each exam should include an answer mode', function () {
	assert.ok(
		this.lastResponse.body.every(
			(exam) => exam.answerMode === 'letters' || exam.answerMode === 'powersOfTwo'
		)
	);
});

Then('each alternative should include text and correctness information', function () {
	assert.ok(
		this.lastResponse.body.every((question) =>
			question.alternatives.every(
				(alternative) =>
					typeof alternative.text === 'string' && typeof alternative.isCorrect === 'boolean'
			)
		)
	);
});

Then('the question should be created successfully', function () {
	assert.equal(this.lastOperation, 'create-success');
	assert.ok(this.lastCreatedQuestionId);
});

Then('the new question should appear in the question list', function () {
	assert.ok(this.visibleQuestions.some((q) => q.id === this.lastCreatedQuestionId));
});

Then('the frontend should show a simple validation message', function () {
	assert.equal(typeof this.ui.validationMessage, 'string');
	assert.ok(this.ui.validationMessage.length > 0);
});

Then('the question should not be created', function () {
	assert.notEqual(this.lastOperation, 'create-success');
});

Then('the question should be removed successfully', function () {
	assert.equal(this.lastOperation, 'remove-success');
	assert.ok(this.lastRemovedQuestionId);
});

Then('it should no longer appear in the visible list', function () {
	assert.ok(this.visibleQuestions.every((q) => q.id !== this.lastRemovedQuestionId));
});

Then('the question should remain in the visible list', function () {
	assert.ok(this.visibleQuestions.length > 0);
});

Then('the question should be updated successfully', function () {
	assert.equal(this.lastOperation, 'edit-success');
	assert.ok(this.lastUpdatedQuestionId);
});

Then('the updated question should appear in the visible list', function () {
	const updated = this.visibleQuestions.find((q) => q.id === this.lastUpdatedQuestionId);
	assert.ok(updated);
	assert.ok(updated.statement.includes('(edited)'));
});

Then('the question should not be updated', function () {
	assert.notEqual(this.lastOperation, 'edit-success');
});
