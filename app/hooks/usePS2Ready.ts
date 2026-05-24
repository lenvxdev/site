import { useSyncExternalStore } from "react";

let _ready = false;
const _listeners = new Set<() => void>();

export function signalPS2Ready() {
  if (_ready) return;
  _ready = true;
  _listeners.forEach(fn => fn());
}

export function usePS2Ready() {
  return useSyncExternalStore(
    cb => { _listeners.add(cb); return () => { _listeners.delete(cb); }; },
    () => _ready,
    () => false
  );
}
