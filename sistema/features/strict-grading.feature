Feature: Strict grading

  Scenario: Grade exams with strict correction
    Given a valid answer key and valid student responses are loaded
    When I run strict grading
    Then the system should apply the rule that a wrong alternative makes the question score zero
    And the grading result should be available for reporting