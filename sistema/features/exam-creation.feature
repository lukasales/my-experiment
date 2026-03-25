Feature: Exam creation

  Scenario: Create an exam successfully
    Given the exam creation form is visible
    When I fill the exam title
    And I choose an answer mode
    And I submit the form
    Then the exam should be created successfully
    And the new exam should appear in the visible exam list

  Scenario: Prevent exam creation with missing required data
    Given the exam creation form is visible
    When I submit the form with missing required data
    Then the frontend should show a simple validation message
    And the exam should not be created