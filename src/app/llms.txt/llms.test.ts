import { describe, expect, it } from "vitest";
import { speechRelayMetrics } from "@/data/siteContent";
import { GET } from "./route";

describe("/llms.txt", () => {
  it("serves plain-text portfolio context with verified metrics and NVIDIA/aicr evidence", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");

    const body = await response.text();
    expect(body).toContain("Chitresh Yadav");
    expect(body).toContain(`${speechRelayMetrics.profile.meanMs} ms mean`);
    expect(body).toContain("NVIDIA/aicr#3342");
    expect(body).toContain("https://csy20.me/ring.json");
    expect(body).not.toContain("xevrion/breakscale#74");
  });
});
