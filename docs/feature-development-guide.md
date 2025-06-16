# Feature Development Guide

## 1. Understand the Requirement
- **Read the ticket or user story** carefully.
- **Clarify ambiguities** by asking targeted questions.
- **Define success criteria**: list acceptance criteria and edge cases.

## 2. Explore the Existing Codebase
- **Locate related modules**: search for similar features.
- **Review architecture diagrams** or README to grasp high-level flow.
- **Gather context**: note coding patterns, naming conventions, and existing utilities.

## 3. Plan Your Approach
- **Break the feature down** into smaller tasks:
  1. Data models / schema changes  
  2. Business logic  
  3. API or UI enhancements  
  4. Tests  
- **Sketch a rough design**:
  - Sequence diagram or flowchart (even a quick ASCII sketch).
  - Pseudocode for core logic.

## 4. Write Tests First
- **Define unit tests** covering:
  - Happy path(s)  
  - Edge cases  
  - Failure modes  
- **Use mocking/stubbing** for external dependencies.

## 5. Implement Incrementally
- **Commit early, commit often**:
  - Small commits with meaningful messages.
  - Link each commit to a task or issue number.
- **Run tests locally** after each change.
- **Refactor as you go** to keep code clean.

## 6. Self-Review
- **Run linters and formatters** automatically.
- **Verify test coverage** hasn’t dropped.
- **Check for TODOs** and leftover debug code.
- **Ensure naming consistency** and that any new public APIs are documented.

## 7. Submit for Code Review
- **Open a Pull Request**:
  - Summarize what you did.
  - Highlight any non-obvious decisions.
- **Address feedback** promptly:
  - Reply to comments.
  - Iterate until approval.

## 8. Merge & Monitor
- **Merge after approval** and follow the project’s release process.
- **Watch CI/CD pipelines** for failures.
- **Validate in staging** and smoke-test in production as required.
