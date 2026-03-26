Feature: Exam removal

  Background:
    Given the exam list is visible

  Scenario: Remove an existing exam successfully
    Given there is at least one existing exam
    When I request removal of an exam
    Then the exam should be removed successfully
    And it should no longer appear in the visible exam list

  Scenario: Show a simple error when exam removal fails
    Given there is at least one existing exam
    When the exam removal request fails
    Then the frontend should show a simple error message
    And the exam should remain visible