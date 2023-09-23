## Inside that directory, you can run several commands:

### Runs the end-to-end tests.

pnpm exec playwright test

### Starts the interactive UI mode.

pnpm exec playwright test --ui

### Runs the tests only on Desktop Chrome.

pnpm exec playwright test --project=chromium

### Runs the tests in a specific file.

pnpm exec playwright test example

### Runs the tests in debug mode.

pnpm exec playwright test --debug

### Auto generate tests with Codegen.

pnpm exec playwright codegen
