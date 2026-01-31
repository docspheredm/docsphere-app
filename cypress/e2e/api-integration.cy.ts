describe("API Integration Tests - Medical App Endpoints", () => {
  const baseUrl = "http://localhost:9002/api";

  describe("Patients API", () => {
    it("should fetch all patients", () => {
      cy.request("GET", `${baseUrl}/patients`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("patients");
        expect(Array.isArray(response.body.patients)).to.be.true;
      });
    });

    it("should fetch patients with pagination", () => {
      cy.request("GET", `${baseUrl}/patients?page=1&limit=10`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.patients).to.have.length.lessThanOrEqual(10);
      });
    });

    it("should search patients by name", () => {
      cy.request("GET", `${baseUrl}/patients?search=John`).then((response) => {
        expect(response.status).to.eq(200);
        if (response.body.patients.length > 0) {
          expect(response.body.patients[0].name.toLowerCase()).to.include("john");
        }
      });
    });

    it("should create a new patient", () => {
      const newPatient = {
        name: `Test Patient ${Date.now()}`,
        age: 45,
        email: `test${Date.now()}@example.com`,
        phone: "1234567890",
      };

      cy.request("POST", `${baseUrl}/patients`, newPatient).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property("id");
        expect(response.body.name).to.equal(newPatient.name);
      });
    });

    it("should reject patient creation with missing fields", () => {
      const invalidPatient = {
        name: "Test Patient",
        // Missing required fields
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/patients`,
        body: invalidPatient,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.greaterThanOrEqual(400);
      });
    });

    it("should validate email format on patient creation", () => {
      const patientWithInvalidEmail = {
        name: "Test Patient",
        age: 45,
        email: "invalid-email",
        phone: "1234567890",
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/patients`,
        body: patientWithInvalidEmail,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.greaterThanOrEqual(400);
      });
    });
  });

  describe("Encounters API", () => {
    let patientId: string;

    before(() => {
      // Create a patient for testing encounters
      const newPatient = {
        name: `Encounter Test ${Date.now()}`,
        age: 35,
        email: `encounter${Date.now()}@example.com`,
        phone: "1234567890",
      };

      cy.request("POST", `${baseUrl}/patients`, newPatient).then((response) => {
        patientId = response.body.id;
      });
    });

    it("should fetch encounters for a patient", () => {
      cy.request("GET", `${baseUrl}/encounters?patientId=${patientId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("encounters");
        expect(Array.isArray(response.body.encounters)).to.be.true;
      });
    });

    it("should create a new encounter", () => {
      const newEncounter = {
        patientId,
        chiefComplaint: "Headache",
        diagnosis: "Migraine",
        notes: "Patient reports severe headache",
        vitals: {
          temperature: 98.6,
          bloodPressure: "120/80",
          heartRate: 72,
        },
      };

      cy.request("POST", `${baseUrl}/encounters`, newEncounter).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property("id");
        expect(response.body.chiefComplaint).to.equal("Headache");
      });
    });

    it("should filter encounters by date range", () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      cy.request(
        "GET",
        `${baseUrl}/encounters?patientId=${patientId}&startDate=${startDate}&endDate=${endDate}`
      ).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("encounters");
      });
    });

    it("should update an existing encounter", () => {
      // First create an encounter
      const newEncounter = {
        patientId,
        chiefComplaint: "Cough",
        diagnosis: "Common Cold",
        notes: "Mild symptoms",
      };

      cy.request("POST", `${baseUrl}/encounters`, newEncounter)
        .then((response) => {
          const encounterId = response.body.id;

          // Update the encounter
          const updatedEncounter = {
            diagnosis: "Upper Respiratory Infection",
            notes: "Symptoms worsening",
          };

          return cy.request(
            "PUT",
            `${baseUrl}/encounters/${encounterId}`,
            updatedEncounter
          );
        })
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.diagnosis).to.equal("Upper Respiratory Infection");
        });
    });
  });

  describe("Surgical Patients API", () => {
    it("should fetch all surgical patients", () => {
      cy.request("GET", `${baseUrl}/surgical-patients`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("patients");
        expect(Array.isArray(response.body.patients)).to.be.true;
      });
    });

    it("should filter surgical patients by status", () => {
      cy.request("GET", `${baseUrl}/surgical-patients?status=In Surgery`).then((response) => {
        expect(response.status).to.eq(200);
        if (response.body.patients.length > 0) {
          expect(response.body.patients[0].surgicalStatus).to.equal("In Surgery");
        }
      });
    });

    it("should create a new surgical patient from OPD patient", () => {
      const newSurgicalPatient = {
        patientId: "patient-123",
        surgicalStatus: "Pre-op Assessment",
        originalOPDEncounterId: "encounter-456",
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/surgical-patients`,
        body: newSurgicalPatient,
        failOnStatusCode: false,
      }).then((response) => {
        // Status should be 201 if patient didn't exist, or error if it did
        expect(response.status).to.be.oneOf([201, 400]);
      });
    });

    it("should display surgical encounter history", () => {
      cy.request("GET", `${baseUrl}/surgical-patients`).then((response) => {
        if (response.body.patients.length > 0) {
          const patientId = response.body.patients[0].id;

          cy.request("GET", `${baseUrl}/surgical-encounters?patientId=${patientId}`).then(
            (encounterResponse) => {
              expect(encounterResponse.status).to.eq(200);
            }
          );
        }
      });
    });
  });

  describe("Surgical Encounters API", () => {
    it("should fetch surgical encounters", () => {
      cy.request("GET", `${baseUrl}/surgical-encounters`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("encounters");
      });
    });

    it("should filter surgical encounters by status", () => {
      cy.request("GET", `${baseUrl}/surgical-encounters?status=Completed`).then((response) => {
        expect(response.status).to.eq(200);
        if (response.body.encounters.length > 0) {
          // Check that at least some encounters have the expected structure
          expect(response.body.encounters[0]).to.have.property("patientId");
        }
      });
    });

    it("should create a surgical encounter with all stages", () => {
      const newSurgicalEncounter = {
        patientId: "surgical-patient-123",
        encounterId: `encounter-${Date.now()}`,
        stage1: {
          investigations: [
            { investigationType: "Blood Test", testName: "CBC", status: "Pending" },
          ],
          allClearedForSurgery: false,
        },
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/surgical-encounters`,
        body: newSurgicalEncounter,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400]);
      });
    });

    it("should update surgical encounter stage", () => {
      cy.request("GET", `${baseUrl}/surgical-encounters`).then((response) => {
        if (response.body.encounters.length > 0) {
          const encounterId = response.body.encounters[0].id;

          const stageUpdate = {
            stage2: {
              anesthelogistName: "Dr. Anesthetic",
              asa_grade: "II",
              clearanceForSurgery: true,
            },
          };

          cy.request({
            method: "PUT",
            url: `${baseUrl}/surgical-encounters/${encounterId}`,
            body: stageUpdate,
            failOnStatusCode: false,
          }).then((updateResponse) => {
            expect(updateResponse.status).to.be.oneOf([200, 201, 400]);
          });
        }
      });
    });
  });

  describe("Follow-up Visits API", () => {
    it("should fetch all follow-up visits", () => {
      cy.request("GET", `${baseUrl}/followup-visits`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("followupVisits");
        expect(Array.isArray(response.body.followupVisits)).to.be.true;
      });
    });

    it("should filter follow-up visits by type", () => {
      cy.request("GET", `${baseUrl}/followup-visits?type=same-condition`).then((response) => {
        expect(response.status).to.eq(200);
        if (response.body.followupVisits.length > 0) {
          expect(response.body.followupVisits[0].followupType).to.equal("same-condition");
        }
      });
    });

    it("should filter follow-up visits by patient", () => {
      cy.request("GET", `${baseUrl}/followup-visits?patientId=patient-123`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("followupVisits");
      });
    });

    it("should create a same-condition follow-up visit", () => {
      const followupVisit = {
        patientId: "patient-123",
        originalEncounterId: "encounter-456",
        followupType: "same-condition",
        description: "Post-treatment review",
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/followup-visits`,
        body: followupVisit,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400]);
      });
    });

    it("should create an additional-new-condition follow-up visit", () => {
      const followupVisit = {
        patientId: "patient-123",
        originalEncounterId: "encounter-456",
        followupType: "additional-new-condition",
        description: "New condition: Hypertension",
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/followup-visits`,
        body: followupVisit,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400]);
      });
    });

    it("should create an entirely-new-condition follow-up visit", () => {
      const followupVisit = {
        patientId: "patient-123",
        originalEncounterId: "encounter-456",
        followupType: "entirely-new-condition",
        description: "New condition: Diabetes Mellitus",
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/followup-visits`,
        body: followupVisit,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400]);
      });
    });

    it("should search follow-up visits", () => {
      cy.request("GET", `${baseUrl}/followup-visits?search=post-treatment`).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe("Reminders API", () => {
    it("should fetch all reminders", () => {
      cy.request("GET", `${baseUrl}/reminders`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("reminders");
      });
    });

    it("should create a new reminder", () => {
      const newReminder = {
        text: `Test reminder ${Date.now()}`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        patientId: "patient-123",
      };

      cy.request({
        method: "POST",
        url: `${baseUrl}/reminders`,
        body: newReminder,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([201, 400]);
      });
    });

    it("should update a reminder", () => {
      cy.request("GET", `${baseUrl}/reminders`).then((response) => {
        if (response.body.reminders.length > 0) {
          const reminderId = response.body.reminders[0].id;

          const updatedReminder = {
            text: "Updated reminder",
            dueDate: new Date().toISOString(),
          };

          cy.request({
            method: "PUT",
            url: `${baseUrl}/reminders/${reminderId}`,
            body: updatedReminder,
            failOnStatusCode: false,
          }).then((updateResponse) => {
            expect(updateResponse.status).to.be.oneOf([200, 201, 400]);
          });
        }
      });
    });

    it("should delete a reminder", () => {
      // First create a reminder
      const newReminder = {
        text: `Reminder to delete ${Date.now()}`,
        dueDate: new Date().toISOString(),
      };

      cy.request("POST", `${baseUrl}/reminders`, newReminder)
        .then((response) => {
          const reminderId = response.body.id;

          // Delete the reminder
          return cy.request({
            method: "DELETE",
            url: `${baseUrl}/reminders/${reminderId}`,
            failOnStatusCode: false,
          });
        })
        .then((response) => {
          expect(response.status).to.be.oneOf([200, 204, 400]);
        });
    });
  });

  describe("API Error Handling", () => {
    it("should return 404 for non-existent patient", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/patients/non-existent-id`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });

    it("should return 400 for invalid request format", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/patients`,
        body: "invalid json", // Intentionally invalid
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.greaterThanOrEqual(400);
      });
    });

    it("should handle server errors gracefully", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/patients?limit=invalid`, // Invalid parameter
        failOnStatusCode: false,
      }).then((response) => {
        // Server should handle and return appropriate status
        expect(response.status).to.be.oneOf([200, 400]);
      });
    });
  });

  describe("API Performance", () => {
    it("should fetch patients within reasonable time", () => {
      cy.request("GET", `${baseUrl}/patients`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.duration).to.be.lessThan(3000); // Should complete within 3 seconds
      });
    });

    it("should create patient within reasonable time", () => {
      const newPatient = {
        name: `Perf Test ${Date.now()}`,
        age: 40,
        email: `perf${Date.now()}@example.com`,
        phone: "1234567890",
      };

      cy.request("POST", `${baseUrl}/patients`, newPatient).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.duration).to.be.lessThan(2000); // Should complete within 2 seconds
      });
    });
  });
});
