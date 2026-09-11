import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Film,
  Sparkles,
  Search,
  Columns3,
  Rows3,
  Compass
} from 'lucide-react';
import {
  CinemaTimeline,
  CinemaFile,
  REACT_CINEMA,
  EXPRESS_CINEMA,
  OPENSOURCE_CONNECT_CINEMA,
  fetchLiveRepoTimeline,
  getFileColor
} from '../utils/gitCinemaData';

// Web Audio API procedural synthesizer for calm, gentle acoustic chime
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playCommitPulse(tag: string) {
    if (!this.enabled) return;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      let freq = 392.00; // G4
      if (tag === 'RELEASE') freq = 587.33; // D5
      else if (tag === 'FEATURE') freq = 523.25; // C5
      else if (tag === 'REFACTOR') freq = 440.00; // A4

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.15);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio context fails gracefully in silent environments
    }
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface HierarchyNode {
  id: string;
  name: string;
  fullPath: string;
  parentId?: string;
  type: 'root' | 'folder' | 'file';
  children: HierarchyNode[];
  loc?: number;
  churn?: number;
  extension?: string;
  color?: string;
  lastUpdated?: number;
  status?: 'created' | 'modified' | 'idle';
  depth: number;
  width: number;
  height: number;
  leafCount: number;

  // Smooth transition animation state (zero sudden pop-ups)
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  currentOpacity: number;
  targetOpacity: number;
  currentScale: number;
  branchProgress: number; // 0.0 -> 1.0 curve growth from parent
}

