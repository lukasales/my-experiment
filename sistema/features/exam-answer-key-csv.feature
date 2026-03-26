@generation
Feature: Exam answer-key CSV generation

  Scenario: Generate CSV after batch generation
    Given the generation API client is available
    And exam "exam-1" is configured with answer mode "letters" and question ids "q1,q2"
    And I request batch exam ZIP for "exam-1" with count 3
    When I request answer-key CSV for "exam-1"
    Then the generation response should be successful
    And the generation response should be a non-empty CSV artifact
    And the CSV header should be "examNumber,q1,q2"
    And the CSV should contain exactly 3 data rows
    And each CSV data row should start with a numeric exam number