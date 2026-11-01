import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  CaseStudyDialog,
  getNoteIdForProjectTitle,
  parseNoteHash,
} from "./CaseStudyDialog";

describe("CaseStudyDialog", () => {
  it("maps featured project titles and URL hashes to note IDs", () => {
    expect(getNoteIdForProjectTitle("Speech Relay")).toBe("speech-relay");
    expect(getNoteIdForProjectTitle("02_OS")).toBe("02-os");
    expect(getNoteIdForProjectTitle("Warrant")).toBeNull();

    expect(parseNoteHash("#notes-speech-relay")).toBe("speech-relay");
    expect(parseNoteHash("#notes-nen")).toBe("nen");
    expect(parseNoteHash("#notes-unknown")).toBeNull();
    expect(parseNoteHash("#open-source")).toBeNull();
  });

  it("renders architectural decision, outcome, and tags for a case study", () => {
    const onClose = vi.fn();
    render(<CaseStudyDialog noteId="speech-relay" onClose={onClose} />);

    expect(
      screen.getByRole("heading", { name: "Speech Relay" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Silero-VAD replaces fixed-window/)).toBeInTheDocument();
    expect(screen.getByText(/23\.6% lower mean latency/)).toBeInTheDocument();
    expect(screen.getByText("faster-whisper")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close engineering notes" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders product spotlight guarantees for Nen", () => {
    render(<CaseStudyDialog noteId="nen" onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Nen" })).toBeInTheDocument();
    expect(screen.getByText("Your music. On your phone.")).toBeInTheDocument();
    expect(screen.getByText("Offline local playback")).toBeInTheDocument();
  });

  it("cycles adjacent notes with prev/next buttons and arrow keys", () => {
    const onNavigate = vi.fn();
    const { rerender } = render(
      <CaseStudyDialog
        noteId="speech-relay"
        onClose={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    expect(screen.getByText("1 / 4")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous note: Nen" }));
    expect(onNavigate).toHaveBeenLastCalledWith("nen");

    fireEvent.click(screen.getByRole("button", { name: "Next note: 02_OS" }));
    expect(onNavigate).toHaveBeenLastCalledWith("02-os");

    rerender(
      <CaseStudyDialog
        noteId="nen"
        onClose={vi.fn()}
        onNavigate={onNavigate}
      />,
    );

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(onNavigate).toHaveBeenLastCalledWith("speech-relay");

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(onNavigate).toHaveBeenLastCalledWith("bytewise");
  });
});
