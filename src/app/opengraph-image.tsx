import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { mergedContributionSummary } from "@/data/contributions";
import { profile, speechRelayMetrics } from "@/data/siteContent";

export const alt = "Chitresh Yadav — Backend · Applied ML";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const portraitBytes = readFileSync(
    path.join(process.cwd(), "public/portrait-twitter.jpg"),
  );
  const portraitSrc = `data:image/jpeg;base64,${portraitBytes.toString("base64")}`;

  const tiles = [
    {
      stat: `${speechRelayMetrics.profile.meanMs} ms`,
      accent: "#38bdf8",
      label: "Speech Relay mean E2E",
      sub: `EN → HI WebRTC · ${speechRelayMetrics.profile.p50Ms} ms p50`,
    },
    {
      stat: `-${speechRelayMetrics.vadComparison.reductionPercent}%`,
      accent: "#38bdf8",
      label: "Silero-VAD latency cut",
      sub: `${speechRelayMetrics.vadComparison.fixedWindowMs} ms → ${speechRelayMetrics.vadComparison.vadMs} ms`,
    },
    {
      stat: `${mergedContributionSummary.merged} PRs`,
      accent: "#a855f7",
      label: "Merged upstream work",
      sub: `Across ${mergedContributionSummary.repositories} public repositories`,
    },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          color: "#eceae4",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "9999px",
                backgroundColor: "#38bdf8",
              }}
            />
            <span style={{ fontSize: "22px", color: "#eceae4", letterSpacing: "-0.02em" }}>
              csy20.me
            </span>
            <span style={{ fontSize: "20px", color: "#8d8b84" }}>·</span>
            <span style={{ fontSize: "20px", color: "#b7b5ae" }}>{profile.role}</span>
          </div>
          <span
            style={{
              fontSize: "18px",
              color: "#8d8b84",
              letterSpacing: "0.04em",
            }}
          >
            {profile.strapline}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "820px",
            }}
          >
            <span
              style={{
                fontSize: "72px",
                fontWeight: 600,
                lineHeight: 1.0,
                letterSpacing: "-0.045em",
                color: "#eceae4",
              }}
            >
              {profile.name}
            </span>
            <span
              style={{
                marginTop: "20px",
                fontSize: "30px",
                lineHeight: 1.28,
                letterSpacing: "-0.025em",
                color: "#b7b5ae",
              }}
            >
              Building useful software, from model to product.
            </span>
          </div>

          <img
            src={portraitSrc}
            alt=""
            width={164}
            height={164}
            style={{
              width: "164px",
              height: "164px",
              borderRadius: "28px",
              objectFit: "cover",
              border: "1px solid rgba(255, 255, 255, 0.14)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            gap: "18px",
          }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.label}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                backgroundColor: "#141518",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                borderRadius: "20px",
                padding: "22px 24px",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 600,
                  letterSpacing: "-0.035em",
                  color: tile.accent,
                }}
              >
                {tile.stat}
              </span>
              <span
                style={{
                  marginTop: "8px",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#eceae4",
                }}
              >
                {tile.label}
              </span>
              <span
                style={{
                  marginTop: "4px",
                  fontSize: "15px",
                  color: "#8d8b84",
                }}
              >
                {tile.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
