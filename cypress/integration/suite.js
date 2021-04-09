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
  it.skip("simple commands + assertions", () => {
    cy.get(selectors.mainLogo).should("be.visible");
  });

  /***** 
  visual regression: take a screenshot, reload the page take another and then compare the two to verify that they are exactly the same.
  ++++*/
  it.skip("visual testing", () => {
    cy.screenshot("homepage", {
      blackout: [selectors.mainLogo],
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
  it.skip("conditional testing", () => {
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
