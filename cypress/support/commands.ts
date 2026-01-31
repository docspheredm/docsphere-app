// Custom commands for medical app testing
Cypress.Commands.add("login", () => {
  cy.visit("/");
});

Cypress.Commands.add("navigateToTab", (tabName: string) => {
  cy.contains("button", tabName).click();
});

Cypress.Commands.add("fillInputField", (label: string, value: string) => {
  cy.contains("label", label).parent().find("input").type(value);
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      navigateToTab(tabName: string): Chainable<void>;
      fillInputField(label: string, value: string): Chainable<void>;
    }
  }
}

export {};
