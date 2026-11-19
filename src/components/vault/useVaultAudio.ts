"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Original cinematic sound design for the IHBNF treasure hunt.
 * No movie audio, stock samples, downloads, paid services, or oscillator bleeps.
 * Foley is built from deterministic noise grains, resonant metal, deep stone
 * movement and a small room impulse. All cues are initiated by visitor input.
 */
type Cue =
  | "chain" | "latch" | "compass" | "compassFinal"
  | "awaken" | "pulse" | "hinge"
  | "key" | "dial" | "ratchet" | "reject" | "bolt" | "door" | "entry";

type SoundEngine = {
  context: AudioContext;
  master: GainNode;
  dry: GainNode;
  wet: GainNode;
  noise: AudioBuffer;
};

type Recording = { src: string; volume: number; delay: number };
const recordedCues: Partial<Record<Cue, Recording[]>> = {
  chain: [{ src: "/media/audio/lamp-switch-real-cc0.wav", volume: .32, delay: .05 }],
  latch: [{ src: "/media/audio/vault-chains-cc0.mp3", volume: .13, delay: .07 }],
  pulse: [{ src: "/media/audio/vault-wood-creaks-cc0.mp3", volume: .17, delay: .68 }],
  hinge: [
    { src: "/media/audio/vault-portrait-hinge-cc0.mp3", volume: .42, delay: .22 },
    { src: "/media/audio/vault-wood-creaks-cc0.mp3", volume: .21, delay: .72 },
  ],
  key: [{ src: "/media/audio/vault-button-mechanical-cc0.wav", volume: .24, delay: 0 }],
  bolt: [{ src: "/media/audio/vault-chains-cc0.mp3", volume: .20, delay: .05 }],
  door: [{ src: "/media/audio/vault-heavy-thud-cc0.mp3", volume: .34, delay: 1.23 }],
};
const soundPaths = [...new Set(Object.values(recordedCues).flatMap(clips => (clips || []).map(c => c.src)))];

function makeNoise(context: AudioContext) {
  const length = Math.ceil(context.sampleRate * 3);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 0x9e3779b9;
  for (let i = 0; i < data.length; i++) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    // Two filtered, slightly correlated streams give the sound more body than
    // plain white-noise "static" and avoid exactly repeated digital chirps.
    data[i] = (((seed >>> 8) / 0xffffff) * 2 - 1) * .82;
  }
  return buffer;
}

function makeRoomIR(context: AudioContext) {
  const length = Math.floor(context.sampleRate * 1.35);
  const response = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    let seed = channel ? 47293 : 18707;
    const data = response.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      seed = (1664525 * seed + 1013904223) >>> 0;
      const t = i / context.sampleRate;
      const decay = Math.pow(1 - i / length, 2.8);
      data[i] = (((seed >>> 8) / 0xffffff) * 2 - 1) * decay * .23;
      if (t < .028) data[i] *= .23;
    }
  }
  return response;
}

