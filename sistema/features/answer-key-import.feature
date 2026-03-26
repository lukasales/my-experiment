Feature: Answer key CSV import

  Scenario: Import answer key CSV successfully
    Given an answer key CSV file is available
    When I import the answer key CSV
    Then the system should parse the answer key successfully
    And the parsed answer key data should be available for grading

  Scenario: Reject invalid answer key CSV
    Given an invalid answer key CSV file is available
    When I import the answer key CSV
    Then the system should show a simple import error