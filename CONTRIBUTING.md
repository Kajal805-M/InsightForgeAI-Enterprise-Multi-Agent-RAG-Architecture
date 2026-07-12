# Contributing Guidelines

First off, thank you for considering contributing to the Enterprise RAG Platform! 

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
3. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`.

## Development Standards

### Backend (Python)
- Follow PEP 8 style guidelines.
- Ensure all new API endpoints are fully typed using Python type hints and Pydantic models.
- Any new services must be injected gracefully and avoid tight coupling.
- Run `pytest` locally to ensure no regressions before committing:
  ```bash
  cd backend
  pytest
  ```

### Frontend (TypeScript / Vanilla JS)
- We strictly avoid heavy frameworks (like React/Vue) to maintain maximum performance and minimal bundle sizes. All UI should be constructed natively using DOM APIs or modern Web Components.
- Use Tailwind CSS utility classes for styling. Do not write custom CSS unless absolutely necessary (add it to `style.css` if so).
- Run Vitest before committing:
  ```bash
  cd frontend
  npm run test
  ```

## Pull Request Process

1. Ensure all tests pass.
2. Update the `README.md` with details of changes to the interface or new features.
3. Submit a Pull Request targeting the `main` branch. Provide a clear summary of the problem and the proposed solution.

Your PR will be reviewed by maintainers and merged upon approval.
