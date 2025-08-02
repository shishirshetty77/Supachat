# Testing Guide

## Running Tests
- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`
- Coverage report: `npm run test:coverage`

## Test Structure
- Unit tests: `/tests/unit/`
- Integration tests: `/tests/integration/`
- E2E tests: `/tests/e2e/`
- Test utilities: `/tests/utils/`

## Writing Tests
- Use Jest for unit testing
- Use Cypress for E2E testing
- Mock external dependencies
- Aim for 80%+ code coverage
