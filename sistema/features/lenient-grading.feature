Feature: Lenient grading

  Scenario: Grade exams with proportional correction
    Given a valid answer key and valid student responses are loaded
    When I run lenient grading
    Then the system should apply the chosen proportional scoring rule
    And the grading result should be available for reporting