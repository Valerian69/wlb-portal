#!/usr/bin/env node

/**
 * TestSprite Test Runner for WLB Portal
 * 
 * This script runs tests using TestSprite MCP server
 * Usage: npm run test:sprite
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    return true;
  } catch (error) {
    log(`Command failed: ${command}`, 'red');
    return false;
  }
}

function checkConfiguration() {
  const configPath = path.join(process.cwd(), 'testsprite.config.json');
  if (!fs.existsSync(configPath)) {
    log('Error: testsprite.config.json not found!', 'red');
    return false;
  }
  
  const jestConfig = path.join(process.cwd(), 'jest.config.js');
  if (!fs.existsSync(jestConfig)) {
    log('Error: jest.config.js not found!', 'red');
    return false;
  }
  
  return true;
}

function runTests(options = {}) {
  const { watch, coverage, verbose, testPath } = options;
  
  let command = 'npx jest';
  
  if (watch) {
    command += ' --watch';
  }
  
  if (coverage) {
    command += ' --coverage';
  }
  
  if (verbose) {
    command += ' --verbose';
  }
  
  if (testPath) {
    command += ` ${testPath}`;
  }
  
  log('\n🧪 Running TestSprite Tests...\n', 'cyan');
  return runCommand(command);
}

function generateReport() {
  log('\n📊 Generating Test Report...\n', 'cyan');
  
  const reportDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Run with JSON reporter
  runCommand('npx jest --json --outputFile=test-results/jest-results.json');
  
  log(`\n✅ Report generated in ${reportDir}`, 'green');
}

function showHelp() {
  log(`
TestSprite Test Runner for WLB Portal

Usage:
  node testrunner.js [options]

Options:
  --watch, -w      Run tests in watch mode
  --coverage, -c   Generate coverage report
  --verbose, -v    Verbose output
  --report, -r     Generate test report
  --help, -h       Show this help message

Examples:
  node testrunner.js                    # Run all tests
  node testrunner.js --watch            # Watch mode
  node testrunner.js --coverage         # With coverage
  node testrunner.js --report           # Generate report
  node testrunner.js -w -c -v           # Combined options
  node testrunner.js src/__tests__/lib  # Specific test path

  `, 'cyan');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  if (!checkConfiguration()) {
    process.exit(1);
  }
  
  const options = {
    watch: args.includes('--watch') || args.includes('-w'),
    coverage: args.includes('--coverage') || args.includes('-c'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };
  
  const testPath = args.find(arg => !arg.startsWith('-'));
  
  const success = runTests({ ...options, testPath });
  
  if (args.includes('--report') || args.includes('-r')) {
    generateReport();
  }
  
  process.exit(success ? 0 : 1);
}

main();
