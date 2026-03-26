@generation
Feature: Single exam PDF generation

  Scenario: Generate one real single-exam PDF
    Given the generation API client is available
    And exam "exam-1" is configured with answer mode "letters" and question ids "q1,q2"
    When I request single exam PDF for "exam-1"
    Then the generation response should be successful
    And the generation response should be a non-empty PDF artifact
    And the PDF should contain at least one page
    And the response should provide a downloadable filename ending with ".pdf"