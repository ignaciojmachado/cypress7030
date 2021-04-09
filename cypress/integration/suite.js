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

  //Your code here

  /***** 
  visual regression: take a screenshot blacking out the main banner, reload the page take another. BONUS POINTS: Compare the two to verify that they are exactly the same (cy.task).
  ++++*/

  //Your code here

  /***** 
  intercept: write a test that satisfies the following: 
  1. add an intercept that prevents network calls to be made to hubspot and returns a mocked response
  2. navigate to the contact form
  3. check that request are being intercepted
  Hint: /^.*\b(hubspot)\b.*$/
  ++++*/
  it("cy.intercept", () => {
    //Your code here, Hint 2: cy.intercept

    cy.wait("YOUR_REQUEST_HERE").should(({ request, response }) => {
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
      //Your code here

    });
  });
});
