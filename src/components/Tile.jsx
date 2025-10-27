import { TILE_TYPES } from "../lib/constants";
import PlayerToken from "./PlayerToken";

export default function Tile({ tile, owner, playersOnThisTile = [], size }) {
  return (
    <div
      className="relative border border-slate-300 bg-white flex items-center justify-center p-1"
      style={{ width: size, height: size }}
    >
      {tile?.type === TILE_TYPES.PROPERTY && (
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: tile.color || "#e5e7eb" }}
        />
      )}

      {tile ? (
        <div className="text-center">
          {/* Tên ô: nếu có chủ → tô theo màu chủ */}
          <div
            className="text-[11px] font-semibold leading-tight"
            style={{ color: owner?.color || "#0f172a" }}
            title={owner ? `Chủ: ${owner.name}` : undefined}
          >
            {tile.name}
          </div>

          {tile.type === TILE_TYPES.PROPERTY && (
            <div className="text-[11px] text-slate-500">
              ${tile.purchasePrice ?? tile.price}
            </div>
          )}

          {playersOnThisTile.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-0.5 justify-center">
              {playersOnThisTile.map((p) => (
                <PlayerToken key={p.id} color={p.color} label={p.id} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-400">—</div>
      )}
    </div>
  );
}
