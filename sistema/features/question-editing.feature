Feature: Closed question editing

  Scenario: Edit an existing closed question successfully
    Given the question list is visible
    And there is at least one existing question
    When I edit the statement or alternatives of a question
    And I submit the updated data
    Then the question should be updated successfully
    And the updated question should appear in the visible list

  Scenario: Show a simple validation message when editing with missing required fields
    Given the question edit form is visible
    When I submit the form with missing required data
    Then the frontend should show a simple validation message
    And the question should not be updated