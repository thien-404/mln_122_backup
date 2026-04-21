import { TILE_TYPES } from "../lib/constants";
import PlayerToken from "./PlayerToken";

export default function Tile({ tile, owner, playersOnThisTile = [], size }) {
  const isProperty = tile?.type === TILE_TYPES.PROPERTY;
  const typeLabelMap = {
    GO: "Khởi đầu",
    PROPERTY: "Tài sản",
    CHANCE: "Sự kiện",
    TAX: "Nộp quỹ",
    JAIL: "Nhà tù",
    SAFE: "An toàn",
    GO_TO_JAIL: "Đi tù",
  };
  const typeLabel = tile ? typeLabelMap[tile.type] || tile.type : "";

  return (
    <div
      className="relative border border-slate-300 bg-white flex items-center justify-center p-1"
      style={{ width: size, height: size }}
    >
      {isProperty && (
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ background: tile.color || "#e5e7eb" }}
        />
      )}

      {tile ? (
        <div className="text-center w-full px-1">
          <div
            className="text-[13px] font-semibold leading-tight break-words"
            style={{ color: owner?.color || "#0f172a" }}
            title={tile.description || (owner ? `Chủ: ${owner.name}` : undefined)}
          >
            {tile.name}
          </div>

          {!isProperty && (
            <div className="text-[11px] text-slate-500 uppercase mt-0.5">{typeLabel}</div>
          )}

          {isProperty && (
            <div className="text-[12px] text-slate-500 mt-0.5">
              {tile.purchasePrice ?? tile.price} đồng
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
