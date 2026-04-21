import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { DEFAULT_QUESTIONS, CASE_QUESTIONS } from "./data/QUESTION";

const PRICE_BUMP_FACTOR = 1.2;
const QUESTIONS = [...DEFAULT_QUESTIONS, ...CASE_QUESTIONS];

const pickQuestion = () => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalizeAnswer = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
const formatTime = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export default function Game() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const runtime = (() => {
    if (state?.players) return state;
    try {
      const raw = localStorage.getItem("monopolyRuntime");
      if (raw) return JSON.parse(raw);
    } catch {
      return null;
    }
    return null;
  })();

  useEffect(() => {
    if (!runtime?.players?.length) navigate("/", { replace: true });
  }, []); // eslint-disable-line

  const base = useMemo(() => createBoardRect(7, 10), []);
  const { rows, cols, cells } = base;

  const [tileList, setTileList] = useState(base.tiles);
  const [players, setPlayers] = useState(
    runtime?.players ?? [
      { id: "P1", name: "Player 1", color: "#0ea5e9", lives: 3, money: 300, position: 0 },
      { id: "P2", name: "Player 2", color: "#ef4444", lives: 3, money: 300, position: 0 },
      { id: "P3", name: "Player 3", color: "#10b981", lives: 3, money: 300, position: 0 },
    ]
  );

  const MAX_LIVES_RUNTIME = runtime?.maxLives ?? MAX_LIVES;
  const GAME_DURATION_SECONDS = Math.max(0, Number(runtime?.gameDurationMinutes) || 0) * 60;
  const QUESTION_DURATION_SECONDS = Math.max(0, Number(runtime?.questionDurationSeconds) || 0);
  const gameTimerEnabled = GAME_DURATION_SECONDS > 0;
  const questionTimerEnabled = QUESTION_DURATION_SECONDS > 0;

  const [turnIdx, setTurnIdx] = useState(0);
  const turnIdxRef = useRef(turnIdx);
  useEffect(() => {
    turnIdxRef.current = turnIdx;
  }, [turnIdx]);

  const playersRef = useRef(players);
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const tileListRef = useRef(tileList);
  useEffect(() => {
    tileListRef.current = tileList;
  }, [tileList]);

  const { containerRef, cellSize } = useFitCellSize({ cols, maxCell: 120, minCell: 64 });

  const [qOpen, setQOpen] = useState(false);
  const [currQ, setCurrQ] = useState(null);
  const [pendingIdx, setPendingIdx] = useState(null);
  const [offerBuyForIdx, setOfferBuyForIdx] = useState(null);
  const [penaltyForIdx, setPenaltyForIdx] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [isMoving, setIsMoving] = useState(false);
  const [remainingGameSeconds, setRemainingGameSeconds] = useState(GAME_DURATION_SECONDS);
  const [remainingQuestionSeconds, setRemainingQuestionSeconds] = useState(
    questionTimerEnabled ? QUESTION_DURATION_SECONDS : 0
  );
  const [gameOver, setGameOver] = useState(null);

  const questionResolutionRef = useRef(false);
  const gameOverRef = useRef(gameOver);
  const finishGameRef = useRef(null);
  const handleAnswerRef = useRef(null);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  const isActionLocked =
    !!gameOver || qOpen || penaltyForIdx != null || offerBuyForIdx != null || rolling || isMoving;

  function grantStartBonus(player) {
    player.money += PASS_START_BONUS_MONEY;
    player.lives = Math.min(MAX_LIVES_RUNTIME, player.lives + PASS_START_BONUS_LIFE);
  }

  function calculatePlayerWorth(player, tiles) {
    const propertyValue = tiles.reduce((sum, tile) => {
      if (tile.ownerId !== player.id) return sum;
      return sum + (tile.price || 0);
    }, 0);

    return {
      ...player,
      propertyValue,
      totalWorth: player.money + propertyValue,
    };
  }

  function buildFinalStandings(playerList = playersRef.current, tiles = tileListRef.current) {
    const standings = playerList
      .map((player) => calculatePlayerWorth(player, tiles))
      .sort((a, b) => {
        if (b.totalWorth !== a.totalWorth) return b.totalWorth - a.totalWorth;
        if (b.lives !== a.lives) return b.lives - a.lives;
        return a.name.localeCompare(b.name);
      });

    const top = standings[0];
    const winners = top
      ? standings.filter(
          (player) => player.totalWorth === top.totalWorth && player.lives === top.lives
        )
      : [];

    return { standings, winners };
  }

  function finishGame(reason) {
    if (gameOverRef.current) return;

    questionResolutionRef.current = true;
    setQOpen(false);
    setCurrQ(null);
    setPendingIdx(null);
    setOfferBuyForIdx(null);
    setPenaltyForIdx(null);
    setRolling(false);
    setIsMoving(false);
    setRemainingQuestionSeconds(0);

    const { standings, winners } = buildFinalStandings();
    setGameOver({ reason, standings, winners });
  }

  useEffect(() => {
    finishGameRef.current = finishGame;
  });

  function eliminateIfDead(idx, nextLivesValue) {
    if (idx == null || idx < 0) return false;
    const livesNow = nextLivesValue ?? playersRef.current[idx]?.lives ?? 0;
    if (livesNow >= 1) return false;
    eliminatePlayer(idx);
    return true;
  }

  function eliminatePlayer(idx) {
    const victim = playersRef.current[idx];
    if (!victim) return;
    const victimId = victim.id;
    const prevLen = playersRef.current.length;

    setTileList((prev) =>
      prev.map((tile) =>
        tile.ownerId === victimId
          ? {
              ...tile,
              ownerId: null,
              purchasePrice: null,
              price: Math.ceil((tile.price || 0) * PRICE_BUMP_FACTOR),
            }
          : tile
      )
    );

    setPlayers((prev) => prev.filter((_, i) => i !== idx));

    setTurnIdx((prev) => {
      if (prev === idx) {
        const nextLen = prevLen - 1;
        return nextLen <= 0 ? 0 : Math.min(prev, nextLen - 1);
      }
      if (prev > idx) return prev - 1;
      return prev;
    });

    setOfferBuyForIdx((value) => (value == null ? value : value === idx ? null : value > idx ? value - 1 : value));
    setPenaltyForIdx((value) => (value == null ? value : value === idx ? null : value > idx ? value - 1 : value));
    setPendingIdx(null);
  }

  function endTurn() {
    if (gameOverRef.current) return;
    setTurnIdx((current) => {
      const len = playersRef.current.length;
      if (len <= 0) return 0;
      return (current + 1) % len;
    });
  }

  function openQuestionForPlayer(idx) {
    questionResolutionRef.current = false;
    setPendingIdx(idx);
    setCurrQ(pickQuestion());
    setRemainingQuestionSeconds(questionTimerEnabled ? QUESTION_DURATION_SECONDS : 0);
    setQOpen(true);
  }

  function closeQuestionState() {
    setQOpen(false);
    setCurrQ(null);
    setPendingIdx(null);
    setRemainingQuestionSeconds(0);
    questionResolutionRef.current = false;
  }

  function applyWrongAnswer(idx) {
    const before = playersRef.current[idx]?.lives ?? 0;
    const nextLives = Math.max(0, before - 1);

    if (nextLives <= 0) {
      eliminateIfDead(idx, nextLives);
      return false;
    }

    setPlayers((prev) => {
      const next = prev.map((player) => ({ ...player }));
      if (next[idx]) next[idx].lives = nextLives;
      return next;
    });
    return true;
  }

  async function moveAndResolve() {
    if (isActionLocked || gameOverRef.current) return;
    if (playersRef.current.length === 0) return;

    setRolling(true);
    const finalD = 1 + Math.floor(Math.random() * 6);
    const rollDuration = 2200 + Math.floor(Math.random() * 600);
    const tick = 120;
    const start = Date.now();

    while (Date.now() - start < rollDuration) {
      if (gameOverRef.current) {
        setRolling(false);
        return;
      }
      setDiceValue(1 + Math.floor(Math.random() * 6));
      await delay(tick);
    }

    setDiceValue(finalD);
    setRolling(false);

    setIsMoving(true);
    for (let step = 0; step < finalD; step += 1) {
      if (gameOverRef.current) {
        setIsMoving(false);
        return;
      }

      setPlayers((prev) => {
        const len = prev.length;
        if (len === 0) return prev;

        const next = prev.map((player) => ({ ...player }));
        const safeIdx = Math.min(turnIdxRef.current, len - 1);
        const me = next[safeIdx];
        if (!me) return prev;

        const oldPos = me.position;
        const newPos = (oldPos + 1) % tileListRef.current.length;
        const passedStart = newPos < oldPos || newPos === START_TILE_ID;
        if (passedStart) grantStartBonus(me);
        me.position = newPos;

        return next;
      });

      await delay(180);
    }
    setIsMoving(false);

    const safeIdx = Math.min(turnIdxRef.current, Math.max(playersRef.current.length - 1, 0));
    openQuestionForPlayer(safeIdx);
  }

  function resolveTileAfterQuestion(idx) {
    const safeIdx = Math.min(idx ?? 0, Math.max(playersRef.current.length - 1, 0));
    const player = playersRef.current[safeIdx];
    const tile = player ? tileListRef.current[player.position] : null;

    if (!tile) {
      endTurn();
      return;
    }
    if (tile.type === "PROPERTY" && !tile.ownerId) {
      setOfferBuyForIdx(safeIdx);
      return;
    }
    if (tile.type === "PROPERTY" && tile.ownerId && tile.ownerId !== player.id) {
      setPenaltyForIdx(safeIdx);
      return;
    }
    endTurn();
  }

  function handleAnswer(answerText) {
    if (questionResolutionRef.current || gameOverRef.current) return;
    questionResolutionRef.current = true;

    const activeQuestion = currQ;
    const activePendingIdx = pendingIdx;
    const correct = normalizeAnswer(answerText) === normalizeAnswer(activeQuestion?.a);

    if (!correct && activePendingIdx != null) {
      const survived = applyWrongAnswer(activePendingIdx);
      if (!survived) {
        closeQuestionState();
        return;
      }
    }

    closeQuestionState();
    resolveTileAfterQuestion(activePendingIdx);
  }

  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  });

  function handleBuyDecision(buy) {
    if (gameOverRef.current) return;
    const idx = offerBuyForIdx;
    if (idx == null) return;

    if (buy) {
      const buyer = playersRef.current[idx];
      if (buyer) {
        const buyerId = buyer.id;
        const tileId = buyer.position;
        const price = tileListRef.current[tileId].price;

        setPlayers((prev) =>
          prev.map((player, i) =>
            i === idx ? { ...player, money: Math.max(0, player.money - price) } : player
          )
        );

        setTileList((prev) =>
          prev.map((tile, i) =>
            i === tileId
              ? { ...tile, ownerId: buyerId, purchasePrice: tile.purchasePrice ?? tile.price }
              : tile
          )
        );
      }
    }

    setOfferBuyForIdx(null);
    endTurn();
  }

  const penaltyPlayer = penaltyForIdx != null ? players[penaltyForIdx] : null;
  const penaltyTile = penaltyPlayer ? tileList[penaltyPlayer.position] : null;
  const penaltyOwner = penaltyTile?.ownerId
    ? players.find((player) => player.id === penaltyTile.ownerId)
    : null;
  const rent = penaltyTile
    ? Math.ceil(0.6 * (penaltyTile.purchasePrice ?? penaltyTile.price))
    : 0;

  function choosePayMoney() {
    if (!penaltyPlayer || !penaltyTile || !penaltyOwner || gameOverRef.current) return;

    setPlayers((prev) => {
      const next = prev.map((player) => ({ ...player }));
      const payer = next[penaltyForIdx];
      if (payer) payer.money = Math.max(0, payer.money - rent);
      const ownerIdx = next.findIndex((player) => player.id === penaltyOwner.id);
      if (ownerIdx >= 0) next[ownerIdx].money += rent;
      return next;
    });

    setPenaltyForIdx(null);
    endTurn();
  }

  function chooseLoseLife() {
    if (!penaltyPlayer || !penaltyTile || !penaltyOwner || gameOverRef.current) return;

    const victimIdx = penaltyForIdx;
    const ownerId = penaltyOwner.id;
    const afterLives = Math.max(0, (playersRef.current[victimIdx]?.lives ?? 0) - 1);

    if (afterLives <= 0) {
      setPlayers((prev) =>
        prev.map((player) =>
          player.id === ownerId
            ? { ...player, lives: Math.min(MAX_LIVES_RUNTIME, player.lives + 1) }
            : player
        )
      );
      eliminateIfDead(victimIdx, afterLives);
      setPenaltyForIdx(null);
      return;
    }

    setPlayers((prev) => {
      const next = prev.map((player) => ({ ...player }));
      if (next[victimIdx]) next[victimIdx].lives = afterLives;

      const ownerIdx = next.findIndex((player) => player.id === ownerId);
      if (ownerIdx >= 0) {
        next[ownerIdx].lives = Math.min(MAX_LIVES_RUNTIME, next[ownerIdx].lives + 1);
      }
      return next;
    });

    setPenaltyForIdx(null);
    endTurn();
  }

  useEffect(() => {
    if (!gameTimerEnabled || gameOver || remainingGameSeconds <= 0) return undefined;

    const timeoutId = setTimeout(() => {
      setRemainingGameSeconds((current) => {
        if (current <= 1) {
          finishGameRef.current?.("timeout");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [gameOver, gameTimerEnabled, remainingGameSeconds]);

  useEffect(() => {
    if (!qOpen || !questionTimerEnabled || gameOver || questionResolutionRef.current) return undefined;
    if (remainingQuestionSeconds <= 0) {
      handleAnswerRef.current?.("");
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setRemainingQuestionSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [gameOver, qOpen, questionTimerEnabled, remainingQuestionSeconds]);

  const hasPlayers = players.length > 0;
  const currentPlayer = hasPlayers ? players[Math.min(turnIdx, players.length - 1)] : null;
  const buyer = offerBuyForIdx != null ? players[offerBuyForIdx] : null;
  const buyTile = buyer ? tileList[buyer.position] : null;
  const winnerSummary = gameOver?.winners?.length
    ? gameOver.winners.map((player) => player.name).join(", ")
    : "Không có";

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
        <p className="text-slate-500 text-sm mt-1">
          Timer tổng: {gameTimerEnabled ? formatTime(remainingGameSeconds) : "Off"} • Timer câu hỏi: {questionTimerEnabled ? `${QUESTION_DURATION_SECONDS}s` : "Off"}
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
              gameTimerEnabled={gameTimerEnabled}
              gameTimerLabel={formatTime(remainingGameSeconds)}
            />
            <PlayerList players={players} />

            {buyer && buyTile && buyTile.type === "PROPERTY" && !buyTile.ownerId && !gameOver && (
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

      <ModalQuestion
        open={!!qOpen}
        question={currQ}
        onSubmit={handleAnswer}
        remainingSeconds={remainingQuestionSeconds}
        timerEnabled={questionTimerEnabled}
        disabled={!!gameOver}
      />

      <ModalPenaltyChoice
        open={!gameOver && penaltyForIdx != null && !!penaltyTile && !!penaltyOwner}
        tile={penaltyTile}
        owner={penaltyOwner}
        player={penaltyPlayer}
        rent={rent}
        onPickMoney={choosePayMoney}
        onPickLife={chooseLoseLife}
      />

      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Hết game</h2>
                <p className="text-slate-600 mt-1">
                  {gameOver.reason === "timeout" ? "Hết thời gian trận đấu." : "Trận đấu đã kết thúc."}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-2 text-right">
                <div className="text-xs uppercase tracking-wide text-emerald-700">Người thắng</div>
                <div className="text-lg font-semibold text-emerald-900">{winnerSummary}</div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[56px_1fr_110px_90px_110px] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div>Hạng</div>
                <div>Người chơi</div>
                <div>Tiền</div>
                <div>Mạng</div>
                <div>Tổng TS</div>
              </div>
              <div className="divide-y divide-slate-200">
                {gameOver.standings.map((player, index) => (
                  <div
                    key={player.id}
                    className="grid grid-cols-[56px_1fr_110px_90px_110px] items-center px-4 py-3 text-sm"
                  >
                    <div className="font-semibold text-slate-700">#{index + 1}</div>
                    <div className="font-semibold" style={{ color: player.color }}>
                      {player.name}
                    </div>
                    <div>${player.money}</div>
                    <div>{player.lives}</div>
                    <div className="font-semibold">${player.totalWorth}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              Tổng tài sản = tiền mặt + giá hiện tại của tất cả ô đang sở hữu. Nếu bằng nhau thì so sánh số mạng.
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => navigate("/", { replace: false })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Về Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
