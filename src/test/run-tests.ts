/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn } from 'child_process';
import * as path from 'path';

interface TestSuite {
  name: string;
  filePath: string;
}

const suites: TestSuite[] = [
  { name: 'Unit Tests (Auth, Validations, Belt Order)', filePath: 'src/test/unit.test.ts' },
  { name: 'Integration Tests (API, CRUD, Attendance, RBAC, Edge Cases)', filePath: 'src/test/integration.test.ts' },
];

async function runSuite(suite: TestSuite): Promise<boolean> {
  console.log(`\n======================================================`);
  console.log(` RUNNING: ${suite.name}`);
  console.log(`======================================================`);

  return new Promise((resolve) => {
    // Spawn tsx to execute the test suite file
    const child = spawn('npx', ['tsx', '--test', suite.filePath], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        JWT_SECRET: 'test-dojo-master-key-2026',
      },
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ PASSED: ${suite.name}`);
        resolve(true);
      } else {
        console.error(`\n❌ FAILED: ${suite.name} (Exit Code: ${code})`);
        resolve(false);
      }
    });
  });
}

async function main() {
  console.log(`======================================================`);
  console.log(`🥋🥋🥋 KARATE DOJO TEST RUNNER BOOTING UP 🥋🥋🥋`);
  console.log(`======================================================`);

  let allPassed = true;
  const results: Array<{ name: string; passed: boolean }> = [];

  for (const suite of suites) {
    const passed = await runSuite(suite);
    results.push({ name: suite.name, passed });
    if (!passed) {
      allPassed = false;
    }
  }

  console.log(`\n======================================================`);
  console.log(`🥋🥋🥋 FINAL DOJO TEST EXECUTION SUMMARY 🥋🥋🥋`);
  console.log(`======================================================`);
  
  results.forEach((res) => {
    const statusSymbol = res.passed ? '🟢 PASSED' : '🔴 FAILED';
    console.log(`[${statusSymbol}] - ${res.name}`);
  });

  console.log(`======================================================`);

  if (allPassed) {
    console.log(`\n🏆 OSSSS! All tests successfully built green! The Dojo is secure.\n`);
    process.exit(0);
  } else {
    console.error(`\n🚨 OOPS! Some test paths failed. Please debug before merging changes.\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
