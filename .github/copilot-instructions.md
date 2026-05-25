# Repository Skills & Coding Standards

This document defines the architectural patterns, coding standards, and technical constraints for this repository. AI assistants should refer to these rules when generating or refactoring code.

## 1. Core Principles
- **Clean Code:** Follow DRY (Don't Repeat Yourself) and KISS (Keep It Simple, Stupid) principles.
- **SOLID:** Adhere to SOLID principles in all object-oriented designs.
- **Security First:** Always validate inputs, sanitize outputs, and avoid hardcoding secrets or credentials.
 - **Accessibility (a11y):** Ensure all UI components follow WCAG 2.1 standards, including proper ARIA labels and keyboard navigation.

## 2. Technical Stack & Patterns
- **Language Standards:** TypeScript 5.x, React 18+, and Node.js LTS.
- **Architecture:** Feature-based modular architecture. Group components, hooks, and services by feature (e.g., `features/search`, `features/chat`) rather than generic folders.
- **Styling:** Tailwind CSS for utility-first styling. Follow a mobile-first responsive design approach.
- **Error Handling:** Use custom Exception/Error classes rather than generic types. Always provide meaningful error messages and log context where appropriate.
- **Asynchronous Patterns:** Prefer `async/await` over raw Promises or callbacks. Ensure all asynchronous operations have proper error boundaries.
- **State Management:** Use TanStack Query (React Query) for server state and React Context or Zustand for local client state.

## 3. Coding Style
- **Naming Conventions:**
  - Variables/Functions: `camelCase`
  - Classes/Interfaces: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Components: `PascalCase` (File name should match component name).
- **Documentation:** Every public function and class must have a docstring (JSDoc, Google-style Docstrings, etc.) explaining parameters, return types, and potential side effects.
- **Modularity:** Keep files focused. Prefer many small, specialized files over a single "God file."

## 4. Testing Requirements
- **Unit Testing:** Minimum 80% coverage for business logic and hooks. Use Vitest and React Testing Library.
- **Mocking:** Mock external dependencies (APIs, Databases) in unit tests to ensure isolation and speed.
- **E2E Testing:** Use Playwright for critical user journeys (e.g., authentication, document uploading).

## 5. Git & Workflow
- **Commit Messages:** Follow the Conventional Commits specification (e.g., `feat:`, `fix:`, `refactor:`).
- **Pull Requests:** Ensure all code is linted and passes existing tests before submission.
