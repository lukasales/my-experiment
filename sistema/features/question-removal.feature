Feature: Closed question removal

  Scenario: Remove an existing closed question successfully
    Given the question list is visible
    And there is at least one existing question
    When I request removal of a question
    Then the question should be removed successfully
    And it should no longer appear in the visible list

  Scenario: Show a simple error when removal fails
    Given the question list is visible
    When the removal request fails
    Then the frontend should show a simple error message
    And the question should remain in the visible list