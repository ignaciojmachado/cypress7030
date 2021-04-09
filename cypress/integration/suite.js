/* eslint-disable cypress/no-unnecessary-waiting */
import selectors from "../support/selectors.js";

describe("DMI Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.viewport(1280, 720);
  });

  /***** 
  simple assertions test: make a test that checks that satisfies the following
  1. Main DMI Logo is visible
  ++++*/
  it("simple commands + assertions", () => {
    cy.get(selectors.mainLogo).should("be.visible");
  });

  /***** 
  visual regression: take a screenshot blacking out the main banner, reload the page take another. BONUS POINTS: Compare the two to verify that they are exactly the same. (cy.task)
  ++++*/
  describe("visual testing", () => {
    const failureThreshold = 0;
    const id = Date.now();
    const snapshotsDir = `cypress/screenshots/suite.js/${id}`;

    it("should store original image", () => {
      cy.viewport(1280, 720)
        .visit("/")
        .wait(5000)
        .then(() => {
          cy.get("html").invoke("css", "height", "initial");
          cy.get("body").invoke("css", "height", "initial");
          cy.screenshot(`${id}/original`, {
            capture: "viewport",
            timeout: 60000,
            blackout: [".fusion-builder-row-1"],
          });
        });
    });

    it("should store new image", () => {
      cy.viewport(1280, 720)
        .visit("/")
        .wait(5000)
        .then(() => {
          cy.get("html").invoke("css", "height", "initial");
          cy.get("body").invoke("css", "height", "initial");
          cy.screenshot(`${id}/new`, {
            capture: "viewport",
            timeout: 60000,
            blackout: [".fusion-builder-row-1"],
          });
        });
    });

    it(`both images should be less than ${
      failureThreshold * 100
    }% different`, () => {
      cy.task("pixelMatch", {
        failureThresholdType: "percent",
        snapshotsDir,
        receivedImageBuffer: `${snapshotsDir}/original.png`,
        snapshotImageBuffer: `${snapshotsDir}/new.png`,
        failureThreshold,
        snapshotIdentifier: `diff`,
      }).then((result) => {
        assert(
          result.diffRatio <= failureThreshold,
          `Images are ${result.diffRatio}% different`
        );
      });
    });
  });

  /***** 
  intercept: write a test that satisfies the following: 
  1. add an intercept that prevents network calls to be made to hubspot and returns a mocked response
  2. navigate to the contact form
  3. check that request are being intercepted
  Hint: /^.*\b(hubspot)\b.*$/
  ++++*/
  it("cy.intercept", () => {
    cy.intercept(
      {
        url: /^.*\b(hubspot)\b.*$/,
      },
      {
        statusCode: 500,
        body: { error: "Something went wrong" },
        headers: { "access-control-allow-origin": "*" },
        delayMs: 5000,
      }
    ).as("submitForm");

    cy.get("#menu-item-28194 > a > span").click();

    cy.wait("@submitForm").should(({ request, response }) => {
      expect(response.statusCode).be.equal(500);
    });
  });

  /***** 
  conditional testing: write a test that satisfies the following
  1. Clicks the dismiss button of the cookies message at the bottom of the page only if this message is present
  2. Checks that the message is in fact not visible if conditional statement was false
  Notes: keep in mind that you cannot use cypress commands in conditional evaluations, because when not found these cause the whole test to fail
  ++++*/
  it("conditional testing", () => {
    cy.get("body").then(($body) => {
      if (
        $body
          .text()
          .includes(
            "This website uses cookies to ensure you get the best experience on our website"
          )
      ) {
        console.log("TRUE");
        cy.get(selectors.cookiesDismiss).should("be.visible").click();
      } else {
        console.log("FALSE");
        cy.get(selectors.cookiesDismiss).should("not.be.visible");
      }
    });
  });
});
