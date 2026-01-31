describe("Medical Dashboard - Core Navigation & UI", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  describe("Dashboard Layout & Header", () => {
    it("should display dashboard header with doctor information", () => {
      cy.get("header").should("be.visible");
      cy.contains("VoRe Medical Records").should("be.visible");
      cy.contains("Dr. Smith").should("be.visible");
    });

    it("should display all main tabs", () => {
      const tabs = ["Old Patient", "New Patient", "Surgical Patients", "Reminders"];

      tabs.forEach((tab) => {
        cy.contains("button", tab).should("be.visible");
      });
    });

    it("should have functioning tab navigation", () => {
      cy.contains("button", "Old Patient").click();
      cy.contains("Old Patient").parent().should("have.class", "active");

      cy.contains("button", "New Patient").click();
      cy.contains("New Patient").parent().should("have.class", "active");

      cy.contains("button", "Surgical Patients").click();
      cy.contains("Surgical Patients").parent().should("have.class", "active");
    });
  });

  describe("Old Patient Tab Functionality", () => {
    beforeEach(() => {
      cy.contains("button", "Old Patient").click();
    });

    it("should display list of old patients", () => {
      cy.get("[data-testid='patient-list']").should("be.visible");
      cy.get("[data-testid='patient-item']").should("have.length.greaterThan", 0);
    });

    it("should display patient information cards", () => {
      cy.get("[data-testid='patient-item']").first().within(() => {
        cy.get("[data-testid='patient-name']").should("be.visible");
        cy.get("[data-testid='patient-age']").should("be.visible");
        cy.get("[data-testid='patient-phone']").should("be.visible");
      });
    });

    it("should allow searching for patients", () => {
      cy.get("input[placeholder*='Search']").type("John");
      cy.get("[data-testid='patient-item']").should("have.length.greaterThan", 0);
    });

    it("should show start surgery button for old patients", () => {
      cy.get("[data-testid='patient-item']").first().within(() => {
        cy.contains("button", "Start Surgery").should("be.visible");
      });
    });

    it("should navigate to new encounter when clicking start encounter", () => {
      cy.get("[data-testid='patient-item']").first().click();
      cy.contains("button", "New Encounter").click();

      cy.contains("Encounter Details").should("be.visible");
    });
  });

  describe("New Patient Tab Functionality", () => {
    beforeEach(() => {
      cy.contains("button", "New Patient").click();
    });

    it("should display new patient form", () => {
      cy.get("form").should("be.visible");
      cy.get("input[placeholder*='Name']").should("be.visible");
      cy.get("input[placeholder*='Age']").should("be.visible");
      cy.get("input[placeholder*='Email']").should("be.visible");
      cy.get("input[placeholder*='Phone']").should("be.visible");
    });

    it("should create a new patient with valid data", () => {
      cy.get("input[placeholder*='Name']").type("Jane Doe");
      cy.get("input[placeholder*='Age']").type("35");
      cy.get("input[placeholder*='Email']").type("jane@example.com");
      cy.get("input[placeholder*='Phone']").type("9876543210");

      cy.contains("button", "Create Patient").click();

      cy.contains("Patient created successfully").should("be.visible");
    });

    it("should validate required fields", () => {
      cy.contains("button", "Create Patient").click();

      cy.contains("Name is required").should("be.visible");
      cy.contains("Age is required").should("be.visible");
    });

    it("should validate email format", () => {
      cy.get("input[placeholder*='Name']").type("Jane Doe");
      cy.get("input[placeholder*='Age']").type("35");
      cy.get("input[placeholder*='Email']").type("invalid-email");
      cy.get("input[placeholder*='Phone']").type("9876543210");

      cy.contains("button", "Create Patient").click();

      cy.contains("Invalid email format").should("be.visible");
    });

    it("should validate phone number format", () => {
      cy.get("input[placeholder*='Name']").type("Jane Doe");
      cy.get("input[placeholder*='Age']").type("35");
      cy.get("input[placeholder*='Email']").type("jane@example.com");
      cy.get("input[placeholder*='Phone']").type("123"); // Too short

      cy.contains("button", "Create Patient").click();

      cy.contains("Invalid phone number").should("be.visible");
    });
  });

  describe("Surgical Patients Tab Functionality", () => {
    beforeEach(() => {
      cy.contains("button", "Surgical Patients").click();
    });

    it("should display list of surgical patients", () => {
      cy.get("[data-testid='surgical-patient-list']").should("be.visible");
    });

    it("should show surgical status for each patient", () => {
      cy.get("[data-testid='surgical-patient-item']").first().within(() => {
        cy.contains("Status:").should("be.visible");
        cy.get("[data-testid='surgical-status']").should("be.visible");
      });
    });

    it("should display surgical encounter count", () => {
      cy.get("[data-testid='surgical-patient-item']").first().within(() => {
        cy.contains("Encounters:").should("be.visible");
      });
    });

    it("should allow filtering by surgical status", () => {
      cy.get("select[aria-label*='Filter']").select("In Surgery");
      cy.get("[data-testid='surgical-patient-item']").each(($patient) => {
        cy.wrap($patient).contains("In Surgery").should("be.visible");
      });
    });

    it("should display follow-up visit count for surgical patients", () => {
      cy.get("[data-testid='surgical-patient-item']").first().within(() => {
        cy.contains("Follow-ups:").should("be.visible");
      });
    });
  });

  describe("Reminders Tab Functionality", () => {
    beforeEach(() => {
      cy.contains("button", "Reminders").click();
    });

    it("should display reminders list", () => {
      cy.get("[data-testid='reminders-list']").should("be.visible");
    });

    it("should allow creating new reminder", () => {
      cy.contains("button", "Add Reminder").click();

      cy.get("input[placeholder*='Reminder text']").type("Follow-up with patient");
      cy.get("input[type='datetime-local']").type("2026-02-15T10:00");

      cy.contains("button", "Save Reminder").click();

      cy.contains("Reminder created successfully").should("be.visible");
    });

    it("should display reminder details", () => {
      cy.get("[data-testid='reminder-item']").first().within(() => {
        cy.contains("label", "Text:").should("be.visible");
        cy.contains("label", "Due:").should("be.visible");
        cy.get("button").should("have.length.greaterThan", 0);
      });
    });

    it("should allow editing reminders", () => {
      cy.get("[data-testid='reminder-item']").first().within(() => {
        cy.contains("button", "Edit").click();
      });

      cy.get("input[placeholder*='Reminder text']").clear().type("Updated reminder");
      cy.contains("button", "Save").click();

      cy.contains("Reminder updated successfully").should("be.visible");
    });

    it("should allow deleting reminders", () => {
      cy.get("[data-testid='reminder-item']").first().within(() => {
        cy.contains("button", "Delete").click();
      });

      cy.contains("Are you sure?").should("be.visible");
      cy.contains("button", "Yes, delete").click();

      cy.contains("Reminder deleted successfully").should("be.visible");
    });
  });

  describe("Global Search & Navigation", () => {
    it("should have global search functionality", () => {
      cy.get("input[placeholder*='Search patients']").should("be.visible");
    });

    it("should perform global search across patients", () => {
      cy.get("input[placeholder*='Search patients']").type("John");

      // Should search across all tabs
      cy.get("[data-testid='search-results']").should("be.visible");
    });

    it("should navigate to patient details from search results", () => {
      cy.get("input[placeholder*='Search patients']").type("John");

      cy.get("[data-testid='search-result-item']").first().click();

      cy.contains("Patient Details").should("be.visible");
    });
  });

  describe("Sidebar Navigation", () => {
    it("should display sidebar with navigation options", () => {
      cy.get("[data-testid='sidebar']").should("be.visible");
    });

    it("should have quick access links", () => {
      cy.get("[data-testid='sidebar']").within(() => {
        cy.contains("Dashboard").should("be.visible");
        cy.contains("Patients").should("be.visible");
        cy.contains("Reports").should("be.visible");
      });
    });

    it("should collapse sidebar on mobile", () => {
      cy.viewport("iphone-x");
      cy.get("[data-testid='sidebar-toggle']").click();
      cy.get("[data-testid='sidebar']").should("not.be.visible");
    });
  });

  describe("Accessibility & Keyboard Navigation", () => {
    it("should support tab focus navigation", () => {
      cy.contains("button", "Old Patient").focus().should("have.focus");
    });

    it("should have proper ARIA labels", () => {
      cy.get("[aria-label]").should("have.length.greaterThan", 0);
    });

    it("should support keyboard activation of buttons", () => {
      cy.contains("button", "Old Patient").focus().type("{enter}");
      cy.contains("Old Patient").parent().should("have.class", "active");
    });
  });

  describe("State Persistence", () => {
    it("should persist selected tab on page refresh", () => {
      cy.contains("button", "Surgical Patients").click();
      cy.reload();
      cy.contains("Surgical Patients").parent().should("have.class", "active");
    });

    it("should maintain patient list scroll position", () => {
      cy.contains("button", "Old Patient").click();
      cy.get("[data-testid='patient-list']").scrollTo("bottom");
      cy.reload();
      cy.get("[data-testid='patient-list']").should("be.visible");
    });
  });
});
