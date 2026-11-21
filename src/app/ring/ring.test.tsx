import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GET as getManifest } from "@/app/ring.json/route";
import RingPage from "@/app/ring/page";
import { networkSites } from "@/data/network";
import { Providers } from "@/site/Providers";

describe("/ring directory and manifest", () => {
  it("renders all 7 connected sites on the /ring directory page", () => {
    render(
      <Providers>
        <RingPage />
      </Providers>,
    );

    expect(
      screen.getByRole("heading", { name: "csy20 sites" }),
    ).toBeInTheDocument();

    for (const site of networkSites) {
      expect(
        screen.getByRole("heading", { level: 2, name: site.name }),
      ).toBeInTheDocument();
    }
  });

  it("serves a CORS-enabled JSON manifest at /ring.json", async () => {
    const response = await getManifest();
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");

    const body = await response.json();
    expect(body.sites).toHaveLength(7);
    expect(body.hub).toBe("https://csy20.me/ring");
  });
});
