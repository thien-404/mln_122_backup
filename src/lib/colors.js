// Màu nhóm cho PROPERTY để nhìn rõ vòng bàn cờ
const groups = [
  "#fca5a5", "#fdba74", "#fde047", "#86efac",
  "#93c5fd", "#c4b5fd", "#f9a8d4", "#a7f3d0",
];

export function pickColorGroup(idx) {
  return groups[idx % groups.length];
}
