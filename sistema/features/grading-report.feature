Feature: Grading report generation

  Scenario: Generate final grading report
    Given grading results are available
    When I generate the final grading report
    Then the system should produce a report with student scores
    And the report should identify the grading mode used