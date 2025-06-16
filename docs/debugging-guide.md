# Debugging & Verification Guide for GitHub Copilot Agent

## 1. Problem Identification

* **Clarify Issue**: Clearly understand and restate the user's described bug or unexpected behavior.
* **Check Context**:

  * Identify specific error messages, logs, and stack traces from provided context.
  * Confirm reproducible steps clearly, noting any environment or input specifics.

## 2. Initial Hypothesis

* **Formulate a logical hypothesis** based on known symptoms (e.g., "This may be caused by a null value in variable `X` because of improper initialization").
* **Review recent changes**: check diffs or commits that might have introduced the problem.

## 3. Code Inspection

* **Inspect suspicious code blocks** identified from the hypothesis:

  * Confirm variable initializations, null checks, loops, and conditional branches.
  * Identify potential issues such as off-by-one errors, incorrect conditionals, or missing exception handling.

## 4. Create a Minimal Repro

* **Suggest or generate** a simplified code snippet or unit test to consistently reproduce the problem.
* Ensure it isolates and demonstrates the problem without unrelated dependencies.

## 5. Automated Instrumentation & Logging

* **Propose debug logs or assertions** at key points:

  * Entry and exit of relevant functions.
  * Values of critical variables before and after transformations.
  * Conditional branches to reveal unexpected execution paths.

## 6. Propose Fixes & Validations

* **Offer possible code solutions** explicitly tied to the identified issue:

  * Provide reasoning (e.g., why adding a null check resolves the problem).
* Suggest tests or assertions to confirm the fix works correctly, covering both happy and edge cases.

## 7. Evaluate & Verify

* **Automatically suggest tests** (unit/integration) that demonstrate the bug is resolved.
* Recommend running automated checks:

  * Static analyzers to catch side-effects.
  * Test suites to ensure regression-free fixes.
* Confirm no related functionality is negatively impacted.

## 8. Document the Resolution

* Clearly summarize the fix:

  * The root cause and resolution clearly articulated.
  * Changes explicitly described and justified.
