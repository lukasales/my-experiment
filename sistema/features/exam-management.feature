Feature: Exam management

  Background:
    Given the exam list is visible
    And there is at least one existing exam

  Rule: Manage exams with existing questions

    Scenario: Link questions to an exam
      Given there are existing questions available
      When I select questions for the exam
      And I save the exam question selection
      Then the exam should store the selected question ids
      And the updated exam should appear in the visible list

    Scenario: Edit exam data
      When I edit the exam title or answer mode
      And I save the updated exam
      Then the exam should be updated successfully
      And the updated exam should appear in the visible list

    Scenario: Remove exam
      When I request removal of an exam
      Then the exam should be removed successfully
      And it should no longer appear in the visible exam list