export default function GitCinema(): React.ReactElement {
  // Preset selection & timeline state
  const [selectedPreset, setSelectedPreset] = useState<'react' | 'express' | 'connect' | 'custom'>('react');
  const [customInput, setCustomInput] = useState<string>('vitejs/vite');
  const [loadingCustom, setLoadingCustom] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const [timeline, setTimeline] = useState<CinemaTimeline>(REACT_CINEMA);
  const [currentCommitIdx, setCurrentCommitIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [treeOrientation, setTreeOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const soundSynth = useRef<SoundSynthesizer>(new SoundSynthesizer());

  // Camera Pan & Zoom state
  const cameraRef = useRef<{ x: number; y: number; zoom: number; isDragging: boolean; startX: number; startY: number }>({
    x: 80,
    y: 120,
    zoom: 0.85,
    isDragging: false,
    startX: 0,
    startY: 0
  });

  // Persistent nodes map for smooth organic transitions (no abrupt snap or popups)
  const persistentNodesRef = useRef<Map<string, HierarchyNode>>(new Map());
  const filesRef = useRef<Map<string, CinemaFile>>(new Map());
  const particlesRef = useRef<Particle[]>([]);
  const playTimerRef = useRef<number | null>(null);

  // Switch timeline presets
  const handleSelectPreset = (preset: 'react' | 'express' | 'connect') => {
    setIsPlaying(false);
    persistentNodesRef.current.clear();
    setSelectedPreset(preset);
    setCurrentCommitIdx(0);
    setCustomError(null);
    if (preset === 'react') setTimeline(REACT_CINEMA);
    else if (preset === 'express') setTimeline(EXPRESS_CINEMA);
    else if (preset === 'connect') setTimeline(OPENSOURCE_CONNECT_CINEMA);
  };

  const handleLoadCustomRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    try {
      setLoadingCustom(true);
      setCustomError(null);
      setIsPlaying(false);
      persistentNodesRef.current.clear();
      const customTimeline = await fetchLiveRepoTimeline(customInput.trim());
      setTimeline(customTimeline);
      setSelectedPreset('custom');
      setCurrentCommitIdx(0);
    } catch (err: any) {
      setCustomError(err.message || 'Failed to load GitHub repository');
    } finally {
      setLoadingCustom(false);
    }
  };

  // Build file map and compute hierarchical layout smoothly
  useEffect(() => {
    const fileMap = new Map<string, CinemaFile>();

    for (let i = 0; i <= currentCommitIdx && i < timeline.commits.length; i++) {
      const commit = timeline.commits[i];
      commit.files.forEach((f) => {
        if (f.action === 'delete') {
          fileMap.delete(f.path);
        } else {
          const parts = f.path.split('/');
          const name = parts[parts.length - 1];
          const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
          const ext = name.includes('.') ? name.split('.').pop() || '' : '';

          const existing = fileMap.get(f.path);
          if (existing) {
            existing.loc = f.loc;
            existing.churn += 1;
            existing.lastUpdated = i;
            existing.status = 'modified';
          } else {
            fileMap.set(f.path, {
              id: f.path,
              path: f.path,
              name,
              folder,
              extension: ext,
              loc: f.loc,
              churn: 1,
              color: getFileColor(ext),
              lastUpdated: i,
              status: 'created'
            });
          }
        }
      });
    }

    filesRef.current = fileMap;

    // ====================================================
    // BUILD LOGICAL HIERARCHY TREE
    // ====================================================
    const rootNode: HierarchyNode = {
      id: 'root',
      name: timeline.repoName.split('/')[1] || 'repository',
      fullPath: '',
      type: 'root',
      children: [],
      depth: 0,
      width: treeOrientation === 'horizontal' ? 180 : 170,
      height: 40,
      leafCount: 0,
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      currentOpacity: 1,
      targetOpacity: 1,
      currentScale: 1,
      branchProgress: 1
    };

    fileMap.forEach((file) => {
      const parts = file.path.split('/');
      let current = rootNode;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        const fullPath = parts.slice(0, i + 1).join('/');

        let child = current.children.find((c) => c.name === part);
        if (!child) {
          child = {
            id: fullPath,
            name: part,
            fullPath,
            parentId: current.id,
            type: isFile ? 'file' : 'folder',
            children: [],
            depth: i + 1,
            width: isFile ? 185 : 155,
            height: isFile ? 34 : 34,
            loc: isFile ? file.loc : undefined,
            churn: isFile ? file.churn : undefined,
            extension: isFile ? file.extension : undefined,
            color: isFile ? file.color : '#3F72AF',
            lastUpdated: isFile ? file.lastUpdated : undefined,
            status: isFile ? (file.lastUpdated === currentCommitIdx ? 'modified' : 'idle') : undefined,
            leafCount: 0,
            currentX: 0,
            currentY: 0,
            targetX: 0,
            targetY: 0,
            currentOpacity: 0,
            targetOpacity: 1,
            currentScale: 0.65,
            branchProgress: 0
          };
          current.children.push(child);
        }
        current = child;
      }
    });

    // Compute leaf counts for balanced spacing
    const computeLeafCount = (node: HierarchyNode): number => {
      if (node.children.length === 0) {
        node.leafCount = 1;
        return 1;
      }
      node.leafCount = node.children.reduce((acc, c) => acc + computeLeafCount(c), 0);
      return node.leafCount;
    };
    computeLeafCount(rootNode);

    // Compute target coordinates for all nodes
    let currentLeafIndex = 0;

    if (treeOrientation === 'horizontal') {
      const levelSpacing = 240;
      const leafHeight = 48;

      const layoutHorizontal = (node: HierarchyNode) => {
        node.targetX = node.depth * levelSpacing;

        if (node.children.length === 0) {
          node.targetY = currentLeafIndex * leafHeight;
          currentLeafIndex++;
        } else {
          node.children.forEach(layoutHorizontal);
          const firstY = node.children[0].targetY;
          const lastY = node.children[node.children.length - 1].targetY;
          node.targetY = (firstY + lastY) / 2;
        }
      };

      layoutHorizontal(rootNode);
    } else {
      const levelSpacing = 120;
      const leafWidth = 200;

      const layoutVertical = (node: HierarchyNode) => {
        node.targetY = node.depth * levelSpacing;

        if (node.children.length === 0) {
          node.targetX = currentLeafIndex * leafWidth;
          currentLeafIndex++;
        } else {
          node.children.forEach(layoutVertical);
          const firstX = node.children[0].targetX;
          const lastX = node.children[node.children.length - 1].targetX;
          node.targetX = (firstX + lastX) / 2;
        }
      };

      layoutVertical(rootNode);
    }

    // ====================================================
    // SYNCHRONIZE WITH PERSISTENT NODES (ORGANIC TRANSITIONS)
    // ====================================================
    const activeIds = new Set<string>();

    const syncNode = (node: HierarchyNode) => {
      activeIds.add(node.id);
      const existing = persistentNodesRef.current.get(node.id);

      if (existing) {
        // Node already exists: update targets smoothly
        existing.targetX = node.targetX;
        existing.targetY = node.targetY;
        existing.targetOpacity = 1;
        existing.loc = node.loc;
        existing.churn = node.churn;
        existing.children = node.children;
        existing.lastUpdated = node.lastUpdated;
        existing.status = node.status;
      } else {
        // New node: spawn from parent position if available, or target
        const parent = node.parentId ? persistentNodesRef.current.get(node.parentId) : null;
        node.currentX = parent ? parent.currentX : node.targetX;
        node.currentY = parent ? parent.currentY : node.targetY;
        node.currentOpacity = 0.0;
        node.targetOpacity = 1.0;
        node.currentScale = 0.65;
        node.branchProgress = 0.0;
        persistentNodesRef.current.set(node.id, node);
      }

      node.children.forEach(syncNode);
    };

    syncNode(rootNode);

    // Mark removed nodes for smooth fade out
    persistentNodesRef.current.forEach((node, id) => {
      if (!activeIds.has(id)) {
        node.targetOpacity = 0;
      }
    });

    // Play subtle audio chime for the new commit
    if (timeline.commits[currentCommitIdx]) {
      const currentCommit = timeline.commits[currentCommitIdx];
      soundSynth.current.playCommitPulse(currentCommit.tag);
    }
  }, [currentCommitIdx, timeline, treeOrientation]);

  // Fit view camera framing helper
  const fitTreeToScreen = () => {
    const canvas = canvasRef.current;
    const nodes = Array.from(persistentNodesRef.current.values()).filter((n) => n.currentOpacity > 0.05);
    if (!canvas || nodes.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      if (n.targetX < minX) minX = n.targetX;
      if (n.targetX + n.width > maxX) maxX = n.targetX + n.width;
      if (n.targetY < minY) minY = n.targetY;
      if (n.targetY + n.height > maxY) maxY = n.targetY + n.height;
    });

    const rect = canvas.getBoundingClientRect();
    const treeW = maxX - minX + 220;
    const treeH = maxY - minY + 260;

    const scaleX = (rect.width * 0.85) / treeW;
    const scaleY = (rect.height * 0.7) / treeH;
    const bestZoom = Math.max(0.4, Math.min(1.05, Math.min(scaleX, scaleY)));

    cameraRef.current = {
      x: (rect.width / 2) - ((minX + maxX) / 2) * bestZoom,
      y: (rect.height / 2) - ((minY + maxY) / 2) * bestZoom - 20,
      zoom: bestZoom,
      isDragging: false,
      startX: 0,
      startY: 0
    };
  };

  // Playback timer: SLOW AND MEASURED (Base 5500ms / speed)
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    // 5.5 seconds per commit at 1x speed allows full appreciation of the gradual growth
    const intervalMs = Math.max(1200, Math.round(5500 / playbackSpeed));
    playTimerRef.current = window.setInterval(() => {
      setCurrentCommitIdx((prev) => {
        if (prev >= timeline.commits.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, timeline.commits.length]);

  // Main Canvas Render Loop (60 FPS Smooth Interpolation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const camera = cameraRef.current;

      ctx.clearRect(0, 0, width, height);

      // Deep space theater background
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * 0.85);
      bgGrad.addColorStop(0, '#0a192f');
      bgGrad.addColorStop(0.65, '#040d1a');
      bgGrad.addColorStop(1, '#02060e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Architectural engineering grid lines
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 106, 103, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 45 * camera.zoom;
      const offsetX = camera.x % gridSize;
      const offsetY = camera.y % gridSize;

      for (let x = offsetX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Camera Pan & Zoom Transform
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      const persistentMap = persistentNodesRef.current;
      const nodes = Array.from(persistentMap.values());

      // ====================================================
      // 1. UPDATE PHYSICS & SMOOTH GLIDE (ORGANIC BLOSSOM)
      // ====================================================
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];

        // Smooth position glide (lerp)
        node.currentX += (node.targetX - node.currentX) * 0.045;
        node.currentY += (node.targetY - node.currentY) * 0.045;

        // Smooth opacity fade
        node.currentOpacity += (node.targetOpacity - node.currentOpacity) * 0.038;

        // Smooth expansion scale
        node.currentScale += (1.0 - node.currentScale) * 0.045;

        // Smooth branch unrolling progress from parent
        node.branchProgress = Math.min(1, node.branchProgress + 0.028);

        // Remove fully faded dead nodes
        if (node.targetOpacity === 0 && node.currentOpacity < 0.015) {
          persistentMap.delete(node.id);
        }
      }

      // ====================================================
      // 2. DRAW SMOOTHLY UNROLLING BEZIER CONNECTOR CURVES
      // ====================================================
      nodes.forEach((node) => {
        if (node.currentOpacity < 0.02) return;

        if (node.children && node.children.length > 0) {
          node.children.forEach((childRef) => {
            const child = persistentMap.get(childRef.id);
            if (!child || child.currentOpacity < 0.02) return;

            const isChildActive = child.lastUpdated === currentCommitIdx;
            const progress = child.branchProgress; // Smooth branch growth

            ctx.beginPath();
            if (treeOrientation === 'horizontal') {
              const startX = node.currentX + node.width;
              const startY = node.currentY + node.height / 2;
              const targetX = child.currentX;
              const targetY = child.currentY + child.height / 2;

              // Partial unrolling curve
              const curEndX = startX + (targetX - startX) * progress;
              const curEndY = startY + (targetY - startY) * progress;
              const midX = (startX + curEndX) / 2;

              ctx.moveTo(startX, startY);
              ctx.bezierCurveTo(midX, startY, midX, curEndY, curEndX, curEndY);
            } else {
              const startX = node.currentX + node.width / 2;
              const startY = node.currentY + node.height;
              const targetX = child.currentX + child.width / 2;
              const targetY = child.currentY;

              const curEndX = startX + (targetX - startX) * progress;
              const curEndY = startY + (targetY - startY) * progress;
              const midY = (startY + curEndY) / 2;

              ctx.moveTo(startX, startY);
              ctx.bezierCurveTo(startX, midY, curEndX, midY, curEndX, curEndY);
            }

            const alpha = Math.min(node.currentOpacity, child.currentOpacity);
            ctx.strokeStyle = isChildActive
              ? `rgba(45, 212, 191, ${0.85 * alpha})`
              : `rgba(63, 114, 175, ${0.28 * alpha})`;
            ctx.lineWidth = isChildActive ? 2 : 1.2;
            ctx.stroke();
          });
        }
      });

      // ====================================================
      // 3. DRAW GENTLY FADING & EXPANDING CARDS
      // ====================================================
      nodes.forEach((node) => {
        if (node.currentOpacity < 0.02) return;

        ctx.save();
        ctx.globalAlpha = Math.min(1, Math.max(0, node.currentOpacity));

        // Center-scaled blossom transform
        const cx = node.currentX + node.width / 2;
        const cy = node.currentY + node.height / 2;
        ctx.translate(cx, cy);
        ctx.scale(node.currentScale, node.currentScale);
        ctx.translate(-cx, -cy);

        const isRecentlyUpdated = node.lastUpdated === currentCommitIdx;

        // Gentle breathing card glow on active update
        if (isRecentlyUpdated) {
          ctx.save();
          ctx.shadowColor = '#2dd4bf';
          ctx.shadowBlur = 14;
          ctx.fillStyle = 'rgba(45, 212, 191, 0.12)';
          ctx.beginPath();
          ctx.roundRect(node.currentX - 3, node.currentY - 3, node.width + 6, node.height + 6, 8);
          ctx.fill();
          ctx.restore();
        }

        // Card Container
        ctx.beginPath();
        ctx.roundRect(node.currentX, node.currentY, node.width, node.height, 6);

        if (node.type === 'root') {
          // Root Repository Card
          const rootGrad = ctx.createLinearGradient(node.currentX, node.currentY, node.currentX + node.width, node.currentY + node.height);
          rootGrad.addColorStop(0, '#112D4E');
          rootGrad.addColorStop(1, '#006A67');
          ctx.fillStyle = rootGrad;
          ctx.fill();
          ctx.strokeStyle = '#FFF4B7';
          ctx.lineWidth = 1.8;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 11px Sora, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(`📦 ${node.name}`, node.currentX + 12, node.currentY + node.height / 2);
        } else if (node.type === 'folder') {
          // Directory Folder Card
          ctx.fillStyle = 'rgba(17, 45, 78, 0.92)';
          ctx.fill();
          ctx.strokeStyle = isRecentlyUpdated ? '#2dd4bf' : 'rgba(63, 114, 175, 0.5)';
          ctx.lineWidth = isRecentlyUpdated ? 1.8 : 1;
          ctx.stroke();

          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 10px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          const folderText = node.name.length > 15 ? `${node.name.substring(0, 13)}…` : node.name;
          ctx.fillText(`📁 ${folderText}`, node.currentX + 8, node.currentY + node.height / 2);

          // Child items count pill
          const countBadge = `${node.children.length}`;
          ctx.fillStyle = 'rgba(0, 106, 103, 0.4)';
          ctx.beginPath();
          ctx.roundRect(node.currentX + node.width - 24, node.currentY + 8, 18, 18, 4);
          ctx.fill();
          ctx.fillStyle = '#2dd4bf';
          ctx.font = 'bold 8.5px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(countBadge, node.currentX + node.width - 15, node.currentY + node.height / 2);
        } else {
          // File Card
          ctx.fillStyle = isRecentlyUpdated ? 'rgba(2, 24, 34, 0.96)' : 'rgba(2, 5, 14, 0.92)';
          ctx.fill();
          ctx.strokeStyle = isRecentlyUpdated ? '#2dd4bf' : 'rgba(100, 116, 139, 0.35)';
          ctx.lineWidth = isRecentlyUpdated ? 1.8 : 0.8;
          ctx.stroke();

          // Extension tag pill
          const ext = (node.extension || 'txt').toUpperCase();
          const extColor = node.color || '#38bdf8';
          ctx.fillStyle = `${extColor}22`;
          ctx.beginPath();
          ctx.roundRect(node.currentX + 5, node.currentY + 7, 28, 20, 3);
          ctx.fill();

          ctx.fillStyle = extColor;
          ctx.font = 'bold 7.5px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ext.substring(0, 3), node.currentX + 19, node.currentY + node.height / 2);

          // Filename
          ctx.fillStyle = isRecentlyUpdated ? '#FFF4B7' : '#f8fafc';
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          const maxNameLen = 14;
          const truncatedName = node.name.length > maxNameLen ? `${node.name.substring(0, 12)}..` : node.name;
          ctx.fillText(truncatedName, node.currentX + 38, node.currentY + node.height / 2);

          // LOC Badge
          if (node.loc) {
            ctx.fillStyle = '#64748b';
            ctx.font = '7.5px JetBrains Mono, monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${node.loc}L`, node.currentX + node.width - 7, node.currentY + node.height / 2);
          }
        }

        ctx.restore();
      });

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameId);
    };
  }, [timeline, currentCommitIdx, treeOrientation]);

  // Current active commit
  const currentCommit = timeline.commits[currentCommitIdx] || timeline.commits[0];

  // Telemetry metrics
  const totalActiveFiles = filesRef.current.size;
  const totalActiveLoc = useMemo(() => {
    let loc = 0;
    filesRef.current.forEach((f) => {
      loc += f.loc;
    });
    return loc;
  }, [currentCommitIdx, filesRef.current.size]);

  // Camera Pan & Zoom event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.startX = e.clientX - cameraRef.current.x;
    cameraRef.current.startY = e.clientY - cameraRef.current.y;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (cameraRef.current.isDragging) {
      cameraRef.current.x = e.clientX - cameraRef.current.startX;
      cameraRef.current.y = e.clientY - cameraRef.current.startY;
    }
  };

  const handleMouseUp = () => {
    cameraRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    cameraRef.current.zoom = Math.max(0.3, Math.min(2.5, cameraRef.current.zoom * zoomFactor));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 'calc(100vh - 72px)',
        overflow: 'hidden',
        background: '#02060e',
        color: '#F9F7F7',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. FULL-SCREEN INTERACTIVE CANVAS */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: cameraRef.current.isDragging ? 'grabbing' : 'grab',
          display: 'block',
          zIndex: 1
        }}
      />

      {/* 2. FLOATING TOP CINEMA BAR (GLASS OVERLAY) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          right: '20px',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          pointerEvents: 'none'
        }}
      >
        {/* Left: Repo Title & Era */}
        <div
          className="glass-panel"
          style={{
            padding: '10px 16px',
            background: 'rgba(2, 5, 14, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 106, 103, 0.4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'auto',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 106, 103, 0.3)',
              border: '1px solid rgba(255, 244, 183, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Film size={16} color="#FFF4B7" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Sora, sans-serif' }} className="gradient-text">
                {timeline.repoName}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#2dd4bf', background: 'rgba(0, 106, 103, 0.35)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                {timeline.era}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>
              {totalActiveFiles} Files • {totalActiveLoc.toLocaleString()} LOC • ⭐ {timeline.stars.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Center: Presets & Custom Repo Search */}
        <div
          className="glass-panel"
          style={{
            padding: '6px 12px',
            background: 'rgba(2, 5, 14, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 106, 103, 0.4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
          }}
        >
          {/* Preset Buttons */}
          <div style={{ display: 'flex', background: 'rgba(17, 45, 78, 0.6)', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => handleSelectPreset('react')}
              style={{
                background: selectedPreset === 'react' ? 'rgba(0, 106, 103, 0.85)' : 'transparent',
                color: selectedPreset === 'react' ? '#FFF4B7' : '#cbd5e1',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              React
            </button>
            <button
              onClick={() => handleSelectPreset('express')}
              style={{
                background: selectedPreset === 'express' ? 'rgba(0, 106, 103, 0.85)' : 'transparent',
                color: selectedPreset === 'express' ? '#FFF4B7' : '#cbd5e1',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Express
            </button>
            <button
              onClick={() => handleSelectPreset('connect')}
              style={{
                background: selectedPreset === 'connect' ? 'rgba(0, 106, 103, 0.85)' : 'transparent',
                color: selectedPreset === 'connect' ? '#FFF4B7' : '#cbd5e1',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Our Project
            </button>
          </div>

          {/* Quick Custom Input */}
          <form onSubmit={handleLoadCustomRepo} style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="owner/repo"
              style={{
                background: 'rgba(10, 25, 47, 0.85)',
                border: '1px solid rgba(63, 114, 175, 0.45)',
                color: '#F9F7F7',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                width: '140px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            />
            <button
              type="submit"
              disabled={loadingCustom}
              className="btn-primary"
              style={{ padding: '5px 10px', fontSize: '0.75rem', fontWeight: 700 }}
            >
              <Search size={12} />
            </button>
          </form>
        </div>

        {/* Right: Controls (Orientation, Fit View, Sound, Fullscreen) */}
        <div
          className="glass-panel"
          style={{
            padding: '6px 10px',
            background: 'rgba(2, 5, 14, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 106, 103, 0.4)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'auto',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
          }}
        >
          {/* Orientation Toggle */}
          <button
            onClick={() => setTreeOrientation((prev) => prev === 'horizontal' ? 'vertical' : 'horizontal')}
            className="btn-secondary"
            style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Toggle between Horizontal and Vertical"
          >
            {treeOrientation === 'horizontal' ? <Columns3 size={13} color="#FFF4B7" /> : <Rows3 size={13} color="#FFF4B7" />}
            {treeOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
          </button>

          {/* Fit View */}
          <button
            onClick={fitTreeToScreen}
            className="btn-secondary"
            style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '0.74rem', color: '#FFF4B7', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Fit complete tree on screen"
          >
            <Compass size={13} />
            Fit View
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const res = soundSynth.current.toggleSound();
              setSoundEnabled(res);
            }}
            className="btn-secondary"
            style={{ padding: '6px 8px', borderRadius: '6px', color: soundEnabled ? '#34d399' : '#94a3b8' }}
            title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          {/* Browser Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="btn-secondary"
            style={{ padding: '6px 8px', borderRadius: '6px', color: '#FFF4B7' }}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {customError && (
        <div
          style={{
            position: 'absolute',
            top: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            color: '#f87171',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            backdropFilter: 'blur(10px)'
          }}
        >
          {customError}
        </div>
      )}

      {/* 3. FLOATING BOTTOM CONTROL DECK & SLOW CROSS-FADING DIRECTOR COMMENTARY */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: '920px',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {/* Upper Card: Director's Commentary HUD (Smooth Cross-fade on commit update) */}
        <div
          key={currentCommit.hash}
          className="glass-panel"
          style={{
            padding: '14px 20px',
            background: 'rgba(2, 5, 14, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 244, 183, 0.35)',
            borderRadius: '14px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
            transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={currentCommit.author.avatar}
                alt={currentCommit.author.name}
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #006A67' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'Sora, sans-serif' }}>
                {currentCommit.author.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#2dd4bf', fontFamily: 'JetBrains Mono, monospace' }}>
                @{currentCommit.author.handle}
              </span>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background:
                    currentCommit.tag === 'RELEASE'
                      ? 'rgba(255, 244, 183, 0.2)'
                      : currentCommit.tag === 'FEATURE'
                      ? 'rgba(45, 212, 191, 0.2)'
                      : 'rgba(56, 189, 248, 0.2)',
                  color:
                    currentCommit.tag === 'RELEASE'
                      ? '#FFF4B7'
                      : currentCommit.tag === 'FEATURE'
                      ? '#2dd4bf'
                      : '#38bdf8',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                {currentCommit.tag}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentCommit.chapter && (
                <span style={{ fontSize: '0.72rem', color: '#FFF4B7', background: 'rgba(0, 106, 103, 0.4)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  ★ {currentCommit.chapter}
                </span>
              )}
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                Commit {currentCommitIdx + 1} of {timeline.commits.length} ({currentCommit.hash})
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
            "{currentCommit.message}"
          </div>

          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
            {currentCommit.commentary}
          </div>
        </div>

        {/* Lower Card: Relaxed Timeline Scrubber & Speed Controls */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 18px',
            background: 'rgba(2, 5, 14, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 106, 103, 0.45)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)'
          }}
        >
          {/* Progress Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', minWidth: '75px' }}>
              #{currentCommitIdx + 1} / {timeline.commits.length}
            </span>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min={0}
                max={timeline.commits.length - 1}
                value={currentCommitIdx}
                onChange={(e) => setCurrentCommitIdx(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(17, 45, 78, 0.8)',
                  outline: 'none',
                  accentColor: '#2dd4bf',
                  cursor: 'pointer'
                }}
              />
            </div>

            <span style={{ fontSize: '0.74rem', color: '#2dd4bf', fontFamily: 'JetBrains Mono, monospace', minWidth: '85px', textAlign: 'right' }}>
              {currentCommit.date}
            </span>
          </div>

          {/* Quick Chapter Milestone Buttons */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {timeline.chapters.map((ch) => {
              const isActive = currentCommitIdx >= ch.commitIndex;
              return (
                <button
                  key={ch.title}
                  onClick={() => setCurrentCommitIdx(ch.commitIndex)}
                  style={{
                    background: isActive ? 'rgba(0, 106, 103, 0.4)' : 'rgba(17, 45, 78, 0.35)',
                    border: isActive ? '1px solid rgba(255, 244, 183, 0.4)' : '1px solid rgba(63, 114, 175, 0.2)',
                    color: isActive ? '#FFF4B7' : '#94a3b8',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  title={ch.description}
                >
                  ★ {ch.title}
                </button>
              );
            })}
          </div>

          {/* Action Row: Play/Pause, Step, Relaxed Slower Speeds */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentCommitIdx((p) => Math.max(0, p - 1))}
                disabled={currentCommitIdx === 0}
                className="btn-secondary"
                style={{ padding: '7px 12px', borderRadius: '8px' }}
                title="Step 1 Commit Backward"
              >
                <SkipBack size={14} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background: isPlaying ? 'rgba(239, 68, 68, 0.85)' : 'linear-gradient(135deg, #006A67, #2dd4bf)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '7px 20px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 16px rgba(0, 106, 103, 0.4)'
                }}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>

              <button
                onClick={() => setCurrentCommitIdx((p) => Math.min(timeline.commits.length - 1, p + 1))}
                disabled={currentCommitIdx >= timeline.commits.length - 1}
                className="btn-secondary"
                style={{ padding: '7px 12px', borderRadius: '8px' }}
                title="Step 1 Commit Forward"
              >
                <SkipForward size={14} />
              </button>

              <button
                onClick={() => {
                  setCurrentCommitIdx(0);
                  setIsPlaying(true);
                }}
                className="btn-secondary"
                style={{ padding: '7px 12px', borderRadius: '8px' }}
                title="Restart Timeline"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Deliberate, Slow Playback Speeds */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginRight: '3px' }}>SPEED:</span>
              {[
                { label: '0.25x (Super Slow - 22s)', value: 0.25 },
                { label: '0.5x (Slow - 11s)', value: 0.5 },
                { label: '1x (Calm - 5.5s)', value: 1 },
                { label: '1.5x (3.6s)', value: 1.5 },
                { label: '2x (2.7s)', value: 2 }
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlaybackSpeed(s.value)}
                  style={{
                    background: playbackSpeed === s.value ? 'rgba(0, 106, 103, 0.85)' : 'rgba(17, 45, 78, 0.55)',
                    border: playbackSpeed === s.value ? '1px solid #FFF4B7' : '1px solid rgba(63, 114, 175, 0.3)',
                    color: playbackSpeed === s.value ? '#FFF4B7' : '#cbd5e1',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title={s.label}
                >
                  {s.value}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
