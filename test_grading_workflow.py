#!/usr/bin/env python3
import requests
import json

print("Testing Grading Workflow...")
print("=" * 50)

# Test answer-key import
answer_key_csv = 'examNumber,q1,q2\n1,B,A'
response1 = requests.post('http://localhost:3001/grading/answer-key/import', json={'csvContent': answer_key_csv})
print('Answer Key Import:', response1.status_code)
print(json.dumps(response1.json(), indent=2))

# Test student-responses import
student_responses_csv = 'studentId,examNumber,q1,q2\nstudent1,1,B,A'
response2 = requests.post('http://localhost:3001/grading/student-responses/import', json={'csvContent': student_responses_csv})
print('\nStudent Responses Import:', response2.status_code)
print(json.dumps(response2.json(), indent=2))

# Test strict grading
response3 = requests.post('http://localhost:3001/grading/run/strict')
print('\nStrict Grading:', response3.status_code)
print(json.dumps(response3.json(), indent=2))

# Test final report
response4 = requests.get('http://localhost:3001/grading/report/final?mode=strict')
print('\nFinal Report:', response4.status_code)
print(json.dumps(response4.json(), indent=2))

print("\n" + "=" * 50)
print("Workflow test completed successfully!")
