import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    ghostText: {
      setGhostText: (text: string) => ReturnType;
      clearGhostText: () => ReturnType;
      acceptGhostText: () => ReturnType;
    };
  }
}

interface GhostTextPluginState {
  suggestion: string | null;
  position: number | null;
  decorations: DecorationSet;
}

const GHOST_TEXT_KEY = new PluginKey<GhostTextPluginState>("ghostText");

const EMPTY_STATE: GhostTextPluginState = {
  suggestion: null,
  position: null,
  decorations: DecorationSet.empty,
};

export const GhostText = Extension.create({
  name: "ghostText",

  addStorage() {
    return {
      suggestion: null as string | null,
    };
  },

  addCommands() {
    return {
      setGhostText:
        (text: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(GHOST_TEXT_KEY, { type: "set", text });
            dispatch(tr);
          }
          return true;
        },
      clearGhostText:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(GHOST_TEXT_KEY, { type: "clear" });
            dispatch(tr);
          }
          return true;
        },
      acceptGhostText:
        () =>
        ({ state, dispatch }) => {
          const pluginState = GHOST_TEXT_KEY.getState(state);
          if (!pluginState?.suggestion || pluginState.position == null) return false;
          if (dispatch) {
            const tr = state.tr;
            tr.insertText(pluginState.suggestion, pluginState.position);
            tr.setMeta(GHOST_TEXT_KEY, { type: "clear" });
            dispatch(tr);
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin<GhostTextPluginState>({
        key: GHOST_TEXT_KEY,
        state: {
          init() {
            return EMPTY_STATE;
          },
          apply(tr, prev) {
            const meta = tr.getMeta(GHOST_TEXT_KEY);

            if (meta?.type === "clear") {
              extension.storage.suggestion = null;
              return EMPTY_STATE;
            }

            if (meta?.type === "set") {
              const pos = tr.selection.from;
              const widget = Decoration.widget(
                pos,
                () => {
                  const span = document.createElement("span");
                  span.textContent = meta.text;
                  span.className = "ghost-text-suggestion";
                  span.setAttribute("aria-hidden", "true");
                  return span;
                },
                { side: 1 },
              );
              extension.storage.suggestion = meta.text;
              return {
                suggestion: meta.text,
                position: pos,
                decorations: DecorationSet.create(tr.doc, [widget]),
              };
            }

            // Clear on any document change or cursor movement
            if (tr.docChanged || tr.selectionSet) {
              if (prev.suggestion) {
                extension.storage.suggestion = null;
                return EMPTY_STATE;
              }
            }

            return prev;
          },
        },
        props: {
          decorations(state) {
            return GHOST_TEXT_KEY.getState(state)?.decorations ?? DecorationSet.empty;
          },
          handleKeyDown(view, event) {
            const pluginState = GHOST_TEXT_KEY.getState(view.state);
            if (!pluginState?.suggestion) return false;

            if (event.key === "Tab") {
              event.preventDefault();
              const { suggestion, position } = pluginState;
              if (suggestion && position != null) {
                const tr = view.state.tr;
                tr.insertText(suggestion, position);
                tr.setMeta(GHOST_TEXT_KEY, { type: "clear" });
                view.dispatch(tr);
              }
              return true;
            }

            if (event.key === "Escape") {
              event.preventDefault();
              const tr = view.state.tr;
              tr.setMeta(GHOST_TEXT_KEY, { type: "clear" });
              view.dispatch(tr);
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});
