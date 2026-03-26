@generation
Feature: Batch exam PDF generation

  Scenario: Generate requested number of PDF files in ZIP
    Given the generation API client is available
    And exam "exam-1" is configured with answer mode "letters" and question ids "q1,q2"
    When I request batch exam ZIP for "exam-1" with count 3
    Then the generation response should be successful
    And the generation response should be a non-empty ZIP artifact
    And the ZIP should contain exactly 3 PDF files