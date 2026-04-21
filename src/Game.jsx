import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBoardRect } from "./lib/board";
import Board from "./components/Board";
import Controls from "./components/Controls";
import PlayerList from "./components/PlayerList";
import ModalQuestion from "./components/ModalQuestion";
import PurchaseCard from "./components/PurchaseCard";
import ModalPenaltyChoice from "./components/ModalPenaltyChoice";
import ModalChanceCard from "./components/ModalChanceCard";
import {
  START_TILE_ID,
  JAIL_TILE_ID,
  PASS_START_BONUS_MONEY,
  PASS_START_BONUS_LIFE,
  MAX_LIVES,
  TILE_TYPES,
} from "./lib/constants";
import { useFitCellSize } from "./hooks/useFitCellSize";
import { DEFAULT_QUESTIONS } from "./data/QUESTION";
import { CHANCE_CARDS } from "./data/BOARD_CONCEPT";

const PRICE_BUMP_FACTOR = 1.2;
const LIFE_SCORE_VALUE = 500;
const QUESTIONS = [...DEFAULT_QUESTIONS];
const CHANCE_DECK = [...CHANCE_CARDS];

const buildQuestionPool = (questions) => {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};
const buildChanceDeck = (cards) => {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};
const shufflePlayers = (list) => {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const withPlayerDefaults = (player) => ({
  ...player,
  jailedTurns: player.jailedTurns ?? 0,
});

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
const tileTypeLabel = (type) => {
  const map = {
    GO: "Khởi đầu",
    PROPERTY: "Tài sản",
    CHANCE: "Sự kiện",
    TAX: "Nộp quỹ",
    JAIL: "Nhà tù",
    SAFE: "An toàn",
    GO_TO_JAIL: "Đi tù",
  };
  return map[type] || type || "Không xác định";
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

  const base = useMemo(() => createBoardRect(7, 7), []);
  const { rows, cols, cells } = base;

  const [tileList, setTileList] = useState(base.tiles);
  const [players, setPlayers] = useState(() =>
    shufflePlayers(
      (runtime?.players ?? [
        { id: "P1", name: "Player 1", color: "#0ea5e9", lives: 3, money: 300, position: 0 },
        { id: "P2", name: "Player 2", color: "#ef4444", lives: 3, money: 300, position: 0 },
        { id: "P3", name: "Player 3", color: "#10b981", lives: 3, money: 300, position: 0 },
      ]).map(withPlayerDefaults)
    )
  );
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]);

  const MAX_LIVES_RUNTIME = runtime?.maxLives ?? MAX_LIVES;
  const GAME_DURATION_SECONDS = Math.max(0, Number(runtime?.gameDurationMinutes) || 0) * 60;
  const QUESTION_DURATION_SECONDS = Math.max(0, Number(runtime?.questionDurationSeconds) || 0);
  const gameTimerEnabled = GAME_DURATION_SECONDS > 0;
  const questionTimerEnabled = QUESTION_DURATION_SECONDS > 0;

  const [turnIdx, setTurnIdx] = useState(0);
  const turnIdxRef = useRef(turnIdx);
  const questionPoolRef = useRef(buildQuestionPool(QUESTIONS));
  const chanceDeckRef = useRef(buildChanceDeck(CHANCE_DECK));
  useEffect(() => {
    turnIdxRef.current = turnIdx;
  }, [turnIdx]);

  const playersRef = useRef(players);
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  const eliminatedPlayersRef = useRef(eliminatedPlayers);
  useEffect(() => {
    eliminatedPlayersRef.current = eliminatedPlayers;
  }, [eliminatedPlayers]);
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
  const [chanceOpen, setChanceOpen] = useState(false);
  const [chanceCard, setChanceCard] = useState(null);
  const [chanceMessage, setChanceMessage] = useState("");
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
    !!gameOver ||
    qOpen ||
    chanceOpen ||
    penaltyForIdx != null ||
    offerBuyForIdx != null ||
    rolling ||
    isMoving;

  function grantStartBonus(player) {
    player.money += PASS_START_BONUS_MONEY;
    player.lives = Math.min(MAX_LIVES_RUNTIME, player.lives + PASS_START_BONUS_LIFE);
  }

  function calculatePlayerWorth(player, tiles) {
    const propertyValue = tiles.reduce((sum, tile) => {
      if (tile.ownerId !== player.id) return sum;
      return sum + (tile.price || 0);
    }, 0);
    const lifeScore = player.lives * LIFE_SCORE_VALUE;

    return {
      ...player,
      propertyValue,
      lifeScore,
      totalWorth: player.money + propertyValue + lifeScore,
    };
  }

  function buildFinalStandings(
    activePlayers = playersRef.current,
    eliminatedList = eliminatedPlayersRef.current,
    tiles = tileListRef.current
  ) {
    const aliveStandings = activePlayers.map((player) => calculatePlayerWorth(player, tiles));
    const eliminatedStandings = eliminatedList.map((player) => ({
      ...player,
      lives: 0,
      propertyValue: player.propertyValue ?? 0,
      lifeScore: 0,
      totalWorth: player.money + (player.propertyValue ?? 0),
    }));

    const standings = [...aliveStandings, ...eliminatedStandings]
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

  function finishGame(reason, standingsSource) {
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

    const { standings, winners } = standingsSource
      ? buildFinalStandings(
          standingsSource.activePlayers,
          standingsSource.eliminatedPlayers,
          standingsSource.tiles
        )
      : buildFinalStandings();
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
    const nextLen = prevLen - 1;
    const victimPropertyValue = tileListRef.current.reduce((sum, tile) => {
      if (tile.ownerId !== victimId) return sum;
      return sum + (tile.price || 0);
    }, 0);
    const eliminatedSnapshot = {
      ...victim,
      lives: 0,
      propertyValue: victimPropertyValue,
      lifeScore: 0,
      totalWorth: victim.money + victimPropertyValue,
    };

    const nextTiles = tileListRef.current.map((tile) =>
      tile.ownerId === victimId
        ? {
            ...tile,
            ownerId: null,
            purchasePrice: null,
            price: Math.ceil((tile.price || 0) * PRICE_BUMP_FACTOR),
          }
        : tile
    );
    setTileList(nextTiles);

    const nextPlayers = playersRef.current.filter((_, i) => i !== idx);
    setPlayers(nextPlayers);
    const withoutVictim = eliminatedPlayersRef.current.filter((player) => player.id !== victimId);
    const nextEliminatedPlayers = [...withoutVictim, eliminatedSnapshot];
    setEliminatedPlayers(nextEliminatedPlayers);

    setTurnIdx((prev) => {
      if (prev === idx) {
        return nextLen <= 0 ? 0 : Math.min(prev, nextLen - 1);
      }
      if (prev > idx) return prev - 1;
      return prev;
    });

    setOfferBuyForIdx((value) => (value == null ? value : value === idx ? null : value > idx ? value - 1 : value));
    setPenaltyForIdx((value) => (value == null ? value : value === idx ? null : value > idx ? value - 1 : value));
    setPendingIdx(null);

    if (nextLen === 1) {
      finishGame("last-survivor", {
        activePlayers: nextPlayers,
        eliminatedPlayers: nextEliminatedPlayers,
        tiles: nextTiles,
      });
    }
  }

  function endTurn() {
    if (gameOverRef.current) return;
    setTurnIdx((current) => {
      const len = playersRef.current.length;
      if (len <= 0) return 0;
      return (current + 1) % len;
    });
  }

  function takeNextQuestion() {
    if (QUESTIONS.length === 0) return null;
    if (questionPoolRef.current.length === 0) {
      questionPoolRef.current = buildQuestionPool(QUESTIONS);
    }
    return questionPoolRef.current.pop() ?? null;
  }

  function takeChanceCard() {
    if (CHANCE_DECK.length === 0) return null;
    if (chanceDeckRef.current.length === 0) {
      chanceDeckRef.current = buildChanceDeck(CHANCE_DECK);
    }
    return chanceDeckRef.current.pop() ?? null;
  }

  function openQuestionForPlayer(idx) {
    const nextQuestion = takeNextQuestion();
    if (!nextQuestion) {
      endTurn();
      return;
    }
    questionResolutionRef.current = false;
    setPendingIdx(idx);
    setCurrQ(nextQuestion);
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

  function openChanceResult(card, message) {
    setChanceCard(card);
    setChanceMessage(message);
    setChanceOpen(true);
  }

  function closeChanceResult() {
    setChanceOpen(false);
    setChanceCard(null);
    setChanceMessage("");
    endTurn();
  }

  function executeChanceCard(idx, card) {
    const player = playersRef.current[idx];
    if (!player || !card) return "Không có hiệu ứng.";

    if (card.effect === "RECEIVE_200") {
      setPlayers((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, money: p.money + 200 } : p))
      );
      return `${player.name} nhận 200$.`;
    }

    if (card.effect === "MOVE_TO_NEXT_FREE_PROPERTY_HALF_PRICE") {
      const currentPos = player.position;
      const tiles = tileListRef.current;
      let target = null;
      for (let step = 1; step < tiles.length; step += 1) {
        const pos = (currentPos + step) % tiles.length;
        const tile = tiles[pos];
        if (tile?.type === TILE_TYPES.PROPERTY && !tile.ownerId) {
          target = tile;
          break;
        }
      }
      if (!target) return "Không còn ô trống để mua giá ưu đãi.";

      const halfPrice = Math.ceil((target.price || 0) * 0.5);
      setPlayers((prev) =>
        prev.map((p, i) =>
          i === idx
            ? {
                ...p,
                position: target.id,
                money: Math.max(0, p.money - halfPrice),
              }
            : p
        )
      );
      setTileList((prev) =>
        prev.map((tile) =>
          tile.id === target.id
            ? { ...tile, ownerId: player.id, purchasePrice: halfPrice }
            : tile
        )
      );
      return `${player.name} di chuyển đến ${target.name} và mua với giá ${halfPrice}$.`;
    }

    if (card.effect === "LOSE_2_LIFE_OR_PAY_400") {
      if (player.money >= 400) {
        setPlayers((prev) =>
          prev.map((p, i) => (i === idx ? { ...p, money: p.money - 400 } : p))
        );
        return `${player.name} trả 400$ để vượt qua biến cố.`;
      }
      const nextLives = Math.max(0, player.lives - 2);
      if (nextLives <= 0) {
        eliminateIfDead(idx, nextLives);
        return `${player.name} mất 2 mạng và bị loại.`;
      }
      setPlayers((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, lives: nextLives } : p))
      );
      return `${player.name} mất 2 mạng.`;
    }

    if (card.effect === "MOVE_TO_TILE_17") {
      setPlayers((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, position: 17 } : p))
      );
      return `${player.name} bị điều động đến ô Hà Nội quyết tử.`;
    }

    if (card.effect === "COLLECT_50_FROM_EACH") {
      setPlayers((prev) => {
        const next = prev.map((p) => ({ ...p }));
        const receiver = next[idx];
        if (!receiver) return prev;
        let collected = 0;
        next.forEach((p, i) => {
          if (i === idx) return;
          const pay = Math.min(50, p.money);
          p.money -= pay;
          collected += pay;
        });
        receiver.money += collected;
        return next;
      });
      return `${player.name} nhận tiền ủng hộ từ các người chơi còn lại.`;
    }

    if (card.effect === "OTHERS_LOSE_1_LIFE") {
      const victims = [];
      playersRef.current.forEach((p, i) => {
        if (i === idx) return;
        const afterLives = Math.max(0, p.lives - 1);
        if (afterLives <= 0) victims.push(i);
      });
      setPlayers((prev) =>
        prev.map((p, i) => (i === idx ? p : { ...p, lives: Math.max(0, p.lives - 1) }))
      );
      victims
        .sort((a, b) => b - a)
        .forEach((victimIdx) => eliminateIfDead(victimIdx, 0));
      return "Tất cả người chơi khác mất 1 mạng.";
    }

    return "Thẻ không có hiệu ứng hợp lệ.";
  }

  async function moveAndResolve() {
    if (isActionLocked || gameOverRef.current) return;
    if (playersRef.current.length === 0) return;
    const current = playersRef.current[Math.min(turnIdxRef.current, playersRef.current.length - 1)];
    if (current?.jailedTurns > 0) {
      setPlayers((prev) =>
        prev.map((player, idx) =>
          idx === turnIdxRef.current
            ? { ...player, jailedTurns: Math.max(0, (player.jailedTurns || 0) - 1) }
            : player
        )
      );
      endTurn();
      return;
    }

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
    if (tile.type === TILE_TYPES.PROPERTY && !tile.ownerId) {
      setOfferBuyForIdx(safeIdx);
      return;
    }
    if (tile.type === TILE_TYPES.PROPERTY && tile.ownerId && tile.ownerId !== player.id) {
      setPenaltyForIdx(safeIdx);
      return;
    }
    if (tile.type === TILE_TYPES.CHANCE) {
      const card = takeChanceCard();
      if (!card) {
        endTurn();
        return;
      }
      const message = executeChanceCard(safeIdx, card);
      openChanceResult(card, message);
      return;
    }
    if (tile.type === TILE_TYPES.TAX) {
      const amount = Math.abs(tile.rent || 0);
      setPlayers((prev) =>
        prev.map((p, i) =>
          i === safeIdx ? { ...p, money: tile.rent < 0 ? Math.max(0, p.money - amount) : p.money + amount } : p
        )
      );
      endTurn();
      return;
    }
    if (tile.type === TILE_TYPES.SAFE) {
      setPlayers((prev) =>
        prev.map((p, i) =>
          i === safeIdx ? { ...p, lives: Math.min(MAX_LIVES_RUNTIME, p.lives + 1) } : p
        )
      );
      endTurn();
      return;
    }
    if (tile.type === TILE_TYPES.GO_TO_JAIL) {
      setPlayers((prev) =>
        prev.map((p, i) =>
          i === safeIdx ? { ...p, position: JAIL_TILE_ID, jailedTurns: 1 } : p
        )
      );
      endTurn();
      return;
    }
    if (tile.type === TILE_TYPES.JAIL) {
      setPlayers((prev) =>
        prev.map((p, i) => (i === safeIdx ? { ...p, jailedTurns: 1 } : p))
      );
      endTurn();
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
    ? penaltyTile.rent ?? Math.ceil(0.6 * (penaltyTile.purchasePrice ?? penaltyTile.price))
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
  const currentTile = currentPlayer ? tileList[currentPlayer.position] : null;
  const currentTileOwner = currentTile?.ownerId
    ? players.find((player) => player.id === currentTile.ownerId)
    : null;

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold">MonopolyEdu – Bản đồ lịch sử 1945-1946</h1>
          <button
            onClick={() => navigate("/", { replace: false })}
            className="text-sm rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-50"
            title="Quay lại màn hình thiết lập"
          >
            ← Thiết lập
          </button>
        </div>

        <p className="text-slate-600 mt-1">
          Cấu hình: {players.length} người chơi • Tối đa {MAX_LIVES_RUNTIME} mạng
        </p>
        <p className="text-slate-500 text-sm mt-1">
          Thời gian trận: {gameTimerEnabled ? formatTime(remainingGameSeconds) : "Tắt"} • Thời gian câu hỏi: {questionTimerEnabled ? `${QUESTION_DURATION_SECONDS}s` : "Tắt"}
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
            <PlayerList players={players} currentPlayerId={currentPlayer?.id} />
            <div className="rounded-2xl bg-white p-4 shadow-md border border-slate-200">
              <div className="text-sm font-semibold text-slate-800">Thông tin ô hiện tại</div>
              {currentTile ? (
                <div className="mt-2 text-sm text-slate-600 space-y-1">
                  <div>
                    <b>{currentTile.name}</b> • {tileTypeLabel(currentTile.type)}
                  </div>
                  <div>{currentTile.description || "Không có mô tả."}</div>
                  {currentTile.type === TILE_TYPES.PROPERTY && (
                    <div>
                      Giá: <b>${currentTile.price}</b> • Phí ghé ô: <b>${currentTile.rent}</b>
                      {currentTileOwner ? (
                        <> • Chủ: <b style={{ color: currentTileOwner.color }}>{currentTileOwner.name}</b></>
                      ) : (
                        <> • Chưa có chủ</>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-sm text-slate-500">Chưa có người chơi ở lượt hiện tại.</div>
              )}
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-md border border-slate-200">
              <div className="text-sm font-semibold text-slate-800">Chú thích loại ô</div>
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-slate-600">
                <div>Khởi đầu</div>
                <div>Sự kiện</div>
                <div>Tài sản</div>
                <div>Nộp quỹ</div>
                <div>Nhà tù</div>
                <div>An toàn</div>
              </div>
            </div>

            {buyer && buyTile && buyTile.type === TILE_TYPES.PROPERTY && !buyTile.ownerId && !gameOver && (
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
      <ModalChanceCard
        open={!gameOver && chanceOpen}
        card={chanceCard}
        message={chanceMessage}
        onClose={closeChanceResult}
      />

      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Hết game</h2>
                <p className="text-slate-600 mt-1">
                  {gameOver.reason === "timeout"
                    ? "Đã hết thời gian trận đấu."
                    : gameOver.reason === "last-survivor"
                    ? "Chỉ còn một người sống sót."
                    : "Trận đấu đã kết thúc."}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-2 text-right">
                <div className="text-xs uppercase tracking-wide text-emerald-700">Người thắng</div>
                <div className="text-lg font-semibold text-emerald-900">{winnerSummary}</div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-[56px_1fr_110px_120px_90px_110px] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div>Hạng</div>
                <div>Người chơi</div>
                <div>Tiền</div>
                <div>Tài sản</div>
                <div>Mạng</div>
                <div>Tổng điểm</div>
              </div>
              <div className="divide-y divide-slate-200">
                {gameOver.standings.map((player, index) => (
                  <div
                    key={player.id}
                    className="grid grid-cols-[56px_1fr_110px_120px_90px_110px] items-center px-4 py-3 text-sm"
                  >
                    <div className="font-semibold text-slate-700">#{index + 1}</div>
                    <div className="font-semibold" style={{ color: player.color }}>
                      {player.name}
                    </div>
                    <div>${player.money}</div>
                    <div>${player.propertyValue}</div>
                    <div>{player.lives}</div>
                    <div className="font-semibold">${player.totalWorth}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              Tổng Điểm = tiền + giá trị hiện tại của tài sản sở hữu + tim (500 mỗi tim). Nếu bằng điểm thì so về số tim, nếu vẫn bằng thì so về tên (theo bảng chữ cái).
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => navigate("/", { replace: false })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Về thiết lập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

