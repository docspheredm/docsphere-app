describe("Surgical Encounter Workflow - Complete 5-Stage Surgery Process", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login();
  });

  it("should display the medical dashboard with all tabs", () => {
    // Verify main dashboard elements
    cy.contains("button", "Old Patient").should("be.visible");
    cy.contains("button", "New Patient").should("be.visible");
    cy.contains("button", "Surgical Patients").should("be.visible");
    cy.contains("button", "Reminders").should("be.visible");
  });

  describe("5-Stage Surgical Workflow", () => {
    beforeEach(() => {
      // Navigate to Old Patient tab and create a patient to transition to surgery
      cy.contains("button", "Old Patient").click();
    });

    it("Stage 1: Pre-Surgical Investigations - Order Tests", () => {
      // Assuming we have a patient to work with
      cy.get("[data-testid='patient-item']").first().click().then(() => {
        // Look for a "Start Surgery" button
        cy.contains("button", "Start Surgery").click();
      });

      // Should navigate to surgical encounter recorder
      cy.contains("Stage 1:", { timeout: 10000 }).should("be.visible");
      cy.contains("Pre-surgical Investigations").should("be.visible");

      // Test ordering blood tests
      cy.contains("button", "Add Investigation").click();
      cy.get("select").first().select("Blood Test");
      cy.get("input[type='text']").first().type("Complete Blood Count");
      cy.contains("button", "Confirm").click();

      // Verify investigation was added
      cy.contains("Complete Blood Count").should("be.visible");

      // Order imaging
      cy.contains("button", "Add Investigation").click();
      cy.get("select").first().select("Imaging");
      cy.get("input[type='text']").first().type("X-Ray Chest");
      cy.contains("button", "Confirm").click();

      cy.contains("X-Ray Chest").should("be.visible");

      // Mark all as cleared
      cy.get("[data-testid='cleared-checkbox']").each(($checkbox) => {
        cy.wrap($checkbox).check();
      });

      // Proceed to next stage
      cy.contains("button", "All Clear - Proceed to Stage 2").click();
    });

    it("Stage 2: Pre-Anesthetic Checkup - ASA Grading", () => {
      cy.contains("Stage 2:", { timeout: 10000 }).should("be.visible");
      cy.contains("Pre-Anesthetic Checkup").should("be.visible");

      // Fill anesthesiologist name
      cy.get("input[placeholder*='Anesthesiologist']").type("Dr. Anesthetic");

      // Select ASA grade
      cy.contains("label", "ASA Grade").parent().find("select").select("II");

      // Check clearance checkbox
      cy.contains("label", "Anesthetic Clearance").parent().find("input[type='checkbox']").check();

      // Verify clearance text
      cy.contains("Clearance for surgery granted").should("be.visible");

      // Proceed to next stage
      cy.contains("button", "ASA Assessment Complete - Proceed to Stage 3").click();
    });

    it("Stage 3: Surgery Planning - Set Date/Time/Approach", () => {
      cy.contains("Stage 3:", { timeout: 10000 }).should("be.visible");
      cy.contains("Surgery Planning").should("be.visible");

      // Fill surgery name
      cy.get("input[placeholder*='Surgery name']").type("Appendectomy");

      // Fill planned date
      cy.get("input[type='date']").type("2026-02-15");

      // Fill planned time
      cy.get("input[type='time']").type("10:00");

      // Select surgical approach
      cy.contains("label", "Approach").parent().find("select").select("Laparoscopic");

      // Select urgency level
      cy.contains("label", "Urgency").parent().find("select").select("Routine");

      // Proceed to next stage
      cy.contains("button", "Surgery Planned - Proceed to Stage 4").click();
    });

    it("Stage 4: Surgical Notes - Record Findings", () => {
      cy.contains("Stage 4:", { timeout: 10000 }).should("be.visible");
      cy.contains("Surgical Notes").should("be.visible");

      // Fill anesthesia technique
      cy.get("input[placeholder*='Anesthesia']").type("General Anesthesia");

      // Fill approach
      cy.get("input[placeholder*='Approach']").type("Midline incision");

      // Fill findings
      cy.get("textarea").first().type("Appendix was inflamed. Appendectomy performed successfully.");

      // Add biopsies
      cy.contains("button", "Add Biopsy").click();
      cy.get("input").last().type("Appendix tissue");

      // Add cultures
      cy.contains("button", "Add Culture").click();
      cy.get("input").last().type("Aerobic and Anaerobic");

      // Add implants
      cy.contains("button", "Add Implant").click();
      cy.get("input").last().type("Mesh reinforcement");

      // Proceed to final stage
      cy.contains("button", "Surgery Completed - Proceed to Stage 5").click();
    });

    it("Stage 5: Post-Op Follow-up - Discharge & Recovery", () => {
      cy.contains("Stage 5:", { timeout: 10000 }).should("be.visible");
      cy.contains("Post-Surgery Follow-up").should("be.visible");

      // Select wound status
      cy.contains("label", "Wound Status").parent().find("select").select("Healing well");

      // Check suture removal
      cy.contains("label", "Suture Removal Done").parent().find("input[type='checkbox']").check();

      // Check drain removal
      cy.contains("label", "Drain Removal Done").parent().find("input[type='checkbox']").check();

      // Select post-op status
      cy.contains("label", "Post-Op Status").parent().find("select").select("Ready for discharge");

      // Complete surgery
      cy.contains("button", "Complete Surgery").click();

      // Should show success message or return to dashboard
      cy.contains("Surgery recorded successfully", { timeout: 5000 }).should("be.visible");
    });
  });

  describe("Follow-up Visit Classification System", () => {
    it("should correctly classify same-condition follow-up visits", () => {
      // Navigate to Old Patient
      cy.contains("button", "Old Patient").click();

      // Select a patient with previous encounters
      cy.get("[data-testid='patient-with-encounter']").first().click();

      // Start a new encounter which should trigger follow-up detection
      cy.contains("button", "New Encounter").click();

      // System should detect previous encounter
      cy.contains("Follow-up Visit Detected").should("be.visible");
      cy.contains("Previous encounters found").should("be.visible");

      // Select same-condition follow-up
      cy.contains("label", "Same condition - continuation").click();

      // Fill encounter details
      cy.get("input[placeholder*='Chief Complaint']").type("Post-treatment review");

      // Complete encounter
      cy.contains("button", "Complete Encounter").click();

      // Verify follow-up was recorded with correct type
      cy.contains("Follow-up recorded: same-condition").should("be.visible");
    });

    it("should correctly classify additional-new-condition follow-up visits", () => {
      cy.contains("button", "Old Patient").click();
      cy.get("[data-testid='patient-with-encounter']").first().click();
      cy.contains("button", "New Encounter").click();

      cy.contains("Follow-up Visit Detected").should("be.visible");

      // Select additional-new-condition
      cy.contains("label", "Additional new condition").click();

      // Description field should appear
      cy.get("input[placeholder*='New condition']").type("Hypertension");

      cy.get("input[placeholder*='Chief Complaint']").type("Blood pressure monitoring");

      cy.contains("button", "Complete Encounter").click();

      cy.contains("Follow-up recorded: additional-new-condition").should("be.visible");
    });

    it("should correctly classify entirely-new-condition follow-up visits", () => {
      cy.contains("button", "Old Patient").click();
      cy.get("[data-testid='patient-with-encounter']").first().click();
      cy.contains("button", "New Encounter").click();

      cy.contains("Follow-up Visit Detected").should("be.visible");

      // Select entirely-new-condition
      cy.contains("label", "Entirely new condition").click();

      // Description field should appear
      cy.get("input[placeholder*='New condition']").type("Diabetes mellitus");

      cy.get("input[placeholder*='Chief Complaint']").type("New diagnosis follow-up");

      cy.contains("button", "Complete Encounter").click();

      cy.contains("Follow-up recorded: entirely-new-condition").should("be.visible");
    });
  });

  describe("Surgical Patients Tab - View & Manage", () => {
    it("should display list of surgical patients", () => {
      cy.contains("button", "Surgical Patients").click();

      // Should show surgical patients
      cy.contains("Surgical Patients List").should("be.visible");

      // Should have search/filter options
      cy.get("input[placeholder*='Search']").should("be.visible");
    });

    it("should show surgical patient details with encounter history", () => {
      cy.contains("button", "Surgical Patients").click();

      // Click on first surgical patient
      cy.get("[data-testid='surgical-patient-item']").first().click();

      // Should display patient details
      cy.contains("h2").should("contain", "Name:").should("be.visible");

      // Should show surgical status
      cy.contains("Status:").should("be.visible");

      // Should show surgical encounters
      cy.contains("Surgical Encounters").should("be.visible");

      // Should show follow-up visits section
      cy.contains("Follow-up Visits").should("be.visible");
    });
  });

  describe("API Integration - Surgical Endpoints", () => {
    it("should fetch surgical patients via API", () => {
      cy.request("GET", "/api/surgical-patients").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("patients");
        expect(Array.isArray(response.body.patients)).to.be.true;
      });
    });

    it("should create new surgical patient via API", () => {
      const newPatient = {
        name: "Test Patient",
        email: "test@example.com",
        phone: "1234567890",
        age: 45,
      };

      cy.request("POST", "/api/surgical-patients", newPatient).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property("id");
        expect(response.body.name).to.equal("Test Patient");
      });
    });

    it("should fetch surgical encounters by patient ID", () => {
      cy.request("GET", "/api/surgical-encounters?patientId=test-123").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("encounters");
      });
    });

    it("should create surgical encounter via API", () => {
      const newEncounter = {
        patientId: "test-123",
        encounterId: "enc-456",
        stage1: {
          investigations: [],
          allClearedForSurgery: false,
        },
      };

      cy.request("POST", "/api/surgical-encounters", newEncounter).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property("id");
      });
    });

    it("should fetch follow-up visits via API", () => {
      cy.request("GET", "/api/followup-visits?patientId=test-123").then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("followupVisits");
      });
    });

    it("should create follow-up visit via API", () => {
      const newFollowup = {
        patientId: "test-123",
        originalEncounterId: "enc-456",
        followupType: "same-condition",
        description: "Post-treatment review",
      };

      cy.request("POST", "/api/followup-visits", newFollowup).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property("id");
      });
    });
  });

  describe("Data Validation & Error Handling", () => {
    it("should prevent proceeding without completing required fields", () => {
      cy.contains("button", "Old Patient").click();
      cy.get("[data-testid='patient-item']").first().click();
      cy.contains("button", "Start Surgery").click();

      // Try to proceed without investigations
      cy.contains("button", "All Clear - Proceed").should("be.disabled");
    });

    it("should show error for invalid API request", () => {
      cy.request({
        method: "POST",
        url: "/api/surgical-patients",
        body: {}, // Missing required fields
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.gte(400);
      });
    });

    it("should handle network errors gracefully", () => {
      // Intercept and fail the request
      cy.intercept("GET", "/api/surgical-patients", {
        statusCode: 500,
        body: { error: "Internal Server Error" },
      }).as("failedRequest");

      cy.contains("button", "Surgical Patients").click();
      cy.wait("@failedRequest");

      // Should show error message
      cy.contains("Error loading surgical patients").should("be.visible");
    });
  });

  describe("UI/UX Responsiveness", () => {
    it("should be responsive on mobile viewport", () => {
      cy.viewport("iphone-x");
      cy.visit("/");

      cy.contains("button", "Old Patient").should("be.visible");
      cy.contains("button", "Surgical Patients").should("be.visible");
    });

    it("should be responsive on tablet viewport", () => {
      cy.viewport("ipad-2");
      cy.visit("/");

      cy.contains("button", "Old Patient").should("be.visible");
      cy.get("[data-testid='main-content']").should("be.visible");
    });

    it("should be responsive on desktop viewport", () => {
      cy.viewport(1920, 1080);
      cy.visit("/");

      cy.contains("button", "Old Patient").should("be.visible");
      cy.get("[data-testid='main-content']").should("be.visible");
    });
  });

  describe("Performance & Loading States", () => {
    it("should show loading state when fetching surgical patients", () => {
      // Intercept the request and delay it
      cy.intercept("GET", "/api/surgical-patients", (req) => {
        req.reply((res) => {
          res.delay?.(2000);
        });
      }).as("fetchPatients");

      cy.contains("button", "Surgical Patients").click();

      // Should show loading indicator
      cy.contains("Loading...", { timeout: 5000 }).should("be.visible");

      cy.wait("@fetchPatients");

      // Should show patients after loading
      cy.get("[data-testid='surgical-patient-item']").should("have.length.greaterThan", 0);
    });

    it("should handle rapid navigation between tabs", () => {
      cy.contains("button", "Old Patient").click();
      cy.contains("button", "New Patient").click();
      cy.contains("button", "Surgical Patients").click();
      cy.contains("button", "Reminders").click();
      cy.contains("button", "Old Patient").click();

      // Should still be functional
      cy.contains("Old Patient").should("be.visible");
    });
  });
});
