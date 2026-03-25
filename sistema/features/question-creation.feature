Feature: Closed question creation

  Scenario: Create a closed question successfully
    Given the question creation form is open
    When I fill the statement and exactly four alternatives
    And I mark the correct alternatives
    And I submit the form
    Then the question should be created successfully
    And the new question should appear in the question list

  Scenario: Prevent creation with missing required fields
    Given the question creation form is open
    When I submit the form with missing required data
    Then the frontend should show a simple validation message
    And the question should not be created