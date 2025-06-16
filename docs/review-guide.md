# Code Review & Verification Guide

## 1. Understand the Change

* **Review the Context**: Carefully read the original requirement, user story, or task description.
* **Summarize the Purpose**: Clearly restate the intent of the code to confirm understanding before reviewing further.

## 2. Evaluate Clarity & Maintainability

* **Readability Check**:

  * Confirm variable and function names are clear and descriptive.
  * Ensure functions and methods have a single, well-defined responsibility.
* **Simplicity**:

  * Check for overly complex logic; suggest simpler alternatives.
  * Highlight areas that could confuse future maintainers.

## 3. Assess Correctness

* **Logic Review**:

  * Confirm that the logic aligns clearly with the requirements.
  * Identify any missing conditions, edge cases, or incorrect assumptions.
* **Boundary Conditions**:

  * Verify handling of empty inputs, large inputs, null values, and edge scenarios.

## 4. Performance Evaluation

* **Complexity Analysis**:

  * Verify that the chosen approach meets stated time complexity targets (e.g., O(n) vs. O(n²)).
  * Confirm space complexity aligns with requirements (e.g., avoiding unnecessary allocations).
* **Efficiency**:

  * Suggest optimizations to avoid redundant computations or inefficient data structure usage.

## 5. Testing & Coverage

* **Test Review**:

  * Ensure tests cover key scenarios, including happy paths and failure cases.
  * Suggest additional tests if coverage seems incomplete or inadequate.
* **Regression Safety**:

  * Recommend tests to prevent regressions or unintended side-effects.

## 6. Best Practices & Standards

* **Code Conventions**:

  * Confirm adherence to established project coding standards and style guides.
  * Identify deviations clearly, suggesting how to align with best practices.
* **Error Handling & Logging**:

  * Check for meaningful error handling, logs, or exceptions, avoiding sensitive information exposure.

## 7. Security & Robustness

* **Security Check**:

  * Identify potential vulnerabilities (e.g., SQL injection, XSS).
  * Recommend safe handling of sensitive data.
* **Robustness**:

  * Verify resilience against unexpected inputs or failures (e.g., network timeouts, failed dependencies).

## 8. Feedback Clarity & Actionability

* **Constructive Feedback**:

  * Clearly specify what to change, why, and how.
  * Provide actionable suggestions, avoiding ambiguity or overly general comments.

## 9. Summarize Review

* **Concise Summary**:

  * Clearly restate primary strengths and areas for improvement.
  * Explicitly state if the change is ready to merge or needs further revisions.

