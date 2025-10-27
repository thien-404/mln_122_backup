import React, { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBoardRect } from "./lib/board";
import Board from "./components/Board";
import Controls from "./components/Controls";
import PlayerList from "./components/PlayerList";
import ModalQuestion from "./components/ModalQuestion";
import PurchaseCard from "./components/PurchaseCard";
import ModalPenaltyChoice from "./components/ModalPenaltyChoice";
import {
  START_TILE_ID,
  PASS_START_BONUS_MONEY,
  PASS_START_BONUS_LIFE,
  MAX_LIVES,
} from "./lib/constants";
import { useFitCellSize } from "./hooks/useFitCellSize";
// Câu hỏi
import { QUESTIONS } from "./data/QUESTION";

const PRICE_BUMP_FACTOR = 1.2;

// Câu hỏi demo

const pickQuestion = () => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Game() {
  const navigate = useNavigate();
  const { state } = useLocation(); // { players, maxLives }

  const runtime = (() => {
    if (state?.players) return state;
    try {
      const raw = localStorage.getItem("monopolyRuntime");
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  })();

  useEffect(() => {
    if (!runtime?.players?.length) navigate("/", { replace: true });
  }, []); // eslint-disable-line

  // Board
  const base = useMemo(() => createBoardRect(7, 10), []);
  const { rows, cols, cells } = base;

  // Tiles & Players
  const [tileList, setTileList] = useState(base.tiles);
  const [players, setPlayers] = useState(
    runtime?.players ?? [
      { id: "P1", name: "Player 1", color: "#0ea5e9", lives: 3, money: 300, position: 0 },
      { id: "P2", name: "Player 2", color: "#ef4444", lives: 3, money: 300, position: 0 },
      { id: "P3", name: "Player 3", color: "#10b981", lives: 3, money: 300, position: 0 },
    ]
  );
  const MAX_LIVES_RUNTIME = runtime?.maxLives ?? MAX_LIVES;

  // Turn index + refs an toàn
  const [turnIdx, setTurnIdx] = useState(0);
  const turnIdxRef = useRef(turnIdx);
  useEffect(() => { turnIdxRef.current = turnIdx; }, [turnIdx]);

  const playersRef = useRef(players);
  useEffect(() => { playersRef.current = players; }, [players]);

  const { containerRef, cellSize } = useFitCellSize({ cols, maxCell: 120, minCell: 64 });

  // Modals & pending
  const [qOpen, setQOpen] = useState(false);
  const [currQ, setCurrQ] = useState(null);
  const [pendingIdx, setPendingIdx] = useState(null);

  const [offerBuyForIdx, setOfferBuyForIdx] = useState(null);
  const [penaltyForIdx, setPenaltyForIdx] = useState(null);

  // Dice & movement animation
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [isMoving, setIsMoving] = useState(false);

  const isActionLocked = qOpen || penaltyForIdx != null || offerBuyForIdx != null || rolling || isMoving;

  function grantStartBonus(p) {
    p.money += PASS_START_BONUS_MONEY;
    p.lives = Math.min(MAX_LIVES_RUNTIME, p.lives + PASS_START_BONUS_LIFE);
  }

  function eliminateIfDead(idx, nextLivesValue) {
    if (idx == null || idx < 0) return;
    const livesNow = nextLivesValue ?? playersRef.current[idx]?.lives ?? 0;
    if (livesNow >= 1) return;
    eliminatePlayer(idx);
  }

  function eliminatePlayer(idx) {
    const victim = playersRef.current[idx];
    if (!victim) return;
    const victimId = victim.id;
    const prevLen = playersRef.current.length;

    // Thu hồi BĐS và tăng giá
    setTileList((prev) =>
      prev.map((t) =>
        t.ownerId === victimId
          ? { ...t, ownerId: null, purchasePrice: null, price: Math.ceil((t.price || 0) * PRICE_BUMP_FACTOR) }
          : t
      )
    );

    // Loại người chơi
    setPlayers((prev) => prev.filter((_, i) => i !== idx));

    // Chỉnh turnIdx
    setTurnIdx((prev) => {
      if (prev === idx) {
        const nextLen = prevLen - 1;
        return nextLen <= 0 ? 0 : Math.min(prev, nextLen - 1);
      }
      if (prev > idx) return prev - 1;
      return prev;
    });

    // Chỉnh index liên quan
    setOfferBuyForIdx((v) => (v == null ? v : v === idx ? null : v > idx ? v - 1 : v));
    setPenaltyForIdx((v) => (v == null ? v : v === idx ? null : v > idx ? v - 1 : v));
    setPendingIdx(null);
  }

  // ===== NEW: roll animation (2–3s) + move step-by-step =====
  async function moveAndResolve() {
    if (isActionLocked) return;
    if (playersRef.current.length === 0) return;

    // 1) Animate dice ~2–3s
    setRolling(true);
    const finalD = 1 + Math.floor(Math.random() * 6);
    const rollDuration = 2200 + Math.floor(Math.random() * 600); // 2.2s–2.8s
    const tick = 120; // đổi số mỗi 120ms
    const start = Date.now();
    while (Date.now() - start < rollDuration) {
      setDiceValue(1 + Math.floor(Math.random() * 6));
      // tránh blocking
      // eslint-disable-next-line no-await-in-loop
      await delay(tick);
    }
    setDiceValue(finalD);
    setRolling(false);

    // 2) Move step-by-step
    setIsMoving(true);
    const steps = finalD;
    for (let s = 0; s < steps; s++) {
      setPlayers((prev) => {
        const len = prev.length;
        if (len === 0) return prev;

        const next = prev.map((p) => ({ ...p }));
        const safeIdx = Math.min(turnIdxRef.current, len - 1);
        const me = next[safeIdx];
        if (!me) return prev;

        const oldPos = me.position;
        const newPos = (oldPos + 1) % tileList.length;
        const passedStart = newPos < oldPos || newPos === START_TILE_ID;
        if (passedStart) grantStartBonus(me);
        me.position = newPos;

        return next;
      });

      // delay giữa các bước (mượt hơn)
      // eslint-disable-next-line no-await-in-loop
      await delay(180);
    }
    setIsMoving(false);

    // 3) Sau khi đến ô mới → đặt pending & mở câu hỏi
    const safeIdx = Math.min(turnIdxRef.current, Math.max(playersRef.current.length - 1, 0));
    setPendingIdx(safeIdx);
    setCurrQ(pickQuestion());
    setQOpen(true);
  }

  function handleAnswer(answerText) {
    setQOpen(false);
    const correct =
      (answerText || "").trim().toLowerCase() === (currQ?.a || "").trim().toLowerCase();

    if (!correct && pendingIdx != null) {
      const before = playersRef.current[pendingIdx]?.lives ?? 0;
      const newLives = Math.max(0, before - 1);

      setPlayers((prev) => {
        const next = prev.map((p) => ({ ...p }));
        if (next[pendingIdx]) next[pendingIdx].lives = newLives;
        return next;
      });

      if (newLives <= 0) {
        // chết: loại & kết thúc lượt (không xử lý tile)
        eliminatePlayer(pendingIdx);
        setPendingIdx(null);
        setCurrQ(null);
        endTurn();
        return;
      }
    }

    // còn sống → xử lý tile
    const safeIdx = Math.min(pendingIdx ?? 0, Math.max(playersRef.current.length - 1, 0));
    const player = playersRef.current[safeIdx];
    const tile = player ? tileList[player.position] : null;

    if (!tile) {
      endTurn();
    } else if (tile.type === "PROPERTY" && !tile.ownerId) {
      setOfferBuyForIdx(safeIdx);
    } else if (tile.type === "PROPERTY" && tile.ownerId && tile.ownerId !== player.id) {
      setPenaltyForIdx(safeIdx);
    } else {
      endTurn();
    }

    setPendingIdx(null);
    setCurrQ(null);
  }

  function endTurn() {
    setTurnIdx((i) => {
      const len = playersRef.current.length;
      if (len <= 0) return 0;
      return (i + 1) % len;
    });
  }

  function handleBuyDecision(buy) {
    const idx = offerBuyForIdx;
    if (idx == null) return;

    if (buy) {
      const buyer = playersRef.current[idx];
      if (buyer) {
        const buyerId = buyer.id;
        const tileId = buyer.position;
        const price = tileList[tileId].price;

        setPlayers((prev) =>
          prev.map((p, i) => (i === idx ? { ...p, money: Math.max(0, p.money - price) } : p))
        );

        setTileList((prev) =>
          prev.map((t, i) =>
            i === tileId ? { ...t, ownerId: buyerId, purchasePrice: t.purchasePrice ?? t.price } : t
          )
        );
      }
    }

    setOfferBuyForIdx(null);
    endTurn();
  }

  // Penalty context
  const penaltyPlayer = penaltyForIdx != null ? players[penaltyForIdx] : null;
  const penaltyTile = penaltyPlayer ? tileList[penaltyPlayer.position] : null;
  const penaltyOwner = penaltyTile?.ownerId
    ? players.find((p) => p.id === penaltyTile.ownerId)
    : null;
  const rent = penaltyTile
    ? Math.ceil(0.6 * (penaltyTile.purchasePrice ?? penaltyTile.price))
    : 0;

  function choosePayMoney() {
    if (!penaltyPlayer || !penaltyTile || !penaltyOwner) return;

    setPlayers((prev) => {
      const next = prev.map((p) => ({ ...p }));
      const payer = next[penaltyForIdx];
      if (payer) payer.money = Math.max(0, payer.money - rent);
      const ownerIdx = next.findIndex((p) => p.id === penaltyOwner.id);
      if (ownerIdx >= 0) next[ownerIdx].money += rent;
      return next;
    });

    setPenaltyForIdx(null);
    endTurn();
  }

  function chooseLoseLife() {
    if (!penaltyPlayer || !penaltyTile || !penaltyOwner) return;

    const victimIdx = penaltyForIdx;
    const ownerId = penaltyOwner.id;

    const afterLives = Math.max(0, (playersRef.current[victimIdx]?.lives ?? 0) - 1);

    setPlayers((prev) => {
      const next = prev.map((p) => ({ ...p }));
      if (next[victimIdx]) next[victimIdx].lives = afterLives;

      const ownerIdx = next.findIndex((p) => p.id === ownerId);
      if (ownerIdx >= 0) {
        next[ownerIdx].lives = Math.min(MAX_LIVES_RUNTIME, next[ownerIdx].lives + 1);
      }
      return next;
    });

    if (afterLives <= 0) {
      eliminatePlayer(victimIdx);
    }

    setPenaltyForIdx(null);
    endTurn();
  }

  // currentPlayer an toàn (có thể null)
  const hasPlayers = players.length > 0;
  const currentPlayer = hasPlayers ? players[Math.min(turnIdx, players.length - 1)] : null;

  // Purchase card context
  const buyer = offerBuyForIdx != null ? players[offerBuyForIdx] : null;
  const buyTile = buyer ? tileList[buyer.position] : null;

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold">MonopolyEdu – Game</h1>
          <button
            onClick={() => navigate("/", { replace: false })}
            className="text-sm rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50"
            title="Quay lại Setup"
          >
            ← Setup
          </button>
        </div>

        <p className="text-slate-600 mt-1">
          Cấu hình: {players.length} người chơi • MAX_LIVES = {MAX_LIVES_RUNTIME}
        </p>

        <div className="grid grid-cols-12 gap-3 mt-3">
          <div ref={containerRef} className="col-span-12 lg:col-span-10 w-full flex justify-center">
            <Board rows={rows} cols={cols} cells={cells} tiles={tileList} players={players} cellSize={cellSize} />
          </div>

          <div className="col-span-12 lg:col-span-2 flex flex-col gap-3">
            <Controls
              currentPlayer={currentPlayer}
              onRoll={moveAndResolve}
              disabled={isActionLocked || !hasPlayers}
              rolling={rolling}
              diceValue={diceValue}
            />
            <PlayerList players={players} />

            {buyer && buyTile && buyTile.type === "PROPERTY" && !buyTile.ownerId && (
              <PurchaseCard
                player={buyer}
                tile={buyTile}
                onBuy={() => handleBuyDecision(true)}
                onSkip={() => handleBuyDecision(false)}
              />
            )}
          </div>
        </div>
      </div>

      <ModalQuestion open={!!qOpen} question={currQ} onSubmit={handleAnswer} />

      <ModalPenaltyChoice
        open={penaltyForIdx != null && !!penaltyTile && !!penaltyOwner}
        tile={penaltyTile}
        owner={penaltyOwner}
        player={penaltyPlayer}
        rent={rent}
        onPickMoney={choosePayMoney}
        onPickLife={chooseLoseLife}
      />
    </div>
  );
}
