Feature: Exam editing

  Background:
    Given the exam list is visible

  Scenario: Edit an existing exam successfully
    Given there is at least one existing exam
    When I edit the exam title or answer mode
    And I save the updated exam
    Then the exam should be updated successfully
    And the updated exam should appear in the visible list

  Scenario: Prevent invalid exam editing
    Given there is at least one existing exam
    And the exam edit form is visible
    When I submit missing required exam data
    Then the frontend should show a simple validation message
    And the exam should not be updated