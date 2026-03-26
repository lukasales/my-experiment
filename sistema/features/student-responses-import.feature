Feature: Student responses CSV import

  Scenario: Import student responses CSV successfully
    Given a student responses CSV file is available
    When I import the student responses CSV
    Then the system should parse the student responses successfully
    And the parsed response data should be available for grading

  Scenario: Reject invalid student responses CSV
    Given an invalid student responses CSV file is available
    When I import the student responses CSV
    Then the system should show a simple import error