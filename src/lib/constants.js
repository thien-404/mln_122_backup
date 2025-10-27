export const TILE_TYPES = {
  START: "START",
  PROPERTY: "PROPERTY",
  FREE_PARKING: "FREE_PARKING",
};

export const START_TILE_ID = 0;

// Ô VUÔNG
export const CELL_SIZE = 84; // px (đổi tùy ý)

export const MAX_LIVES = 5;

// Thưởng khi qua/đi qua START
export const PASS_START_BONUS_MONEY = 200;
export const PASS_START_BONUS_LIFE = 1;

// Luật khi vào BĐS người khác
export const RENT_RATE = 0.2;
export const WRONG_ANSWER_LIFE_LOSS = 1;

// Layout tỉ lệ (nếu vẫn muốn giữ)
export const BOARD_WIDTH_PCT = 75; // %
export const SIDEBAR_WIDTH_PCT = 20; // %
