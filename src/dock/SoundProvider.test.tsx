import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SoundProvider } from "./SoundProvider";
import { useSound } from "./useSound";

class FakeOscillator {
  type = "triangle";
  frequency = { value: 0 };
  onended: (() => void) | null = null;
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeGain {
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  disconnect = vi.fn();
}

let initialAudioState: AudioContextState;
let resumeBehavior: (context: FakeAudioContext) => Promise<void>;
const contexts: FakeAudioContext[] = [];

class FakeAudioContext {
  state = initialAudioState;
  currentTime = 12;
  destination = {};
  oscillators: FakeOscillator[] = [];
  gains: FakeGain[] = [];
  resume = vi.fn(() => resumeBehavior(this));
  close = vi.fn(() => {
    this.state = "closed";
    return Promise.resolve();
  });
  createOscillator = vi.fn(() => {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  });
  createGain = vi.fn(() => {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  });

  constructor() {
    contexts.push(this);
  }
}

function firstContext() {
  const context = contexts[0];
  if (!context) throw new Error("Expected an audio context");
  return context;
}

beforeEach(() => {
  window.localStorage.clear();
  contexts.length = 0;
  initialAudioState = "running";
  resumeBehavior = (context) => {
    context.state = "running";
    return Promise.resolve();
  };
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("webkitAudioContext", undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("SoundProvider", () => {
  it("creates audio lazily for a requested tick, never on page load", () => {
    const { result } = renderHook(useSound, { wrapper: SoundProvider });
    expect(result.current.soundEnabled).toBe(true);
    fireEvent.pointerDown(window);
    fireEvent.keyDown(window, { key: "Tab" });
    expect(contexts).toHaveLength(0);
    act(() => result.current.playDockTick());
    expect(contexts).toHaveLength(1);
    expect(firstContext().createOscillator).toHaveBeenCalledOnce();
  });

  it("reuses one context and reproduces the production tick with cleanup", () => {
    const { result, unmount } = renderHook(useSound, {
      wrapper: SoundProvider,
    });
    act(() => result.current.playDockTick());
    expect(contexts).toHaveLength(1);
    const context = firstContext();
    const oscillator = context.oscillators[0];
    const gain = context.gains[0];
    if (!oscillator || !gain) throw new Error("Expected a tick signal");
    expect(oscillator.type).toBe("sine");
    expect(oscillator.frequency.value).toBe(1640);
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0.03, 12);
    expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
      0.0008,
      12.045,
    );
    expect(oscillator.connect).toHaveBeenCalledWith(gain);
    expect(gain.connect).toHaveBeenCalledWith(context.destination);
    expect(oscillator.start).toHaveBeenCalledOnce();
    expect(oscillator.stop).toHaveBeenCalledWith(12.05);
    oscillator.onended?.();
    expect(oscillator.disconnect).toHaveBeenCalledOnce();
    expect(gain.disconnect).toHaveBeenCalledOnce();
    act(() => result.current.playDockTick());
    expect(contexts).toHaveLength(1);
    unmount();
    expect(context.close).toHaveBeenCalledOnce();
  });

  it("persists mute across mounts and plays a preview when sound is enabled", async () => {
    const first = renderHook(useSound, { wrapper: SoundProvider });
    act(() => first.result.current.toggleSound());
    expect(first.result.current.soundEnabled).toBe(false);
    expect(window.localStorage.getItem("csy20-dock-sound")).toBe("off");
    first.unmount();

    initialAudioState = "suspended";
    const { result } = renderHook(useSound, { wrapper: SoundProvider });
    expect(result.current.soundEnabled).toBe(false);
    act(() => result.current.playDockTick());
    expect(contexts).toHaveLength(0);
    await act(async () => result.current.toggleSound());
    expect(result.current.soundEnabled).toBe(true);
    expect(window.localStorage.getItem("csy20-dock-sound")).toBe("on");
    expect(firstContext().resume).toHaveBeenCalledOnce();
    expect(firstContext().createOscillator).toHaveBeenCalledOnce();
    act(() => result.current.playDockTick());
    expect(firstContext().createOscillator).toHaveBeenCalledTimes(2);
  });

  it("plays one first tick after resume and coalesces suspended hover requests", async () => {
    initialAudioState = "suspended";
    const completeResumes: (() => void)[] = [];
    resumeBehavior = (context) =>
      new Promise<void>((resolve) => {
        completeResumes.push(() => {
          context.state = "running";
          resolve();
        });
      });
    const { result } = renderHook(useSound, { wrapper: SoundProvider });
    act(() => {
      result.current.playDockTick();
      result.current.playDockTick();
      result.current.playDockTick();
    });
    expect(firstContext().resume).toHaveBeenCalled();
    expect(firstContext().createOscillator).not.toHaveBeenCalled();
    await act(async () => completeResumes.forEach((complete) => complete()));
    expect(firstContext().createOscillator).toHaveBeenCalledOnce();
    act(() => result.current.playDockTick());
    expect(firstContext().createOscillator).toHaveBeenCalledTimes(2);
  });

  it.each(["mute", "unmount"] as const)(
    "cancels a pending tick on %s before an asynchronous resume completes",
    async (cancel) => {
      initialAudioState = "suspended";
      let completeResume = () => {};
      resumeBehavior = (context) =>
        new Promise<void>((resolve) => {
          completeResume = () => {
            context.state = "running";
            resolve();
          };
        });
      const { result, unmount } = renderHook(useSound, {
        wrapper: SoundProvider,
      });
      act(() => result.current.playDockTick());
      const context = firstContext();
      if (cancel === "mute") act(() => result.current.toggleSound());
      else unmount();
      await act(async () => completeResume());
      expect(context.createOscillator).not.toHaveBeenCalled();
      if (cancel === "unmount") expect(context.close).toHaveBeenCalledOnce();
    },
  );

  it("keeps short successive interactions audible without an artificial throttle", () => {
    vi.spyOn(performance, "now").mockReturnValue(100);
    const { result } = renderHook(useSound, { wrapper: SoundProvider });
    act(() => {
      result.current.playDockTick();
      result.current.playDockTick();
      result.current.playDockTick();
    });
    expect(firstContext().createOscillator).toHaveBeenCalledTimes(3);
  });

  it("handles blocked storage and missing audio APIs without failing actions", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    vi.stubGlobal("AudioContext", undefined);
    const { result } = renderHook(useSound, { wrapper: SoundProvider });
    expect(() => act(() => result.current.playDockTick())).not.toThrow();
    act(() => result.current.toggleSound());
    expect(result.current.soundEnabled).toBe(false);
    act(() => result.current.toggleSound());
    expect(result.current.soundEnabled).toBe(true);
    expect(contexts).toHaveLength(0);
  });

  it("uses legacy WebKit audio and safely retries a rejected resume", async () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("webkitAudioContext", FakeAudioContext);
    initialAudioState = "suspended";
    resumeBehavior = () => Promise.reject(new Error("Autoplay blocked"));
    const { result } = renderHook(useSound, { wrapper: SoundProvider });
    await act(async () => result.current.playDockTick());
    expect(firstContext().resume).toHaveBeenCalledOnce();
    expect(firstContext().createOscillator).not.toHaveBeenCalled();
    resumeBehavior = (context) => {
      context.state = "running";
      return Promise.resolve();
    };
    await act(async () => result.current.playDockTick());
    expect(firstContext().resume).toHaveBeenCalledTimes(2);
    expect(firstContext().createOscillator).toHaveBeenCalledOnce();
  });

  it("requires a provider and synchronizes a mute from another tab", () => {
    expect(() => renderHook(useSound)).toThrow(
      "useSound must be used within SoundProvider",
    );
    const { result } = renderHook(useSound, { wrapper: SoundProvider });
    act(() =>
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "csy20-dock-sound",
          newValue: "off",
        }),
      ),
    );
    expect(result.current.soundEnabled).toBe(false);
    act(() => result.current.playDockTick());
    expect(contexts).toHaveLength(0);
  });
});
