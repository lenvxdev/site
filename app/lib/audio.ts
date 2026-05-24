let _soundEnabled = true;
export function setSoundEnabled(v: boolean) { _soundEnabled = v; }
export function isSoundEnabled() { return _soundEnabled; }

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === "suspended") _ctx.resume().catch(() => {});
  return _ctx;
}

function makeReverb(ac: AudioContext, duration = 2.8, decay = 2.4): ConvolverNode {
  const len = Math.floor(ac.sampleRate * duration);
  const buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow((len - i) / len, decay);
    }
  }
  const conv = ac.createConvolver();
  conv.buffer = buf;
  return conv;
}

let _sfxReverb: ConvolverNode | null = null;
let _sfxBusOut: GainNode   | null = null;

function ensureSfxBus(ac: AudioContext) {
  if (_sfxReverb) return;
  _sfxReverb = makeReverb(ac, 1.4, 2.0);
  _sfxBusOut = ac.createGain();
  _sfxReverb.connect(_sfxBusOut);
  _sfxBusOut.connect(ac.destination);
}

const _bufCache = new Map<string, AudioBuffer>();

async function getBuffer(src: string): Promise<AudioBuffer> {
  if (_bufCache.has(src)) return _bufCache.get(src)!;
  const res = await fetch(src);
  const arr = await res.arrayBuffer();
  const decoded = await getCtx().decodeAudioData(arr);
  _bufCache.set(src, decoded);
  return decoded;
}

export function playSfx(
  src: string,
  { volume = 1, wet = 0.2 }: { volume?: number; wet?: number } = {}
) {
  const ac = getCtx();
  getBuffer(src).then(buf => {
    ensureSfxBus(ac);
    const source = ac.createBufferSource();
    source.buffer = buf;

    const dry  = ac.createGain();
    const send = ac.createGain();

    dry.gain.value  = (1 - wet) * volume;
    send.gain.value = wet * volume;

    source.connect(dry);
    source.connect(send);
    dry.connect(ac.destination);
    send.connect(_sfxReverb!);

    source.start();
  }).catch(() => {});
}

export interface AudioHandle {
  el: HTMLAudioElement;
  fadeTo(target: number, ms?: number): void;
}

export function playWithReverb(
  src: string,
  { loop = false, volume = 1, wet = 0.22 }: { loop?: boolean; volume?: number; wet?: number } = {}
): AudioHandle {
  const ac = getCtx();
  const el = new Audio(src);
  el.loop  = loop;

  const master = ac.createGain();
  master.gain.value = volume;

  try {
    const source = ac.createMediaElementSource(el);
    const reverb = makeReverb(ac);
    const dry    = ac.createGain();
    const wetG   = ac.createGain();
    dry.gain.value  = 1 - wet;
    wetG.gain.value = wet;
    source.connect(dry);
    source.connect(reverb);
    reverb.connect(wetG);
    dry.connect(master);
    wetG.connect(master);
  } catch {
    const source = ac.createMediaElementSource(el);
    source.connect(master);
  }

  master.connect(ac.destination);
  el.play().catch(() => {});

  return {
    el,
    fadeTo(target: number, ms = 1500) {
      const now = ac.currentTime;
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(target, now + ms / 1000);
    },
  };
}
