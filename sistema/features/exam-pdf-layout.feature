@generation
Feature: Exam PDF layout and generation flow

  Scenario: Batch generation returns valid PDF artifacts with exam-numbered files
    Given the generation API client is available
    And exam "exam-1" is configured with answer mode "letters" and question ids "q1,q2"
    When I request batch exam ZIP for "exam-1" with count 2
    Then the generation response should be successful
    And the generation response should be a non-empty ZIP artifact
    And the ZIP should contain exactly 2 PDF files
    And every PDF entry in the ZIP should be a valid non-empty PDF