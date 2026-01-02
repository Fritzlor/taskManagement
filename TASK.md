# TrueScaleTech Full Stack Engineer Assessment

## Overview

This repository contains a task management application with some intentional issues that need to be addressed. Your task is to identify and fix these issues within the time limit.


## Required Tasks

### 1. Fix the Security Bug (High Priority)

Users should only be able to access their own data. Currently, authenticated users can access other users' projects and tasks by guessing IDs.

**What to fix:**
- Prevent users from viewing tasks in projects they don't own
- Prevent users from modifying or deleting tasks that don't belong to them

### 2. Add Pagination

The tasks endpoint currently returns all tasks without pagination.

**Requirements:**
- Add pagination to `GET /api/projects/:projectId/tasks`
- Parameters: `page` (default: 1), `pageSize` (default: 10, max: 50)
- Return pagination metadata (total count, total pages, current page)
- Update the frontend to support pagination

### 3. Add Input Validation

Request bodies and query parameters are not validated.

**Requirements:**
- Validate all request bodies (required fields, types, lengths)
- Validate query parameters
- Return appropriate HTTP status codes for invalid input (400)

### 4. Standardize API Errors

API errors are inconsistent in format.

**Requirements:**
- All API errors should return this shape:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

### 5. Fix the Failing Test

There is one failing test in `__tests__/task-authorization.test.ts`. Make the necessary changes so this test passes.

---

## Write-up

After completing the tasks, add **8-12 bullet points** to the README explaining:

- What was fixed and why
- Key decisions and trade-offs made
- What you would improve with more time

---

## Rules

- **Do not over-engineer** — pragmatic solutions are preferred
- You may stub or mock non-essential functionality
- **Clarity and judgment matter more than completeness**
- Focus on demonstrating understanding over perfection

---

## Evaluation Criteria

You will be evaluated on:

1. **Security** — Correct access control and ownership enforcement
2. **Code Quality** — Clean, readable, maintainable code
3. **Pragmatism** — Reasonable decisions under time pressure
4. **Communication** — Clear explanation of decisions and trade-offs

---

## Getting Started

See the README.md for setup instructions.

Good luck! 
