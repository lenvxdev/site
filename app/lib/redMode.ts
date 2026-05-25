import type { AudioHandle } from "./audio";

let _red = false;
const _subs = new Set<() => void>();

export function setRedMode(v: boolean) { _red = v; _subs.forEach(f => f()); }
export function subscribeRedMode(fn: () => void) { _subs.add(fn); return () => _subs.delete(fn); }
export function getRedMode() { return _red; }

let _rsodHandle: AudioHandle | null = null;
export function setRsodHandle(h: AudioHandle | null) { _rsodHandle = h; }
export function takeRsodHandle(): AudioHandle | null { const h = _rsodHandle; _rsodHandle = null; return h; }
