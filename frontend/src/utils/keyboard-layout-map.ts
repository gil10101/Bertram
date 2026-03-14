interface DetectedLayout {
  layout: string;
}

class KeyboardLayoutMapper {
  private detectedLayout: DetectedLayout = { layout: "qwerty" };

  getDetectedLayout(): DetectedLayout {
    return this.detectedLayout;
  }

  getKeyForCode(code: string): string {
    if (code.startsWith("Key")) return code.slice(3).toLowerCase();
    if (code.startsWith("Digit")) return code.slice(5);
    const map: Record<string, string> = {
      Slash: "/", Semicolon: ";", Quote: "'", Comma: ",",
      Period: ".", Minus: "-", Equal: "=",
      BracketLeft: "[", BracketRight: "]",
      Backspace: "Backspace", Enter: "Enter", Space: "Space",
      Escape: "Escape", Tab: "Tab",
    };
    return map[code] ?? code;
  }

  mapKeys(codes: string[]): string[] {
    return codes.map((code) => this.getKeyForCode(code));
  }
}

export const keyboardLayoutMapper = new KeyboardLayoutMapper();
