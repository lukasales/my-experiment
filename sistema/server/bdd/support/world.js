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
        questionIds: [1],
      },
      {
        id: 'exam-2',
        title: 'Binary Practice Exam',
        answerMode: 'powersOfTwo',
        questionIds: [],
      },
    ];

    this.visibleQuestions = this.questions.map((q) => ({ ...q }));
    this.visibleExams = this.exams.map((exam) => ({ ...exam }));
    this.lastResponse = null;
    this.pendingQuestionDraft = null;
    this.pendingExamDraft = null;
    this.pendingEditedQuestion = null;
    this.pendingEditedExam = null;

    this.lastOperation = null;
    this.lastCreatedQuestionId = null;
    this.lastRemovedQuestionId = null;
    this.lastUpdatedQuestionId = null;
    this.lastUpdatedExamId = null;
    this.lastRemovedExamId = null;
    this.lastCreatedExamId = null;

    this.requestLog = [];

    this.backend = {
      getQuestionsOutcome: 'success',
      getExamsOutcome: 'success',
      removeQuestionOutcome: 'success',
      removeExamOutcome: 'success',
    };

    this.ui = {
      currentScreen: null,
      questionListVisible: false,
      questionCreationFormVisible: false,
      questionEditFormVisible: false,
      examListVisible: false,
      examCreationFormVisible: false,
      examEditFormVisible: false,
      loading: false,
      errorMessage: '',
      validationMessage: '',
    };
  }
}

setWorldConstructor(QuestionsWorld);
