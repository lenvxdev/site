import { useSyncExternalStore } from "react";

let _ready = false;
const _listeners       = new Set<() => void>();
const _replayListeners = new Set<(isReturn: boolean) => void>();

export function signalPS2Ready() {
  if (_ready) return;
  _ready = true;
  _listeners.forEach(fn => fn());
}

export function requestReplay(isReturn = false) {
  _ready = false;
  _listeners.forEach(fn => fn());
  _replayListeners.forEach(fn => fn(isReturn));
}

export function subscribeReplay(fn: (isReturn: boolean) => void) {
  _replayListeners.add(fn);
  return () => { _replayListeners.delete(fn); };
}

export function usePS2Ready() {
  return useSyncExternalStore(
    cb => { _listeners.add(cb); return () => { _listeners.delete(cb); }; },
    () => _ready,
    () => false
  );
}
