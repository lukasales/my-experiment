@generation
Feature: Exam randomization in generation

  Scenario: Randomization changes answer-key order with deterministic seed control
    Given the generation API client is available
    And exam "exam-1" is configured with answer mode "letters" and question ids "q1,q2"
    And I force deterministic randomization with zero sequence
    And I request batch exam ZIP for "exam-1" with count 1
    When I request answer-key CSV for "exam-1"
    Then the generation response should be successful
    And the CSV header should be "examNumber,q1,q2"
    And the first CSV data row should not equal "1,B,A"
