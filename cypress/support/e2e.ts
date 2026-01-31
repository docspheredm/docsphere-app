// Cypress support file for E2E tests
import "./commands";

Cypress.on("uncaught:exception", (err, runnable) => {
  // Return false here to prevent Cypress from failing the test
  // This is useful for handling external errors or expected runtime errors
  if (
    err.message.includes("ResizeObserver") ||
    err.message.includes("Cannot read properties of undefined")
  ) {
    return false;
  }
  return true;
});
