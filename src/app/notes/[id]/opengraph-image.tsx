import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import {
  ENGINEERING_NOTE_IDS,
  profile,
  resolveNote,
  type EngineeringNoteId,
} from "@/data/siteContent";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return ENGINEERING_NOTE_IDS.map((id) => ({ id }));
}

function isEngineeringNoteId(value: string): value is EngineeringNoteId {
  return (ENGINEERING_NOTE_IDS as readonly string[]).includes(value);
}

export default async function NoteOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const noteId: EngineeringNoteId = isEngineeringNoteId(id)
    ? id
    : "speech-relay";
  const resolved = resolveNote(noteId);

  const geistFont = readFileSync(
    path.join(
      process.cwd(),
      "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf",
    ),
  );

  const eyebrow =
    resolved.kind === "case-study"
      ? resolved.study.category
      : resolved.project.eyebrow;
  const summary =
    resolved.kind === "case-study"
      ? resolved.study.decision
      : resolved.spotlight.overview;
  const outcome =
    resolved.kind === "case-study"
      ? resolved.study.outcome
      : resolved.spotlight.features.join(" · ");

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
          fontFamily: "Geist, sans-serif",
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
            <span style={{ fontSize: "22px", color: "#eceae4" }}>
              csy20.me/notes/{noteId}
            </span>
            <span style={{ fontSize: "20px", color: "#8d8b84" }}>·</span>
            <span style={{ fontSize: "20px", color: "#b7b5ae" }}>
              {eyebrow}
            </span>
          </div>
          <span style={{ fontSize: "18px", color: "#38bdf8" }}>
            {resolved.project.metric}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "1020px",
          }}
        >
          <span
            style={{
              fontSize: "68px",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              color: "#eceae4",
            }}
          >
            {resolved.project.title}
          </span>
          <span
            style={{
              marginTop: "20px",
              fontSize: "28px",
              lineHeight: 1.35,
              color: "#b7b5ae",
            }}
          >
            {summary}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#141518",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            borderRadius: "20px",
            padding: "22px 28px",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              fontWeight: 500,
              color: "#38bdf8",
            }}
          >
            {outcome}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span style={{ fontSize: "17px", color: "#8d8b84" }}>
              {resolved.project.tags.join(" · ")}
            </span>
            <span style={{ fontSize: "17px", color: "#eceae4" }}>
              {profile.name}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistFont, weight: 400, style: "normal" },
        { name: "Geist", data: geistFont, weight: 500, style: "normal" },
        { name: "Geist", data: geistFont, weight: 600, style: "normal" },
      ],
    },
  );
}
