import { TILE_TYPES } from "./constants";
import { pickColorGroup } from "./colors";
import { BOARD_TILES } from "../data/BOARD_CONCEPT";

/** Board 7x7, vien 24 o theo concept moi */
export function createBoardRect(rows = 7, cols = 7) {
  if (rows < 3 || cols < 3) throw new Error("rows & cols must be >= 3");

  const tiles = [];
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ r, c, tileId: null }))
  );

  // Duyệt viền theo chiều kim đồng hồ, bắt đầu từ góc trái-dưới
  const loop = [];
  for (let c = 0; c < cols; c++) loop.push({ r: rows - 1, c });           // hàng dưới
  for (let r = rows - 2; r >= 0; r--) loop.push({ r, c: cols - 1 });      // cột phải
  for (let c = cols - 2; c >= 0; c--) loop.push({ r: 0, c });             // hàng trên
  for (let r = 1; r < rows - 1; r++) loop.push({ r, c: 0 });              // cột trái

  const perimeter = 2 * (rows + cols) - 4;
  if (perimeter !== BOARD_TILES.length) {
    throw new Error(`Board perimeter ${perimeter} must equal tiles ${BOARD_TILES.length}`);
  }

  for (let i = 0; i < loop.length; i++) {
    const { r, c } = loop[i];
    const source = BOARD_TILES[i];
    const type = source.type;
    const tile = {
      id: source.id,
      name: source.name,
      type,
      row: r,
      col: c,
      group: source.group,
      rent: source.rent ?? 0,
      description: source.description ?? "",
      ownerId: null,
      price: type === TILE_TYPES.PROPERTY ? source.price : 0,
      color: type === TILE_TYPES.PROPERTY ? pickColorGroup(i) : null,
    };
    tiles.push(tile);
    cells[r][c].tileId = tile.id;
  }

  return { rows, cols, tiles, cells }; // tiles.length === 40
}
