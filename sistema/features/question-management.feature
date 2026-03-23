Feature: Question management

  Scenario: List existing closed questions
    Given the server is running
    When I request the list of questions
    Then the response should be successful
    And the response body should be a JSON array of questions

  Scenario: Question items include alternatives
    Given the server is running
    When I request the list of questions
    Then each question should include a statement and alternatives
    And each alternative should include text and correctness information