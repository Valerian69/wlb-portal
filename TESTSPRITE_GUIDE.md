# TestSprite Testing Guide for WLB Portal

## Overview

This project uses **TestSprite MCP Server** for AI-powered automated testing combined with **Jest** and **React Testing Library** for unit and component testing.

## Installation

TestSprite is already installed as a dev dependency. If you need to reinstall:

```bash
npm install --save-dev @testsprite/testsprite-mcp
```

## Configuration

### TestSprite Config (`testsprite.config.json`)

```json
{
  "testsprite": {
    "enabled": true,
    "projectType": "nextjs",
    "testing": {
      "unit": { "enabled": true, "framework": "jest" },
      "component": { "enabled": true, "framework": "react-testing-library" },
      "coverage": { "enabled": true, "threshold": { "lines": 50 } }
    }
  }
}
```

### Jest Config (`jest.config.js`)

Already configured for:
- TypeScript support via `ts-jest`
- React component testing
- Coverage reporting
- Path aliases (`@/*` → `src/*`)

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run with TestSprite runner
npm run test:sprite

# Watch mode (re-runs on file changes)
npm run test:watch
npm run test:sprite:watch

# With coverage report
npm run test:coverage
npm run test:sprite:coverage

# Generate test report
npm run test:sprite:report

# Full test suite with coverage and report
npm run test:sprite:all
```

### Advanced Commands

```bash
# Run tests related to changed files
npm run test:changed

# Run tests for specific file
npm run test:file src/lib/api-client.ts

# Verbose output
npm run test:verbose

# CI mode (no watch, with coverage)
npm run test:ci
```

### Using TestRunner Directly

```bash
# All tests
node testrunner.js

# Watch mode
node testrunner.js --watch

# With coverage
node testrunner.js --coverage

# Generate report
node testrunner.js --report

# Specific test directory
node testrunner.js src/__tests__/lib

# Combined options
node testrunner.js --watch --coverage --verbose
```

## Test Structure

```
src/
├── __tests__/
│   ├── components/
│   │   └── shared.test.tsx      # Component tests
│   ├── contexts/
│   │   └── AuthContext.test.tsx # Context tests
│   ├── lib/
│   │   ├── api-client.test.ts   # API client tests
│   │   ├── encryption.test.ts   # Crypto tests
│   │   ├── password.test.ts     # Auth tests
│   │   ├── rbac.test.ts         # RBAC tests
│   │   └── messageBroker.test.ts # Message tests
│   └── utils/
│       └── test-utils.ts        # Test helpers
```

## Writing Tests

### Unit Test Example

```typescript
// src/__tests__/lib/encryption.test.ts
import { encrypt, decrypt, generateEncryptionKey } from '@/lib/server/crypto/encryption';

describe('Encryption', () => {
  it('should encrypt and decrypt text', () => {
    const plaintext = 'Hello';
    const key = generateEncryptionKey();
    const iv = generateIV();
    
    const encrypted = encrypt(plaintext, key, iv);
    const decrypted = decrypt(encrypted, key, iv);
    
    expect(decrypted).toBe(plaintext);
  });
});
```

### Component Test Example

```typescript
// src/__tests__/components/shared.test.tsx
import { render, screen } from '@testing-library/react';
import { StatusTracker } from '@/components/shared/StatusTracker';

describe('StatusTracker', () => {
  it('should render all status steps', () => {
    render(<StatusTracker currentStatus="submitted" />);
    
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
  });
});
```

### Context Test Example

```typescript
// src/__tests__/contexts/AuthContext.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

describe('AuthProvider', () => {
  it('should authenticate user', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    });
  });
});
```

## Test Coverage

### View Coverage Report

```bash
# Generate and open coverage report
npm run test:coverage
open coverage/index.html  # On macOS
```

### Coverage Thresholds

Current thresholds (in `jest.config.js`):
- **Lines**: 50%
- **Branches**: 50%
- **Functions**: 50%
- **Statements**: 50%

## TestSprite MCP Features

### AI-Powered Test Generation

TestSprite MCP can:
- Generate tests from existing code
- Fix failing tests automatically
- Suggest test improvements
- Create mock data

### Using with AI Assistants

If you have an AI assistant with MCP support (like Cline, Cursor, etc.):

1. Configure MCP server in your IDE settings:
```json
{
  "mcpServers": {
    "testsprite": {
      "command": "node",
      "args": ["node_modules/@testsprite/testsprite-mcp/dist/index.js"],
      "cwd": "/path/to/wlb-portal"
    }
  }
}
```

2. Ask your AI assistant to:
   - "Generate tests for the API client"
   - "Fix failing tests"
   - "Add coverage for the auth module"

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### GitLab CI

```yaml
# .gitlab-ci.yml
test:
  image: node:20
  script:
    - npm ci
    - npm run test:ci
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    reports:
      junit: test-results/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

## Test Utilities

### Mock Data Helpers

```typescript
import { createMockUser, createMockReport } from '@/__tests__/utils/test-utils';

// Create mock user
const user = createMockUser({ role: 'super_admin' });

// Create mock report
const report = createMockReport({ status: 'validated' });
```

### Fetch Mocking

```typescript
import { mockFetchResponse, mockFetchError } from '@/__tests__/utils/test-utils';

// Mock successful response
mockFetchResponse({ data: { user: mockUser } });

// Mock error response
mockFetchError(new Error('Network error'));
```

## Debugging Tests

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${relativeFile}"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debug Commands

```bash
# Run single test file with debug output
npx jest --debug src/__tests__/lib/api-client.test.ts

# Run specific test by name
npx jest -t "should encrypt and decrypt"

# Log test output
npx jest --verbose --no-coverage
```

## Common Issues

### "Cannot find module"

Ensure path aliases are configured in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### "localStorage is undefined"

The Jest setup already mocks localStorage. If you need custom behavior:

```typescript
// In your test
localStorage.getItem.mockReturnValue('mock-value');
```

### "scrollIntoView is not a function"

Already mocked in `jest.setup.ts`. The mock is:

```typescript
Element.prototype.scrollIntoView = jest.fn();
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [TestSprite MCP](https://www.npmjs.com/package/@testsprite/testsprite-mcp)
- [Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)

## Support

For TestSprite-specific issues:
- Documentation: https://testsprite.com/docs
- Support: support@testsprite.com
