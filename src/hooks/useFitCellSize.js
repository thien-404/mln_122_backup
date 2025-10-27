import { useEffect, useRef, useState } from "react";

export function useFitCellSize({ cols, maxCell = 112, minCell = 56, gap = 0 }) {
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(maxCell);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const next = Math.floor((w - gap) / cols); // fit theo bề rộng
      setCellSize(Math.max(minCell, Math.min(maxCell, next)));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [cols, maxCell, minCell, gap]);

  return { containerRef, cellSize };
}
