"use client";

import { useCallback, useEffect, useRef } from "react";

type Strike = [delay: number, duration: number, pitch: number, endPitch: number, volume: number, type: OscillatorType];

const sounds = {
  latch: [[0, .09, 470, 135, .055, "triangle"], [.08, .2, 172, 57, .08, "triangle"]],
  compass: [[0, .035, 1680, 960, .025, "triangle"], [.027, .09, 730, 290, .045, "triangle"]],
  awaken: [[0, .8, 294, 261, .032, "sine"], [.09, .87, 440, 392, .027, "sine"], [.22, .62, 658, 523, .012, "sine"]],
  pulse: [[0, .65, 130, 200, .065, "sine"], [.2, .62, 262, 523, .028, "sine"], [.38, .5, 391, 784, .013, "sine"]],
  hinge: [[0, .42, 109, 68, .028, "sawtooth"], [.16, .59, 145, 99, .019, "triangle"], [.66, .15, 151, 53, .055, "triangle"]],
  key: [[0, .037, 340, 155, .048, "triangle"], [.005, .028, 1200, 400, .017, "triangle"]],
  reject: [[0, .08, 142, 56, .068, "triangle"], [.095, .15, 119, 47, .051, "triangle"]],
  bolt: [[0, .09, 810, 260, .055, "triangle"], [.15, .19, 186, 48, .1, "triangle"], [.31, .16, 139, 45, .07, "triangle"]],
  door: [[0, .57, 95, 65, .028, "sawtooth"], [.28, .49, 105, 150, .022, "triangle"], [.83, .19, 130, 55, .085, "triangle"]],
  entry: [[0, .8, 67, 96, .08, "sine"], [.15, .7, 196, 293, .024, "sine"], [.29, .65, 293, 392, .014, "sine"]],
} satisfies Record<string, Strike[]>;

export function useVaultAudio(muted: boolean) {
  const audio = useRef<AudioContext | null>(null);
  const output = useRef<GainNode | null>(null);

  const prepare = useCallback(() => {
    if (muted) return;
    try {
      if (!audio.current) {
        audio.current = new AudioContext();
        output.current = audio.current.createGain();
        output.current.connect(audio.current.destination);
      }
      if (audio.current.state !== "running") void audio.current.resume().catch(() => {});
    } catch {
      // Visual feedback remains available without Web Audio.
    }
  }, [muted]);

  useEffect(() => {
    if (output.current) output.current.gain.value = muted ? 0 : 1;
  }, [muted]);

  useEffect(() => () => {
    void audio.current?.close().catch(() => {});
    audio.current = null;
    output.current = null;
  }, []);

  const play = useCallback((sound: keyof typeof sounds, offset = 0) => {
    prepare();
    const context = audio.current;
    const master = output.current;
    if (!context || !master || muted) return;
    for (const [delay, duration, pitch, endPitch, level, type] of sounds[sound]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + offset + delay;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(pitch, start);
      oscillator.frequency.exponentialRampToValueAtTime(endPitch, start + duration);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(level, start + Math.min(.035, duration * .22));
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain).connect(master);
      oscillator.start(start);
      oscillator.stop(start + duration);
    }
  }, [muted, prepare]);

  return { prepare, play };
}
