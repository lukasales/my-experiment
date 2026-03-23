Feature: Frontend closed question listing

  Scenario: Display closed questions loaded from backend
    Given the frontend is open
    And the backend returns success for GET /questions
    When the questions screen loads
    Then the frontend should fetch GET /questions
    And it should display a list of questions
    And each question should show its statement
    And each question should show its alternatives

  Scenario: Display loading while fetching questions
    Given the frontend started fetching questions
    When the response has not arrived yet
    Then the UI should show a simple loading indicator

  Scenario: Display error when fetch fails
    Given GET /questions fails
    When the questions screen loads
    Then the UI should show a simple error message