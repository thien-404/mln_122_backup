import { TILE_TYPES } from "./constants";
import { pickColorGroup } from "./colors";
import { VIETNAM_PROVINCES } from "../data/VIETNAM_PROVINCES";

/** Board 10 hàng × 12 cột; chỉ dùng ô VIỀN; ô giữa để trống */
export function createBoardRect(rows = 10, cols = 12) {
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

  const perimeter = 2 * (rows + cols) - 4; // = 40

  // START ở góc trái-dưới (index 0); FREE ở đối diện
  const special = {
    0: TILE_TYPES.START,
    [Math.floor(perimeter / 2)]: TILE_TYPES.FREE_PARKING,
  };

  for (let i = 0; i < loop.length; i++) {
    const { r, c } = loop[i];
    const type = special[i] || TILE_TYPES.PROPERTY;
    const tile = {
      id: i,
      name: type === TILE_TYPES.START
        ? "START"
        : type === TILE_TYPES.FREE_PARKING
          ? "FREE"
          : VIETNAM_PROVINCES[i % VIETNAM_PROVINCES.length],
      type,
      row: r,
      col: c,
      ownerId: null,
      price: type === TILE_TYPES.PROPERTY ? 100 + (i % 5) * 20 : 0,
      color: type === TILE_TYPES.PROPERTY ? pickColorGroup(i) : null,
    };
    tiles.push(tile);
    cells[r][c].tileId = tile.id;
  }

  return { rows, cols, tiles, cells }; // tiles.length === 40
}
