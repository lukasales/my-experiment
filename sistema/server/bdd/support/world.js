const { setWorldConstructor } = require('@cucumber/cucumber');

class QuestionsWorld {
  constructor() {
    this.reset();
  }

  reset() {
    this.nextQuestionId = 2;
    this.questions = [
      {
        id: 1,
        statement: 'Initial question statement',
        alternatives: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAlternatives: [0],
      },
    ];

    this.exams = [
      {
        id: 'exam-1',
        title: 'Example Exam',
        answerMode: 'letters',
      },
      {
        id: 'exam-2',
        title: 'Binary Practice Exam',
        answerMode: 'powersOfTwo',
      },
    ];

    this.visibleQuestions = this.questions.map((q) => ({ ...q }));
    this.lastResponse = null;
    this.pendingQuestionDraft = null;
    this.pendingEditedQuestion = null;

    this.lastOperation = null;
    this.lastCreatedQuestionId = null;
    this.lastRemovedQuestionId = null;
    this.lastUpdatedQuestionId = null;

    this.requestLog = [];

    this.backend = {
      getQuestionsOutcome: 'success',
      removeQuestionOutcome: 'success',
    };

    this.ui = {
      currentScreen: null,
      questionListVisible: false,
      questionCreationFormVisible: false,
      questionEditFormVisible: false,
      loading: false,
      errorMessage: '',
      validationMessage: '',
    };
  }
}

setWorldConstructor(QuestionsWorld);
