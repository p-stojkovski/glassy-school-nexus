# Standard Coding Practices

## 1. Coding Mindset

* **Be consistent**: mirror existing project style.
* **Readability over cleverness**: choose clarity.
* **Keep it simple**: follow the KISS principle.

## 2. Naming Conventions

* **Variables & functions**: use descriptive, camelCase or snake\_case as per project.
* **Classes & types**: PascalCase.
* **Constants**: UPPER\_SNAKE\_CASE.
* **Avoid abbreviations** unless universally recognized.

## 3. Code Structure

* **Single Responsibility** per function or class.
* **Limit function length** (ideally < 50 lines).
* **Group related code** into modules or folders.

## 4. Documentation & Comments

* **Public APIs**: always include doc comments with parameters and return values.
* **Complex logic**: add concise inline comments.
* **Don’t comment obvious code**—if it needs explanation, consider refactoring.

## 5. Error Handling

* **Fail fast**: validate inputs early.
* **Use exceptions sparingly**; prefer result types or error objects when appropriate.
* **Log meaningful context** on errors (but avoid PII).

## 6. Testing Standards

* **Aim for high coverage** on new code (e.g., > 80%).
* **Use descriptive test names**: `shouldDoXWhenY`.
* **Group tests** by feature or component.

## 8. Code Reviews

* **Review for logic, style, and performance**.
* **Use checklists** to ensure consistency.
* **Be constructive and specific** with feedback.

---

## 9. Coding Problem Solution Template

When tackling algorithmic or coding-challenge tasks, follow this structured template to ensure clarity, efficiency, and maintainability.

### Problem Description

*Clearly state the problem here, including constraints such as input size, expected runtime, or memory limits. Highlight any requirements that impact complexity or performance, ensuring the problem is well-defined for an optimized solution.*

### Approach

Outline your chosen strategy or algorithm, focusing on:

* **Low Complexity**: Explain why this approach minimizes time (e.g., O(n) vs. O(n²)) and space usage.
* **Single Responsibility**: Describe how you’ll break the solution into small, focused functions or modules, each handling one task.
* **Performance**: Detail why this method avoids unnecessary computations or memory overhead.
* **Assumptions**: Note any simplifying assumptions made without sacrificing correctness.
* **High-level Steps**: Write clear steps to prioritize simplicity and efficiency.

### Solution Code

```javascript
// Write modular, efficient code here.
// Each function/module has one clear responsibility (e.g., parsing input, computing results).
// Use concise comments for clarity, avoiding over-commenting obvious logic.
// Optimize for performance with minimal loops and efficient data structures.
```

### Explanation

Break down how the code implements the approach, step-by-step:

* Highlight how each part maintains low complexity (e.g., avoiding nested loops where possible).
* Show how single responsibility is enforced (e.g., one function computes, another validates).
* Detail performance optimizations (e.g., reusing variables, choosing arrays over hash tables when order matters).

### Complexity Analysis

* **Time Complexity**: State the time complexity (e.g., O(n)). Justify it with specifics (e.g., single pass over data) and explain how it achieves low complexity.
* **Space Complexity**: State the space complexity (e.g., O(1)). Justify it (e.g., using only a few variables) and confirm it aligns with low complexity goals.

### Performance Considerations

Detail optimizations and trade-offs made for performance:

* How you reduced redundant calculations (e.g., memoization, pre-computation).
* Why specific data structures or algorithms were chosen for efficiency (e.g., array vs. linked list).
* Any potential bottlenecks (e.g., large inputs) and how they’re mitigated (e.g., early exits, batch processing).

### Reflection

Reflect on the solution process, emphasizing:

* Lessons on achieving low complexity (e.g., simplifying logic without losing accuracy).
* Insights into enforcing single responsibility (e.g., splitting tasks improved clarity).
* Balancing performance with readable, maintainable code (e.g., avoiding over-optimization).
* Challenges faced (e.g., optimizing for edge cases) and solutions applied.
* Potential further improvements (e.g., alternative algorithms) and their trade-offs.
* Connections to broader concepts (e.g., how this reinforces efficient design principles).
