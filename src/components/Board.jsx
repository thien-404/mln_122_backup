import React from "react";
import Tile from "./Tile";

export default function Board({ rows, cols, cells, tiles, players, cellSize }) {
  const playersOnTile = (tileId) => players.filter((p) => p.position === tileId);
  const findOwner = (ownerId) => players.find((p) => p.id === ownerId) || null;

  return (
    <div
      className="grid bg-slate-200 overflow-hidden gap-0"
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
    >
      {cells.map((row, r) => (
        <React.Fragment key={r}>
          {row.map((cell, c) => {
            const tile = cell.tileId !== null ? tiles[cell.tileId] : null;
            const isEdge = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;

            if (!isEdge) {
              return (
                <div
                  key={`${r}-${c}`}
                  className="border border-slate-300 bg-slate-50"
                  style={{ width: cellSize, height: cellSize }}
                />
              );
            }

            const owner = tile?.ownerId ? findOwner(tile.ownerId) : null;
            return (
              <Tile
                key={`${r}-${c}`}
                tile={tile}
                owner={owner}
                playersOnThisTile={tile ? playersOnTile(tile.id) : []}
                size={cellSize}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
