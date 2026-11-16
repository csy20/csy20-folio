import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Providers } from "@/site/Providers";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders a branded 404 page with navigation back to the portfolio", () => {
    render(
      <Providers>
        <NotFound />
      </Providers>,
    );

    expect(
      screen.getByRole("heading", { name: "Nothing at this path." }),
    ).toBeInTheDocument();
    expect(screen.getByText("404 · route not found")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /← csy20/ })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: /Selected work/ }),
    ).toHaveAttribute("href", "/#projects");
    expect(screen.getByRole("link", { name: /Open source/ })).toHaveAttribute(
      "href",
      "/#open-source",
    );
    expect(screen.getByRole("link", { name: /Contact/ })).toHaveAttribute(
      "href",
      "/#contact",
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