export function useVaultAudio(muted: boolean) {
  const engineRef = useRef<SoundEngine | null>(null);
  const mutedRef = useRef(muted);
  const recordingPool = useRef<Map<string, HTMLAudioElement>>(new Map());
  const pendingRecordingTimers = useRef<number[]>([]);
  mutedRef.current = muted;

  const prepare = useCallback(() => {
    if (mutedRef.current) return;
    try {
      if (!engineRef.current) {
        const context = new AudioContext();
        const master = context.createGain();
        master.gain.value = .76; // cinematic, never deafening
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -17;
        limiter.knee.value = 16;
        limiter.ratio.value = 3.5;
        limiter.attack.value = .006;
        limiter.release.value = .18;
        master.connect(limiter).connect(context.destination);
        const dry = context.createGain();
        dry.gain.value = .92;
        dry.connect(master);
        const wet = context.createGain();
        wet.gain.value = .11;
        const reverb = context.createConvolver();
        reverb.buffer = makeRoomIR(context);
        wet.connect(reverb).connect(master);
        engineRef.current = { context, master, dry, wet, noise: makeNoise(context) };
      }
      if (engineRef.current.context.state !== "running") {
        void engineRef.current.context.resume().catch(() => {});
      }
    } catch { /* All puzzles remain operable without audio. */ }
  }, []);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.master.gain.setTargetAtTime(muted ? 0 : .76, e.context.currentTime, .016);
  }, [muted]);

  useEffect(() => {
    const pool = recordingPool.current;
    for (const src of soundPaths) {
      const clip = new Audio(src);
      clip.preload = "auto";
      pool.set(src, clip);
    }
    return () => {
      pendingRecordingTimers.current.forEach(id => window.clearTimeout(id));
      pendingRecordingTimers.current = [];
      for (const clip of pool.values()) clip.pause();
      pool.clear();
      const e = engineRef.current;
      engineRef.current = null;
      if (e) void e.context.close().catch(() => {});
    };
  }, []);

  const play = useCallback((cue: Cue, offset = 0) => {
    if (mutedRef.current) return;
    prepare();
    const e = engineRef.current;
    if (!e) return;
    const { context: c, dry, wet, noise } = e;
    const at = c.currentTime + Math.max(0, offset);
    // Real CC0 recordings supply the audible mechanical character. Generated
    // low-end body only reinforces the animation instead of sounding electronic.
    for (const sample of recordedCues[cue] || []) {
      const startClip = () => {
        if (mutedRef.current) return;
        const source = recordingPool.current.get(sample.src);
        if (!source) return;
        const clip = source.cloneNode(true) as HTMLAudioElement;
        clip.volume = sample.volume;
        void clip.play().catch(() => {});
      };
      const delay = Math.max(0, (offset + sample.delay) * 1000);
      if (delay < 5) startClip();
      else pendingRecordingTimers.current.push(window.setTimeout(startClip, delay));
    }

    /** Band-limited material texture. All ramps have nonzero endpoints. */
    const texture = (when: number, duration: number, centreHz: number, q: number, loudness: number, type: BiquadFilterType = "bandpass", echo = .3) => {
      const node = c.createBufferSource();
      node.buffer = noise;
      const filter = c.createBiquadFilter();
      filter.type = type;
      filter.frequency.setValueAtTime(centreHz, when);
      filter.Q.value = q;
      const amp = c.createGain();
      amp.gain.setValueAtTime(.0001, when);
      amp.gain.exponentialRampToValueAtTime(Math.max(.0002, loudness), when + Math.min(.045, duration * .26));
      amp.gain.exponentialRampToValueAtTime(.0001, when + duration);
      node.connect(filter).connect(amp);
      amp.connect(dry);
      if (echo > 0) {
        const send = c.createGain(); send.gain.value = echo;
        amp.connect(send).connect(wet);
      }
      node.start(when, (when * 17.13) % 1.2, duration);
      node.stop(when + duration + .01);
    };

    /** Inharmonic steel/bronze resonance, not a simple video-game note. */
    const metal = (when: number, frequency: number, duration: number, gain: number, tail = .4) => {
      [1, 2.03, 2.77, 4.19].forEach((partial, index) => {
        const osc = c.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency * partial, when);
        osc.frequency.exponentialRampToValueAtTime(frequency * partial * .992, when + duration);
        const amp = c.createGain();
        const loud = gain / Math.pow(index + 1, 1.35);
        amp.gain.setValueAtTime(.0001, when);
        amp.gain.exponentialRampToValueAtTime(Math.max(.0002, loud), when + .008);
        amp.gain.exponentialRampToValueAtTime(.0001, when + duration);
        osc.connect(amp); amp.connect(dry);
        const send = c.createGain(); send.gain.value = tail;
        amp.connect(send).connect(wet);
        osc.start(when); osc.stop(when + duration + .015);
      });
    };

    /** Low organic rumble for rock, heavy oak and vault bolts. */
    const rumble = (when: number, duration: number, volume = .045) => {
      texture(when, duration, 115, .38, volume, "lowpass", .25);
      const osc = c.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(82, when);
      osc.frequency.exponentialRampToValueAtTime(47, when + duration);
      const amp = c.createGain();
      amp.gain.setValueAtTime(.0001, when);
      amp.gain.exponentialRampToValueAtTime(volume * .48, when + Math.min(duration * .35, .18));
      amp.gain.exponentialRampToValueAtTime(.0001, when + duration);
      osc.connect(amp).connect(dry);
      osc.start(when); osc.stop(when + duration + .01);
    };

    const scrape = (when: number, duration: number, volume = .055) => {
      texture(when, duration, 850, .48, volume, "bandpass", .26);
      texture(when + .028, Math.max(.08, duration - .05), 280, .6, volume * .58, "lowpass", .24);
    };

    switch (cue) {
      case "chain":
        // Beaded brass shift + an actual switch body thunk.
        texture(at, .045, 3450, 1.1, .05, "highpass", .03);
        texture(at + .022, .065, 2100, 1.9, .037, "bandpass", .06);
        texture(at + .06, .087, 610, 1.2, .086, "bandpass", .10);
        metal(at + .075, 415, .16, .012, .09);
        break;
      case "latch":
        // Seventh pull: a substantial clockwork latch and distant brass
        // acknowledgement that points toward the compass, not an arcade ding.
        rumble(at, .44, .07);
        scrape(at + .045, .22, .060);
        metal(at + .12, 185, .60, .048, .24);
        texture(at + .33, .14, 1400, .65, .041);
        metal(at + .39, 318, 1.10, .026, .65);
        break;
      case "compass":
        // A spring-loaded brass needle spinning over a worn bearing.
        texture(at, .26, 1350, .72, .052);
        for (let i = 0; i < 5; i++) {
          const t = at + .04 + i * .057;
          texture(t, .023, 2050 - i * 220, 1.7, .035 - i * .003, "bandpass", .04);
        }
        metal(at + .28, 610, .31, .012, .10);
        break;
      case "compassFinal":
        scrape(at, .72, .058);
        for (let i = 0; i < 8; i++) {
          texture(at + .02 + i * (.042 + i * .007), .025, 2300 - i * 180, 1.2, .032 - i * .002);
        }
        metal(at + .69, 430, .76, .025, .46);
        break;
      case "awaken":
        // Low ancient-stone resonance, airy harmonic bloom, no bright synth beep.
        rumble(at, 1.32, .058);
        texture(at + .14, 1.15, 1650, .32, .025, "bandpass", .68);
        metal(at + .22, 196, 1.32, .027, .78);
        metal(at + .46, 293.66, 1.25, .015, .77);
        metal(at + .69, 392, 1.22, .009, .87);
        break;
      case "pulse":
        // Touching the rune: distinct magical chord -> deep moving stone.
        metal(at, 263.7, 1.58, .035, .95);
        metal(at + .12, 395.5, 1.7, .018, .82);
        metal(at + .24, 527.5, 1.56, .011, .90);
        texture(at + .12, .98, 2850, .4, .017, "bandpass", .85);
        rumble(at + .63, 1.24, .066);
        break;
      case "hinge":
        // Thick portrait frame moving on old hinges: wood strain,
        // stone-dust rasp, deep settling clunk and a spacious tail.
        scrape(at, 1.64, .068);
        texture(at + .24, 1.37, 420, .47, .076, "lowpass", .44);
        rumble(at + .28, 1.62, .055);
        metal(at + 1.61, 104, .52, .035, .32);
        texture(at + 1.67, .22, 570, 1.1, .06);
        break;
      case "key":
        // The real recording replaces the high-pitched electronic key beep.
        break;
      case "reject":
        metal(at, 145, .38, .028, .23);
        metal(at + .14, 120, .3, .018, .18);
        break;
      case "dial":
        scrape(at, 1.12, .038);
        metal(at + .06, 260, .45, .014, .12);
        break;
      case "ratchet":
        texture(at, .041, 1200, 1.1, .06);
        texture(at + .026, .082, 390, .6, .039);
        break;
      case "bolt":
        rumble(at, .79, .085);
        scrape(at + .03, .65, .078);
        metal(at + .58, 125, .38, .052, .14);
        break;
      case "door":
        rumble(at, 1.65, .083);
        scrape(at + .04, 1.35, .070);
        metal(at + 1.26, 97, .7, .037, .28);
        break;
      case "entry":
        rumble(at, .82, .048);
        texture(at + .08, .76, 650, .25, .023, "bandpass", .64);
        metal(at + .23, 196, 1.10, .022, .75);
        break;
    }
  }, [prepare]);

  return { prepare, play };
}
