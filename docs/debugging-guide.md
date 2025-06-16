# Debugging & Verification Guide

## 1. Adopt a Detective Mindset
- **Reproduce reliably**: confirm the bug steps in a clean environment.
- **Gather clues**:
  - Error messages  
  - Stack traces  
  - Logs (timestamps, request IDs, user IDs)

## 2. Isolate the Problem
- **Binary search**:
  - Comment out or disable half the code.
  - Narrow down until you find the culprit.
- **Write a minimal repro**:
  - Strip away unrelated code.
  - Makes it easier to spot the issue.

## 3. Instrument & Inspect
- **Use breakpoints** in your IDE:
  - Step through the execution flow.
- **Add temporary logging**:
  - Log variable values, function entry/exits.
- **Inspect state**:
  - Before and after transformations.

## 4. Hypothesize & Test
- **Formulate a theory**: “I think X is null because…”
- **Validate**:
  - Write a quick unit test.
  - Try out fixes in the debugger or REPL.

## 5. Common Pitfalls
- **Off-by-one errors** in loops.
- **Async timing issues** (race conditions).
- **State mutation** vs. copying.
- **Configuration/environment mismatches**.

## 6. Use Automated Tools
- **Linters**: catch syntax and style issues early.
- **Static analyzers**: detect potential null dereferences.
- **Memory profilers**: uncover leaks.
- **Performance profilers**: identify hotspots.

## 7. Rubber-Duck & Pair Debugging
- **Explain the problem aloud** (even to an inanimate object).
- **Pair with a colleague**: a fresh pair of eyes often spots subtle bugs.

## 8. Final Verification
- **Re-run full test suite** after fix.
- **Write regression tests** to lock in the bug fix.
- **Check related functionality** hasn’t been broken.
