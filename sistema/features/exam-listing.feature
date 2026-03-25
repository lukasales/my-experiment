Feature: Exam listing

  Scenario: List existing exams
    Given the server is running
    When I request the list of exams
    Then the response should be successful
    And the response body should be a JSON array of exams

  Scenario: Exam items include basic metadata
    Given the server is running
    When I request the list of exams
    Then each exam should include an id
    And each exam should include a title
    And each exam should include an answer mode