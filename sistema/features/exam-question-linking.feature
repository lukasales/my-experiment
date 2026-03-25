Feature: Exam question linking

  Scenario: Link existing questions to an exam
    Given there is at least one existing exam
    And there are existing questions available
    When I select questions for the exam
    And I save the exam question selection
    Then the exam should store the selected question ids
    And the updated exam should appear in the visible list

  Scenario: Prevent saving an exam with invalid question selection
    Given there is an existing exam
    When I submit an invalid question selection
    Then the frontend should show a simple validation message
    And the exam question selection should not be updated