import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, BookOpen, Layers, ZoomIn, ZoomOut, Maximize2, Search } from "lucide-react";
import {
  docsNavTree,
  flattenDocsNavItems,
  contentDocs,
  contentDocBySlug,
} from "../../../docs/contentIndex";
import { getDocHref } from "../../../docs/utils";
import { searchDocsByQuery } from "../../../docs/search";
import type { DocsNavFolder, DocsNavItem } from "../../../docs/types";

type NodeKind = "cluster" | "folder" | "article" | "empty";

interface LayoutNode {
  id: string;
  kind: NodeKind;
  title: string;
  description?: string;
  href?: string;
  x: number;
  y: number;
  r: number;
  articleCount: number;
  parentId?: string;
  animDelay: number;
}

interface LayoutEdge {
  from: string;
  to: string;
}

function classifyNode(f: DocsNavFolder): NodeKind {
  return flattenDocsNavItems(f).length === 0 ? "empty" : "folder";
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildLayout(
  tree: DocsNavFolder,
  vertical: boolean,
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const rand = seededRandom(42);
  const topFolders = tree.children.filter(
    (c): c is DocsNavFolder => c.type === "folder",
  );
  const count = topFolders.length;
  if (count === 0) return { nodes, edges };

  const clusterPositions: { cx: number; cy: number }[] = [];
  if (vertical) {
    const spacing = 420;
    const startY = -((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++)
      clusterPositions.push({ cx: 0, cy: startY + i * spacing });
  } else {
    const spacing = 460;
    const startX = -((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++)
      clusterPositions.push({ cx: startX + i * spacing, cy: 0 });
  }

  topFolders.forEach((folder, fi) => {
    const { cx, cy } = clusterPositions[fi];
    const allItems = flattenDocsNavItems(folder);
    const clusterId = `cluster-${folder.id}`;
    nodes.push({
      id: clusterId, kind: "cluster", title: folder.title,
      x: cx, y: cy, r: 24, articleCount: allItems.length, animDelay: rand() * 3,
    });

    const children = folder.children;
    const childCount = children.length;
    if (childCount === 0) return;
    const orbitR = 160;
    const angleStep = (2 * Math.PI) / Math.max(childCount, 1);
    const angleOffset = -Math.PI / 2;

    children.forEach((child, ci) => {
      const angle = angleOffset + ci * angleStep;
      const nx = cx + orbitR * Math.cos(angle);
      const ny = cy + orbitR * Math.sin(angle);

      if (child.type === "folder") {
        const subFolder = child as DocsNavFolder;
        const subItems = flattenDocsNavItems(subFolder);
        const kind = classifyNode(subFolder);
        const nodeId = `folder-${subFolder.id}`;
        const firstItem = subItems[0];
        const href = kind !== "empty" && firstItem ? firstItem.href : undefined;
        nodes.push({
          id: nodeId, kind, title: subFolder.title,
          x: nx, y: ny, r: kind === "empty" ? 7 : 14,
          articleCount: subItems.length, href,
          parentId: clusterId, animDelay: rand() * 3,
        });
        edges.push({ from: clusterId, to: nodeId });

        const leafChildren = subFolder.children;
        const leafCount = leafChildren.length;
        if (leafCount > 0) {
          const fanSpread = Math.min(Math.PI * 0.9, (leafCount - 1) * 0.32 + 0.5);
          const fanStart = angle - fanSpread / 2;
          const leafR = leafCount > 6 ? 75 : 65;
          leafChildren.forEach((leaf, li) => {
            const leafAngle =
              leafCount === 1 ? angle : fanStart + (li / (leafCount - 1)) * fanSpread;
            const lx = nx + leafR * Math.cos(leafAngle);
            const ly = ny + leafR * Math.sin(leafAngle);
            if (leaf.type === "folder") {
              const df = leaf as DocsNavFolder;
              const di = flattenDocsNavItems(df);
              const dk = classifyNode(df);
              const did = `folder-${df.id}`;
              const df0 = di[0];
              nodes.push({
                id: did, kind: dk, title: df.title,
                x: lx, y: ly, r: dk === "empty" ? 7 : 10,
                articleCount: di.length,
                href: dk !== "empty" && df0 ? df0.href : undefined,
                parentId: nodeId, animDelay: rand() * 3,
              });
              edges.push({ from: nodeId, to: did });
            } else {
              const item = leaf as DocsNavItem;
              const aid = `article-${item.id}`;
              const doc = item.type === "doc" && "slug" in item
                ? contentDocBySlug.get(item.slug) : undefined;
              nodes.push({
                id: aid, kind: "article", title: item.title,
                description: doc?.description ?? item.description,
                x: lx, y: ly, r: 8, articleCount: 0,
                href: item.href, parentId: nodeId, animDelay: rand() * 3,
              });
              edges.push({ from: nodeId, to: aid });
            }
          });
        }
      } else {
        const item = child as DocsNavItem;
        const aid = `article-${item.id}`;
        const doc = item.type === "doc" && "slug" in item
          ? contentDocBySlug.get(item.slug) : undefined;
        nodes.push({
          id: aid, kind: "article", title: item.title,
          description: doc?.description ?? item.description,
          x: nx, y: ny, r: 8, articleCount: 0,
          href: item.href, parentId: clusterId, animDelay: rand() * 3,
        });
        edges.push({ from: clusterId, to: aid });
      }
    });
  });
  return { nodes, edges };
}


// ─── Helpers ───

const formatDate = (date?: string) => {
  if (!date) return undefined;
  try {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
    });
  } catch { return undefined; }
};

const highlight = (text: string, query: string) => {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lower.indexOf(lowerQ);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-[var(--accent-color)]/30 px-0.5 text-inherit">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
};

// ─── DocSearch ───

function DocSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchDocsByQuery(q, 6).filter(
      (hit) => hit.id.startsWith("md:") || hit.id.startsWith("mdx:"),
    );
  }, [query]);

  const showResults = focused && query.trim().length > 0;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults[0]) {
      navigate(searchResults[0].href);
      setQuery("");
      setFocused(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center rounded-xl border border-black/10 bg-white/80 shadow-sm backdrop-blur transition-colors focus-within:border-black/20 dark:border-slate-700/60 dark:bg-slate-900/70 dark:focus-within:border-slate-500/80">
          <Search className="ml-3.5 h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="搜索文章标题、描述或关键词…"
            aria-label="搜索文章"
            className="h-10 w-full bg-transparent pl-2.5 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50"
          />
        </div>
      </form>

      {showResults && (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/95">
          {searchResults.length > 0 ? (
            <div className="space-y-0.5">
              {searchResults.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  onClick={() => {
                    navigate(hit.href);
                    setQuery("");
                    setFocused(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-black/5 dark:hover:bg-slate-800/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {highlight(hit.title, query)}
                    </p>
                    {hit.section && (
                      <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800/90 dark:text-slate-400">
                        {hit.section}
                      </span>
                    )}
                  </div>
                  {hit.snippet && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                      {highlight(hit.snippet, query)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              没有找到匹配结果
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ViewTransform { scale: number; tx: number; ty: number; }
function clampScale(s: number) { return Math.max(0.3, Math.min(4, s)); }

// ─── ConstellationMap ───

function ConstellationMap({
  nodes, edges, vertical,
}: {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  vertical: boolean;
}) {
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [view, setView] = useState<ViewTransform>({ scale: 1, tx: 0, ty: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  const nodeMap = useMemo(() => {
    const m = new Map<string, LayoutNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const connectedIds = useMemo(() => {
    if (!hoveredId) return null;
    const set = new Set<string>([hoveredId]);
    for (const e of edges) {
      if (e.from === hoveredId) set.add(e.to);
      if (e.to === hoveredId) set.add(e.from);
    }
    return set;
  }, [hoveredId, edges]);

  const baseVB = useMemo(() => {
    if (nodes.length === 0) return { x: -400, y: -300, w: 800, h: 600 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const textPad = n.kind === "article" ? 60 : 20;
      minX = Math.min(minX, n.x - n.r - textPad);
      maxX = Math.max(maxX, n.x + n.r + textPad);
      minY = Math.min(minY, n.y - n.r - 10);
      maxY = Math.max(maxY, n.y + n.r + 30);
    }
    const pad = 60;
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }, [nodes]);

  const viewBox = useMemo(() => {
    const w = baseVB.w / view.scale;
    const h = baseVB.h / view.scale;
    const cx = baseVB.x + baseVB.w / 2 - view.tx;
    const cy = baseVB.y + baseVB.h / 2 - view.ty;
    return `${cx - w / 2} ${cy - h / 2} ${w} ${h}`;
  }, [baseVB, view]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setView(v => ({ ...v, scale: clampScale(v.scale * delta) }));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as SVGElement;
    if (target.closest("[data-node]")) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
  }, [view.tx, view.ty]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning || !panStart.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = baseVB.w / view.scale / rect.width;
    const scaleY = baseVB.h / view.scale / rect.height;
    const dx = (e.clientX - panStart.current.x) * scaleX;
    const dy = (e.clientY - panStart.current.y) * scaleY;
    setView(v => ({ ...v, tx: panStart.current!.tx + dx, ty: panStart.current!.ty + dy }));
  }, [isPanning, baseVB, view.scale]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const resetView = useCallback(() => {
    setView({ scale: 1, tx: 0, ty: 0 });
  }, []);

  const zoomIn = useCallback(() => setView(v => ({ ...v, scale: clampScale(v.scale * 1.3) })), []);
  const zoomOut = useCallback(() => setView(v => ({ ...v, scale: clampScale(v.scale / 1.3) })), []);

  return (
    <div className="relative w-full">
      {/* Zoom controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
        <button onClick={zoomIn} className="rounded-lg bg-white/80 p-1.5 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700" title="放大">
          <ZoomIn className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        <button onClick={zoomOut} className="rounded-lg bg-white/80 p-1.5 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700" title="缩小">
          <ZoomOut className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
        {(view.scale !== 1 || view.tx !== 0 || view.ty !== 0) && (
          <button onClick={resetView} className="rounded-lg bg-white/80 p-1.5 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-700" title="重置视图">
            <Maximize2 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full select-none"
        style={{
          maxHeight: vertical ? "700px" : "560px",
          cursor: isPanning ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-sm" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="cluster-grad">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Orbit rings */}
        {nodes.filter(n => n.kind === "cluster").map(cluster => (
          <circle
            key={`orbit-${cluster.id}`}
            cx={cluster.x} cy={cluster.y} r={160}
            fill="none"
            className="constellation-orbit stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="0.5" strokeDasharray="4 6"
            opacity={connectedIds && !connectedIds.has(cluster.id) ? 0.1 : 0.3}
          />
        ))}

        {/* Edges */}
        {edges.map(e => {
          const from = nodeMap.get(e.from);
          const to = nodeMap.get(e.to);
          if (!from || !to) return null;
          const isHL = connectedIds && (connectedIds.has(e.from) || connectedIds.has(e.to));
          const dim = connectedIds && !isHL;
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth={isHL ? 1.2 : 0.7}
              opacity={entered ? (dim ? 0.06 : isHL ? 0.6 : 0.2) : 0}
              style={{ transition: "opacity 0.6s ease, stroke-width 0.2s" }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, ni) => {
          const dim = connectedIds && !connectedIds.has(node.id);
          const hl = connectedIds?.has(node.id);
          const isHov = hoveredId === node.id;
          const clickable = !!node.href;

          return (
            <g
              key={node.id}
              data-node="true"
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (clickable) navigate(node.href!);
              }}
              style={{
                cursor: clickable ? "pointer" : "default",
                opacity: entered ? (dim ? 0.15 : 1) : 0,
                transition: `opacity 0.5s ease ${ni * 0.02}s`,
              }}
            >
              {node.kind === "cluster" && (
                <>
                  <circle cx={node.x} cy={node.y} r={40} fill="url(#cluster-grad)"
                    opacity={isHov ? 0.8 : 0.4} style={{ transition: "opacity 0.25s" }} />
                  <circle cx={node.x} cy={node.y} r={node.r}
                    className="fill-blue-400 dark:fill-blue-300" filter="url(#glow)" opacity={0.9}
                    style={{
                      transform: isHov ? "scale(1.15)" : "scale(1)",
                      transformOrigin: `${node.x}px ${node.y}px`,
                      transition: "transform 0.25s",
                    }} />
                  <text x={node.x} y={node.y + node.r + 18} textAnchor="middle"
                    className="fill-slate-700 dark:fill-slate-200" fontSize="13" fontWeight="600">
                    {node.title}
                  </text>
                </>
              )}

              {node.kind === "folder" && (
                <>
                  <circle cx={node.x} cy={node.y} r={node.r}
                    className="fill-blue-400/80 dark:fill-blue-300/80" filter="url(#glow-sm)"
                    style={{
                      transform: isHov ? "scale(1.2)" : "scale(1)",
                      transformOrigin: `${node.x}px ${node.y}px`,
                      transition: "transform 0.25s",
                    }} />
                  <text x={node.x} y={node.y + node.r + 14} textAnchor="middle"
                    className="fill-slate-600 dark:fill-slate-300" fontSize="10" fontWeight="500">
                    {node.title}
                  </text>
                </>
              )}

              {node.kind === "article" && (
                <>
                  <circle cx={node.x} cy={node.y} r={node.r}
                    className="constellation-twinkle fill-blue-400 dark:fill-blue-300"
                    filter={hl ? "url(#glow-sm)" : undefined}
                    style={{
                      animationDelay: `${node.animDelay}s`,
                      transform: isHov ? "scale(1.4)" : "scale(1)",
                      transformOrigin: `${node.x}px ${node.y}px`,
                      transition: "transform 0.25s",
                    }} />
                  <text
                    x={node.x} y={node.y + node.r + 12} textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400"
                    fontSize="8" fontWeight="400"
                    style={{ opacity: isHov ? 1 : 0.85, transition: "opacity 0.2s" }}
                  >
                    {node.title.length > 14 ? node.title.slice(0, 14) + "…" : node.title}
                  </text>
                </>
              )}

              {node.kind === "empty" && (
                <>
                  <circle cx={node.x} cy={node.y} r={node.r} fill="none"
                    className="constellation-pulse stroke-slate-400 dark:stroke-slate-500"
                    strokeWidth="1.2" strokeDasharray="3 3"
                    style={{
                      animationDelay: `${node.animDelay}s`,
                      transform: isHov ? "scale(1.4)" : "scale(1)",
                      transformOrigin: `${node.x}px ${node.y}px`,
                      transition: "transform 0.25s",
                    }} />
                  <text x={node.x} y={node.y + node.r + 11} textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500" fontSize="7" fontWeight="400"
                    opacity={0.7}>
                    {node.title}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {hoveredId && (() => {
          const node = nodeMap.get(hoveredId);
          if (!node) return null;
          const tw = 180;
          const th = node.description ? 70 : 50;
          const tx = node.x + 20;
          const ty = node.y - th / 2;
          return (
            <foreignObject x={tx} y={ty} width={tw} height={th + 10}
              style={{ pointerEvents: "none", overflow: "visible" }}>
              <div className="rounded-xl border border-black/5 bg-white/90 px-3 py-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
                <p className="text-xs font-semibold text-slate-800 dark:text-white">
                  {node.title}
                </p>
                {node.description && (
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                    {node.description}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                  {node.kind === "empty" ? "即将推出"
                    : node.kind === "article" ? "点击查看文章"
                    : node.kind === "cluster" ? `${node.articleCount} 篇文章`
                    : node.articleCount > 0 ? `${node.articleCount} 篇文章` : "即将推出"}
                </p>
              </div>
            </foreignObject>
          );
        })()}
      </svg>
    </div>
  );
}

// ─── Main Page ───

export const OverviewPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const vertical = containerWidth < 500;

  const topFolders = useMemo(
    () => docsNavTree.children.filter(
      (c): c is DocsNavFolder => c.type === "folder",
    ),
    [],
  );

  const { nodes, edges } = useMemo(
    () => buildLayout(docsNavTree, vertical),
    [vertical],
  );

  const stats = useMemo(() => {
    const totalDocs = contentDocs.length;
    const categoryCount = topFolders.length;
    const latestUpdate = contentDocs.reduce<string | undefined>((latest, doc) => {
      const d = doc.updatedAt ?? doc.createdAt;
      if (!d) return latest;
      if (!latest) return d;
      return d > latest ? d : latest;
    }, undefined);
    return { totalDocs, categoryCount, latestUpdate };
  }, [topFolders]);

  const recentDocs = useMemo(() => {
    return [...contentDocs]
      .filter((d) => d.updatedAt || d.createdAt)
      .sort((a, b) => {
        const da = a.updatedAt ?? a.createdAt ?? "";
        const db = b.updatedAt ?? b.createdAt ?? "";
        return db.localeCompare(da);
      })
      .slice(0, 5);
  }, []);

  return (
    <article ref={containerRef} className="w-full max-w-none space-y-10 pb-20 pt-10">
      {/* Header */}
      <header className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Documentation
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          文档中心
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-300">
          浏览所有技术文档，快速找到你需要的内容。
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <BookOpen className="h-3.5 w-3.5" />
            {stats.totalDocs} 篇文章
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <Layers className="h-3.5 w-3.5" />
            {stats.categoryCount} 个分类
          </span>
          {stats.latestUpdate && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <Clock className="h-3.5 w-3.5" />
              最近更新 {formatDate(stats.latestUpdate)}
            </span>
          )}
        </div>
      </header>

      {/* Search */}
      <DocSearch />

      {/* Constellation Map */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
          知识星图
        </h2>
        <ConstellationMap nodes={nodes} edges={edges} vertical={vertical} />
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-400 dark:bg-blue-300" />
            已有内容
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-slate-400 dark:border-slate-500" />
            即将推出
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            滚轮缩放 · 拖拽平移
          </span>
        </div>
      </section>

      {/* Recent Updates */}
      {recentDocs.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            近期更新
          </h2>
          <div className="relative ml-1">
            {recentDocs.map((doc, i) => {
              const category = doc.slug.split("/")[0] ?? "";
              const date = formatDate(doc.updatedAt) ?? formatDate(doc.createdAt);
              const isLast = i === recentDocs.length - 1;
              return (
                <div key={doc.slug} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-[15px] top-[34px] bottom-0 w-px bg-gradient-to-b from-blue-300 to-transparent dark:from-blue-500/40" />
                  )}
                  {/* Number circle */}
                  <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-500 ring-[3px] ring-white dark:bg-blue-500/10 dark:text-blue-400 dark:ring-slate-950">
                    {i + 1}
                  </div>
                  {/* Content card */}
                  <Link
                    to={getDocHref(doc.slug)}
                    className="group -mt-0.5 flex-1 rounded-xl px-3 py-2 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
                        {category}
                      </span>
                      {date && <span>{date}</span>}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-slate-800 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">
                      {doc.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {doc.description ?? "查看文章内容"}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
};
