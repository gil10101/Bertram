const KEY_TO_CODE: Record<string, string> = {
  a: "KeyA", b: "KeyB", c: "KeyC", d: "KeyD", e: "KeyE", f: "KeyF",
  g: "KeyG", h: "KeyH", i: "KeyI", j: "KeyJ", k: "KeyK", l: "KeyL",
  m: "KeyM", n: "KeyN", o: "KeyO", p: "KeyP", q: "KeyQ", r: "KeyR",
  s: "KeyS", t: "KeyT", u: "KeyU", v: "KeyV", w: "KeyW", x: "KeyX",
  y: "KeyY", z: "KeyZ",
  "0": "Digit0", "1": "Digit1", "2": "Digit2", "3": "Digit3",
  "4": "Digit4", "5": "Digit5", "6": "Digit6", "7": "Digit7",
  "8": "Digit8", "9": "Digit9",
  escape: "Escape", enter: "Enter", space: "Space",
  backspace: "Backspace", tab: "Tab",
  "/": "Slash", "?": "Slash", "#": "Digit3",
  "[": "BracketLeft", "]": "BracketRight",
  ";": "Semicolon", "'": "Quote", ",": "Comma", ".": "Period",
  "-": "Minus", "=": "Equal",
};

export function getKeyCodeFromKey(key: string): string {
  return KEY_TO_CODE[key.toLowerCase()] ?? key;
}
