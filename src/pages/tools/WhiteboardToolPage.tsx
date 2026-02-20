import { useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

type WhiteboardSnapshot = {
  elements: unknown[];
  appState: Record<string, unknown>;
};

type ExcalidrawApiLike = {
  resetScene: () => void;
  updateScene: (sceneData: {
    elements?: readonly unknown[];
    appState?: Record<string, unknown>;
  }) => void;
  updateLibrary: (params: {
    libraryItems: unknown;
    merge?: boolean;
    prompt?: boolean;
    openLibraryMenu?: boolean;
  }) => Promise<void> | void;
};

const STORAGE_KEY = "refinex-whiteboard-v1";
const LIBRARY_MANIFEST_URL = "/excalidraw-libraries/manifest.json";

type LibrariesManifest = {
  files: string[];
};

const parseLibraryItems = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const maybeObject = value as { libraryItems?: unknown };
    if (Array.isArray(maybeObject.libraryItems)) return maybeObject.libraryItems;
  }
  return [];
};

const loadExcalidrawLibraries = async (api: ExcalidrawApiLike) => {
  try {
    const manifestResponse = await fetch(LIBRARY_MANIFEST_URL, {
      cache: "no-store",
    });
    if (!manifestResponse.ok) return;

    const manifest = (await manifestResponse.json()) as LibrariesManifest;
    const fileNames = Array.isArray(manifest.files) ? manifest.files : [];
    if (!fileNames.length) return;

    const libraries = await Promise.all(
      fileNames.map(async (name) => {
        const response = await fetch(`/excalidraw-libraries/${encodeURIComponent(name)}`, {
          cache: "no-store",
        });
        if (!response.ok) return [] as unknown[];

        const text = await response.text();
        const parsed = JSON.parse(text) as unknown;
        return parseLibraryItems(parsed);
      })
    );

    const mergedItems = libraries.flat();
    if (!mergedItems.length) return;

    await api.updateLibrary({
      libraryItems: mergedItems,
      merge: true,
      prompt: false,
      openLibraryMenu: false,
    });
  } catch {
    return;
  }
};

const loadSnapshot = (): WhiteboardSnapshot | null => {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WhiteboardSnapshot;
    if (!Array.isArray(parsed.elements)) return null;
    return {
      elements: parsed.elements,
      appState: parsed.appState ?? {},
    };
  } catch {
    return null;
  }
};

const saveSnapshot = (
  elements: readonly unknown[],
  appState: Record<string, unknown>,
  files: Record<string, unknown>
) => {
  if (typeof localStorage === "undefined") return;

  const serializedAppState = {
    viewBackgroundColor: appState.viewBackgroundColor,
    gridSize: appState.gridSize,
    currentItemStrokeColor: appState.currentItemStrokeColor,
    currentItemBackgroundColor: appState.currentItemBackgroundColor,
    currentItemFillStyle: appState.currentItemFillStyle,
    currentItemStrokeWidth: appState.currentItemStrokeWidth,
    currentItemStrokeStyle: appState.currentItemStrokeStyle,
    currentItemRoughness: appState.currentItemRoughness,
    currentItemOpacity: appState.currentItemOpacity,
    currentItemFontFamily: appState.currentItemFontFamily,
    currentItemFontSize: appState.currentItemFontSize,
    currentItemTextAlign: appState.currentItemTextAlign,
    currentItemStartArrowhead: appState.currentItemStartArrowhead,
    currentItemEndArrowhead: appState.currentItemEndArrowhead,
    currentItemRoundness: appState.currentItemRoundness,
    currentItemArrowType: appState.currentItemArrowType,
    zoom: appState.zoom,
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
    selectedElementIds: {},
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      elements,
      appState: serializedAppState,
      fileCount: Object.keys(files).length,
    })
  );
};

export const WhiteboardToolPage = () => {
  const excalidrawApiRef = useRef<ExcalidrawApiLike | null>(null);
  const librariesLoadedRef = useRef(false);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col px-2 py-2 sm:px-3 sm:py-3">
      <section className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-black/5 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
        <div className="h-full min-h-0 overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-slate-900">
          <Excalidraw
            excalidrawAPI={(api) => {
              const typedApi = api as unknown as ExcalidrawApiLike;
              excalidrawApiRef.current = typedApi;

              const snapshot = loadSnapshot();
              if (snapshot) {
                typedApi.updateScene({
                  elements: snapshot.elements,
                  appState: snapshot.appState,
                });
              }

              if (!librariesLoadedRef.current) {
                librariesLoadedRef.current = true;
                void loadExcalidrawLibraries(typedApi);
              }
            }}
            onChange={(elements, appState, files) => {
              saveSnapshot(
                elements,
                appState as unknown as Record<string, unknown>,
                files as Record<string, unknown>
              );
            }}
            UIOptions={{
              canvasActions: {
                saveAsImage: true,
                saveToActiveFile: false,
                loadScene: true,
                export: {
                  saveFileToDisk: true,
                },
              },
            }}
          />
        </div>
      </section>
    </div>
  );
};
