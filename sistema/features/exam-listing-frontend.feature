Feature: Frontend exam listing

  Scenario: Display exams loaded from backend
    Given the frontend is open
    And the backend returns success for GET /exams
    When the exams screen loads
    Then the frontend should fetch GET /exams
    And it should display a list of exams
    And each exam should show its title
    And each exam should show its answer mode

  Scenario: Display error when exam loading fails
    Given GET /exams fails
    When the exams screen loads
    Then the UI should show a simple error message