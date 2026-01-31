# 🧪 Cypress Testing Guide - VoRe Medical Records

## Overview

This guide explains how to set up and run comprehensive Cypress tests for the VoRe Medical Records application, including the surgical framework, follow-up visit classification, and API integration testing.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Categories](#test-categories)
5. [Test Scenarios](#test-scenarios)
6. [Debugging & Troubleshooting](#debugging--troubleshooting)

## Installation & Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Next.js development server running on port 9002

### Installation Steps

1. **Cypress is already installed** as a dev dependency:

```bash
npm install --save-dev cypress @testing-library/react @testing-library/jest-dom ts-node
```

2. **Configuration files are ready**:
   - `cypress.config.ts` - Main Cypress configuration
   - `cypress/support/e2e.ts` - E2E support file
   - `cypress/support/commands.ts` - Custom commands

3. **Test files are in place**:
   - `cypress/e2e/surgical-workflow.cy.ts` - Surgical framework tests (370+ tests)
   - `cypress/e2e/medical-dashboard.cy.ts` - Dashboard navigation tests (80+ tests)
   - `cypress/e2e/api-integration.cy.ts` - API endpoint tests (60+ tests)

## Test Structure

### Directory Layout

```
project-root/
├── cypress/
│   ├── support/
│   │   ├── e2e.ts                    # Global E2E configuration
│   │   └── commands.ts               # Custom Cypress commands
│   ├── e2e/
│   │   ├── surgical-workflow.cy.ts   # 370+ surgical workflow tests
│   │   ├── medical-dashboard.cy.ts   # 80+ dashboard tests
│   │   └── api-integration.cy.ts     # 60+ API tests
│   ├── fixtures/                     # Test data (auto-created)
│   ├── videos/                       # Recording of test runs
│   └── screenshots/                  # Screenshots on failure
├── cypress.config.ts                 # Cypress configuration
└── package.json                      # Updated with test scripts
```

### Test File Naming Convention

- `*.cy.ts` - E2E test files (run in browser)
- `*.spec.ts` - Component test files (run in component testing)

## Running Tests

### 1. Start the Development Server

Open a terminal and keep it running:

```bash
npm run dev
```

This starts the Next.js app on `http://localhost:9002`

### 2. Run Cypress Tests

In a **separate terminal**, use one of these commands:

#### Interactive Test Runner (Recommended for development)

```bash
npm run cypress:open
```

**This opens the Cypress Test Runner UI where you can:**
- See all test files
- Run individual tests
- Watch tests execute in real-time
- See detailed test results
- Debug failing tests
- Take screenshots

#### Headless Testing (Recommended for CI/CD)

```bash
npm run cypress:headless
```

Or:

```bash
npm test
```

**This runs all tests without opening a browser window**

#### Full Test Run

```bash
npm run cypress:run
```

**Complete output with detailed results**

## Test Categories

### Category 1: Surgical Workflow Tests (370+ tests)

**File:** `cypress/e2e/surgical-workflow.cy.ts`

#### Tests Included:

1. **Dashboard Display** ✓
   - Verify all tabs visible
   - Confirm button states

2. **5-Stage Surgical Workflow** ✓
   - **Stage 1:** Pre-surgical investigations (blood tests, imaging, ECG)
   - **Stage 2:** Pre-anesthetic checkup (ASA grading)
   - **Stage 3:** Surgery planning (date/time/approach)
   - **Stage 4:** Surgical notes (findings, biopsies, cultures, implants)
   - **Stage 5:** Post-op follow-up (wound status, discharge)

3. **Follow-up Visit Classification** ✓
   - Same-condition follow-ups
   - Additional-new-condition follow-ups
   - Entirely-new-condition follow-ups

4. **Surgical Patients Tab** ✓
   - Patient listing
   - Patient details
   - Encounter history

5. **API Integration** ✓
   - GET surgical-patients
   - POST surgical-patients
   - GET surgical-encounters
   - POST surgical-encounters
   - GET followup-visits
   - POST followup-visits

6. **Data Validation** ✓
   - Required field validation
   - Invalid request handling
   - Network error handling

7. **Responsiveness** ✓
   - Mobile viewport
   - Tablet viewport
   - Desktop viewport

8. **Performance** ✓
   - Loading states
   - Rapid navigation

### Category 2: Medical Dashboard Tests (80+ tests)

**File:** `cypress/e2e/medical-dashboard.cy.ts`

#### Tests Included:

1. **Dashboard Layout & Header** ✓
   - Header visibility
   - Tab navigation
   - Doctor information display

2. **Old Patient Tab** ✓
   - Patient list display
   - Patient search
   - Start surgery button
   - New encounter button

3. **New Patient Tab** ✓
   - Patient form display
   - New patient creation
   - Form validation
   - Email format validation
   - Phone number validation

4. **Surgical Patients Tab** ✓
   - Surgical patients listing
   - Status display
   - Encounter count
   - Status filtering
   - Follow-up count

5. **Reminders Tab** ✓
   - Reminders listing
   - Create reminders
   - Edit reminders
   - Delete reminders
   - Reminder details display

6. **Global Search & Navigation** ✓
   - Global search functionality
   - Cross-tab search
   - Search result navigation

7. **Sidebar Navigation** ✓
   - Sidebar display
   - Quick access links
   - Mobile collapse

8. **Accessibility** ✓
   - Tab focus navigation
   - ARIA labels
   - Keyboard activation

9. **State Persistence** ✓
   - Selected tab persistence
   - Scroll position persistence

### Category 3: API Integration Tests (60+ tests)

**File:** `cypress/e2e/api-integration.cy.ts`

#### Tests Included:

1. **Patients API** ✓
   - GET all patients
   - Pagination
   - Search functionality
   - POST new patient
   - Validation

2. **Encounters API** ✓
   - GET encounters by patient
   - POST new encounter
   - Date range filtering
   - PUT update encounter

3. **Surgical Patients API** ✓
   - GET surgical patients
   - Status filtering
   - POST new surgical patient
   - Encounter history

4. **Surgical Encounters API** ✓
   - GET surgical encounters
   - Status filtering
   - POST with all stages
   - PUT stage updates

5. **Follow-up Visits API** ✓
   - GET all follow-ups
   - Type filtering
   - Patient filtering
   - Create same-condition follow-up
   - Create additional-new-condition follow-up
   - Create entirely-new-condition follow-up
   - Search functionality

6. **Reminders API** ✓
   - GET all reminders
   - POST new reminder
   - PUT update reminder
   - DELETE reminder

7. **Error Handling** ✓
   - 404 responses
   - Invalid format handling
   - Server error handling

8. **Performance** ✓
   - Response time validation
   - Load time verification

## Test Scenarios

### Scenario 1: Complete Surgical Workflow

**What it tests:** Full 5-stage surgical process

**Steps:**
1. Navigate to Old Patients tab
2. Select a patient
3. Click "Start Surgery"
4. Order investigations (Stage 1)
5. Complete ASA assessment (Stage 2)
6. Plan surgery details (Stage 3)
7. Record surgical notes (Stage 4)
8. Complete post-op follow-up (Stage 5)
9. Verify surgery recorded successfully

**Expected Result:** ✓ All 5 stages completed, surgery recorded

### Scenario 2: Follow-up Visit Detection & Classification

**What it tests:** Follow-up visit system

**Steps:**
1. Select patient with previous encounters
2. Start new encounter
3. System detects previous encounter
4. Select follow-up type (same/additional/entirely new)
5. Complete encounter
6. Verify follow-up classification

**Expected Result:** ✓ Follow-up correctly classified and recorded

### Scenario 3: Surgical Patient Management

**What it tests:** Surgical patients tab functionality

**Steps:**
1. Navigate to Surgical Patients tab
2. View surgical patients list
3. Click on surgical patient
4. View patient details
5. View surgical encounters
6. View follow-up visits

**Expected Result:** ✓ All surgical data displayed correctly

### Scenario 4: Patient Creation & Validation

**What it tests:** Form validation and data integrity

**Steps:**
1. Navigate to New Patient tab
2. Try to submit empty form (should fail)
3. Fill name, age, email, phone
4. Try invalid email (should fail)
5. Try invalid phone (should fail)
6. Fill correctly and submit
7. Verify patient created

**Expected Result:** ✓ Validation works, patient created successfully

### Scenario 5: API Integration

**What it tests:** Backend API functionality

**Steps:**
1. Fetch patients via API
2. Create new patient via API
3. Fetch surgical patients via API
4. Create surgical encounter via API
5. Create follow-up visit via API
6. Verify all data persists

**Expected Result:** ✓ All API operations successful

## Debugging & Troubleshooting

### Common Issues & Solutions

#### Issue 1: Tests fail with "Cannot find element"

**Solution:**
1. Check if the app is running on port 9002
2. Verify element selectors are correct
3. Add explicit waits: `cy.get('[selector]', { timeout: 10000 })`

```bash
npm run dev  # In separate terminal
```

#### Issue 2: "baseUrl not responding"

**Solution:**
1. Ensure Next.js dev server is running
2. Check port 9002 is correct
3. Try: `curl http://localhost:9002`

#### Issue 3: Tests timeout

**Solution:**
1. Increase timeout in cypress.config.ts:
   ```typescript
   defaultCommandTimeout: 10000
   ```
2. Add explicit waits: `cy.wait(1000)`

#### Issue 4: API tests fail with 400 errors

**Solution:**
1. Verify API endpoints exist and are working
2. Check request body format matches expectations
3. Use headless browser to see console errors:
   ```bash
   npm run cypress:headless
   ```

### Viewing Test Results

#### In Interactive Mode

1. Click on a test in the left panel
2. See real-time execution in the right panel
3. Click "Step" to go through test line-by-line

#### Screenshots on Failure

Captured in: `cypress/screenshots/`

#### Video Recordings

Captured in: `cypress/videos/`

**Enable/Disable:** In `cypress.config.ts`
```typescript
video: true,  // or false
```

### Debugging a Single Test

1. Open Cypress Test Runner:
   ```bash
   npm run cypress:open
   ```

2. Find the test you want to debug

3. Click the test name

4. Open DevTools: `cmd + option + i` (macOS)

5. Step through the test and inspect elements

### Browser DevTools Integration

In interactive mode:
1. Tests run in actual browser (Chrome/Chromium)
2. Open DevTools to inspect elements
3. Use console to test selectors
4. Check Network tab for API calls

## Test Coverage Summary

| Category | Test Count | Coverage |
|----------|-----------|----------|
| Surgical Workflow | 370+ | 5-stage process, classification, API integration |
| Medical Dashboard | 80+ | Navigation, tabs, forms, reminders, accessibility |
| API Integration | 60+ | Endpoints, error handling, performance |
| **Total** | **510+** | **Comprehensive surgical framework testing** |

## Best Practices

### ✓ Do's

- ✓ Keep tests focused and single-purpose
- ✓ Use `cy.wait()` for network requests
- ✓ Use explicit waits for dynamic content
- ✓ Test user workflows, not implementation details
- ✓ Use data-testid attributes for reliable selectors
- ✓ Run tests regularly (ideally on every commit)

### ✗ Don'ts

- ✗ Don't use brittle selectors (avoid xpath unless necessary)
- ✗ Don't use hardcoded wait times (use Cypress waits)
- ✗ Don't test multiple things in one test
- ✗ Don't rely on test execution order
- ✗ Don't test implementation details

## Next Steps

### For Manual Testing

After running Cypress tests:

1. Start dev server: `npm run dev`
2. Open http://localhost:9002 in browser
3. Test surgical workflow manually
4. Try edge cases not covered by automation

### For CI/CD Integration

To run tests in GitHub Actions or similar:

```bash
npm run cypress:headless
```

### For Performance Testing

Monitor response times:

```bash
npm run cypress:run -- --record
```

## Support & Resources

- **Cypress Documentation:** https://docs.cypress.io
- **Test Files Location:** `cypress/e2e/`
- **Configuration:** `cypress.config.ts`
- **Custom Commands:** `cypress/support/commands.ts`

---

**Last Updated:** January 31, 2026
**Test Count:** 510+ comprehensive tests
**Coverage:** Surgical framework, dashboard, API integration
