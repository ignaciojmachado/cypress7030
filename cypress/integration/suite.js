import selectors from "../support/selectors.js";
describe("DMI Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.viewport(1280, 720);
  });

  /* simple sanity test */
  it.skip("Verify that main logo is visible", () => {
    cy.get(selectors.mainLogo).should("be.visible");
    cy.get(selectors.dgLogo).should("be.visible");
  });

  it.skip("ss", () => {
    cy.screenshot("homepage", {
      blackout: [selectors.mainLogo],
    });
  });

  it("intercept", () => {
    cy.get("#menu-item-28194 > a > span").click();
    cy.get("#field_qh4icy").type("test");
    cy.get("#field_ocfup1").type("test");
    cy.get("#field_vouiw8c49614001").type("test");
    cy.get("#field_sg6vn0293d0ad02").type("test");
    cy.get("#field_gxhb9aa0cdce2fb").type("5555555555");
    cy.get("#field_29yf4d").type("test@test.com");
    cy.get("#field_srb0i").select("Afghanistan");
    cy.get("#field_kieed").select("Google");
    cy.get("#field_475qb").select("0-3 months");
    cy.get("#field_q5oxv").type("this is a test");
    cy.get("#field_mqclw3326442da3-0").check();

    cy.intercept(
      {
        method: "POST",
        url:
          "https://app.callrail.com/companies/832775192/998cee22ca8b8bd01202/12/form_capture.json",
      },
      {
        statusCode: 500,
        body: { error: "Something went wrong" },
        headers: { "access-control-allow-origin": "*" },
        delayMs: 5000,
      }
    ).as("submitForm");

    cy.get(
      "#form_contact-form > div > fieldset > div > div.frm_submit > button"
    ).click();

    //#post-31170 > div > div > div > div.fusion-layout-column.fusion_builder_column.fusion-builder-column-0.fusion_builder_column_3_5.\33 _5.fusion-flex-column > div > div > p > strong

    cy.wait("@submitForm").should(({ request, response }) => {
      expect(response.statusCode).be.equal(500);
      cy.log(response.message);
    });
  });

  /* conditional */
  it.skip("conditional", () => {
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
