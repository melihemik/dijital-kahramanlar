import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, Cloud, useGLTF, useAnimations, Html } from "@react-three/drei";
import * as THREE from "three";
import robotGlb from "./assets/models/robot.glb";
import flagGlb from "./assets/models/flag.glb";
import rockAGlb from "./assets/models/rock-a.glb";
import rockBGlb from "./assets/models/rock-b.glb";
import rockCGlb from "./assets/models/rock-c.glb";
import palmTreeGlb from "./assets/models/palm-tree.glb";
import chestGlb from "./assets/models/chest.glb";
import grassPlantGlb from "./assets/models/grass-plant.glb";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import appLogo from "./assets/images/dkahramanlar.png";
import puzzleA1 from "./assets/images/atakim_1-puzzle.png";
import puzzleA2 from "./assets/images/atakim_2-puzzle.png";
import puzzleB1 from "./assets/images/btakim_1-puzzle.png";
import puzzleB2 from "./assets/images/btakim_2-puzzle.png";
import bridgeUnderwaterBgImage from "./assets/images/bridge-underwater-bg.png";
import bridgeRockPileImage from "./assets/images/bridge-rock-pile.png";
import bridgeHeroSideSheetImage from "./assets/images/bridge-hero-side-sheet.png";
import cupIconWifi from "./assets/images/cup-icon-wifi.png";
import cupIconGlobe from "./assets/images/cup-icon-globe.png";
import cupIconComputer from "./assets/images/cup-icon-computer.png";
import balloonPopSfx from "./assets/audio/balloon-pop.mp3";
import gameplayLoopMusic from "./assets/audio/gameplay-loop.mp3";
import tensionLoopMusic from "./assets/audio/tension-loop.mp3";
import winnerLoopMusic from "./assets/audio/winner-loop.mp3";
import defaultSession from "./data/defaultSession.json";
import questionBank from "./data/questions.json";
import wormQuestionBank from "./data/wormQuestions.json";
import bridgeQuestionBank from "./data/bridgeQuestions.json";

const MATCH_ICON_MODULES = import.meta.glob("./assets/images/match-icons/*.svg", {
  eager: true,
  import: "default",
  query: "?url"
});
const STORAGE_KEY = "dijital-kahramanlar-session";
const GROUP_KEYS = ["A", "B"];
const FALLBACK_TRUE_FALSE_QUESTION_BANK = {
  A: [
    {
      question: "A Soru 1",
      answerOptions: [
        {
          text: "Doğru",
          rationale: "",
          isCorrect: true
        },
        {
          text: "Yanlış",
          rationale: "",
          isCorrect: false
        }
      ],
      hint: ""
    },
    {
      question: "A Soru 2",
      answerOptions: [
        {
          text: "Doğru",
          rationale: "",
          isCorrect: false
        },
        {
          text: "Yanlış",
          rationale: "",
          isCorrect: true
        }
      ],
      hint: ""
    },
    {
      question: "A Soru 3",
      answerOptions: [
        {
          text: "Doğru",
          rationale: "",
          isCorrect: true
        },
        {
          text: "Yanlış",
          rationale: "",
          isCorrect: false
        }
      ],
      hint: ""
    }
  ],
  B: [
    {
      question: "B Soru 1",
      answerOptions: [
        {
          text: "Doğru",
          rationale: "",
          isCorrect: true
        },
        {
          text: "Yanlış",
          rationale: "",
          isCorrect: false
        }
      ],
      hint: ""
    },
    {
      question: "B Soru 2",
      answerOptions: [
        {
          text: "Doğru",
          rationale: "",
          isCorrect: false
        },
        {
          text: "Yanlış",
          rationale: "",
          isCorrect: true
        }
      ],
      hint: ""
    },
    {
      question: "B Soru 3",
      answerOptions: [
        {
          text: "Doğru",
          rationale: "",
          isCorrect: true
        },
        {
          text: "Yanlış",
          rationale: "",
          isCorrect: false
        }
      ],
      hint: ""
    }
  ]
};
const FALLBACK_BRIDGE_QUESTION_BANK = {
  A: [
    {
      question: "Güçlü bir ____ kullanmalıyız.",
      answerOptions: [
        { text: "şifre", rationale: "", isCorrect: true },
        { text: "renk", rationale: "", isCorrect: false },
        { text: "oyuncak", rationale: "", isCorrect: false }
      ],
      hint: ""
    },
    {
      question: "Tanımadığımız kişilere ____ vermemeliyiz.",
      answerOptions: [
        { text: "kişisel bilgi", rationale: "", isCorrect: true },
        { text: "selam", rationale: "", isCorrect: false },
        { text: "emoji", rationale: "", isCorrect: false }
      ],
      hint: ""
    }
  ],
  B: [
    {
      question: "Şifremizi kimseyle ____ etmemeliyiz.",
      answerOptions: [
        { text: "paylaş", rationale: "", isCorrect: true },
        { text: "değiştir", rationale: "", isCorrect: false },
        { text: "uzat", rationale: "", isCorrect: false }
      ],
      hint: ""
    },
    {
      question: "Şüpheli linke hemen ____mamalıyız.",
      answerOptions: [
        { text: "tıkla", rationale: "", isCorrect: true },
        { text: "bak", rationale: "", isCorrect: false },
        { text: "gül", rationale: "", isCorrect: false }
      ],
      hint: ""
    }
  ]
};
const FALLBACK_BALLOON_QUESTION_BANK = {
  A: [
    {
      question: "Hangisi güçlü ve güvenli bir şifredir?",
      hint: "Harf, rakam ve sembol içeren karmaşık şifreleri düşünün.",
      answerOptions: [
        { text: "k7!mP9x#", rationale: "", isCorrect: true },
        { text: "123456", rationale: "", isCorrect: false },
        { text: "advesoyad", rationale: "", isCorrect: false },
        { text: "000000", rationale: "", isCorrect: false },
        { text: "dogumyili", rationale: "", isCorrect: false }
      ]
    },
    {
      question: "Hesap şifreni kiminle paylaşabilirsin?",
      hint: "Şifrelerin gizliliğini düşünün.",
      answerOptions: [
        { text: "Yalnızca ailemle", rationale: "", isCorrect: true },
        { text: "Tüm arkadaşlarımla", rationale: "", isCorrect: false },
        { text: "Oyundaki yabancılarla", rationale: "", isCorrect: false },
        { text: "Sosyal medyada", rationale: "", isCorrect: false },
        { text: "Sınıf grubunda", rationale: "", isCorrect: false }
      ]
    },
    {
      question: "Tanımadığın birinden gelen şüpheli linke ne yapmalısın?",
      hint: "Bilinmeyen bağlantılara tıklamak tehlikelidir.",
      answerOptions: [
        { text: "Tıklamayıp aileme gösteririm", rationale: "", isCorrect: true },
        { text: "Hemen tıklarım", rationale: "", isCorrect: false },
        { text: "Şifremi girerim", rationale: "", isCorrect: false },
        { text: "Arkadaşlarıma yollarım", rationale: "", isCorrect: false },
        { text: "Merak edip açarım", rationale: "", isCorrect: false }
      ]
    },
    {
      question: "Hangisi internette asla paylaşılmaması gereken kişisel bilgidir?",
      hint: "Kişisel güvenliğinizi tehlikeye atacak bilgileri düşünün.",
      answerOptions: [
        { text: "Ev adresi ve TC kimlik no", rationale: "", isCorrect: true },
        { text: "En sevdiğin renk", rationale: "", isCorrect: false },
        { text: "Tuttuğun futbol takımı", rationale: "", isCorrect: false },
        { text: "En sevdiğin yemek", rationale: "", isCorrect: false },
        { text: "Dinlediğin müzik türü", rationale: "", isCorrect: false }
      ]
    },
    {
      question: "Ortak bilgisayarda işin bitince ilk ne yapmalısın?",
      hint: "Başkalarının hesabına erişmesini önlemek gerekir.",
      answerOptions: [
        { text: "Hesaptan güvenli çıkış yaparım", rationale: "", isCorrect: true },
        { text: "Şifremi tarayıcıya kaydederim", rationale: "", isCorrect: false },
        { text: "Hesabı açık bırakırım", rationale: "", isCorrect: false },
        { text: "Ekranı kapatıp giderim", rationale: "", isCorrect: false },
        { text: "Geçmişi silmeden ayrılırım", rationale: "", isCorrect: false }
      ]
    }
  ],
  B: [
    {
      question: "Sosyal medyada tanımadığın birinin arkadaşlık isteğine ne yapmalısın?",
      hint: "Yabancılarla bağlantı kurmanın risklerini düşünün.",
      answerOptions: [
        { text: "İsteği reddedip aileme haber veririm", rationale: "", isCorrect: true },
        { text: "Hemen kabul edip mesaj atarım", rationale: "", isCorrect: false },
        { text: "Evimin konumunu gönderirim", rationale: "", isCorrect: false },
        { text: "Okul saatlerimi anlatırım", rationale: "", isCorrect: false },
        { text: "Ailemin telefonunu yazarım", rationale: "", isCorrect: false }
      ]
    },
    {
      question: "Hangisi güçlü bir şifre oluştururken tavsiye edilir?",
      hint: "Karmaşık ve tahmin edilemez kombinasyonlar.",
      answerOptions: [
        { text: "Harf, sayı ve özel sembol", rationale: "", isCorrect: true },
        { text: "Doğum tarihi ve yılı", rationale: "", isCorrect: false },
        { text: "Evcil hayvanının adı", rationale: "", isCorrect: false },
        { text: "12345678 dizilimi", rationale: "", isCorrect: false },
        { text: "Sadece kendi adın", rationale: "", isCorrect: false }
      ]
    },
    {
      question: "İnternette tanımadığın biri hediye veya oyun parası teklif ederse ne yapmalısın?",
      hint: "Tuzak ve dolandırıcılık ihtimalini düşünün.",
      answerOptions: [
        { text: "İnanmayıp aileme söylerim", rationale: "", isCorrect: true },
        { text: "Hemen kabul ederim", rationale: "", isCorrect: false },
        { text: "Şifremi ona veririm", rationale: "", isCorrect: false },
        { text: "Ev adresimi yazarım", rationale: "", isCorrect: false },
        { text: "Kredi kartı bilgisi ararım", rationale: "", isCorrect: false }
      ]
    },
    {
      question: "İnternette birisi seni rahatsız eden kaba mesajlar atarsa ne yapmalısın?",
      hint: "Siber zorbalık durumlarında doğru adım.",
      answerOptions: [
        { text: "Engeller, aileme veya öğretmenime söylerim", rationale: "", isCorrect: true },
        { text: "Ben de ona hakaret ederim", rationale: "", isCorrect: false },
        { text: "Korkup kimseye bir şey demem", rationale: "", isCorrect: false },
        { text: "Şifremi ona gönderirim", rationale: "", isCorrect: false },
        { text: "Tartışmayı sürdürürüm", rationale: "", isCorrect: false }
      ]
    },
    {
      question: "Hangi web sitesi güvenli bir bağlantı kullanıyor olabilir?",
      hint: "Adres çubuğundaki güvenlik kilit ve protokol göstergesi.",
      answerOptions: [
        { text: "Adresinde https:// ve kilit simgesi olan", rationale: "", isCorrect: true },
        { text: "Rengarenk reklamlarla dolu olan", rationale: "", isCorrect: false },
        { text: "Bedava telefon dağıttığını iddia eden", rationale: "", isCorrect: false },
        { text: "Hemen tıkla uyarısı veren", rationale: "", isCorrect: false },
        { text: "Şifreni herkese açık soran", rationale: "", isCorrect: false }
      ]
    }
  ]
};
const FALLBACK_QUESTION_BANK = {
  balloon: FALLBACK_BALLOON_QUESTION_BANK,
  worm: FALLBACK_TRUE_FALSE_QUESTION_BANK,
  bridge: FALLBACK_BRIDGE_QUESTION_BANK
};
const FALLBACK_GAME = {
  id: "balloon",
  title: "Balon Oyunu",
  durationSeconds: 90,
  pointsPerCorrect: 10,
  pointsPerWrong: 0
};
const WORM_GRID = {
  cols: 20,
  rows: 12
};
const WORM_STEP_MS = 280;
const WORM_DIRECTION_PRESETS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }
};
const PUZZLE_GRID = {
  cols: 3,
  rows: 3
};
const PUZZLE_PREVIEW_SECONDS = 3;
const PUZZLE_SCATTER_MS = 1800;
const TENSION_THRESHOLD_SECONDS = 15;
const BRIDGE_TARGET_STEPS = 5;
const PUZZLE_IMAGE_POOLS = {
  A: [puzzleA1, puzzleA2],
  B: [puzzleB1, puzzleB2]
};
const PUZZLE_DIFFICULTY_OPTIONS = [
  { key: "easy", label: "Basit 3x3", cols: 3, rows: 3 },
  { key: "medium", label: "Orta 4x4", cols: 4, rows: 4 },
  { key: "hard", label: "Zor 5x5", cols: 5, rows: 5 }
];
const WORM_VALUE_OPTIONS = [10, 20, 30];
const CUP_ICON_OPTIONS = [
  { id: "wifi", label: "Wi-Fi", imageUrl: cupIconWifi },
  { id: "globe", label: "İnternet", imageUrl: cupIconGlobe },
  { id: "computer", label: "Bilgisayar", imageUrl: cupIconComputer }
];
const CUP_ROUNDS_PER_GROUP = 3;
const CUP_SHUFFLE_COUNT = 6;
const CUP_SHUFFLE_STEP_MS = 430;
const CUP_SHUFFLE_PREP_MS = 80;
const MATCH_GROUP_POOL_SIZE = 20;
const MATCH_PAIR_COUNT = 10;
const MATCH_PREVIEW_SECONDS = 2;
const MATCH_POINTS_PER_PAIR = 5;
const MATCH_ICON_ITEMS = [
  { id: "computer-bridge", label: "Bilgisayar Köprü", iconFile: "computer-bridge.svg" },
  { id: "url", label: "URL", iconFile: "url.svg" },
  { id: "phishing", label: "Oltalama", iconFile: "phishing.svg" },
  { id: "secure", label: "Güvenli", iconFile: "secure.svg" },
  { id: "worm", label: "Solucan", iconFile: "worm.svg" },
  { id: "antivirus", label: "Antivirüs", iconFile: "antivirus.svg" },
  { id: "firewall", label: "Güvenlik Duvarı", iconFile: "firewall.svg" },
  { id: "software", label: "Yazılım", iconFile: "software.svg" },
  { id: "player", label: "Oyuncu", iconFile: "player.svg" },
  { id: "equipment", label: "Ekipman", iconFile: "equipment.svg" },
  { id: "screen", label: "Ekran", iconFile: "screen.svg" },
  { id: "level", label: "Bölüm", iconFile: "level.svg" },
  { id: "score", label: "Skor", iconFile: "score.svg" },
  { id: "multiplayer", label: "Çok Oyunculu", iconFile: "multiplayer.svg" },
  { id: "insult", label: "Hakaret", iconFile: "insult.svg" },
  { id: "threat", label: "Tehdit", iconFile: "threat.svg" },
  { id: "glasses", label: "Gözlük", iconFile: "glasses.svg" },
  { id: "headphones", label: "Kulaklık", iconFile: "headphones.svg" },
  { id: "keyboard", label: "Klavye", iconFile: "keyboard.svg" },
  { id: "mouse", label: "Fare", iconFile: "mouse.svg" },
  { id: "virus", label: "Virüs", iconFile: "virus.svg" },
  { id: "wifi", label: "Wi-Fi", iconFile: "wifi.svg" },
  { id: "network", label: "Ağ", iconFile: "network.svg" },
  { id: "browser", label: "Tarayıcı", iconFile: "browser.svg" },
  { id: "like", label: "Beğeni", iconFile: "like.svg" },
  { id: "profile", label: "Profil", iconFile: "profile.svg" },
  { id: "clock", label: "Saat", iconFile: "clock.svg" },
  { id: "internet", label: "İnternet", iconFile: "internet.svg" },
  { id: "activity", label: "Aktivite", iconFile: "activity.svg" },
  { id: "reminder", label: "Hatırlatıcı", iconFile: "reminder.svg" },
  { id: "phone", label: "Telefon", iconFile: "phone.svg" },
  { id: "signature", label: "İmza", iconFile: "signature.svg" },
  { id: "photo", label: "Fotoğraf", iconFile: "photo.svg" },
  { id: "character", label: "Karakter", iconFile: "character.svg" },
  { id: "number", label: "Rakam", iconFile: "number.svg" },
  { id: "symbol", label: "Sembol", iconFile: "symbol.svg" },
  { id: "password", label: "Şifre", iconFile: "password.svg" },
  { id: "child", label: "Çocuk", iconFile: "child.svg" },
  { id: "tree", label: "Ağaç", iconFile: "tree.svg" },
  { id: "parent", label: "Ebeveyn", iconFile: "parent.svg" }
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomFromList(values, fallbackValue = null) {
  if (!Array.isArray(values) || values.length === 0) {
    return fallbackValue;
  }

  return values[Math.floor(Math.random() * values.length)];
}

function getMatchingIconUrl(fileName) {
  return MATCH_ICON_MODULES[`./assets/images/match-icons/${fileName}`] ?? "";
}

function swapCupSlots(slots, firstSlot, secondSlot) {
  const nextSlots = [...slots];
  const temp = nextSlots[firstSlot];
  nextSlots[firstSlot] = nextSlots[secondSlot];
  nextSlots[secondSlot] = temp;
  return nextSlots;
}

function createCupShufflePlan(stepCount) {
  const adjacentPairs = [
    [0, 1],
    [1, 2]
  ];
  const plan = [];
  let simulatedSlots = [0, 1, 2];

  for (let step = 0; step < stepCount; step += 1) {
    const pickedPair = randomFromList(adjacentPairs, adjacentPairs[0]);
    simulatedSlots = swapCupSlots(simulatedSlots, pickedPair[0], pickedPair[1]);
    plan.push(pickedPair);
  }

  if (simulatedSlots.every((cupId, slot) => cupId === slot)) {
    const pickedPair = randomFromList(adjacentPairs, adjacentPairs[0]);
    plan.push(pickedPair);
  }

  return plan;
}

function getMatchIconPool(groupKey = "A") {
  const startIndex = groupKey === "B" ? MATCH_GROUP_POOL_SIZE : 0;
  return MATCH_ICON_ITEMS.slice(startIndex, startIndex + MATCH_GROUP_POOL_SIZE);
}

function createMatchingCards(groupKey = "A", pairCount = MATCH_PAIR_COUNT) {
  const groupPool = getMatchIconPool(groupKey);
  const safePairCount = Math.max(1, Math.min(pairCount, groupPool.length));
  const selectedIcons = shuffle(groupPool).slice(0, safePairCount);
  const duplicatedCards = selectedIcons.flatMap((icon) => [
    {
      id: `${icon.id}-a`,
      iconId: icon.id,
      label: icon.label,
      iconUrl: getMatchingIconUrl(icon.iconFile)
    },
    {
      id: `${icon.id}-b`,
      iconId: icon.id,
      label: icon.label,
      iconUrl: getMatchingIconUrl(icon.iconFile)
    }
  ]);

  return shuffle(duplicatedCards);
}

function shuffle(values) {
  const nextValues = [...values];

  for (let index = nextValues.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = nextValues[index];
    nextValues[index] = nextValues[swapIndex];
    nextValues[swapIndex] = temp;
  }

  return nextValues;
}

function normalizeGroup(baseGroup, group) {
  return {
    ...baseGroup,
    ...(group ?? {}),
    score: Number.isFinite(group?.score) ? Math.max(0, group.score) : baseGroup.score,
    completedGames: Array.isArray(group?.completedGames)
      ? group.completedGames
      : []
  };
}

function normalizeTurn(baseTurn, turn) {
  return {
    ...baseTurn,
    ...(turn ?? {}),
    askedQuestionIds: Array.isArray(turn?.askedQuestionIds)
      ? turn.askedQuestionIds
      : Array.isArray(baseTurn?.askedQuestionIds)
        ? baseTurn.askedQuestionIds
        : [],
    currentQuestionId:
      typeof turn?.currentQuestionId === "string" ? turn.currentQuestionId : null
  };
}

function getFallbackQuestions(gameId = "balloon", groupKey = "A") {
  const gameBank =
    FALLBACK_QUESTION_BANK[gameId] ?? FALLBACK_QUESTION_BANK.balloon;
  return gameBank[groupKey] ?? gameBank.A;
}

function normalizeAnswerOption(option, fallbackOption) {
  return {
    text: option?.text || fallbackOption.text,
    rationale: option?.rationale || fallbackOption.rationale || "",
    isCorrect:
      typeof option?.isCorrect === "boolean"
        ? option.isCorrect
        : fallbackOption.isCorrect
  };
}

function normalizeAnswerOptions(question, fallbackQuestion) {
  const rawOptions = Array.isArray(question?.answerOptions)
    ? question.answerOptions
    : [];
  const fallbackOptions = fallbackQuestion.answerOptions;
  const cleanedRawOptions = rawOptions.filter(
    (option) => typeof option?.text === "string" && option.text.trim()
  );
  const hasTrueFalseLabels =
    cleanedRawOptions.some((option) => option.text === "Doğru") ||
    cleanedRawOptions.some((option) => option.text === "Yanlış");

  if (cleanedRawOptions.length >= 2 && !hasTrueFalseLabels) {
    const normalizedOptions = cleanedRawOptions.map((option, index) =>
      normalizeAnswerOption(option, {
        text: `Seçenek ${index + 1}`,
        rationale: "",
        isCorrect: index === 0
      })
    );
    const hasCorrectOption = normalizedOptions.some((option) => option.isCorrect);

    if (!hasCorrectOption) {
      normalizedOptions[0] = {
        ...normalizedOptions[0],
        isCorrect: true
      };
    }

    return normalizedOptions;
  }

  const trueOption =
    rawOptions.find((option) => option?.text === "Doğru") ??
    (question?.correctAnswer
      ? {
          text: "Doğru",
          rationale: "",
          isCorrect: question.correctAnswer === "Doğru"
        }
      : null) ??
    fallbackOptions[0];
  const falseOption =
    rawOptions.find((option) => option?.text === "Yanlış") ??
    (question?.wrongAnswer
      ? {
          text: "Yanlış",
          rationale: "",
          isCorrect: question.correctAnswer === "Yanlış"
        }
      : null) ??
    fallbackOptions[1];

  return [
    normalizeAnswerOption(trueOption, fallbackOptions[0]),
    normalizeAnswerOption(falseOption, fallbackOptions[1])
  ];
}

function normalizeQuestionIdPart(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 42);
}

function buildQuestionId(gameId, groupKey, question, index) {
  if (typeof question?.id === "string" && question.id.trim()) {
    return question.id.trim();
  }

  const sourceValue = question?.questionNumber ?? index + 1;
  const textValue = normalizeQuestionIdPart(question?.question || `soru-${sourceValue}`);
  return `${gameId}-${groupKey}-${sourceValue}-${textValue}`;
}

function normalizeQuestion(question, index, groupKey = "A", gameId = "balloon") {
  const fallbackQuestions = getFallbackQuestions(gameId, groupKey);
  const fallbackQuestion = fallbackQuestions[index % fallbackQuestions.length];

  return {
    id: buildQuestionId(gameId, groupKey, question, index),
    questionNumber: question?.questionNumber ?? index + 1,
    question: question?.question || fallbackQuestion.question,
    imageUrl: question?.imageUrl || "",
    answerOptions: normalizeAnswerOptions(question, fallbackQuestion),
    hint: question?.hint || fallbackQuestion.hint || "",
    difficulty: question?.difficulty || "medium",
    pointValue: Number(question?.pointValue) || undefined
  };
}

function inferDifficultyFromQuestionNumber(questionNumber) {
  if (questionNumber <= 17) {
    return "easy";
  }

  if (questionNumber <= 33) {
    return "medium";
  }

  return "hard";
}

function getPointValueFromDifficulty(difficulty) {
  if (difficulty === "easy") {
    return 10;
  }

  if (difficulty === "hard") {
    return 30;
  }

  return 20;
}

function getPointValueFromIndex(indexInGroup) {
  if (indexInGroup < 10) {
    return 10;
  }

  if (indexInGroup < 20) {
    return 20;
  }

  return 30;
}

function getWormPointValue(question, indexInGroup) {
  const explicitValue = Number(question?.pointValue);
  if ([10, 20, 30].includes(explicitValue)) {
    return explicitValue;
  }

  if (typeof question?.difficulty === "string") {
    return getPointValueFromDifficulty(question.difficulty);
  }

  return getPointValueFromIndex(indexInGroup);
}

function normalizeGame(game, index = 0) {
  const baseGame = defaultSession.games?.[index] ?? FALLBACK_GAME;
  const { questions, ...gameWithoutQuestions } = game ?? {};
  const normalizedGame = {
    ...FALLBACK_GAME,
    ...baseGame,
    ...gameWithoutQuestions
  };

  if (normalizedGame.id === "match") {
    return {
      ...normalizedGame,
      durationSeconds: 120
    };
  }

  return normalizedGame;
}

function normalizeGames(rawGames, baseGames) {
  const sessionGames = Array.isArray(rawGames) ? rawGames : [];
  const defaults = Array.isArray(baseGames) && baseGames.length > 0
    ? baseGames
    : [FALLBACK_GAME];

  const requiredGames = defaults.map((defaultGame, index) => {
    const byId = sessionGames.find((sessionGame) => sessionGame?.id === defaultGame.id);
    const selectedGame = byId ?? defaultGame;

    return normalizeGame(selectedGame, index);
  });

  const requiredIds = new Set(defaults.map((game) => game.id));
  const extraGames = sessionGames
    .filter((sessionGame) => sessionGame?.id && !requiredIds.has(sessionGame.id))
    .map((sessionGame, index) => normalizeGame(sessionGame, defaults.length + index));

  return [...requiredGames, ...extraGames];
}

function createSimpleTrueFalseQuestion(questionText, isCorrectTrue, extra = {}) {
  return {
    question: questionText,
    answerOptions: [
      {
        text: "Doğru",
        rationale: "",
        isCorrect: Boolean(isCorrectTrue)
      },
      {
        text: "Yanlış",
        rationale: "",
        isCorrect: !Boolean(isCorrectTrue)
      }
    ],
    hint: "",
    ...extra
  };
}

function createFillBlankQuestion(questionText, correctText, wrongOptions = [], extra = {}) {
  const safeCorrectText = String(correctText ?? "").trim();
  const safeWrongOptions = Array.isArray(wrongOptions)
    ? wrongOptions
      .map((item) => String(item ?? "").trim())
      .filter(Boolean)
    : [];

  const optionTexts = [safeCorrectText, ...safeWrongOptions]
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);
  const normalizedOptionTexts = optionTexts.length >= 2
    ? optionTexts
    : [safeCorrectText || "Doğru Seçenek", "Yanlış Seçenek"];
  const answerOptions = shuffle(
    normalizedOptionTexts.map((text) => ({
      text,
      rationale: "",
      isCorrect: text === (safeCorrectText || normalizedOptionTexts[0])
    }))
  );

  return {
    question: questionText,
    answerOptions,
    hint: "",
    ...extra
  };
}

function normalizeCustomQuestions(rawCustomQuestions, baseCustomQuestions) {
  const normalized = clone(baseCustomQuestions);

  ["balloon", "worm", "bridge"].forEach((gameId) => {
    GROUP_KEYS.forEach((groupKey) => {
      const sourceQuestions = Array.isArray(rawCustomQuestions?.[gameId]?.[groupKey])
        ? rawCustomQuestions[gameId][groupKey]
        : [];
      normalized[gameId][groupKey] = sourceQuestions
        .filter((question) => typeof question?.question === "string" && question.question.trim())
        .map((question, index) => {
          if (gameId === "worm") {
            return normalizeQuestion(
              {
                ...question,
                pointValue: getWormPointValue(question, index),
                difficulty:
                  question?.difficulty ??
                  (getWormPointValue(question, index) === 10
                    ? "easy"
                    : getWormPointValue(question, index) === 30
                      ? "hard"
                      : "medium")
              },
              index,
              groupKey,
              gameId
            );
          }

          return normalizeQuestion(question, index, groupKey, gameId);
        });
    });
  });

  return normalized;
}

function normalizeCustomPuzzles(rawPuzzles) {
  if (!Array.isArray(rawPuzzles)) {
    return [];
  }

  return rawPuzzles
    .filter((puzzle) => typeof puzzle?.imageUrl === "string" && puzzle.imageUrl.trim())
    .map((puzzle, index) => ({
      id: puzzle.id || `custom-puzzle-${index + 1}`,
      imageUrl: puzzle.imageUrl
    }));
}

function normalizeSettings(rawSettings, baseSettings) {
  return {
    ...baseSettings,
    ...(rawSettings ?? {}),
    developerMode: Boolean(rawSettings?.developerMode),
    customQuestions: normalizeCustomQuestions(
      rawSettings?.customQuestions,
      baseSettings.customQuestions
    ),
    customPuzzles: normalizeCustomPuzzles(rawSettings?.customPuzzles)
  };
}

function getQuestionsForGroup(gameId, groupKey, customQuestions = null) {
  const fallbackQuestions = getFallbackQuestions(gameId, groupKey);

  if (gameId === "worm") {
    const rawWormQuestions = Array.isArray(wormQuestionBank?.questions)
      ? wormQuestionBank.questions
      : [];
    let selectedPool = [];

    if (rawWormQuestions.length >= 50) {
      selectedPool =
        groupKey === "A"
          ? rawWormQuestions.slice(0, 25)
          : rawWormQuestions.slice(25, 50);
    } else {
      const splitByGroup = rawWormQuestions.filter((_, index) =>
        groupKey === "A" ? index % 2 === 0 : index % 2 === 1
      );
      selectedPool = splitByGroup.length > 0 ? splitByGroup : rawWormQuestions;
    }

    if (selectedPool.length === 0) {
      const normalizedFallbackQuestions = fallbackQuestions.map((question, index) =>
        normalizeQuestion(
          {
            ...question,
            difficulty: "easy",
            pointValue: 10
          },
          index,
          groupKey,
          "worm"
        )
      );

      return normalizedFallbackQuestions;
    }

    const normalizedBaseWormQuestions = selectedPool.map((question, index) =>
      normalizeQuestion(
        {
          ...question,
          difficulty:
            question?.difficulty ??
            inferDifficultyFromQuestionNumber(question?.questionNumber ?? index + 1),
          pointValue: getWormPointValue(question, index)
        },
        index,
        groupKey,
        "worm"
      )
    );

    const customWormQuestions = Array.isArray(customQuestions?.worm?.[groupKey])
      ? customQuestions.worm[groupKey]
      : [];

    return [...normalizedBaseWormQuestions, ...customWormQuestions];
  }

  if (gameId === "bridge") {
    const bridgeGroupSet = bridgeQuestionBank?.[groupKey];
    const otherGroupKey = groupKey === "A" ? "B" : "A";
    const bridgeOtherGroupSet = bridgeQuestionBank?.[otherGroupKey];
    const rawBridgeQuestions = Array.isArray(bridgeGroupSet?.questions)
      ? bridgeGroupSet.questions
      : Array.isArray(bridgeGroupSet)
        ? bridgeGroupSet
        : [];
    const rawBridgeOtherQuestions = Array.isArray(bridgeOtherGroupSet?.questions)
      ? bridgeOtherGroupSet.questions
      : Array.isArray(bridgeOtherGroupSet)
        ? bridgeOtherGroupSet
        : [];
    const mergedBridgeQuestions = [...rawBridgeQuestions, ...rawBridgeOtherQuestions];
    const questions =
      mergedBridgeQuestions.length > 0 ? mergedBridgeQuestions : fallbackQuestions;
    const normalizedBaseBridgeQuestions = questions.map((question, index) =>
      normalizeQuestion(question, index, groupKey, "bridge")
    );
    const customBridgeQuestions = Array.isArray(customQuestions?.bridge?.[groupKey])
      ? customQuestions.bridge[groupKey]
      : [];

    return [...normalizedBaseBridgeQuestions, ...customBridgeQuestions];
  }

  const groupQuestionSet = questionBank?.[gameId]?.[groupKey];
  const rawQuestions = Array.isArray(groupQuestionSet)
    ? groupQuestionSet
    : groupQuestionSet?.questions;
  const questions =
    Array.isArray(rawQuestions) && rawQuestions.length > 0
      ? rawQuestions
      : fallbackQuestions;

  const normalizedBaseQuestions = questions.map((question, index) =>
    normalizeQuestion(question, index, groupKey, gameId)
  );
  const customBalloonQuestions = Array.isArray(customQuestions?.[gameId]?.[groupKey])
    ? customQuestions[gameId][groupKey]
    : [];

  return [...normalizedBaseQuestions, ...customBalloonQuestions];
}

function pickRandomQuestionWithoutRepeat(questions, askedQuestionIds = []) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      question: null,
      askedQuestionIds: []
    };
  }

  let askedSet = new Set(
    askedQuestionIds.filter((questionId) => questions.some((question) => question.id === questionId))
  );
  let candidates = questions.filter((question) => !askedSet.has(question.id));

  if (candidates.length === 0) {
    askedSet = new Set();
    candidates = questions;
  }

  const pickedQuestion = randomFromList(candidates, questions[0]);

  if (pickedQuestion?.id) {
    askedSet.add(pickedQuestion.id);
  }

  return {
    question: pickedQuestion,
    askedQuestionIds: [...askedSet]
  };
}

function getPuzzleDifficultyByKey(key) {
  return (
    PUZZLE_DIFFICULTY_OPTIONS.find((option) => option.key === key) ??
    PUZZLE_DIFFICULTY_OPTIONS[1]
  );
}

function getBalloonQuestionPool(session, groupKey) {
  return getQuestionsForGroup(
    "balloon",
    groupKey,
    session?.settings?.customQuestions
  );
}

function assignNextBalloonQuestion(session, groupKey) {
  const turn = session.gameState.turns[groupKey];
  const questions = getBalloonQuestionPool(session, groupKey);
  const picked = pickRandomQuestionWithoutRepeat(questions, turn.askedQuestionIds);

  turn.askedQuestionIds = picked.askedQuestionIds;
  turn.currentQuestionId = picked.question?.id ?? null;
}

function resolveCurrentBalloonQuestion(session) {
  const groupKey = session?.activeGroup ?? "A";
  const turn = session?.gameState?.turns?.[groupKey];
  const questions = getBalloonQuestionPool(session, groupKey);

  if (questions.length === 0) {
    return normalizeQuestion(
      getFallbackQuestions("balloon", groupKey)[0],
      0,
      groupKey,
      "balloon"
    );
  }

  const byId = questions.find((question) => question.id === turn?.currentQuestionId);
  return byId ?? questions[0];
}

function getBridgeQuestionPool(session, groupKey) {
  return getQuestionsForGroup(
    "bridge",
    groupKey,
    session?.settings?.customQuestions
  );
}

function assignNextBridgeQuestion(session, groupKey) {
  const turn = session.gameState.turns[groupKey];
  const questions = getBridgeQuestionPool(session, groupKey);
  const picked = pickRandomQuestionWithoutRepeat(questions, turn.askedQuestionIds);

  turn.askedQuestionIds = picked.askedQuestionIds;
  turn.currentQuestionId = picked.question?.id ?? null;
}

function resolveCurrentBridgeQuestion(session) {
  const groupKey = session?.activeGroup ?? "A";
  const turn = session?.gameState?.turns?.[groupKey];
  const questions = getBridgeQuestionPool(session, groupKey);

  if (questions.length === 0) {
    return normalizeQuestion(
      getFallbackQuestions("bridge", groupKey)[0],
      0,
      groupKey,
      "bridge"
    );
  }

  const byId = questions.find((question) => question.id === turn?.currentQuestionId);
  return byId ?? questions[0];
}


function normalizeSession(rawSession) {
  const base = clone(defaultSession);

  if (
    !rawSession ||
    typeof rawSession !== "object" ||
    rawSession.schemaVersion !== base.schemaVersion
  ) {
    return {
      ...base,
      games: normalizeGames(base.games, base.games)
    };
  }

  const games = normalizeGames(rawSession.games, base.games);

  return {
    ...base,
    ...rawSession,
    timer: {
      ...base.timer,
      ...(rawSession.timer ?? {})
    },
    groups: {
      A: normalizeGroup(base.groups.A, rawSession.groups?.A),
      B: normalizeGroup(base.groups.B, rawSession.groups?.B)
    },
    gameState: {
      ...base.gameState,
      ...(rawSession.gameState ?? {}),
      transition: {
        ...base.gameState.transition,
        ...(rawSession.gameState?.transition ?? {})
      },
      turns: {
        A: normalizeTurn(base.gameState.turns.A, rawSession.gameState?.turns?.A),
        B: normalizeTurn(base.gameState.turns.B, rawSession.gameState?.turns?.B)
      }
    },
    settings: normalizeSettings(rawSession.settings, base.settings),
    games
  };
}

function getBrowserSession() {
  try {
    const savedSession = window.localStorage.getItem(STORAGE_KEY);
    return savedSession ? JSON.parse(savedSession) : clone(defaultSession);
  } catch {
    return clone(defaultSession);
  }
}

const sessionStore = {
  async getData() {
    if (window.appAPI?.getData) {
      return window.appAPI.getData();
    }

    return getBrowserSession();
  },
  async saveData(appData) {
    if (window.appAPI?.saveData) {
      return window.appAPI.saveData(appData);
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    return true;
  },
  async resetData() {
    if (window.appAPI?.resetData) {
      return window.appAPI.resetData();
    }

    const resetSession = clone(defaultSession);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resetSession));
    return resetSession;
  }
};

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function nextBurstState(previousBurst) {
  return {
    id: (previousBurst?.id ?? 0) + 1,
    x: "50%",
    y: "50%"
  };
}

let feedbackAudioContext = null;

function getFeedbackAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    return null;
  }

  if (!feedbackAudioContext || feedbackAudioContext.state === "closed") {
    feedbackAudioContext = new AudioContextConstructor();
  }

  if (feedbackAudioContext.state === "suspended") {
    feedbackAudioContext.resume().catch(() => {});
  }

  return feedbackAudioContext;
}

function playFeedbackTone(audioContext, frequency, startAt, duration, type = "square") {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.14, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.025);
}

function playAnswerFeedbackSound(isCorrect) {
  const audioContext = getFeedbackAudioContext();
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  if (isCorrect) {
    playFeedbackTone(audioContext, 523.25, now, 0.12);
    playFeedbackTone(audioContext, 659.25, now + 0.09, 0.12);
    playFeedbackTone(audioContext, 783.99, now + 0.18, 0.16);
    return;
  }

  // Distinct low raspy buzzer for wrong answers
  playFeedbackTone(audioContext, 150, now, 0.18, "sawtooth");
  playFeedbackTone(audioContext, 95, now + 0.15, 0.26, "sawtooth");
}

function isSameCell(cellA, cellB) {
  return cellA.x === cellB.x && cellA.y === cellB.y;
}

function createInitialSnake() {
  return [
    { x: 7, y: 6 },
    { x: 6, y: 6 },
    { x: 5, y: 6 }
  ];
}

function spawnFoodAtRandomCell(occupied, value) {
  let attempts = 0;

  while (attempts < 160) {
    const x = Math.floor(Math.random() * WORM_GRID.cols);
    const y = Math.floor(Math.random() * WORM_GRID.rows);
    const key = `${x}-${y}`;

    if (!occupied.has(key)) {
      occupied.add(key);
      return { x, y, value };
    }

    attempts += 1;
  }

  const fallbackX = Math.floor(Math.random() * WORM_GRID.cols);
  const fallbackY = Math.floor(Math.random() * WORM_GRID.rows);
  occupied.add(`${fallbackX}-${fallbackY}`);

  return {
    x: fallbackX,
    y: fallbackY,
    value
  };
}

function spawnWormFoods(snakeCells, foodValues) {
  const values = Array.isArray(foodValues) && foodValues.length > 0
    ? [...new Set(foodValues)]
    : [10, 20, 30];
  const occupied = new Set(snakeCells.map((cell) => `${cell.x}-${cell.y}`));

  return values.map((value) => spawnFoodAtRandomCell(occupied, value));
}

function getWormGrowthByValue(value) {
  const safeValue = Number.isFinite(value) ? value : 10;
  return Math.max(2, Math.floor(safeValue / 10) + 1);
}

function buildPuzzlePieces(cols, rows) {
  return Array.from({ length: cols * rows }, (_, index) => ({
    id: index,
    row: Math.floor(index / cols),
    col: index % cols
  }));
}

function getPuzzlePieceBackgroundStyle(piece, imageUrl, cols, rows) {
  const xRatio = cols > 1 ? piece.col / (cols - 1) : 0;
  const yRatio = rows > 1 ? piece.row / (rows - 1) : 0;

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${xRatio * 100}% ${yRatio * 100}%`
  };
}

function getPuzzleTrayColumns(pieceCount) {
  if (pieceCount >= 16) {
    return 4;
  }

  if (pieceCount >= 9) {
    return 3;
  }

  return 2;
}

function getTimeLeft(session, now) {
  if (session.roundStatus !== "running" || !session.timer.endsAt) {
    return session.timer.durationSeconds;
  }

  const endsAt = new Date(session.timer.endsAt).getTime();

  if (!Number.isFinite(endsAt)) {
    return 0;
  }

  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

function getWinner(groups) {
  if (groups.A.score === groups.B.score) {
    return "Beraberlik";
  }

  return groups.A.score > groups.B.score ? "A Grubu Kazandı" : "B Grubu Kazandı";
}

function getAnswerChoices(question) {
  return Array.isArray(question?.answerOptions)
    ? question.answerOptions
    : [];
}

function getCorrectAnswerChoice(question) {
  return getAnswerChoices(question).find((choice) => choice?.isCorrect) ?? null;
}

function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const dataRef = useRef(null);
  const audioRefs = useRef(null);

  const unlockAudio = useCallback(() => {
    setAudioUnlocked(true);
  }, []);

  useEffect(() => {
    const gameplay = new Audio(gameplayLoopMusic);
    gameplay.loop = true;
    gameplay.preload = "auto";
    gameplay.volume = 0.36;

    const tension = new Audio(tensionLoopMusic);
    tension.loop = true;
    tension.preload = "auto";
    tension.volume = 0.42;

    const winner = new Audio(winnerLoopMusic);
    winner.loop = true;
    winner.preload = "auto";
    winner.volume = 0.38;

    const pop = new Audio(balloonPopSfx);
    pop.preload = "auto";
    pop.volume = 0.95;

    audioRefs.current = {
      gameplay,
      tension,
      winner,
      pop,
      activeTrack: "none"
    };

    return () => {
      [gameplay, tension, winner, pop].forEach((track) => {
        track.pause();
        track.currentTime = 0;
      });
      audioRefs.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioUnlocked) {
      return undefined;
    }

    const handleUnlock = () => {
      setAudioUnlocked(true);
    };

    window.addEventListener("pointerdown", handleUnlock, { once: true });
    window.addEventListener("keydown", handleUnlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, [audioUnlocked]);

  const persistSession = useCallback(async (nextSession) => {
    const normalizedSession = normalizeSession(nextSession);
    dataRef.current = normalizedSession;
    setData(normalizedSession);
    await sessionStore.saveData(normalizedSession);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const savedSession = await sessionStore.getData();
        const normalizedSession = normalizeSession(savedSession);

        if (isMounted) {
          dataRef.current = normalizedSession;
          setData(normalizedSession);
        }

        await sessionStore.saveData(normalizedSession);
      } catch (error) {
        if (isMounted) {
          setLoadError("Oturum verisi okunamadı.");
        }

        console.error(error);
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeGame = data?.games[data.activeGameIndex] ?? data?.games[0];
  const activeTurn = data?.gameState.turns[data.activeGroup];
  const activeBalloonQuestion = useMemo(() => {
    if (!data || activeGame?.id !== "balloon") {
      return null;
    }

    return resolveCurrentBalloonQuestion(data);
  }, [activeGame?.id, data]);
  const activeBridgeQuestion = useMemo(() => {
    if (!data || activeGame?.id !== "bridge") {
      return null;
    }

    return resolveCurrentBridgeQuestion(data);
  }, [activeGame?.id, data]);

  const timeLeft = useMemo(() => {
    if (!data) return 0;
    return getTimeLeft(data, now);
  }, [data, now]);

  useEffect(() => {
    const tracks = audioRefs.current;
    if (!tracks) {
      return;
    }

    const pauseBackground = () => {
      tracks.gameplay.pause();
      tracks.tension.pause();
      tracks.winner.pause();
      tracks.activeTrack = "none";
    };

    if (!audioUnlocked || !data) {
      pauseBackground();
      return;
    }

    let nextTrack = "none";

    if (data.phase === "winner") {
      nextTrack = "winner";
    } else if (data.phase === "playing") {
      const inTensionWindow =
        data.roundStatus === "running" &&
        timeLeft > 0 &&
        timeLeft <= TENSION_THRESHOLD_SECONDS;
      nextTrack = inTensionWindow ? "tension" : "gameplay";
    } else if (
      data.phase === "puzzleSetup" ||
      data.phase === "intro"
    ) {
      nextTrack = "gameplay";
    }

    if (tracks.activeTrack === nextTrack) {
      return;
    }

    [tracks.gameplay, tracks.tension, tracks.winner].forEach((track) => {
      track.pause();
      track.currentTime = 0;
    });

    tracks.activeTrack = nextTrack;

    if (nextTrack === "none") {
      return;
    }

    const targetTrack =
      nextTrack === "winner"
        ? tracks.winner
        : nextTrack === "tension"
          ? tracks.tension
          : tracks.gameplay;

    targetTrack.play().catch(() => {});
  }, [audioUnlocked, data, timeLeft]);

  const resetProgress = useCallback(async () => {
    const keepSettings = clone(dataRef.current?.settings ?? defaultSession.settings);
    const resetSession = await sessionStore.resetData();
    const normalizedSession = normalizeSession(resetSession);
    normalizedSession.settings = normalizeSettings(keepSettings, defaultSession.settings);
    dataRef.current = normalizedSession;
    setData(normalizedSession);
    await sessionStore.saveData(normalizedSession);
  }, []);

  const createSessionForGame = useCallback((gameId = null) => {
    const keepSettings = clone(dataRef.current?.settings ?? defaultSession.settings);
    const nextSession = normalizeSession(clone(defaultSession));
    nextSession.settings = normalizeSettings(keepSettings, defaultSession.settings);
    const requestedGameIndex = gameId
      ? nextSession.games.findIndex((game) => game.id === gameId)
      : 0;
    const activeGameIndex = requestedGameIndex >= 0 ? requestedGameIndex : 0;

    nextSession.phase = "playing";
    nextSession.activeGameIndex = activeGameIndex;
    nextSession.activeGroup = "A";
    nextSession.roundStatus = "idle";
    nextSession.gameState.turns = clone(defaultSession.gameState.turns);
    nextSession.gameState.transition = clone(defaultSession.gameState.transition);
    nextSession.timer = {
      durationSeconds: nextSession.games[activeGameIndex]?.durationSeconds ?? 90,
      startedAt: null,
      endsAt: null
    };

    return nextSession;
  }, []);

  const updateSettings = useCallback(async (updater) => {
    const currentSession = dataRef.current;
    if (!currentSession) {
      return;
    }

    const nextSession = clone(currentSession);
    const nextSettings =
      typeof updater === "function"
        ? updater(clone(nextSession.settings))
        : updater;

    nextSession.settings = normalizeSettings(nextSettings, defaultSession.settings);
    await persistSession(nextSession);
  }, [persistSession]);

  const addCustomQuestion = useCallback(
    async ({
      gameId,
      groupKey,
      questionText,
      correctAnswer,
      pointValue,
      correctOptionText,
      wrongOptionTexts
    }) => {
      const currentSession = dataRef.current;
      if (!currentSession) {
        return false;
      }

      const safeQuestionText = String(questionText ?? "").trim();
      if (!safeQuestionText) {
        return false;
      }

      const safeGameId =
        gameId === "worm" || gameId === "bridge"
          ? gameId
          : "balloon";
      const safeGroupKey = groupKey === "B" ? "B" : "A";
      const isCorrectTrue = correctAnswer !== "Yanlış";
      const nextSession = clone(currentSession);
      const currentList = nextSession.settings.customQuestions[safeGameId][safeGroupKey];
      const nextIndex = currentList.length;
      const customQuestionId = `custom-${safeGameId}-${safeGroupKey}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      let normalizedQuestion;

      if (safeGameId === "balloon") {
        const safeCorrectOptionText = String(correctOptionText ?? "").trim();
        let safeWrongOptions = Array.isArray(wrongOptionTexts)
          ? wrongOptionTexts
            .map((option) => String(option ?? "").trim())
            .filter(Boolean)
          : [];

        if (!safeCorrectOptionText) {
          return false;
        }

        if (safeWrongOptions.length < 4) {
          const fallbackPool = getFallbackQuestions("balloon", safeGroupKey);
          const poolWrongs = [];
          for (const q of fallbackPool) {
            for (const opt of getAnswerChoices(q)) {
              if (
                !opt.isCorrect &&
                opt.text &&
                opt.text !== safeCorrectOptionText &&
                !safeWrongOptions.includes(opt.text) &&
                !poolWrongs.includes(opt.text)
              ) {
                poolWrongs.push(opt.text);
              }
            }
          }
          const needed = 4 - safeWrongOptions.length;
          safeWrongOptions = [...safeWrongOptions, ...poolWrongs.slice(0, needed)];
        }

        const answerOptions = [
          { text: safeCorrectOptionText, isCorrect: true, rationale: "" },
          ...safeWrongOptions.slice(0, 4).map((text) => ({ text, isCorrect: false, rationale: "" }))
        ];

        const baseQuestion = {
          id: customQuestionId,
          questionNumber: nextIndex + 1,
          question: safeQuestionText,
          imageUrl: "",
          hint: "",
          answerOptions
        };

        normalizedQuestion = normalizeQuestion(
          baseQuestion,
          nextIndex,
          safeGroupKey,
          "balloon"
        );
      } else if (safeGameId === "bridge") {
        const safeCorrectOptionText = String(correctOptionText ?? "").trim();
        const safeWrongOptions = Array.isArray(wrongOptionTexts)
          ? wrongOptionTexts
            .map((option) => String(option ?? "").trim())
            .filter(Boolean)
          : [];

        if (!safeCorrectOptionText) {
          return false;
        }

        const baseQuestion = createFillBlankQuestion(
          safeQuestionText,
          safeCorrectOptionText,
          safeWrongOptions,
          { id: customQuestionId }
        );
        normalizedQuestion = normalizeQuestion(
          baseQuestion,
          nextIndex,
          safeGroupKey,
          safeGameId
        );
      } else {
        const baseQuestion = createSimpleTrueFalseQuestion(safeQuestionText, isCorrectTrue, {
          id: customQuestionId
        });
        const wormValue = WORM_VALUE_OPTIONS.includes(Number(pointValue))
          ? Number(pointValue)
          : 20;
        normalizedQuestion =
          safeGameId === "worm"
            ? normalizeQuestion(
              {
                ...baseQuestion,
                pointValue: wormValue,
                difficulty:
                  wormValue === 10 ? "easy" : wormValue === 30 ? "hard" : "medium"
              },
              nextIndex,
              safeGroupKey,
              safeGameId
            )
            : normalizeQuestion(baseQuestion, nextIndex, safeGroupKey, safeGameId);
      }

      nextSession.settings.customQuestions[safeGameId][safeGroupKey] = [
        ...currentList,
        normalizedQuestion
      ];

      await persistSession(nextSession);
      return true;
    },
    [persistSession]
  );

  const addCustomPuzzle = useCallback(async (imageUrl) => {
    const currentSession = dataRef.current;
    if (!currentSession || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return false;
    }

    const nextSession = clone(currentSession);
    const nextCustomPuzzle = {
      id: `custom-puzzle-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      imageUrl
    };
    nextSession.settings.customPuzzles = [
      ...nextSession.settings.customPuzzles,
      nextCustomPuzzle
    ];
    await persistSession(nextSession);
    return true;
  }, [persistSession]);

  const removeCustomQuestion = useCallback(async ({ gameId, groupKey, questionId }) => {
    const currentSession = dataRef.current;
    if (!currentSession || typeof questionId !== "string") {
      return false;
    }

    const safeGameId =
      gameId === "worm" || gameId === "bridge"
        ? gameId
        : "balloon";
    const safeGroupKey = groupKey === "B" ? "B" : "A";
    const nextSession = clone(currentSession);
    const currentList = nextSession.settings.customQuestions[safeGameId][safeGroupKey];
    const nextList = currentList.filter((question) => question.id !== questionId);

    if (nextList.length === currentList.length) {
      return false;
    }

    nextSession.settings.customQuestions[safeGameId][safeGroupKey] = nextList;
    await persistSession(nextSession);
    return true;
  }, [persistSession]);

  const removeCustomPuzzle = useCallback(async (puzzleId) => {
    const currentSession = dataRef.current;
    if (!currentSession || typeof puzzleId !== "string") {
      return false;
    }

    const nextSession = clone(currentSession);
    const currentPuzzles = nextSession.settings.customPuzzles;
    const nextPuzzles = currentPuzzles.filter((puzzle) => puzzle.id !== puzzleId);

    if (nextPuzzles.length === currentPuzzles.length) {
      return false;
    }

    nextSession.settings.customPuzzles = nextPuzzles;
    await persistSession(nextSession);
    return true;
  }, [persistSession]);

  const startSession = useCallback(async () => {
    unlockAudio();
    await persistSession(createSessionForGame());
  }, [createSessionForGame, persistSession, unlockAudio]);

  const startTurn = useCallback(async () => {
    if (!data || data.phase !== "playing" || data.roundStatus === "running") {
      return;
    }

    unlockAudio();

    const startedAt = Date.now();
    const durationSeconds = activeGame?.durationSeconds ?? 90;
    const nextSession = clone(data);
    const turn = nextSession.gameState.turns[nextSession.activeGroup];

    turn.status = "running";
    turn.questionIndex = 0;
    turn.currentQuestionId = null;
    turn.askedQuestionIds = [];

    if (activeGame?.id === "balloon") {
      assignNextBalloonQuestion(nextSession, nextSession.activeGroup);
    } else if (activeGame?.id === "bridge") {
      assignNextBridgeQuestion(nextSession, nextSession.activeGroup);
    }

    nextSession.roundStatus = "running";
    nextSession.timer = {
      durationSeconds,
      startedAt: new Date(startedAt).toISOString(),
      endsAt: new Date(startedAt + durationSeconds * 1000).toISOString()
    };

    setNow(startedAt);
    await persistSession(nextSession);
  }, [activeGame, data, persistSession, unlockAudio]);

  const finishTurn = useCallback(async () => {
    const currentSession = dataRef.current;
    if (!currentSession || currentSession.phase !== "playing") {
      return;
    }

    const nextSession = clone(currentSession);
    const groupKey = nextSession.activeGroup;
    const activeGroupTurn = nextSession.gameState.turns[groupKey];
    const currentGame =
      nextSession.games[nextSession.activeGameIndex] ?? FALLBACK_GAME;

    activeGroupTurn.status = "finished";
    nextSession.roundStatus = "idle";
    nextSession.timer = {
      durationSeconds: currentGame?.durationSeconds ?? 90,
      startedAt: null,
      endsAt: null
    };

    if (currentGame?.id) {
      const completedGames = new Set(nextSession.groups[groupKey].completedGames);
      completedGames.add(currentGame.id);
      nextSession.groups[groupKey].completedGames = [...completedGames];
    }

    if (groupKey === "A") {
      nextSession.activeGroup = "B";
    } else {
      const nextGameIndex = nextSession.activeGameIndex + 1;
      const nextGame = nextSession.games[nextGameIndex];

      if (nextGame?.id === "puzzle") {
        nextSession.phase = "puzzleSetup";
        nextSession.roundStatus = "transition";
        nextSession.activeGameIndex = nextGameIndex;
        nextSession.activeGroup = "A";
        nextSession.gameState.transition.puzzleDifficulty = "medium";
        nextSession.gameState.turns = clone(defaultSession.gameState.turns);
        nextSession.timer = {
          durationSeconds: nextSession.games[nextGameIndex]?.durationSeconds ?? 90,
          startedAt: null,
          endsAt: null
        };
      } else if (nextGameIndex < nextSession.games.length) {
        nextSession.phase = "playing";
        nextSession.roundStatus = "idle";
        nextSession.activeGameIndex = nextGameIndex;
        nextSession.activeGroup = "A";
        nextSession.timer = {
          durationSeconds: nextSession.games[nextGameIndex]?.durationSeconds ?? 90,
          startedAt: null,
          endsAt: null
        };
        nextSession.gameState.turns = clone(defaultSession.gameState.turns);
      } else {
        nextSession.phase = "winner";
        nextSession.roundStatus = "complete";
      }
    }

    await persistSession(nextSession);
  }, [persistSession]);

  const addScoreToActiveGroup = useCallback(
    async (amount, playFeedback = true) => {
      const currentSession = dataRef.current;
      if (!currentSession || currentSession.phase !== "playing") {
        return;
      }

      const nextSession = clone(currentSession);
      const groupKey = nextSession.activeGroup;

      nextSession.groups[groupKey].score = Math.max(
        0,
        nextSession.groups[groupKey].score + amount
      );
      if (amount !== 0 && playFeedback) {
        playAnswerFeedbackSound(amount > 0);
      }
      await persistSession(nextSession);
    },
    [persistSession]
  );

  const answerQuestion = useCallback(
    async (isCorrect) => {
      if (
        !data ||
        data.phase !== "playing" ||
        data.roundStatus !== "running" ||
        activeGame?.id !== "balloon"
      ) {
        return;
      }

      const nextSession = clone(data);
      const groupKey = nextSession.activeGroup;
      const turn = nextSession.gameState.turns[groupKey];
      const currentQuestion = resolveCurrentBalloonQuestion(nextSession);

      if (!currentQuestion) {
        return;
      }

      turn.answered += 1;
      turn.questionIndex += 1;

      if (isCorrect) {
        turn.correct += 1;
        turn.balloonLevel += 1;
        nextSession.groups[groupKey].score = Math.max(
          0,
          nextSession.groups[groupKey].score + (activeGame.pointsPerCorrect ?? 10)
        );
      } else {
        const configuredWrongPenalty = Number.isFinite(activeGame.pointsPerWrong)
          ? activeGame.pointsPerWrong
          : -10;
        const wrongPenalty = configuredWrongPenalty < 0 ? configuredWrongPenalty : -10;
        nextSession.groups[groupKey].score = Math.max(
          0,
          nextSession.groups[groupKey].score + wrongPenalty
        );
        turn.balloonLevel = Math.max(0, turn.balloonLevel - 1);
      }

      playAnswerFeedbackSound(isCorrect);
      assignNextBalloonQuestion(nextSession, groupKey);
      await persistSession(nextSession);
    },
    [activeGame, data, persistSession]
  );

  const answerBridgeQuestion = useCallback(
    async (isCorrect) => {
      if (
        !data ||
        data.phase !== "playing" ||
        data.roundStatus !== "running" ||
        activeGame?.id !== "bridge"
      ) {
        return;
      }

      const nextSession = clone(data);
      const groupKey = nextSession.activeGroup;
      const turn = nextSession.gameState.turns[groupKey];
      const currentQuestion = resolveCurrentBridgeQuestion(nextSession);

      if (!currentQuestion) {
        return;
      }

      turn.answered += 1;

      if (isCorrect) {
        turn.correct += 1;
        turn.questionIndex += 1;
        nextSession.groups[groupKey].score = Math.max(
          0,
          nextSession.groups[groupKey].score + 10
        );

        if (turn.questionIndex < (activeGame.targetSteps ?? BRIDGE_TARGET_STEPS)) {
          assignNextBridgeQuestion(nextSession, groupKey);
        } else {
          turn.currentQuestionId = null;
        }
      } else {
        nextSession.groups[groupKey].score = Math.max(
          0,
          nextSession.groups[groupKey].score - 10
        );
      }

      playAnswerFeedbackSound(isCorrect);
      await persistSession(nextSession);
    },
    [activeGame, data, persistSession]
  );


  const answerCupGuess = useCallback(
    async (isCorrect) => {
      if (
        !data ||
        data.phase !== "playing" ||
        data.roundStatus !== "running" ||
        activeGame?.id !== "cup"
      ) {
        return null;
      }

      const nextSession = clone(data);
      const groupKey = nextSession.activeGroup;
      const turn = nextSession.gameState.turns[groupKey];
      const roundsPerGroup = Math.max(
        1,
        Number(activeGame.roundsPerGroup) || CUP_ROUNDS_PER_GROUP
      );

      if (turn.questionIndex >= roundsPerGroup) {
        return turn.questionIndex;
      }

      turn.answered += 1;
      turn.questionIndex += 1;

      if (isCorrect) {
        turn.correct += 1;
        nextSession.groups[groupKey].score = Math.max(
          0,
          nextSession.groups[groupKey].score + (activeGame.pointsPerCorrect ?? 20)
        );
      } else {
        const configuredWrongPenalty = Number.isFinite(activeGame.pointsPerWrong)
          ? activeGame.pointsPerWrong
          : -10;
        const wrongPenalty = configuredWrongPenalty < 0 ? configuredWrongPenalty : -10;
        nextSession.groups[groupKey].score = Math.max(
          0,
          nextSession.groups[groupKey].score + wrongPenalty
        );
      }

      playAnswerFeedbackSound(isCorrect);
      await persistSession(nextSession);
      return turn.questionIndex;
    },
    [activeGame, data, persistSession]
  );

  const setPuzzleDifficulty = useCallback(async (difficultyKey) => {
    if (!data || data.phase !== "puzzleSetup") {
      return;
    }

    const nextSession = clone(data);
    nextSession.gameState.transition.puzzleDifficulty =
      getPuzzleDifficultyByKey(difficultyKey).key;
    await persistSession(nextSession);
  }, [data, persistSession]);

  const continueToPuzzle = useCallback(async () => {
    if (!data || data.phase !== "puzzleSetup") {
      return;
    }

    const nextSession = clone(data);
    const selectedDifficulty = getPuzzleDifficultyByKey(
      nextSession.gameState.transition.puzzleDifficulty
    );

    nextSession.games = nextSession.games.map((game) => {
      if (game.id !== "puzzle") {
        return game;
      }

      return {
        ...game,
        cols: selectedDifficulty.cols,
        rows: selectedDifficulty.rows
      };
    });
    nextSession.phase = "playing";
    nextSession.roundStatus = "idle";
    nextSession.activeGroup = "A";
    nextSession.gameState.turns = clone(defaultSession.gameState.turns);
    nextSession.timer = {
      durationSeconds: nextSession.games[nextSession.activeGameIndex]?.durationSeconds ?? 90,
      startedAt: null,
      endsAt: null
    };

    await persistSession(nextSession);
  }, [data, persistSession]);

  const jumpToDeveloperScene = useCallback(async (sceneKey) => {
    const currentSession = dataRef.current ?? normalizeSession(clone(defaultSession));
    const keepSettings = clone(currentSession.settings);
    const keepGroups = clone(currentSession.groups);
    const makeSession = (gameId = null) => {
      const session = createSessionForGame(gameId);
      session.settings = keepSettings;
      session.groups = keepGroups;
      return session;
    };
    let nextSession = makeSession();

    if (sceneKey === "intro") {
      nextSession = normalizeSession(clone(defaultSession));
      nextSession.settings = keepSettings;
      nextSession.groups = keepGroups;
    } else if (sceneKey === "balloon") {
      nextSession = makeSession("balloon");
    } else if (sceneKey === "worm") {
      nextSession = makeSession("worm");
    } else if (sceneKey === "bridge") {
      nextSession = makeSession("bridge");
    } else if (sceneKey === "cup") {
      nextSession = makeSession("cup");
    } else if (sceneKey === "match") {
      nextSession = makeSession("match");
    } else if (sceneKey === "pacman") {
      nextSession = makeSession("pacman");
    } else if (sceneKey === "puzzle") {
      nextSession = makeSession("puzzle");
    } else if (sceneKey === "puzzleSetup") {
      nextSession = makeSession("puzzle");
      nextSession.phase = "puzzleSetup";
      nextSession.roundStatus = "transition";
      nextSession.gameState.transition.puzzleDifficulty = "medium";
    } else if (sceneKey === "winner") {
      nextSession = makeSession("puzzle");
      nextSession.phase = "winner";
      nextSession.roundStatus = "complete";
    }

    await persistSession(nextSession);
    setSettingsOpen(false);
  }, [createSessionForGame, persistSession]);

  useEffect(() => {
    if (data?.roundStatus !== "running") {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(timerId);
  }, [data?.roundStatus]);

  useEffect(() => {
    if (!data || data.roundStatus !== "running" || timeLeft > 0) {
      return;
    }

    finishTurn();
  }, [data, finishTurn, timeLeft]);

  if (loadError) {
    return (
      <main className="app-screen center-screen">
        <div className="status-text">{loadError}</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="app-screen center-screen">
        <div className="status-text">Yükleniyor...</div>
      </main>
    );
  }

  if (settingsOpen) {
    const allQuestions = {
      balloon: {
        A: getQuestionsForGroup("balloon", "A", data.settings.customQuestions),
        B: getQuestionsForGroup("balloon", "B", data.settings.customQuestions)
      },
      worm: {
        A: getQuestionsForGroup("worm", "A", data.settings.customQuestions),
        B: getQuestionsForGroup("worm", "B", data.settings.customQuestions)
      },
      bridge: {
        A: getQuestionsForGroup("bridge", "A", data.settings.customQuestions),
        B: getQuestionsForGroup("bridge", "B", data.settings.customQuestions)
      }
    };

    return (
      <SettingsScreen
        allQuestions={allQuestions}
        customQuestions={data.settings.customQuestions}
        customPuzzles={data.settings.customPuzzles}
        customQuestionCounts={{
          balloon: {
            A: data.settings.customQuestions?.balloon?.A?.length ?? 0,
            B: data.settings.customQuestions?.balloon?.B?.length ?? 0
          },
          worm: {
            A: data.settings.customQuestions?.worm?.A?.length ?? 0,
            B: data.settings.customQuestions?.worm?.B?.length ?? 0
          },
          bridge: {
            A: data.settings.customQuestions?.bridge?.A?.length ?? 0,
            B: data.settings.customQuestions?.bridge?.B?.length ?? 0
          }
        }}
        developerMode={data.settings.developerMode}
        onAddCustomPuzzle={addCustomPuzzle}
        onAddQuestion={addCustomQuestion}
        onRemoveCustomPuzzle={removeCustomPuzzle}
        onRemoveQuestion={removeCustomQuestion}
        onClose={() => setSettingsOpen(false)}
        onToggleDeveloperMode={(enabled) => {
          void updateSettings((currentSettings) => ({
            ...currentSettings,
            developerMode: enabled
          }));
        }}
      />
    );
  }

  const settingsButton = data.settings.developerMode ? null : (
    <IconActionButton
      actionType="settings"
      className="small-button settings-open-button"
      onClick={() => setSettingsOpen(true)}
    />
  );

  const developerNav =
    data.settings.developerMode ? (
      <DeveloperQuickNav onJump={jumpToDeveloperScene} onOpenSettings={() => setSettingsOpen(true)} />
    ) : null;

  if (data.phase === "playing") {
    if (activeGame?.id === "worm") {
      return (
        <>
          <WormGame
            activeGame={activeGame}
            activeGroup={data.activeGroup}
            customQuestions={data.settings.customQuestions}
            groups={data.groups}
            isRunning={data.roundStatus === "running"}
            onAddScore={addScoreToActiveGroup}
            onReset={resetProgress}
            onStartTurn={startTurn}
            timeLeft={timeLeft}
          />
          {settingsButton}
          {developerNav}
        </>
      );
    }

    if (activeGame?.id === "bridge") {
      return (
        <>
          <BridgeGame
            activeGame={activeGame}
            activeGroup={data.activeGroup}
            activeTurn={activeTurn}
            groups={data.groups}
            isRunning={data.roundStatus === "running"}
            onAnswer={answerBridgeQuestion}
            onCompleteTurn={finishTurn}
            onReset={resetProgress}
            onStartTurn={startTurn}
            question={activeBridgeQuestion}
            timeLeft={timeLeft}
          />
          {settingsButton}
          {developerNav}
        </>
      );
    }

    if (activeGame?.id === "pacman") {
      return (
        <>
          <PacmanGame
            activeGame={activeGame}
            activeGroup={data.activeGroup}
            groups={data.groups}
            isRunning={data.roundStatus === "running"}
            onAddScore={addScoreToActiveGroup}
            onCompleteTurn={finishTurn}
            onReset={resetProgress}
            onStartTurn={startTurn}
            timeLeft={timeLeft}
          />
          {settingsButton}
          {developerNav}
        </>
      );
    }

    if (activeGame?.id === "puzzle") {
      return (
        <>
          <PuzzleGame
            activeGame={activeGame}
            activeGroup={data.activeGroup}
            customPuzzles={data.settings.customPuzzles}
            groups={data.groups}
            isRunning={data.roundStatus === "running"}
            onAddScore={addScoreToActiveGroup}
            onCompleteTurn={finishTurn}
            onReset={resetProgress}
            onStartTurn={startTurn}
            timeLeft={timeLeft}
          />
          {settingsButton}
          {developerNav}
        </>
      );
    }

    if (activeGame?.id === "match") {
      return (
        <>
          <MatchingGame
            activeGame={activeGame}
            activeGroup={data.activeGroup}
            groups={data.groups}
            isRunning={data.roundStatus === "running"}
            onAddScore={addScoreToActiveGroup}
            onCompleteTurn={finishTurn}
            onReset={resetProgress}
            onStartTurn={startTurn}
            timeLeft={timeLeft}
          />
          {settingsButton}
          {developerNav}
        </>
      );
    }


    if (activeGame?.id === "cup") {
      return (
        <>
          <CupGame
            activeGame={activeGame}
            activeGroup={data.activeGroup}
            activeTurn={activeTurn}
            groups={data.groups}
            isRunning={data.roundStatus === "running"}
            onCompleteTurn={finishTurn}
            onGuess={answerCupGuess}
            onReset={resetProgress}
            onStartTurn={startTurn}
            timeLeft={timeLeft}
          />
          {settingsButton}
          {developerNav}
        </>
      );
    }

    return (
      <>
        <BalloonGame
          activeGame={activeGame}
          activeGroup={data.activeGroup}
          activeTurn={activeTurn}
          groups={data.groups}
          isRunning={data.roundStatus === "running"}
          onAnswer={answerQuestion}
          onReset={resetProgress}
          onStartTurn={startTurn}
          question={activeBalloonQuestion}
          timeLeft={timeLeft}
        />
        {settingsButton}
        {developerNav}
      </>
    );
  }

  if (data.phase === "winner") {
    return (
      <>
        <WinnerScreen groups={data.groups} onRestart={resetProgress} />
        {settingsButton}
        {developerNav}
      </>
    );
  }


  if (data.phase === "puzzleSetup") {
    return (
      <>
        <PuzzleSetupScreen
          activeDifficulty={data.gameState.transition.puzzleDifficulty}
          onContinue={continueToPuzzle}
          onReset={resetProgress}
          onSetDifficulty={setPuzzleDifficulty}
        />
        {settingsButton}
        {developerNav}
      </>
    );
  }

  return (
    <>
      <IntroScreen onStart={startSession} />
      {settingsButton}
      {developerNav}
    </>
  );
}

function IntroScreen({ onStart }) {
  return (
    <main className="app-screen center-screen intro-screen">
      <img
        className="home-logo"
        src={appLogo}
        alt="Dijital Kahramanlar"
      />
      <button className="pixel-button start-button" onClick={onStart}>
        Başla
      </button>
    </main>
  );
}

function PixelResetIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="#fff3df"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* 8-bit pixelated reload arrow */}
      <rect x="9" y="1" width="2" height="6" />
      <rect x="11" y="2" width="2" height="4" />
      <rect x="13" y="3" width="2" height="2" />
      <rect x="4" y="2" width="5" height="2" />
      <rect x="2" y="4" width="2" height="2" />
      <rect x="1" y="6" width="2" height="4" />
      <rect x="2" y="10" width="2" height="2" />
      <rect x="4" y="12" width="6" height="2" />
      <rect x="10" y="10" width="2" height="2" />
      <rect x="11" y="7" width="2" height="3" />
    </svg>
  );
}

function IconActionButton({ actionType, className = "", onClick }) {
  const isSettings = actionType === "settings";
  const label = isSettings ? "Ayarlar" : "Sıfırla";

  return (
    <button
      aria-label={label}
      className={`pixel-button icon-button ${
        isSettings ? "settings-icon-button" : "reset-icon-button"
      } ${className}`.trim()}
      onClick={onClick}
      title={label}
      type="button"
    >
      {isSettings ? (
        <span aria-hidden="true" className="icon-glyph settings-glyph" />
      ) : (
        <PixelResetIcon />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function CelebrationBurst({ burst }) {
  if (!burst?.id) {
    return null;
  }

  return (
    <div
      className="mini-confetti"
      key={burst.id}
      style={{ left: burst.x, top: burst.y }}
    >
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function DeveloperQuickNav({ onJump, onOpenSettings }) {
  const quickLinks = [
    { key: "intro", label: "Ana" },
    { key: "balloon", label: "Balon" },
    { key: "worm", label: "Yılan" },
    { key: "bridge", label: "Boşluk" },
    { key: "cup", label: "Bardak" },
    { key: "match", label: "Eşleştir" },
    { key: "pacman", label: "Pacman" },
    { key: "puzzleSetup", label: "Puzzle Seç" },
    { key: "puzzle", label: "Puzzle" },
    { key: "winner", label: "Kazanan" }
  ];

  return (
    <aside className="developer-nav" aria-label="Geliştirici Kısayolları">
      <IconActionButton
        actionType="settings"
        className="tiny-button developer-settings-icon"
        onClick={onOpenSettings}
      />
      {quickLinks.map((link) => (
        <button
          className="pixel-button tiny-button"
          key={link.key}
          onClick={() => onJump(link.key)}
          type="button"
        >
          {link.label}
        </button>
      ))}
    </aside>
  );
}

function QuestionAdder({
  count,
  gameId,
  groupKey,
  label,
  allQuestions,
  onAddQuestion,
  onRemoveQuestion,
  showPointValue = false
}) {
  const [questionText, setQuestionText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("Doğru");
  const [pointValue, setPointValue] = useState(20);
  const [statusText, setStatusText] = useState("");

  const submitForm = useCallback(async (event) => {
    event.preventDefault();
    const saved = await onAddQuestion({
      gameId,
      groupKey,
      questionText,
      correctAnswer,
      pointValue
    });

    if (saved) {
      setQuestionText("");
      setStatusText("Soru eklendi.");
      return;
    }

    setStatusText("Lütfen soru metni gir.");
  }, [correctAnswer, gameId, groupKey, onAddQuestion, pointValue, questionText]);

  const removeQuestion = useCallback(async (questionId) => {
    const removed = await onRemoveQuestion({ gameId, groupKey, questionId });
    setStatusText(removed ? "Soru silindi." : "Soru silinemedi.");
  }, [gameId, groupKey, onRemoveQuestion]);

  return (
    <form className="settings-form-card" onSubmit={submitForm}>
      <h4>{label}</h4>
      <small>{count} özel soru</small>
      <textarea
        onChange={(event) => setQuestionText(event.target.value)}
        placeholder="Soru metni"
        rows={3}
        value={questionText}
      />
      <div className="settings-row">
        <label>
          Doğru Cevap
          <select
            onChange={(event) => setCorrectAnswer(event.target.value)}
            value={correctAnswer}
          >
            <option value="Doğru">Doğru</option>
            <option value="Yanlış">Yanlış</option>
          </select>
        </label>
        {showPointValue ? (
          <label>
            Puan
            <select
              onChange={(event) => setPointValue(Number(event.target.value))}
              value={pointValue}
            >
              {WORM_VALUE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <button className="pixel-button small-button" type="submit">
        Soru Ekle
      </button>
      {statusText ? <p className="settings-status">{statusText}</p> : null}
      <div className="saved-list">
        {allQuestions.length === 0 ? (
          <div className="saved-item-empty">Kayıtlı soru yok.</div>
        ) : (
          allQuestions.map((question) => {
            const trueOption = getAnswerChoices(question).find(
              (choice) => choice.text === "Doğru"
            );
            const correctLabel = trueOption?.isCorrect ? "Doğru" : "Yanlış";
            const isCustomQuestion = String(question.id || "").startsWith("custom-");

            return (
              <div className="saved-item" key={question.id}>
                <div className="saved-item-content">
                  <strong>{question.question}</strong>
                  <small>
                    Kaynak: {isCustomQuestion ? "Özel" : "Hazır"} |{" "}
                    Cevap: {correctLabel}
                    {showPointValue ? ` | Puan: ${getWormPointValue(question, 0)}` : ""}
                  </small>
                </div>
                {isCustomQuestion ? (
                  <button
                    className="pixel-button tiny-button false-answer-button"
                    onClick={() => removeQuestion(question.id)}
                    type="button"
                  >
                    Sil
                  </button>
                ) : (
                  <span className="saved-item-lock">Kilitli</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </form>
  );
}

function FillBlankQuestionAdder({
  count,
  gameId,
  groupKey,
  label,
  allQuestions,
  onAddQuestion,
  onRemoveQuestion
}) {
  const [questionText, setQuestionText] = useState("");
  const [correctOptionText, setCorrectOptionText] = useState("");
  const [wrongOptionsText, setWrongOptionsText] = useState("");
  const [statusText, setStatusText] = useState("");

  const submitForm = useCallback(async (event) => {
    event.preventDefault();
    const safeQuestionText = String(questionText ?? "").trim();
    const safeCorrectOptionText = String(correctOptionText ?? "").trim();
    const safeWrongOptions = String(wrongOptionsText ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!safeQuestionText || !safeCorrectOptionText) {
      setStatusText("Cümle ve doğru seçenek zorunlu.");
      return;
    }

    const saved = await onAddQuestion({
      gameId,
      groupKey,
      questionText: safeQuestionText,
      correctOptionText: safeCorrectOptionText,
      wrongOptionTexts: safeWrongOptions
    });

    if (saved) {
      setQuestionText("");
      setCorrectOptionText("");
      setWrongOptionsText("");
      setStatusText("Soru eklendi.");
      return;
    }

    setStatusText("Soru eklenemedi.");
  }, [
    correctOptionText,
    gameId,
    groupKey,
    onAddQuestion,
    questionText,
    wrongOptionsText
  ]);

  const removeQuestion = useCallback(async (questionId) => {
    const removed = await onRemoveQuestion({ gameId, groupKey, questionId });
    setStatusText(removed ? "Soru silindi." : "Soru silinemedi.");
  }, [gameId, groupKey, onRemoveQuestion]);

  return (
    <form className="settings-form-card" onSubmit={submitForm}>
      <h4>{label}</h4>
      <small>{count} özel soru</small>
      <textarea
        onChange={(event) => setQuestionText(event.target.value)}
        placeholder="Boşluklu cümle (ör: Güçlü bir ____ seçmeliyiz.)"
        rows={3}
        value={questionText}
      />
      <label>
        Doğru Seçenek
        <input
          onChange={(event) => setCorrectOptionText(event.target.value)}
          placeholder="Örn: şifre"
          type="text"
          value={correctOptionText}
        />
      </label>
      <label>
        Yanlış Seçenekler (virgülle)
        <input
          onChange={(event) => setWrongOptionsText(event.target.value)}
          placeholder="Örn: renk, oyuncak"
          type="text"
          value={wrongOptionsText}
        />
      </label>
      <button className="pixel-button small-button" type="submit">
        Soru Ekle
      </button>
      {statusText ? <p className="settings-status">{statusText}</p> : null}
      <div className="saved-list">
        {allQuestions.length === 0 ? (
          <div className="saved-item-empty">Kayıtlı soru yok.</div>
        ) : (
          allQuestions.map((question) => {
            const isCustomQuestion = String(question.id || "").startsWith("custom-");
            const correctChoice = getCorrectAnswerChoice(question);
            const optionsText = getAnswerChoices(question)
              .map((choice) => choice.text)
              .join(" | ");

            return (
              <div className="saved-item" key={question.id}>
                <div className="saved-item-content">
                  <strong>{question.question}</strong>
                  <small>
                    Kaynak: {isCustomQuestion ? "Özel" : "Hazır"} |{" "}
                    Doğru: {correctChoice?.text ?? "-"}
                  </small>
                  <small>Şıklar: {optionsText}</small>
                </div>
                {isCustomQuestion ? (
                  <button
                    className="pixel-button tiny-button false-answer-button"
                    onClick={() => removeQuestion(question.id)}
                    type="button"
                  >
                    Sil
                  </button>
                ) : (
                  <span className="saved-item-lock">Kilitli</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </form>
  );
}

function BalloonQuestionAdder({
  count,
  gameId = "balloon",
  groupKey,
  label,
  allQuestions,
  onAddQuestion,
  onRemoveQuestion
}) {
  const [questionText, setQuestionText] = useState("");
  const [correctOptionText, setCorrectOptionText] = useState("");
  const [wrongOption1, setWrongOption1] = useState("");
  const [wrongOption2, setWrongOption2] = useState("");
  const [wrongOption3, setWrongOption3] = useState("");
  const [wrongOption4, setWrongOption4] = useState("");
  const [statusText, setStatusText] = useState("");

  const submitForm = useCallback(async (event) => {
    event.preventDefault();
    const safeQuestionText = String(questionText ?? "").trim();
    const safeCorrectOptionText = String(correctOptionText ?? "").trim();
    const safeWrongOptions = [wrongOption1, wrongOption2, wrongOption3, wrongOption4]
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);

    if (!safeQuestionText || !safeCorrectOptionText) {
      setStatusText("Soru metni ve doğru seçenek zorunludur.");
      return;
    }

    if (safeWrongOptions.length < 1) {
      setStatusText("En az bir yanlış seçenek giriniz (önerilen: 4 seçenek).");
      return;
    }

    const saved = await onAddQuestion({
      gameId: "balloon",
      groupKey,
      questionText: safeQuestionText,
      correctOptionText: safeCorrectOptionText,
      wrongOptionTexts: safeWrongOptions
    });

    if (saved) {
      setQuestionText("");
      setCorrectOptionText("");
      setWrongOption1("");
      setWrongOption2("");
      setWrongOption3("");
      setWrongOption4("");
      setStatusText("Balon sorusu başarıyla eklendi.");
      return;
    }

    setStatusText("Soru eklenemedi.");
  }, [
    correctOptionText,
    groupKey,
    onAddQuestion,
    questionText,
    wrongOption1,
    wrongOption2,
    wrongOption3,
    wrongOption4
  ]);

  const removeQuestion = useCallback(async (questionId) => {
    const removed = await onRemoveQuestion({ gameId: "balloon", groupKey, questionId });
    setStatusText(removed ? "Soru silindi." : "Soru silinemedi.");
  }, [groupKey, onRemoveQuestion]);

  return (
    <form className="settings-form-card" onSubmit={submitForm}>
      <h4>{label}</h4>
      <small>{count} özel balon sorusu</small>
      <textarea
        onChange={(event) => setQuestionText(event.target.value)}
        placeholder="Soru metni (ör: Hangisi güçlü bir şifredir?)"
        rows={2}
        value={questionText}
      />
      <div className="settings-field-group">
        <label>
          Doğru Balon Seçeneği
          <input
            onChange={(event) => setCorrectOptionText(event.target.value)}
            placeholder="Doğru cevap (ör: k7!mP9x#)"
            type="text"
            value={correctOptionText}
          />
        </label>
      </div>
      <div className="settings-field-group">
        <label>Yanlış Balon Seçenekleri (4 Adet)</label>
        <div className="settings-wrong-options-grid">
          <input
            onChange={(event) => setWrongOption1(event.target.value)}
            placeholder="Yanlış 1 (ör: 123456)"
            type="text"
            value={wrongOption1}
          />
          <input
            onChange={(event) => setWrongOption2(event.target.value)}
            placeholder="Yanlış 2 (ör: advesoyad)"
            type="text"
            value={wrongOption2}
          />
          <input
            onChange={(event) => setWrongOption3(event.target.value)}
            placeholder="Yanlış 3 (ör: 000000)"
            type="text"
            value={wrongOption3}
          />
          <input
            onChange={(event) => setWrongOption4(event.target.value)}
            placeholder="Yanlış 4 (ör: dogumyili)"
            type="text"
            value={wrongOption4}
          />
        </div>
      </div>
      <button className="pixel-button small-button" type="submit">
        Balon Sorusu Ekle
      </button>
      {statusText ? <p className="settings-status">{statusText}</p> : null}
      <div className="saved-list">
        {allQuestions.length === 0 ? (
          <div className="saved-item-empty">Kayıtlı soru yok.</div>
        ) : (
          allQuestions.map((question) => {
            const isCustomQuestion = String(question.id || "").startsWith("custom-");
            const choices = getAnswerChoices(question);
            const correctChoice = choices.find((c) => c?.isCorrect);
            const wrongChoices = choices.filter((c) => !c?.isCorrect);

            return (
              <div className="saved-item" key={question.id}>
                <div className="saved-item-content">
                  <strong>{question.question}</strong>
                  <small>
                    Kaynak: {isCustomQuestion ? "Özel" : "Hazır"} | Doğru: <strong>{correctChoice?.text ?? "-"}</strong>
                  </small>
                  {wrongChoices.length > 0 && (
                    <small>Yanlışlar: {wrongChoices.map((w) => w.text).join(", ")}</small>
                  )}
                </div>
                {isCustomQuestion ? (
                  <button
                    className="pixel-button tiny-button false-answer-button"
                    onClick={() => removeQuestion(question.id)}
                    type="button"
                  >
                    Sil
                  </button>
                ) : (
                  <span className="saved-item-lock">Kilitli</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </form>
  );
}

function SettingsScreen({
  allQuestions,
  customQuestions,
  customPuzzles,
  customQuestionCounts,
  developerMode,
  onAddCustomPuzzle,
  onAddQuestion,
  onRemoveCustomPuzzle,
  onRemoveQuestion,
  onClose,
  onToggleDeveloperMode
}) {
  const [puzzleStatus, setPuzzleStatus] = useState("");

  const handlePuzzleFile = useCallback((event) => {
    const file = event.target.files?.[0];
    const inputElement = event.target;
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const imageUrl = typeof reader.result === "string" ? reader.result : "";
      const saved = await onAddCustomPuzzle(imageUrl);
      setPuzzleStatus(saved ? "Puzzle görseli eklendi." : "Puzzle eklenemedi.");
      inputElement.value = "";
    };
    reader.readAsDataURL(file);
  }, [onAddCustomPuzzle]);

  return (
    <main className="app-screen game-screen settings-screen">
      <header className="settings-header">
        <h2>Ayarlar</h2>
        <button className="pixel-button small-button" onClick={onClose} type="button">
          Kapat
        </button>
      </header>
      <section className="settings-panel">
        <div className="settings-toggle-row">
          <span>Geliştirici Modu</span>
          <label className="settings-toggle">
            <input
              checked={developerMode}
              onChange={(event) => onToggleDeveloperMode(event.target.checked)}
              type="checkbox"
            />
            <span>{developerMode ? "Açık" : "Kapalı"}</span>
          </label>
        </div>

        <h3>Balon Oyunu Soruları</h3>
        <div className="settings-grid two-col">
          <BalloonQuestionAdder
            count={customQuestionCounts.balloon.A}
            gameId="balloon"
            groupKey="A"
            allQuestions={allQuestions.balloon.A}
            label="A Grubu"
            onAddQuestion={onAddQuestion}
            onRemoveQuestion={onRemoveQuestion}
          />
          <BalloonQuestionAdder
            count={customQuestionCounts.balloon.B}
            gameId="balloon"
            groupKey="B"
            allQuestions={allQuestions.balloon.B}
            label="B Grubu"
            onAddQuestion={onAddQuestion}
            onRemoveQuestion={onRemoveQuestion}
          />
        </div>

        <h3>Yılan Oyunu Soruları</h3>
        <div className="settings-grid two-col">
          <QuestionAdder
            count={customQuestionCounts.worm.A}
            gameId="worm"
            groupKey="A"
            allQuestions={allQuestions.worm.A}
            label="A Grubu"
            onAddQuestion={onAddQuestion}
            onRemoveQuestion={onRemoveQuestion}
            showPointValue
          />
          <QuestionAdder
            count={customQuestionCounts.worm.B}
            gameId="worm"
            groupKey="B"
            allQuestions={allQuestions.worm.B}
            label="B Grubu"
            onAddQuestion={onAddQuestion}
            onRemoveQuestion={onRemoveQuestion}
            showPointValue
          />
        </div>

        <h3>Boşluk Doldurma Soruları</h3>
        <div className="settings-grid two-col">
          <FillBlankQuestionAdder
            count={customQuestionCounts.bridge.A}
            gameId="bridge"
            groupKey="A"
            allQuestions={allQuestions.bridge.A}
            label="A Grubu"
            onAddQuestion={onAddQuestion}
            onRemoveQuestion={onRemoveQuestion}
          />
          <FillBlankQuestionAdder
            count={customQuestionCounts.bridge.B}
            gameId="bridge"
            groupKey="B"
            allQuestions={allQuestions.bridge.B}
            label="B Grubu"
            onAddQuestion={onAddQuestion}
            onRemoveQuestion={onRemoveQuestion}
          />
        </div>


        <h3>Puzzle Görseli Ekle</h3>
        <div className="settings-upload">
          <label className="settings-file">
            <span>Görsel Seç</span>
            <input accept="image/*" onChange={handlePuzzleFile} type="file" />
          </label>
          <strong>{customPuzzles.length} özel puzzle görseli</strong>
        </div>
        <div className="puzzle-list">
          {customPuzzles.length === 0 ? (
            <div className="saved-item-empty">Kayıtlı puzzle görseli yok.</div>
          ) : (
            customPuzzles.map((puzzle, index) => (
              <div className="puzzle-item" key={puzzle.id}>
                <img alt={`Puzzle ${index + 1}`} src={puzzle.imageUrl} />
                <button
                  className="pixel-button tiny-button false-answer-button"
                  onClick={() => {
                    void onRemoveCustomPuzzle(puzzle.id);
                  }}
                  type="button"
                >
                  Sil
                </button>
              </div>
            ))
          )}
        </div>
        {puzzleStatus ? <p className="settings-status">{puzzleStatus}</p> : null}
      </section>
    </main>
  );
}

function PuzzleSetupScreen({ activeDifficulty, onContinue, onReset, onSetDifficulty }) {
  return (
    <main className="app-screen center-screen game-screen puzzle-setup-screen">
      <section className="puzzle-setup-panel">
        <h2>Puzzle Zorluğunu Seç</h2>
        <div className="difficulty-options">
          {PUZZLE_DIFFICULTY_OPTIONS.map((option) => (
            <button
              className={`pixel-button small-button ${
                activeDifficulty === option.key ? "true-answer-button" : ""
              }`}
              key={option.key}
              onClick={() => onSetDifficulty(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="puzzle-setup-actions">
          <button className="pixel-button start-button" onClick={onContinue} type="button">
            Devam Et
          </button>
          <IconActionButton actionType="reset" className="small-button reset-button-static" onClick={onReset} />
        </div>
      </section>
    </main>
  );
}

const BALLOON_COLORS = ["#FF6B6B","#4ECDC4","#FFE66D","#A8E6CF","#FF8B94","#DDA0DD","#87CEEB","#FFA07A","#98FB98","#F0E68C"];
const BALLOON_POSITIONS = [
  {x:10,y:38},{x:25,y:55},{x:42,y:32},{x:55,y:58},{x:72,y:35},{x:85,y:55},
  {x:15,y:68},{x:35,y:72},{x:50,y:45},{x:65,y:68},{x:80,y:42},{x:30,y:42}
];

const BALLOON_PALETTES = [
  { main: "#ff598f", light: "#ff9ebb", dark: "#c9184a" },
  { main: "#00b4d8", light: "#90e0ef", dark: "#0077b6" },
  { main: "#ffb703", light: "#ffe169", dark: "#fb8500" },
  { main: "#06d6a0", light: "#80ed99", dark: "#059669" },
  { main: "#a370f7", light: "#d8bbff", dark: "#7928ca" }
];

function BalloonGame({
  activeGame,
  activeGroup,
  activeTurn,
  groups,
  isRunning,
  onAnswer,
  onReset,
  onStartTurn,
  question,
  timeLeft
}) {
  const [burst, setBurst] = useState(null);
  const [shakingIndex, setShakingIndex] = useState(null);
  const [questionAnimKey, setQuestionAnimKey] = useState(0);

  const fallbackQuestion = normalizeQuestion(
    getFallbackQuestions("balloon", activeGroup)[0],
    0,
    activeGroup,
    "balloon"
  );
  const visibleQuestion = question ?? fallbackQuestion;

  const choices = useMemo(() => {
    const rawChoices = getAnswerChoices(visibleQuestion);
    let correct = rawChoices.find((c) => c?.isCorrect);
    let wrongs = rawChoices.filter((c) => !c?.isCorrect);

    if (!correct) {
      correct = { text: "Doğru Seçenek", isCorrect: true };
    }

    if (wrongs.length < 4) {
      const fallbackBank = getFallbackQuestions("balloon", activeGroup);
      const poolWrongs = [];
      for (const q of fallbackBank) {
        if (q.id === visibleQuestion?.id) continue;
        for (const opt of getAnswerChoices(q)) {
          if (
            !opt.isCorrect &&
            opt.text &&
            opt.text !== correct.text &&
            !wrongs.some((w) => w.text === opt.text) &&
            !poolWrongs.some((w) => w.text === opt.text)
          ) {
            poolWrongs.push(opt);
          }
        }
      }
      wrongs = [...wrongs, ...shuffle(poolWrongs).slice(0, 4 - wrongs.length)];
    }

    const selectedWrongs = shuffle(wrongs).slice(0, 4);
    return shuffle([correct, ...selectedWrongs]);
  }, [visibleQuestion, activeGroup]);

  const balloonElementsRef = useRef([]);
  const entranceStartTimeRef = useRef(0);
  const physicsRef = useRef([
    { baseX: 80, y: 800, baseSpeed: 55, speedWaveFreq: 0.6, speedWaveAmp: 9, speedWavePhase: 0.2, swayAmp: 16, swayFreq: 0.5, swayPhase: 0.2, tiltAmp: 2.5, swayTime: 0 },
    { baseX: 280, y: 880, baseSpeed: 50, speedWaveFreq: 0.5, speedWaveAmp: 8, speedWavePhase: 1.5, swayAmp: 18, swayFreq: 0.6, swayPhase: 1.5, tiltAmp: 3.0, swayTime: 0 },
    { baseX: 500, y: 960, baseSpeed: 60, speedWaveFreq: 0.7, speedWaveAmp: 10, speedWavePhase: 2.8, swayAmp: 15, swayFreq: 0.45, swayPhase: 2.8, tiltAmp: 2.2, swayTime: 0 },
    { baseX: 740, y: 1040, baseSpeed: 52, speedWaveFreq: 0.55, speedWaveAmp: 9, speedWavePhase: 4.1, swayAmp: 19, swayFreq: 0.55, swayPhase: 4.1, tiltAmp: 3.2, swayTime: 0 },
    { baseX: 980, y: 1120, baseSpeed: 58, speedWaveFreq: 0.65, speedWaveAmp: 9, speedWavePhase: 5.3, swayAmp: 17, swayFreq: 0.65, swayPhase: 5.3, tiltAmp: 2.8, swayTime: 0 }
  ]);

  const resetBalloonPositions = useCallback(() => {
    entranceStartTimeRef.current = performance.now();
    const W = typeof window !== "undefined" ? window.innerWidth : 1200;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;
    const usableWidth = Math.max(400, W - 220);
    const bandWidth = usableWidth / 5;

    // Start all 5 balloons staggered right below the bottom of the screen
    const verticalSlots = shuffle([
      H * 0.92,
      H * 1.02,
      H * 1.12,
      H * 1.22,
      H * 1.32
    ]);
    const laneSlots = shuffle([0, 1, 2, 3, 4]);

    physicsRef.current.forEach((b, i) => {
      const laneIndex = laneSlots[i];
      const slotX = 25 + laneIndex * bandWidth + Math.random() * Math.max(10, bandWidth - 180);
      b.baseX = Math.max(20, Math.min(W - 195, slotX));
      b.y = verticalSlots[i] + (Math.random() * 20 - 10);
      b.baseSpeed = 45 + Math.random() * 20;
      b.speedWaveFreq = 0.45 + Math.random() * 0.35;
      b.speedWaveAmp = 8 + Math.random() * 6;
      b.speedWavePhase = Math.random() * Math.PI * 2;
      b.swayAmp = 14 + Math.random() * 8;
      b.swayFreq = 0.45 + Math.random() * 0.3;
      b.swayPhase = Math.random() * Math.PI * 2;
      b.tiltAmp = 2.0 + Math.random() * 2.0;
      b.swayTime = Math.random() * 10;
    });
  }, []);

  // When round starts or when a new question arrives, scatter balloons across fresh random positions
  useEffect(() => {
    if (!isRunning) return;
    resetBalloonPositions();
    setQuestionAnimKey((k) => k + 1);
  }, [visibleQuestion?.id, isRunning, resetBalloonPositions]);

  // Continuous RAF physics loop
  useEffect(() => {
    if (!isRunning) return;

    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      const W = typeof window !== "undefined" ? window.innerWidth : 1200;
      const H = typeof window !== "undefined" ? window.innerHeight : 800;

      // Fast initial entrance boost: during the first 1.8 seconds, balloons rush up from bottom
      const entranceElapsed = (currentTime - entranceStartTimeRef.current) / 1000;
      let entranceBoost = 0;
      if (entranceElapsed < 1.2) {
        const p = 1 - entranceElapsed / 1.2;
        entranceBoost = p * p * 350;
      }

      // Atmospheric thermal / wind pulse across the scene
      const globalGust = Math.sin(currentTime / 2400) * 5;

      physicsRef.current.forEach((b, i) => {
        // Natural speed variation: sometimes faster, sometimes slower
        const speedWave = Math.sin(b.swayTime * b.speedWaveFreq + b.speedWavePhase) * b.speedWaveAmp;
        const currentSpeed = Math.max(30, b.baseSpeed + speedWave + globalGust + entranceBoost);

        b.y -= currentSpeed * dt;
        b.swayTime += dt;
        const sway = Math.sin(b.swayTime * b.swayFreq + b.swayPhase) * b.swayAmp;
        const tilt = Math.sin(b.swayTime * b.swayFreq + b.swayPhase) * b.tiltAmp;
        const curX = Math.max(16, Math.min(W - 195, b.baseX + sway));

        if (b.y < -260) {
          b.y = H + 30 + Math.random() * 70;
          b.baseX = 20 + Math.random() * (W - 200);
      b.baseSpeed = 45 + Math.random() * 20;
      b.speedWaveFreq = 0.45 + Math.random() * 0.35;
      b.speedWaveAmp = 8 + Math.random() * 6;
      b.speedWavePhase = Math.random() * Math.PI * 2;
      b.swayFreq = 0.45 + Math.random() * 0.3;
      b.swayPhase = Math.random() * Math.PI * 2;
      b.swayAmp = 14 + Math.random() * 8;
        }

        const el = balloonElementsRef.current[i];
        if (el) {
          el.style.transform = `translate3d(${curX}px, ${b.y}px, 0) rotate(${tilt}deg)`;
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  const handleBalloonClick = useCallback(
    (choice, index) => {
      if (choice?.isCorrect) {
        // ONLY play pop sound on correct answer!
        const popAudio = new Audio(balloonPopSfx);
        popAudio.currentTime = 0;
        popAudio.volume = 0.95;
        popAudio.play().catch(() => {});

        setBurst((p) => nextBurstState(p));
        onAnswer(true);
      } else {
        // Wrong answer: DO NOT play balloonPopSfx!
        setShakingIndex(index);
        setTimeout(() => {
          setShakingIndex((curr) => (curr === index ? null : curr));
        }, 500);
        onAnswer(false);
      }
    },
    [onAnswer]
  );

  return (
    <main className="app-screen game-screen balloon-new-screen">
      <header className="game-header">
        <ScoreBox label="A Grubu" score={groups.A.score} active={activeGroup === "A"} />
        <div className="timer-box">{formatTime(timeLeft)}</div>
        <ScoreBox label="B Grubu" score={groups.B.score} active={activeGroup === "B"} />
      </header>

      {!isRunning ? (
        <section className="turn-start" aria-label="Tur başlangıcı">
          <div className="turn-label">{groups[activeGroup].name}</div>
          <button className="pixel-button start-button" onClick={onStartTurn}>
            Başlat
          </button>
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
        </section>
      ) : (
        <section className="balloon-new-stage">
          <IconActionButton actionType="reset" className="small-button reset-button balloon-reset-btn" onClick={onReset} />
          <div className="balloon-question-panel">
            <span className="balloon-chapter-label">KAPI 1</span>
            <h2 className="balloon-question-text">{visibleQuestion?.question || "Soru yükleniyor..."}</h2>
            <p className="balloon-subtitle">Doğru cevabı taşıyan balonu patlat.</p>
          </div>
          <CelebrationBurst burst={burst} />
        </section>
      )}

      {isRunning ? (
        <div className="balloons-flying-layer" aria-label="Uçan Balonlar">
          {choices.map((choice, i) => {
            const palette = BALLOON_PALETTES[i % BALLOON_PALETTES.length];
            const textLen = choice?.text?.length ?? 0;
            const labelFontSize = textLen > 24 ? "0.95rem" : textLen > 14 ? "1.08rem" : "1.22rem";
            const isShaking = shakingIndex === i;

            return (
              <button
                key={`balloon-slot-${i}`}
                ref={(el) => {
                  balloonElementsRef.current[i] = el;
                }}
                className={`floating-balloon ${isShaking ? "wrong-shake" : ""}`}
                style={{
                  "--balloon-color": palette.main,
                  "--balloon-light": palette.light,
                  "--balloon-dark": palette.dark
                }}
                onClick={() => handleBalloonClick(choice, i)}
                type="button"
              >
                <div
                  className="balloon-body spawn-in"
                  key={`balloon-body-${questionAnimKey}-${i}`}
                >
                  <div className="balloon-shine-main" />
                  <div className="balloon-shine-sec" />
                  <span
                    className="balloon-label"
                    style={{ fontSize: labelFontSize }}
                  >
                    {choice?.text || "Seçenek"}
                  </span>
                </div>
                <div className="balloon-knot" />
                <svg className="balloon-string-svg" viewBox="0 0 24 85">
                  <path d="M12,0 Q4,25 16,50 T12,85" stroke="#2b1613" strokeWidth="3" fill="none" />
                </svg>
              </button>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}

function ScoreBox({ active, label, score }) {
  return (
    <div className={`score-box ${active ? "active" : ""}`}>
      <span>{label}</span>
      <strong>{score}</strong>
    </div>
  );
}

function FlagModel({ position = [0, 0, 0], scale = [0.72, 0.72, 0.72], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(flagGlb);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);
  return <primitive object={cloned} position={position} scale={scale} rotation={rotation} />;
}

function PalmTreeModel({ position = [0, 0, 0], scale = [0.38, 0.38, 0.38], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(palmTreeGlb);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);
  return <primitive object={cloned} position={position} scale={scale} rotation={rotation} />;
}

function ChestModel({ position = [0, 0, 0], scale = [0.36, 0.36, 0.36], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(chestGlb);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);
  return <primitive object={cloned} position={position} scale={scale} rotation={rotation} />;
}

function GrassPlantModel({ position = [0, 0, 0], scale = [0.24, 0.24, 0.24], rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(grassPlantGlb);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);
  return <primitive object={cloned} position={position} scale={scale} rotation={rotation} />;
}

function BeachIsland({ position, rotation = [0, 0, 0], isDestination = false }) {
  const reefGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(2.7, 3.2, 0.35, 9);
    geo.computeVertexNormals();
    return geo;
  }, []);

  const beachGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(2.3, 2.8, 0.34, 9);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0) {
        const angle = Math.atan2(pos.getZ(i), pos.getX(i));
        const rMod = 1 + 0.12 * Math.sin(angle * 2.5) + 0.06 * Math.cos(angle * 4);
        pos.setX(i, pos.getX(i) * rMod);
        pos.setZ(i, pos.getZ(i) * rMod);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const grassGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1.65, 2.05, 0.16, 9);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0) {
        const angle = Math.atan2(pos.getZ(i), pos.getX(i));
        const rMod = 1 + 0.1 * Math.sin(angle * 3);
        pos.setX(i, pos.getX(i) * rMod);
        pos.setZ(i, pos.getZ(i) * rMod);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* Sualtı kaya temeli */}
      <mesh geometry={reefGeo} position={[0, -0.22, 0]} receiveShadow>
        <meshStandardMaterial color="#264448" roughness={0.92} flatShading />
      </mesh>

      {/* Islak kum ve kıyı köpüğü halkası */}
      <mesh position={[0, -0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.65, 2.95, 18]} />
        <meshBasicMaterial color="#e0f7fa" transparent opacity={0.4} />
      </mesh>

      {/* Low-poly altın kumsal gövdesi */}
      <mesh geometry={beachGeo} position={[0, -0.04, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#e5c875" roughness={0.92} flatShading />
      </mesh>

      {/* Üst çimenlik plato */}
      <mesh geometry={grassGeo} position={[0, 0.18, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#54a83b" roughness={0.88} flatShading />
      </mesh>

      {/* Ada tipine göre çevre detayları */}
      {!isDestination ? (
        <>
          <PalmTreeModel position={[-0.85, 0.22, -0.55]} scale={[0.36, 0.36, 0.36]} rotation={[0.08, 0.35, -0.12]} />
          <GrassPlantModel position={[-0.45, 0.26, -0.45]} scale={[0.22, 0.22, 0.22]} />
          <GrassPlantModel position={[-0.7, 0.26, 0.4]} scale={[0.2, 0.2, 0.2]} />
          <mesh position={[0.9, 0.12, 0]} rotation={[0, 0, -0.05]} castShadow receiveShadow>
            <boxGeometry args={[0.55, 0.05, 0.45]} />
            <meshStandardMaterial color="#7a4b22" roughness={0.85} flatShading />
          </mesh>
        </>
      ) : (
        <>
          <PalmTreeModel position={[0.9, 0.22, -0.55]} scale={[0.38, 0.38, 0.38]} rotation={[-0.08, -0.45, 0.12]} />
          <ChestModel position={[0.62, 0.26, 0.45]} scale={[0.38, 0.38, 0.38]} rotation={[0, -Math.PI / 3.5, 0]} />
          <FlagModel position={[0.42, 0.26, -0.45]} scale={[0.72, 0.72, 0.72]} rotation={[0, -Math.PI / 4, 0]} />
          <GrassPlantModel position={[0.18, 0.26, -0.65]} scale={[0.24, 0.24, 0.24]} />
          <GrassPlantModel position={[0.3, 0.26, 0.6]} scale={[0.2, 0.2, 0.2]} />
        </>
      )}
    </group>
  );
}

const ROCK_GLB_MAP = [rockAGlb, rockBGlb, rockCGlb, rockAGlb, rockBGlb];
const ROCK_SCALES = [
  [0.34, 0.22, 0.34],
  [0.34, 0.175, 0.34],
  [0.40, 0.27, 0.40],
  [0.34, 0.22, 0.34],
  [0.34, 0.175, 0.34]
];
const ROCK_ROTATIONS = [
  [0, 0.2, 0],
  [0, -0.85, 0],
  [0, 1.35, 0],
  [0, -1.9, 0],
  [0, 0.95, 0]
];

function Rock3D({ index = 0, position, isCurrent, isPassed, isTarget }) {
  const modelUrl = ROCK_GLB_MAP[index % ROCK_GLB_MAP.length];
  const { scene } = useGLTF(modelUrl);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  const scale = ROCK_SCALES[index % ROCK_SCALES.length];
  const rotation = ROCK_ROTATIONS[index % ROCK_ROTATIONS.length];

  return (
    <group position={position}>
      <primitive object={cloned} scale={scale} rotation={rotation} />

      {/* Su yüzeyi köpük dalgası */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.78, 16]} />
        <meshBasicMaterial color="#d4f1f9" transparent opacity={0.35} />
      </mesh>

      {/* Sıradaki hedef taş vurgusu (yeşil halka) */}
      {isTarget ? (
        <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.68, 24]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.85} />
        </mesh>
      ) : null}

      {/* Robotun üzerinde bulunduğu aktif taş vurgusu (mavi halka) */}
      {isCurrent ? (
        <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.52, 0.65, 24]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.75} />
        </mesh>
      ) : null}
    </group>
  );
}

function AnimatedRobot({ targetPos, isJumping, isWrong, hasFinishedIsland }) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(robotGlb);
  const { actions } = useAnimations(animations, scene);
  const activeActionRef = useRef("Idle");

  // Continuous position tracking across renders
  const currentPosRef = useRef([...targetPos]);
  const jumpStartPosRef = useRef([...targetPos]);
  const jumpProgressRef = useRef(1);
  const previousTargetRef = useRef([...targetPos]);
  const targetPosRef = useRef([...targetPos]);
  targetPosRef.current = targetPos;

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [scene]);

  // Initial Idle action
  useEffect(() => {
    if (actions?.Idle && activeActionRef.current === "Idle") {
      actions.Idle.reset().fadeIn(0.2).play();
    }
  }, [actions]);

  // Handle jump initiation and reset
  useEffect(() => {
    const prev = previousTargetRef.current;
    const targetChanged =
      prev[0] !== targetPos[0] ||
      prev[1] !== targetPos[1] ||
      prev[2] !== targetPos[2];
    previousTargetRef.current = [...targetPos];

    // Reset back to start island
    if (targetPos[0] <= -5.0 && targetChanged && !isJumping) {
      currentPosRef.current = [...targetPos];
      jumpProgressRef.current = 1;
      if (groupRef.current) {
        groupRef.current.position.set(...targetPos);
        groupRef.current.rotation.set(0, Math.PI / 2, 0);
      }
      if (actions) {
        Object.values(actions).forEach((a) => a.stop());
        actions.Idle?.reset().fadeIn(0.2).play();
        activeActionRef.current = "Idle";
      }
      return;
    }

    if (isJumping && actions) {
      jumpStartPosRef.current = [...currentPosRef.current];
      jumpProgressRef.current = 0;

      if (activeActionRef.current && actions[activeActionRef.current]) {
        actions[activeActionRef.current].fadeOut(0.1);
      }
      if (actions.Jump) {
        actions.Jump.reset().setLoop(THREE.LoopOnce, 1);
        actions.Jump.clampWhenFinished = true;
        actions.Jump.fadeIn(0.08).play();
      }
      activeActionRef.current = "Jump";
    }
  }, [isJumping, targetPos, actions]);

  // Wrong answer -> head shake (No)
  useEffect(() => {
    if (isWrong && actions?.No) {
      if (activeActionRef.current && actions[activeActionRef.current]) {
        actions[activeActionRef.current].fadeOut(0.12);
      }
      actions.No.reset().setLoop(THREE.LoopOnce, 1);
      actions.No.clampWhenFinished = true;
      actions.No.fadeIn(0.12).play();
      activeActionRef.current = "No";

      const timer = window.setTimeout(() => {
        actions.No?.fadeOut(0.25);
        actions.Idle?.reset().fadeIn(0.25).play();
        activeActionRef.current = "Idle";
      }, 1250);

      return () => window.clearTimeout(timer);
    }
  }, [isWrong, actions]);

  // Island completed celebration
  useEffect(() => {
    if (hasFinishedIsland && actions) {
      const celebrationTimer = window.setTimeout(() => {
        if (actions.Dance) {
          if (activeActionRef.current && actions[activeActionRef.current]) {
            actions[activeActionRef.current].fadeOut(0.2);
          }
          actions.Dance.reset().fadeIn(0.25).play();
          activeActionRef.current = "Dance";
        } else if (actions.ThumbsUp) {
          actions.ThumbsUp.reset().fadeIn(0.25).play();
          activeActionRef.current = "ThumbsUp";
        }
      }, 600);
      return () => window.clearTimeout(celebrationTimer);
    }
  }, [hasFinishedIsland, actions]);

  // Frame update
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (jumpProgressRef.current < 1) {
      jumpProgressRef.current = Math.min(1, jumpProgressRef.current + delta * 1.4);
      const p = jumpProgressRef.current;
      const smoothP = p * p * (3 - 2 * p);

      const start = jumpStartPosRef.current;
      const dest = targetPosRef.current;

      const currentX = THREE.MathUtils.lerp(start[0], dest[0], smoothP);
      const currentZ = THREE.MathUtils.lerp(start[2], dest[2], smoothP);
      const baseY = THREE.MathUtils.lerp(start[1], dest[1], p);
      const arcY = Math.sin(p * Math.PI) * 1.45;
      const currentY = baseY + arcY;

      groupRef.current.position.set(currentX, currentY, currentZ);
      currentPosRef.current = [currentX, currentY, currentZ];

      const dx = dest[0] - start[0];
      const dz = dest[2] - start[2];
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        const heading = Math.atan2(dx, dz);
        const pitch = -Math.sin(p * Math.PI) * 0.18;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          heading,
          delta * 12
        );
        groupRef.current.rotation.x = pitch;
      }

      if (p >= 1) {
        groupRef.current.rotation.x = 0;
        if (!hasFinishedIsland) {
          actions?.Jump?.fadeOut(0.18);
          actions?.Idle?.reset().fadeIn(0.2).play();
          activeActionRef.current = "Idle";
        }
      }
    } else {
      const dest = targetPosRef.current;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, dest[0], delta * 10);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, dest[1], delta * 10);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dest[2], delta * 10);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 8);

      const idleHeading = Math.PI / 2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, idleHeading, delta * 6);
      currentPosRef.current = [
        groupRef.current.position.x,
        groupRef.current.position.y,
        groupRef.current.position.z
      ];
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={[0.32, 0.32, 0.32]} />
    </group>
  );
}

function Water() {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.22 + Math.sin(state.clock.elapsedTime * 1.2) * 0.035;
    }
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]} receiveShadow>
      <planeGeometry args={[80, 40]} />
      <meshStandardMaterial
        color="#0ea5e9"
        roughness={0.15}
        metalness={0.35}
        transparent
        opacity={0.82}
      />
    </mesh>
  );
}

function BridgeGame({
  activeGame,
  activeGroup,
  activeTurn,
  groups,
  isRunning,
  onAnswer,
  onCompleteTurn,
  onReset,
  onStartTurn,
  question,
  timeLeft
}) {
  const [burst, setBurst] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [hasFinishedIsland, setHasFinishedIsland] = useState(false);
  const completedRef = useRef(false);
  const targetSteps = Math.max(1, Number(activeGame?.targetSteps) || BRIDGE_TARGET_STEPS);
  const solvedSteps = Math.max(
    0,
    Math.min(targetSteps, Number(activeTurn?.questionIndex) || 0)
  );
  const fallbackQuestion = normalizeQuestion(
    getFallbackQuestions("bridge", activeGroup)[0],
    0,
    activeGroup,
    "bridge"
  );
  const visibleQuestion = question ?? fallbackQuestion;
  const options = useMemo(
    () => shuffle(getAnswerChoices(visibleQuestion)),
    [activeGroup, activeTurn?.questionIndex, visibleQuestion]
  );
  const questionParts = useMemo(
    () => String(visibleQuestion?.question ?? "").split("____"),
    [visibleQuestion?.question]
  );
  const bridgeTiles = useMemo(
    () => Array.from({ length: targetSteps }, (_, index) => index),
    [targetSteps]
  );
  const bridgeRocks = useMemo(
    () => [
      { x: 8, y: 56, scale: 0.62 },
      { x: 18, y: 78, scale: 0.84 },
      { x: 29, y: 61, scale: 0.68 },
      { x: 40, y: 80, scale: 0.9 },
      { x: 56, y: 60, scale: 0.64 },
      { x: 70, y: 79, scale: 0.88 },
      { x: 83, y: 58, scale: 0.66 },
      { x: 94, y: 80, scale: 0.82 }
    ],
    []
  );
  const bridgeBoardStyle = useMemo(
    () => ({
      "--bridge-underwater-bg-url": `url(${bridgeUnderwaterBgImage})`,
      "--bridge-rock-url": `url(${bridgeRockPileImage})`,
      "--bridge-hero-url": `url(${bridgeHeroSideSheetImage})`
    }),
    []
  );
  const heroIndex = Math.max(0, Math.min(targetSteps - 1, solvedSteps));
  const heroPositionPercent = ((heroIndex + 0.5) / targetSteps) * 100;
  const currentStepLabel = Math.min(solvedSteps + 1, targetSteps);

  useEffect(() => {
    setIsAnswerLocked(false);
    setIsShaking(false);
    setIsJumping(false);
    setIsWrong(false);
    setHasFinishedIsland(false);
  }, [activeGroup, isRunning, visibleQuestion?.id]);

  useEffect(() => {
    if (!isShaking) {
      return undefined;
    }

    const shakeTimerId = window.setTimeout(() => {
      setIsShaking(false);
    }, 450);

    return () => {
      window.clearTimeout(shakeTimerId);
    };
  }, [isShaking]);

  useEffect(() => {
    if (!isJumping) {
      return undefined;
    }

    const jumpTimerId = window.setTimeout(() => {
      setIsJumping(false);
    }, 850);

    return () => {
      window.clearTimeout(jumpTimerId);
    };
  }, [isJumping]);

  useEffect(() => {
    if (!isWrong) {
      return undefined;
    }

    const wrongTimerId = window.setTimeout(() => {
      setIsWrong(false);
    }, 1200);

    return () => {
      window.clearTimeout(wrongTimerId);
    };
  }, [isWrong]);

  useEffect(() => {
    if (solvedSteps >= targetSteps && isRunning) {
      const timer = window.setTimeout(() => {
        setHasFinishedIsland(true);
        setIsJumping(true);
      }, 700);
      return () => window.clearTimeout(timer);
    }
    setHasFinishedIsland(false);
  }, [solvedSteps, targetSteps, isRunning]);

  useEffect(() => {
    if (!isRunning || solvedSteps < targetSteps) {
      completedRef.current = false;
      return;
    }

    if (completedRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      completedRef.current = true;
      void onCompleteTurn();
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [isRunning, onCompleteTurn, solvedSteps, targetSteps]);

  const handleChoice = useCallback(async (choice) => {
    if (!isRunning || isAnswerLocked || solvedSteps >= targetSteps) {
      return;
    }

    setIsAnswerLocked(true);

    if (choice?.isCorrect) {
      setIsJumping(true);
      setBurst((previousBurst) => nextBurstState(previousBurst));
      await onAnswer(true);
    } else {
      setIsShaking(true);
      setIsWrong(true);
      await onAnswer(false);
    }

    window.setTimeout(() => {
      setIsAnswerLocked(false);
    }, 350);
  }, [isAnswerLocked, isRunning, onAnswer, solvedSteps, targetSteps]);

  // İki kumsal arasında 5 kaya - eşit aralıklı
  const stonePositions = useMemo(() => [
    [-3.36, -0.15, 0.25],
    [-1.68, -0.15, -0.25],
    [0.0,   -0.15, 0.25],
    [1.68,  -0.15, -0.25],
    [3.36,  -0.15, 0.25]
  ], []);

  const robotTargetPos = useMemo(() => {
    if (solvedSteps <= 0) {
      return [-5.2, 0.48, 0];
    }
    if (hasFinishedIsland) {
      return [5.2, 0.48, 0];
    }
    const currentStone = stonePositions[Math.min(solvedSteps - 1, 4)];
    return [currentStone[0], 0.52, currentStone[2]];
  }, [hasFinishedIsland, solvedSteps, stonePositions]);

  return (
    <main className="app-screen game-screen bridge-screen">
      <header className="game-header">
        <ScoreBox label="A Grubu" score={groups.A.score} active={activeGroup === "A"} />
        <div className="timer-box">{formatTime(timeLeft)}</div>
        <ScoreBox label="B Grubu" score={groups.B.score} active={activeGroup === "B"} />
      </header>

      {!isRunning ? (
        <section className="turn-start" aria-label="Tur başlangıcı">
          <div className="turn-label">{groups[activeGroup].name}</div>
          <button className="pixel-button start-button" onClick={onStartTurn}>Başlat</button>
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
        </section>
      ) : (
        <section className="bridge-stage bridge-3d-stage">
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
          <div className="bridge-3d-canvas-wrap">
            <Canvas shadows camera={{ position: [0, 4.4, 8.8], fov: 46 }}>
              <Sky sunPosition={[100, 25, 100]} turbidity={1.5} rayleigh={0.8} />
              <Cloud position={[-11, 7, -10]} speed={0.15} opacity={0.35} />
              <Cloud position={[11, 8, -9]} speed={0.12} opacity={0.3} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[6, 12, 6]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
              <Water />

              {/* Sol Kumsal Başlangıç Adası */}
              <BeachIsland position={[-5.6, -0.2, 0]} isDestination={false} />

              {/* Sağ Kumsal Bitiş Adası (Hedef Bayraklı & Hazineli) */}
              <BeachIsland position={[5.6, -0.2, 0]} isDestination={true} />

              {/* İki kumsal arasındaki 5 kaya */}
              {stonePositions.map((pos, i) => (
                <Rock3D
                  key={i}
                  index={i}
                  position={pos}
                  isCurrent={solvedSteps > 0 && solvedSteps - 1 === i}
                  isTarget={solvedSteps === i}
                  isPassed={solvedSteps > i + 1}
                />
              ))}

              {/* Taşların üstünden zıplayan 3D animasyonlu Robot */}
              <AnimatedRobot
                targetPos={robotTargetPos}
                isJumping={isJumping}
                isWrong={isWrong}
                hasFinishedIsland={hasFinishedIsland}
              />
            </Canvas>
          </div>
          <div className={`bridge-question-panel ${isShaking ? "shake" : ""}`}>
            <div className="bridge-question-top">
              <h3>Boşluk Doldurma</h3>
              <span className="bridge-step-chip">
                {Math.min(currentStepLabel, targetSteps)} / {targetSteps}
              </span>
            </div>
            <p className="bridge-question-text">
              {questionParts.map((part, index) => (
                <span key={`segment-${index}`}>
                  {part}
                  {index < questionParts.length - 1 ? (
                    <span className="bridge-blank">____</span>
                  ) : null}
                </span>
              ))}
            </p>
            <div className="bridge-options">
              {options.map((choice, index) => (
                <button
                  className="pixel-button bridge-option-button"
                  disabled={isAnswerLocked || solvedSteps >= targetSteps}
                  key={`${choice.text}-${index}`}
                  onClick={() => {
                    void handleChoice(choice);
                  }}
                  type="button"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
          <CelebrationBurst burst={burst} />
        </section>
      )}
    </main>
  );
}

function Table3D() {
  const topThickness = 0.35;
  const legPositions = useMemo(
    () => [
      [-3.8, -1.8, -1.8],
      [3.8, -1.8, -1.8],
      [-3.8, -1.8, 1.8],
      [3.8, -1.8, 1.8]
    ],
    []
  );

  return (
    <group>
      {/* Polished wooden tabletop */}
      <mesh position={[0, -topThickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.6, topThickness, 4.4]} />
        <meshStandardMaterial color="#935c34" roughness={0.38} metalness={0.04} />
      </mesh>

      {/* Table border / apron */}
      <mesh position={[0, -topThickness - 0.05, 0]} receiveShadow>
        <boxGeometry args={[8.8, 0.12, 4.5]} />
        <meshStandardMaterial color="#6e3c1b" roughness={0.45} metalness={0.08} />
      </mesh>

      {/* 4 table legs */}
      {legPositions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.18, 0.14, 3.2, 16]} />
          <meshStandardMaterial color="#5a2d10" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function HollowCupMesh({ color = "#d90429", accentColor = "#ffd166" }) {
  const h = 1.55;
  const rTop = 0.60;
  const rBot = 0.80;

  return (
    <group>
      {/* Outer tapered cup body */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[rTop, rBot, h, 40, 1, true]} />
        <meshStandardMaterial
          color={color}
          roughness={0.28}
          metalness={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner darker body for realistic hollow depth */}
      <mesh position={[0, h / 2 + 0.02, 0]}>
        <cylinderGeometry args={[rTop - 0.03, rBot - 0.03, h - 0.04, 40, 1, true]} />
        <meshStandardMaterial
          color="#7a0014"
          roughness={0.5}
          metalness={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Top closed cap (base of cup, facing up) */}
      <mesh position={[0, h + 0.01, 0]} castShadow>
        <cylinderGeometry args={[rTop, rTop, 0.06, 40]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.12} />
      </mesh>

      {/* Top ring bevel */}
      <mesh position={[0, h + 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[rTop * 0.88, 0.035, 16, 40]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.12} />
      </mesh>

      {/* Bottom rolled lip */}
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[rBot, 0.04, 16, 40]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.12} />
      </mesh>

      {/* Metallic gold foil accent rings */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.705, 0.715, 0.09, 40, 1, true]} />
        <meshStandardMaterial color={accentColor} roughness={0.22} metalness={0.65} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.648, 0.655, 0.05, 40, 1, true]} />
        <meshStandardMaterial color={accentColor} roughness={0.22} metalness={0.65} />
      </mesh>
    </group>
  );
}

const CUP_SLOT_X = [-2.4, 0, 2.4];
const CUP_LIFT_Y = 1.5;

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function Computer3D() {
  return (
    <group position={[0, 0.08, 0]}>
      {/* Monitor tilted slightly back to face camera angle directly */}
      <group position={[0, 0.38, 0]} rotation={[-0.22, 0, 0]}>
        {/* Monitor chassis (retro desktop monitor) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.58, 0.46, 0.30]} />
          <meshStandardMaterial color="#e2dfd7" roughness={0.38} />
        </mesh>
        {/* Dark screen border bezel */}
        <mesh position={[0, 0, 0.152]}>
          <planeGeometry args={[0.46, 0.36]} />
          <meshBasicMaterial color="#001833" />
        </mesh>
        {/* Glowing cyan pixel display */}
        <mesh position={[0, 0, 0.154]}>
          <planeGeometry args={[0.42, 0.32]} />
          <meshBasicMaterial color="#00f5d4" />
        </mesh>
        {/* Pixel terminal smile & eyes on screen */}
        <mesh position={[-0.09, 0.04, 0.156]}>
          <boxGeometry args={[0.045, 0.045, 0.01]} />
          <meshBasicMaterial color="#001833" />
        </mesh>
        <mesh position={[0.09, 0.04, 0.156]}>
          <boxGeometry args={[0.045, 0.045, 0.01]} />
          <meshBasicMaterial color="#001833" />
        </mesh>
        <mesh position={[0, -0.05, 0.156]}>
          <boxGeometry args={[0.14, 0.035, 0.01]} />
          <meshBasicMaterial color="#001833" />
        </mesh>
      </group>

      {/* Monitor stand neck */}
      <mesh position={[0, 0.14, -0.02]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.12, 16]} />
        <meshStandardMaterial color="#8d99ae" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Monitor stand base */}
      <mesh position={[0, 0.07, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.03, 0.28]} />
        <meshStandardMaterial color="#c8c6be" roughness={0.4} />
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, 0.03, 0.25]} rotation={[-0.18, 0, 0]} castShadow>
        <boxGeometry args={[0.50, 0.03, 0.16]} />
        <meshStandardMaterial color="#d4d2cb" roughness={0.5} />
      </mesh>
      {/* Keyboard keys plate */}
      <mesh position={[0, 0.048, 0.25]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.46, 0.015, 0.13]} />
        <meshStandardMaterial color="#3d405b" roughness={0.6} />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.32, 0.025, 0.25]} castShadow>
        <boxGeometry args={[0.06, 0.03, 0.09]} />
        <meshStandardMaterial color="#e0ded8" roughness={0.4} />
      </mesh>
    </group>
  );
}

function WifiRouter3D() {
  return (
    <group position={[0, 0.08, 0]}>
      {/* Main router box (sleek modern tech unit) */}
      <mesh position={[0, 0.10, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.13, 0.36]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.3} metalness={0.25} />
      </mesh>
      {/* Accent top plate */}
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.54, 0.015, 0.28]} />
        <meshStandardMaterial color="#2b2d42" roughness={0.4} />
      </mesh>
      {/* Status LED lights on front */}
      {[-0.18, -0.09, 0, 0.09, 0.18].map((x, idx) => (
        <mesh key={idx} position={[x, 0.10, 0.185]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshBasicMaterial color={idx === 2 ? "#00f5d4" : "#48cae4"} />
        </mesh>
      ))}
      {/* Left antenna */}
      <group position={[-0.24, 0.16, -0.12]} rotation={[0.1, 0, 0.22]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.52, 12]} />
          <meshStandardMaterial color="#111115" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#ffd166" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
      {/* Right antenna */}
      <group position={[0.24, 0.16, -0.12]} rotation={[0.1, 0, -0.22]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.52, 12]} />
          <meshStandardMaterial color="#111115" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#ffd166" roughness={0.2} metalness={0.6} />
        </mesh>
      </group>
      {/* Wi-Fi Signal Arcs standing upright facing camera */}
      <group position={[0, 0.22, 0.04]}>
        <mesh rotation={[0, 0, Math.PI * 0.2]}>
          <torusGeometry args={[0.12, 0.016, 12, 32, Math.PI * 0.6]} />
          <meshBasicMaterial color="#00f5d4" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI * 0.2]}>
          <torusGeometry args={[0.20, 0.016, 12, 32, Math.PI * 0.6]} />
          <meshBasicMaterial color="#48cae4" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI * 0.2]}>
          <torusGeometry args={[0.28, 0.016, 12, 32, Math.PI * 0.6]} />
          <meshBasicMaterial color="#90e0ef" />
        </mesh>
      </group>
    </group>
  );
}

function InternetGlobe3D() {
  const globeRef = useRef();

  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group position={[0, 0.08, 0]}>
      {/* Stand base (gold brass finish) */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.06, 28]} />
        <meshStandardMaterial color="#d4a373" roughness={0.25} metalness={0.65} />
      </mesh>
      {/* Stand stem */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.22, 16]} />
        <meshStandardMaterial color="#d4a373" roughness={0.25} metalness={0.65} />
      </mesh>
      {/* Stand meridian half-ring arc */}
      <mesh position={[0, 0.44, 0]} rotation={[0, 0, -Math.PI * 0.35]}>
        <torusGeometry args={[0.35, 0.026, 16, 36, Math.PI * 1.05]} />
        <meshStandardMaterial color="#d4a373" roughness={0.25} metalness={0.65} />
      </mesh>
      {/* Rotating 3D Globe with Earth continents / latitude lines */}
      <group ref={globeRef} position={[0, 0.44, 0]} rotation={[0.35, 0, 0.2]}>
        {/* Oceans sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color="#0077b6" roughness={0.35} metalness={0.1} />
        </mesh>
        {/* Latitude and Longitude wireframe / grid lines for cyber internet aesthetic */}
        <mesh>
          <sphereGeometry args={[0.284, 16, 12]} />
          <meshBasicMaterial color="#90e0ef" wireframe transparent opacity={0.35} />
        </mesh>
        {/* Stylized continent patches (green landmasses) */}
        <mesh position={[0.14, 0.12, 0.18]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color="#38b000" roughness={0.6} />
        </mesh>
        <mesh position={[-0.15, 0.05, 0.18]}>
          <sphereGeometry args={[0.10, 12, 12]} />
          <meshStandardMaterial color="#38b000" roughness={0.6} />
        </mesh>
        <mesh position={[0.02, -0.14, 0.20]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#70e000" roughness={0.6} />
        </mesh>
        <mesh position={[-0.16, 0.14, -0.14]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#38b000" roughness={0.6} />
        </mesh>
        {/* Glowing orbital internet ring */}
        <mesh rotation={[Math.PI / 2.8, 0, 0]}>
          <torusGeometry args={[0.40, 0.018, 12, 48]} />
          <meshBasicMaterial color="#ffd166" />
        </mesh>
      </group>
    </group>
  );
}

function CupToken({ targetId }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Heavy gold/white token pedestal */}
      <mesh position={[0, 0.035, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.54, 0.58, 0.07, 36]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.15} />
      </mesh>

      {/* Gold outer rim */}
      <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.53, 0.03, 16, 36]} />
        <meshStandardMaterial color="#ffd166" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* 3D Model according to targetId */}
      {targetId === "wifi" ? (
        <WifiRouter3D />
      ) : targetId === "computer" ? (
        <Computer3D />
      ) : (
        <InternetGlobe3D />
      )}
    </group>
  );
}

function CupGameScene({
  phase,
  targetCupId,
  pickedCupId,
  hiddenIcon,
  shuffleCount,
  onShuffleComplete,
  onCupPick,
  canGuess
}) {
  const cup0Ref = useRef();
  const cup1Ref = useRef();
  const cup2Ref = useRef();
  const tokenRef = useRef();

  const stateRef = useRef({
    cups: [
      { x: CUP_SLOT_X[0], y: 0, z: 0, slot: 0 },
      { x: CUP_SLOT_X[1], y: 0, z: 0, slot: 1 },
      { x: CUP_SLOT_X[2], y: 0, z: 0, slot: 2 }
    ],
    slots: [0, 1, 2],
    activeSwap: null,
    shuffleQueue: [],
    phase: "idle",
    targetCupId: 0,
    pickedCupId: null
  });

  useEffect(() => {
    stateRef.current.phase = phase;
    stateRef.current.targetCupId = targetCupId;
    stateRef.current.pickedCupId = pickedCupId;
  }, [phase, targetCupId, pickedCupId]);

  const shuffleActiveRef = useRef(false);
  useEffect(() => {
    if (phase === "shuffle" && !shuffleActiveRef.current) {
      shuffleActiveRef.current = true;
      const s = stateRef.current;

      const plan = [];
      const possiblePairs = [
        [0, 1],
        [1, 2],
        [0, 2]
      ];
      for (let i = 0; i < shuffleCount; i++) {
        const pair = possiblePairs[Math.floor(Math.random() * possiblePairs.length)];
        plan.push(pair);
      }
      s.shuffleQueue = plan;

      const [slotA, slotB] = s.shuffleQueue.shift();
      const cupA = s.slots[slotA];
      const cupB = s.slots[slotB];

      const fromXA = CUP_SLOT_X[slotA];
      const toXA = CUP_SLOT_X[slotB];
      const fromXB = CUP_SLOT_X[slotB];
      const toXB = CUP_SLOT_X[slotA];

      s.slots[slotA] = cupB;
      s.slots[slotB] = cupA;
      s.cups[cupA].slot = slotB;
      s.cups[cupB].slot = slotA;

      s.activeSwap = {
        cupA,
        cupB,
        fromXA,
        toXA,
        fromXB,
        toXB,
        startTime: performance.now(),
        duration: 480,
        arcSign: Math.random() > 0.5 ? 1 : -1
      };
    } else if (phase !== "shuffle") {
      shuffleActiveRef.current = false;
      stateRef.current.activeSwap = null;
      stateRef.current.shuffleQueue = [];
    }
  }, [phase, shuffleCount]);

  useEffect(() => {
    if (phase === "peek-up") {
      const s = stateRef.current;
      s.slots = [0, 1, 2];
      for (let i = 0; i < 3; i++) {
        s.cups[i].x = CUP_SLOT_X[i];
        s.cups[i].z = 0;
        s.cups[i].slot = i;
      }
    }
  }, [phase]);

  useFrame((_, delta) => {
    const s = stateRef.current;
    const now = performance.now();

    // 1. Process active shuffle swap
    if (s.activeSwap) {
      const swap = s.activeSwap;
      const elapsed = now - swap.startTime;
      const progress = THREE.MathUtils.clamp(elapsed / swap.duration, 0, 1);
      const p = easeInOutCubic(progress);

      s.cups[swap.cupA].x = THREE.MathUtils.lerp(swap.fromXA, swap.toXA, p);
      s.cups[swap.cupA].z = Math.sin(p * Math.PI) * 0.95 * swap.arcSign;

      s.cups[swap.cupB].x = THREE.MathUtils.lerp(swap.fromXB, swap.toXB, p);
      s.cups[swap.cupB].z = -Math.sin(p * Math.PI) * 0.95 * swap.arcSign;

      if (progress >= 1) {
        s.cups[swap.cupA].x = swap.toXA;
        s.cups[swap.cupA].z = 0;
        s.cups[swap.cupB].x = swap.toXB;
        s.cups[swap.cupB].z = 0;
        s.activeSwap = null;

        if (s.shuffleQueue.length > 0) {
          const [nextSlotA, nextSlotB] = s.shuffleQueue.shift();
          const nextCupA = s.slots[nextSlotA];
          const nextCupB = s.slots[nextSlotB];

          const nFromXA = CUP_SLOT_X[nextSlotA];
          const nToXA = CUP_SLOT_X[nextSlotB];
          const nFromXB = CUP_SLOT_X[nextSlotB];
          const nToXB = CUP_SLOT_X[nextSlotA];

          s.slots[nextSlotA] = nextCupB;
          s.slots[nextSlotB] = nextCupA;
          s.cups[nextCupA].slot = nextSlotB;
          s.cups[nextCupB].slot = nextSlotA;

          s.activeSwap = {
            cupA: nextCupA,
            cupB: nextCupB,
            fromXA: nFromXA,
            toXA: nToXA,
            fromXB: nFromXB,
            toXB: nToXB,
            startTime: now,
            duration: 480,
            arcSign: Math.random() > 0.5 ? 1 : -1
          };
        } else {
          shuffleActiveRef.current = false;
          onShuffleComplete?.();
        }
      }
    }

    // 2. Process vertical lifting - use props directly (always fresh)
    for (let i = 0; i < 3; i++) {
      const isLifted =
        (phase === "peek-up" && i === targetCupId) ||
        (phase === "result" && (i === targetCupId || i === pickedCupId));
      const targetY = isLifted ? CUP_LIFT_Y : 0;
      s.cups[i].y = THREE.MathUtils.lerp(s.cups[i].y, targetY, Math.min(1, delta * 8));
    }

    // 3. Update Three.js mesh transforms
    const refs = [cup0Ref, cup1Ref, cup2Ref];
    for (let i = 0; i < 3; i++) {
      if (refs[i].current) {
        refs[i].current.position.set(s.cups[i].x, s.cups[i].y, s.cups[i].z);
      }
    }

    // 4. Update Token position
    if (tokenRef.current) {
      const targetCup = s.cups[s.targetCupId];
      tokenRef.current.position.set(targetCup.x, 0, targetCup.z);
    }
  });

  const cupRefs = [cup0Ref, cup1Ref, cup2Ref];

  return (
    <group position={[0, -0.4, 0]}>
      {/* 3D Ahşap Masa */}
      <Table3D />

      {/* Hedef Jetonu */}
      <group ref={tokenRef} position={[CUP_SLOT_X[targetCupId], 0, 0]}>
        <CupToken targetId={hiddenIcon?.id} />
      </group>

      {/* 3 Adet Bardak */}
      {[0, 1, 2].map((cupId) => (
        <group
          key={cupId}
          ref={cupRefs[cupId]}
          position={[CUP_SLOT_X[cupId], 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            if (canGuess) {
              onCupPick?.(cupId);
            }
          }}
          onPointerOver={() => {
            if (canGuess) document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <HollowCupMesh />
        </group>
      ))}
    </group>
  );
}

function CupGame({
  activeGame,
  activeGroup,
  activeTurn,
  groups,
  isRunning,
  onCompleteTurn,
  onGuess,
  onReset,
  onStartTurn,
  timeLeft
}) {
  const [targetCupId, setTargetCupId] = useState(0);
  const [pickedCupId, setPickedCupId] = useState(null);
  const [iconIndex, setIconIndex] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [statusText, setStatusText] = useState("");
  const targetCupIdRef = useRef(0);
  const timersRef = useRef([]);
  const [finalRoundPending, setFinalRoundPending] = useState(false);
  const busyRef = useRef(false);
  const roundKeyRef = useRef("");
  const lastIconIndexRef = useRef(-1);
  const lastTargetCupRef = useRef(-1);
  const hiddenIcon = CUP_ICON_OPTIONS[iconIndex] ?? CUP_ICON_OPTIONS[0];
  const roundsPerGroup = Math.max(
    1,
    Number(activeGame?.roundsPerGroup) || CUP_ROUNDS_PER_GROUP
  );
  const shuffleCount = Math.max(
    4,
    Math.min(6, Number(activeGame?.shuffleCount) || CUP_SHUFFLE_COUNT)
  );
  const scoreCorrect = Number.isFinite(activeGame?.pointsPerCorrect)
    ? activeGame.pointsPerCorrect
    : 20;
  const scoreWrong = Number.isFinite(activeGame?.pointsPerWrong)
    ? activeGame.pointsPerWrong
    : -10;
  const playedRounds = activeTurn?.questionIndex ?? 0;

  useEffect(() => {
    if (phase !== "guess") {
      document.body.style.cursor = "default";
    }
  }, [phase]);

  const clearRoundTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
      window.clearInterval(timerId);
    });
    timersRef.current = [];
  }, []);

  const startRound = useCallback((roundIndex) => {
    clearRoundTimers();
    setFinalRoundPending(false);
    busyRef.current = false;
    setPickedCupId(null);
    const iconPool = CUP_ICON_OPTIONS.map((_, index) => index);
    const availableIcons = iconPool.filter((index) => index !== lastIconIndexRef.current);
    const nextIconIndex = randomFromList(
      availableIcons.length > 0 ? availableIcons : iconPool,
      0
    );
    const cupPool = [0, 1, 2];
    const availableCups = cupPool.filter((cupId) => cupId !== lastTargetCupRef.current);
    const nextTargetCupId = randomFromList(
      availableCups.length > 0 ? availableCups : cupPool,
      0
    );
    lastIconIndexRef.current = nextIconIndex;
    lastTargetCupRef.current = nextTargetCupId;
    targetCupIdRef.current = nextTargetCupId;
    setIconIndex(nextIconIndex);
    setTargetCupId(nextTargetCupId);
    setPhase("peek-up");
    setStatusText(`Tur ${roundIndex + 1}/${roundsPerGroup} - Dikkatle İzle!`);

    // Peek up for 2000ms so students can clearly see the icon and name
    const peekDownTimer = window.setTimeout(() => {
      setPhase("peek-down");
      setStatusText("Bardak Kapatılıyor...");
    }, 2000);

    // After cup lowers (600ms), start the 3D shuffle
    const shuffleStartTimer = window.setTimeout(() => {
      setPhase("shuffle");
      setStatusText("Karıştırılıyor...");
    }, 2600);

    timersRef.current.push(peekDownTimer, shuffleStartTimer);
  }, [clearRoundTimers, roundsPerGroup]);

  useEffect(() => {
    return () => {
      clearRoundTimers();
    };
  }, [clearRoundTimers]);

  useEffect(() => {
    if (!isRunning) {
      clearRoundTimers();
      setFinalRoundPending(false);
      busyRef.current = false;
      roundKeyRef.current = "";
      setPickedCupId(null);
      setPhase("idle");
      setStatusText("");
      return;
    }

    const roundIndex = activeTurn?.questionIndex ?? 0;
    if (roundIndex >= roundsPerGroup) {
      // The final answer updates questionIndex before its reveal animation
      // finishes. Keep the result phase alive until handleCupPick advances the turn.
      if (phase !== "result") {
        setPhase("complete");
        setStatusText("Tur tamamlandı");
      }
      return;
    }

    const currentRoundKey = `${activeGroup}-${roundIndex}`;
    if (roundKeyRef.current === currentRoundKey) {
      return;
    }

    roundKeyRef.current = currentRoundKey;
    startRound(roundIndex);
  }, [
    activeGroup,
    activeTurn?.questionIndex,
    clearRoundTimers,
    isRunning,
    phase,
    roundsPerGroup,
    startRound
  ]);

  const handleShuffleComplete = useCallback(() => {
    setPhase("guess");
    setStatusText("Hangi bardakta? Bir bardak seç!");
  }, []);

  const canGuess = phase === "guess" && isRunning && !busyRef.current;

  useEffect(() => {
    const isFinalResult =
      isRunning &&
      phase === "result" &&
      (finalRoundPending || playedRounds >= roundsPerGroup);

    if (!isFinalResult) {
      return undefined;
    }

    const finishTimer = window.setTimeout(() => {
      void onCompleteTurn();
    }, 2600);

    return () => window.clearTimeout(finishTimer);
  }, [finalRoundPending, isRunning, onCompleteTurn, phase, playedRounds, roundsPerGroup]);

  const handleCupPick = useCallback(
    async (cupId) => {
      if (!canGuess) {
        return;
      }

      busyRef.current = true;
      clearRoundTimers();
      setPickedCupId(cupId);
      setPhase("result");

      const expectedNextRound = (activeTurn?.questionIndex ?? 0) + 1;
      roundKeyRef.current = `${activeGroup}-${expectedNextRound}`;
      const isCorrect = cupId === targetCupIdRef.current;

      let nextRoundCount;
      try {
        nextRoundCount = await onGuess(isCorrect);
      } catch (e) {
        console.error("Cup guess error:", e);
        nextRoundCount = expectedNextRound;
      }

      const resolvedRoundNumber =
        typeof nextRoundCount === "number"
          ? nextRoundCount
          : expectedNextRound;
      setStatusText(
        isCorrect
          ? `${resolvedRoundNumber}. bulundu (+${scoreCorrect})`
          : `${resolvedRoundNumber}. bulunamadı (${scoreWrong})`
      );

      const revealTimer = window.setTimeout(() => {
        try {
          if (resolvedRoundNumber >= roundsPerGroup) {
            setFinalRoundPending(true);
            setStatusText(`Son bardak bulundu! (+${scoreCorrect})`);
            return;
          }

          if (typeof nextRoundCount !== "number") {
            busyRef.current = false;
            setPhase("guess");
            setStatusText("Hangi bardakta? Bir bardak seç!");
            return;
          }
          startRound(nextRoundCount);
        } catch (e) {
          console.error("Cup reveal error:", e);
          busyRef.current = false;
          setPhase("guess");
        }
      }, 1800);
      timersRef.current.push(revealTimer);
    },
    [
      activeTurn?.questionIndex,
      activeGroup,
      canGuess,
      clearRoundTimers,
      onCompleteTurn,
      onGuess,
      roundsPerGroup,
      scoreCorrect,
      scoreWrong,
      startRound
    ]
  );

  return (
    <main className="app-screen game-screen cup-screen">
      <header className="game-header">
        <ScoreBox label="A Grubu" score={groups.A.score} active={activeGroup === "A"} />
        <div className="timer-box">{formatTime(timeLeft)}</div>
        <ScoreBox label="B Grubu" score={groups.B.score} active={activeGroup === "B"} />
      </header>

      {!isRunning ? (
        <section className="turn-start" aria-label="Tur başlangıcı">
          <div className="turn-label">{groups[activeGroup].name}</div>
          <button className="pixel-button start-button" onClick={onStartTurn}>
            Başlat
          </button>
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
        </section>
      ) : (
        <section className="cup-stage">
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />

          {/* Prominent Target Banner during Peek & Result */}
          {(phase === "peek-up" || phase === "peek-down" || phase === "result") && hiddenIcon ? (
            <div className="cup-target-banner" aria-label="Hedef Simge">
              <div className="cup-target-banner-3d">
                <Canvas camera={{ position: [0, 0.2, 1.65], fov: 40 }} style={{ width: 38, height: 38 }}>
                  <ambientLight intensity={1.2} />
                  <directionalLight position={[2, 3, 2]} intensity={1.0} />
                  <group position={[0, -0.15, 0]} scale={0.62}>
                    {hiddenIcon.id === "wifi" ? (
                      <WifiRouter3D />
                    ) : hiddenIcon.id === "computer" ? (
                      <Computer3D />
                    ) : (
                      <InternetGlobe3D />
                    )}
                  </group>
                </Canvas>
              </div>
              <div className="cup-target-banner-text">
                <span className="cup-target-banner-sub">HEDEF NESNE</span>
                <span className="cup-target-banner-title">{hiddenIcon.label}</span>
              </div>
            </div>
          ) : (
            <div className="cup-target-banner-spacer" />
          )}

          <div className="cup-3d-canvas-wrap" aria-label="3D Bardak Oyunu">
            <Canvas camera={{ position: [0, 4.3, 7.0], fov: 43 }} shadows>
              <ambientLight color="#fff8ee" intensity={1.0} />
              <directionalLight
                position={[4, 11, 5]}
                intensity={1.6}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0003}
              />
              <directionalLight position={[-5, 5, 4]} intensity={0.5} color="#bad7f2" />
              <directionalLight position={[0, 4, 6]} intensity={0.4} color="#ffffff" />

              <CupGameScene
                phase={phase}
                targetCupId={targetCupId}
                pickedCupId={pickedCupId}
                hiddenIcon={hiddenIcon}
                shuffleCount={shuffleCount}
                onShuffleComplete={handleShuffleComplete}
                onCupPick={handleCupPick}
                canGuess={canGuess}
              />
            </Canvas>
          </div>

          <div className="cup-meta">
            <div className="cup-round-chip">{playedRounds} / {roundsPerGroup}</div>
            <p className="cup-status">{statusText}</p>
          </div>
        </section>
      )}
    </main>
  );
}

function MatchingGame({
  activeGame,
  activeGroup,
  groups,
  isRunning,
  onAddScore,
  onCompleteTurn,
  onReset,
  onStartTurn,
  timeLeft
}) {
  const pairCount = Math.max(
    1,
    Math.min(
      MATCH_PAIR_COUNT,
      Number(activeGame?.pairCount) || MATCH_PAIR_COUNT
    )
  );
  const previewSeconds = Math.max(
    1,
    Number(activeGame?.previewSeconds) || MATCH_PREVIEW_SECONDS
  );
  const pointsPerPair = Number.isFinite(activeGame?.pointsPerCorrect)
    ? activeGame.pointsPerCorrect
    : MATCH_POINTS_PER_PAIR;
  const activeKey = `${activeGame?.id}-${activeGroup}`;
  const timersRef = useRef([]);
  const busyRef = useRef(false);
  const completedRef = useRef(false);
  const [cards, setCards] = useState([]);
  const [phase, setPhase] = useState("idle");
  const [openCardIds, setOpenCardIds] = useState([]);
  const [matchedIconIds, setMatchedIconIds] = useState([]);
  const [statusText, setStatusText] = useState("");
  const [burst, setBurst] = useState(null);

  const clearMatchTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearMatchTimers();
    };
  }, [clearMatchTimers]);

  useEffect(() => {
    clearMatchTimers();
    busyRef.current = false;
    completedRef.current = false;
    setBurst(null);

    if (!isRunning) {
      setCards([]);
      setPhase("idle");
      setOpenCardIds([]);
      setMatchedIconIds([]);
      setStatusText("");
      return;
    }

    const nextCards = createMatchingCards(activeGroup, pairCount);
    setCards(nextCards);
    setPhase("preview");
    setOpenCardIds([]);
    setMatchedIconIds([]);
    setStatusText(`Kartları ezberle (${previewSeconds} sn)`);

    const previewTimer = window.setTimeout(() => {
      setPhase("play");
      setStatusText("Aynı iki kartı seç.");
    }, previewSeconds * 1000);
    timersRef.current.push(previewTimer);
  }, [
    activeGroup,
    activeKey,
    clearMatchTimers,
    isRunning,
    pairCount,
    previewSeconds
  ]);

  const matchedCount = matchedIconIds.length;
  const canPick = phase === "play" && isRunning && !busyRef.current;

  const handleCardPick = useCallback(
    async (card) => {
      if (
        !isRunning ||
        phase !== "play" ||
        busyRef.current ||
        openCardIds.includes(card.id) ||
        matchedIconIds.includes(card.iconId)
      ) {
        return;
      }

      if (openCardIds.length === 0) {
        setOpenCardIds([card.id]);
        setStatusText("İkinci kartı seç.");
        return;
      }

      if (openCardIds.length !== 1) {
        return;
      }

      const firstCard = cards.find((item) => item.id === openCardIds[0]);
      if (!firstCard) {
        setOpenCardIds([card.id]);
        return;
      }

      const nextOpenCardIds = [firstCard.id, card.id];
      const isMatch = firstCard.iconId === card.iconId;
      busyRef.current = true;
      setOpenCardIds(nextOpenCardIds);
      setPhase("checking");

      if (!isMatch) {
        playAnswerFeedbackSound(false);
        setStatusText("Eşleşmedi.");
        const closeTimer = window.setTimeout(() => {
          setOpenCardIds([]);
          setPhase("play");
          setStatusText(`${matchedIconIds.length}/${pairCount} çift bulundu.`);
          busyRef.current = false;
        }, 700);
        timersRef.current.push(closeTimer);
        return;
      }

      setStatusText(`${card.label} eşleşti (+${pointsPerPair})`);
      setBurst((previousBurst) => nextBurstState(previousBurst));
      await onAddScore(pointsPerPair);

      const matchTimer = window.setTimeout(() => {
        const nextMatchedIconIds = [...matchedIconIds, card.iconId];
        setMatchedIconIds(nextMatchedIconIds);
        setOpenCardIds([]);
        busyRef.current = false;

        if (nextMatchedIconIds.length >= pairCount && !completedRef.current) {
          completedRef.current = true;
          setPhase("complete");
          setStatusText("Tüm çiftler bulundu.");
          const finishTimer = window.setTimeout(() => {
            void onCompleteTurn();
          }, 650);
          timersRef.current.push(finishTimer);
          return;
        }

        setPhase("play");
        setStatusText(`${nextMatchedIconIds.length}/${pairCount} çift bulundu.`);
      }, 450);
      timersRef.current.push(matchTimer);
    },
    [
      cards,
      isRunning,
      matchedIconIds,
      onAddScore,
      onCompleteTurn,
      openCardIds,
      pairCount,
      phase,
      pointsPerPair
    ]
  );

  return (
    <main className="app-screen game-screen match-screen">
      <header className="game-header">
        <ScoreBox label="A Grubu" score={groups.A.score} active={activeGroup === "A"} />
        <div className="timer-box">{formatTime(timeLeft)}</div>
        <ScoreBox label="B Grubu" score={groups.B.score} active={activeGroup === "B"} />
      </header>

      {!isRunning ? (
        <section className="turn-start" aria-label="Tur başlangıcı">
          <div className="turn-label">{groups[activeGroup].name}</div>
          <button className="pixel-button start-button" onClick={onStartTurn}>
            Başlat
          </button>
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
        </section>
      ) : (
        <section className="match-stage">
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
          <div className="match-meta">
            <div className="match-round-chip">{matchedCount} / {pairCount}</div>
            <p className="match-status">{statusText}</p>
          </div>
          <div className={`match-grid ${phase}`}>
            {cards.map((card, index) => {
              const isMatched = matchedIconIds.includes(card.iconId);
              const isOpen =
                phase === "preview" ||
                openCardIds.includes(card.id) ||
                isMatched;

              return (
                <button
                  aria-label={isOpen ? card.label : `Kapalı kart ${index + 1}`}
                  className={`match-card ${isOpen ? "open" : ""} ${isMatched ? "matched" : ""}`}
                  disabled={!canPick || isOpen}
                  key={`${card.id}-${index}`}
                  onClick={() => {
                    void handleCardPick(card);
                  }}
                  type="button"
                >
                  <span className="match-card-inner">
                    <span className="match-card-back">?</span>
                    <span className="match-card-front">
                      <span className="match-icon-pixel">
                        {card.iconUrl ? (
                          <img alt="" src={card.iconUrl} />
                        ) : (
                          <span>{card.label}</span>
                        )}
                      </span>
                      <span className="match-label">{card.label}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <CelebrationBurst burst={burst} />
        </section>
      )}
    </main>
  );
}

function WormGame({
  activeGame,
  activeGroup,
  customQuestions,
  groups,
  isRunning,
  onAddScore,
  onReset,
  onStartTurn,
  timeLeft
}) {
  const [burst, setBurst] = useState(null);
  const foodValueSignature = Array.isArray(activeGame?.foodValues)
    ? activeGame.foodValues.join("-")
    : "10-20-30";
  const foodValues = useMemo(() => {
    const values =
      Array.isArray(activeGame?.foodValues) && activeGame.foodValues.length > 0
        ? activeGame.foodValues
        : [10, 20, 30];
    return [...new Set(values)];
  }, [activeGame?.id, foodValueSignature]);
  const wormCustomSignature = JSON.stringify(customQuestions?.worm ?? {});
  const wormQuestions = useMemo(
    () => getQuestionsForGroup("worm", activeGroup, customQuestions),
    [activeGroup, wormCustomSignature]
  );
  const questionsByValue = useMemo(() => {
    const buckets = { 10: [], 20: [], 30: [] };
    wormQuestions.forEach((question, index) => {
      const pointValue = getWormPointValue(question, index);
      if (buckets[pointValue]) {
        buckets[pointValue].push(question);
      } else {
        buckets[20].push(question);
      }
    });
    return buckets;
  }, [wormQuestions]);
  const [snakeCells, setSnakeCells] = useState(() => createInitialSnake());
  const [direction, setDirection] = useState(WORM_DIRECTION_PRESETS.right);
  const [foods, setFoods] = useState(() => spawnWormFoods(createInitialSnake(), foodValues));
  const [growth, setGrowth] = useState(0);
  const [pendingQuestion, setPendingQuestion] = useState(null);
  const [questionTimer, setQuestionTimer] = useState(0);
  const askedQuestionIdsByValueRef = useRef({ 10: [], 20: [], 30: [] });
  const directionRef = useRef(direction);
  const foodsRef = useRef(foods);
  const growthRef = useRef(growth);
  const pendingQuestionRef = useRef(null);
  const questionTimerRef = useRef(null);
  const dragRef = useRef({ active: false, pointerId: null, x: 0, y: 0 });
  const activeKey = `${activeGame?.id}-${activeGroup}`;

  useEffect(() => {
    const nextSnake = createInitialSnake();
    const nextFoods = spawnWormFoods(nextSnake, foodValues);
    setSnakeCells(nextSnake);
    setDirection(WORM_DIRECTION_PRESETS.right);
    directionRef.current = WORM_DIRECTION_PRESETS.right;
    setFoods(nextFoods);
    foodsRef.current = nextFoods;
    setGrowth(0);
    growthRef.current = 0;
    askedQuestionIdsByValueRef.current = { 10: [], 20: [], 30: [] };
    setPendingQuestion(null);
    pendingQuestionRef.current = null;
    if (questionTimerRef.current) window.clearTimeout(questionTimerRef.current);
    setQuestionTimer(0);
  }, [activeKey, foodValues, questionsByValue]);

  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { foodsRef.current = foods; }, [foods]);
  useEffect(() => { growthRef.current = growth; }, [growth]);
  useEffect(() => { pendingQuestionRef.current = pendingQuestion; }, [pendingQuestion]);

  const requestDirection = useCallback((nextDirection) => {
    if (!isRunning) return;
    const isOpposite = direction.x + nextDirection.x === 0 && direction.y + nextDirection.y === 0;
    if (isOpposite && snakeCells.length > 1) return;
    setDirection(nextDirection);
  }, [direction, isRunning, snakeCells.length]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const handleKey = (e) => {
      const keyMap = {
        ArrowUp: WORM_DIRECTION_PRESETS.up,
        ArrowDown: WORM_DIRECTION_PRESETS.down,
        ArrowLeft: WORM_DIRECTION_PRESETS.left,
        ArrowRight: WORM_DIRECTION_PRESETS.right,
        w: WORM_DIRECTION_PRESETS.up,
        s: WORM_DIRECTION_PRESETS.down,
        a: WORM_DIRECTION_PRESETS.left,
        d: WORM_DIRECTION_PRESETS.right
      };
      const dir = keyMap[e.key];
      if (dir) { e.preventDefault(); requestDirection(dir); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRunning, requestDirection]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const timerId = window.setInterval(() => {
      setSnakeCells((currentSnake) => {
        const head = currentSnake[0];
        const nextDirection = directionRef.current;
        const nextHead = {
          x: (head.x + nextDirection.x + WORM_GRID.cols) % WORM_GRID.cols,
          y: (head.y + nextDirection.y + WORM_GRID.rows) % WORM_GRID.rows
        };
        const activeFoods = foodsRef.current;
        const eatenFood = activeFoods.find((candidate) => isSameCell(nextHead, candidate));
        const ateFood = Boolean(eatenFood);
        const nextSnake = [nextHead, ...currentSnake];
        let nextGrowth = growthRef.current;

        if (ateFood) {
          const targetValue = eatenFood.value === 10 || eatenFood.value === 20 || eatenFood.value === 30 ? eatenFood.value : 20;
          const valuePool = questionsByValue[targetValue] ?? [];
          const fallbackPool = [...questionsByValue[10], ...questionsByValue[20], ...questionsByValue[30]];
          const availablePool = valuePool.length > 0 ? valuePool : fallbackPool;
          const fallbackQuestion = normalizeQuestion(getFallbackQuestions("worm", activeGroup)[0], 0, activeGroup, "worm");
          const askedForValue = askedQuestionIdsByValueRef.current[targetValue] ?? [];
          const picked = pickRandomQuestionWithoutRepeat(availablePool, askedForValue);
          const selectedQuestion = picked.question ?? fallbackQuestion;
          askedQuestionIdsByValueRef.current = { ...askedQuestionIdsByValueRef.current, [targetValue]: picked.askedQuestionIds };

          const pq = {
            value: eatenFood.value,
            growthGain: getWormGrowthByValue(eatenFood.value),
            prompt: `${eatenFood.value} puan`,
            question: selectedQuestion
          };
          pendingQuestionRef.current = pq;
          setPendingQuestion(pq);
          setQuestionTimer(10);
          if (questionTimerRef.current) window.clearTimeout(questionTimerRef.current);
          questionTimerRef.current = window.setTimeout(() => {
            pendingQuestionRef.current = null;
            setPendingQuestion(null);
            setQuestionTimer(0);
          }, 10000);

          const occupied = new Set(nextSnake.map((cell) => `${cell.x}-${cell.y}`));
          activeFoods.forEach((candidateFood) => { if (candidateFood !== eatenFood) occupied.add(`${candidateFood.x}-${candidateFood.y}`); });
          const replacementFood = spawnFoodAtRandomCell(occupied, eatenFood.value);
          const nextFoods = activeFoods.map((candidateFood) => candidateFood === eatenFood ? replacementFood : candidateFood);
          foodsRef.current = nextFoods;
          setFoods(nextFoods);
        }

        if (nextGrowth > 0) { nextGrowth -= 1; } else { nextSnake.pop(); }
        if (nextGrowth !== growthRef.current) { growthRef.current = nextGrowth; setGrowth(nextGrowth); }
        return nextSnake;
      });
    }, activeGame?.stepMs ?? WORM_STEP_MS);
    return () => window.clearInterval(timerId);
  }, [activeGame?.stepMs, activeGroup, foodValues, isRunning, questionsByValue]);

  useEffect(() => {
    if (!pendingQuestion) return undefined;
    const interval = window.setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          pendingQuestionRef.current = null;
          setPendingQuestion(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [pendingQuestion?.question?.id]);

  const handleQuestionAnswer = useCallback(async (isCorrect) => {
    const pq = pendingQuestionRef.current;
    if (!pq) return;
    if (isCorrect) {
      await onAddScore(pq.value);
      setBurst((p) => nextBurstState(p));
      setGrowth((cg) => { const ng = cg + (pq.growthGain ?? 1); growthRef.current = ng; return ng; });
    } else {
      await onAddScore(-Math.abs(pq.value));
    }
    pendingQuestionRef.current = null;
    setPendingQuestion(null);
    setQuestionTimer(0);
    if (questionTimerRef.current) { window.clearTimeout(questionTimerRef.current); questionTimerRef.current = null; }
  }, [onAddScore]);

  const onBoardPointerDown = useCallback((event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { active: true, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }, []);

  const onBoardPointerMove = useCallback((event) => {
    const dragState = dragRef.current;
    if (!dragState.active || dragState.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragState.x;
    const deltaY = event.clientY - dragState.y;
    const threshold = 14;
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      requestDirection(deltaX > 0 ? WORM_DIRECTION_PRESETS.right : WORM_DIRECTION_PRESETS.left);
    } else {
      requestDirection(deltaY > 0 ? WORM_DIRECTION_PRESETS.down : WORM_DIRECTION_PRESETS.up);
    }
    dragRef.current = { ...dragState, x: event.clientX, y: event.clientY };
  }, [requestDirection]);

  const onBoardPointerEnd = useCallback((event) => {
    const dragState = dragRef.current;
    if (!dragState.active || dragState.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = { active: false, pointerId: null, x: 0, y: 0 };
  }, []);

  const cellElements = useMemo(() => {
    const snakeSet = new Set(snakeCells.map((cell) => `${cell.x}-${cell.y}`));
    const snakeHeadKey = snakeCells.length > 0 ? `${snakeCells[0].x}-${snakeCells[0].y}` : "";
    const foodByKey = new Map(foods.map((item) => [`${item.x}-${item.y}`, item]));
    const cells = [];
    for (let y = 0; y < WORM_GRID.rows; y += 1) {
      for (let x = 0; x < WORM_GRID.cols; x += 1) {
        const key = `${x}-${y}`;
        const classNames = ["worm-cell"];
        if (snakeSet.has(key)) { classNames.push("snake"); if (key === snakeHeadKey) classNames.push("head"); }
        const foodAtCell = foodByKey.get(key);
        if (foodAtCell) classNames.push("food", `food-${foodAtCell.value}`);
        cells.push(<div className={classNames.join(" ")} key={key}>{foodAtCell ? <span className="worm-food-token">{foodAtCell.value}</span> : ""}</div>);
      }
    }
    return cells;
  }, [foods, snakeCells]);

  const pendingChoices = useMemo(() => {
    const question = pendingQuestion?.question;
    const choices = question ? getAnswerChoices(question) : [];
    return {
      trueOption: choices.find((c) => c?.text === "Doğru") ?? { text: "Doğru", isCorrect: true },
      falseOption: choices.find((c) => c?.text === "Yanlış") ?? { text: "Yanlış", isCorrect: false }
    };
  }, [pendingQuestion]);

  return (
    <main className="app-screen game-screen worm-screen">
      <header className="game-header">
        <ScoreBox label="A Grubu" score={groups.A.score} active={activeGroup === "A"} />
        <div className="timer-box">{formatTime(timeLeft)}</div>
        <ScoreBox label="B Grubu" score={groups.B.score} active={activeGroup === "B"} />
      </header>

      {!isRunning ? (
        <section className="turn-start" aria-label="Tur başlangıcı">
          <div className="turn-label">{groups[activeGroup].name}</div>
          <button className="pixel-button start-button" onClick={onStartTurn}>Başlat</button>
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
        </section>
      ) : (
        <section className="worm-stage">
          <div className="worm-stage-topbar">
            <IconActionButton actionType="reset" className="small-button reset-button worm-reset-button" onClick={onReset} />
          </div>
          <div className="worm-board" onPointerDown={onBoardPointerDown} onPointerMove={onBoardPointerMove} onPointerUp={onBoardPointerEnd} onPointerCancel={onBoardPointerEnd}>
            {cellElements}
          </div>
          {pendingQuestion ? (
            <div className="worm-question-overlay">
              <div className="worm-question-overlay-inner">
                <div className="worm-q-timer">{questionTimer}s</div>
                <p className="worm-q-text">{pendingQuestion.question?.question ?? "Soru bulunamadı."}</p>
                <div className="worm-q-actions">
                  <button className="pixel-button true-answer-button" onClick={() => handleQuestionAnswer(pendingChoices.trueOption.isCorrect)}>{pendingChoices.trueOption.text}</button>
                  <button className="pixel-button false-answer-button" onClick={() => handleQuestionAnswer(pendingChoices.falseOption.isCorrect)}>{pendingChoices.falseOption.text}</button>
                </div>
              </div>
            </div>
          ) : null}
          <CelebrationBurst burst={burst} />
        </section>
      )}
    </main>
  );
}

const PACMAN_GRID = { cols: 19, rows: 15 };

const PACMAN_MAP_TEMPLATE = [
  "1111111111111111111", // 0
  "1o.......1.......o1", // 1
  "1.11.111.1.111.11.1", // 2
  "1.................1", // 3
  "1.11.1.11111.1.11.1", // 4
  "1....1...1...1....1", // 5
  "1111.111   111.1111", // 6
  "    ...11-11...    ", // 7 (tünel & kapı)
  "1111.1.1GGG1.1.1111", // 8 (virüs yuvası)
  "1....1.11111.1....1", // 9
  "1.11.1.......1.11.1", // 10
  "1..1...11111...1..1", // 11
  "11.1.1...1...1.1.11", // 12
  "1o...111.3.111...o1", // 13 (Pacman başlangıç 3)
  "1111111111111111111"  // 14
];

const PACMAN_DIRECTIONS = {
  up: { x: 0, y: -1, angle: 270, name: "up" },
  down: { x: 0, y: 1, angle: 90, name: "down" },
  left: { x: -1, y: 0, angle: 180, name: "left" },
  right: { x: 1, y: 0, angle: 0, name: "right" }
};

const VIRUS_DEFS = [
  { id: "trojan", name: "Truva Virüsü", spawnX: 9, spawnY: 8, releaseDelay: 0, personality: "chase" },
  { id: "spyware", name: "Casus Yazılım", spawnX: 8, spawnY: 8, releaseDelay: 8, personality: "ambush" },
  { id: "worm", name: "Solucan Virüsü", spawnX: 10, spawnY: 8, releaseDelay: 16, personality: "patrol" },
  { id: "ransom", name: "Fidye Virüsü", spawnX: 9, spawnY: 7, releaseDelay: 24, personality: "corner" }
];

function playPacmanWakaSound(stepCount = 0) {
  const audioContext = getFeedbackAudioContext();
  if (!audioContext) return;
  const now = audioContext.currentTime;
  const freq = stepCount % 2 === 0 ? 330 : 440;
  playFeedbackTone(audioContext, freq, now, 0.045, "triangle");
}

function playPacmanPowerSound() {
  const audioContext = getFeedbackAudioContext();
  if (!audioContext) return;
  const now = audioContext.currentTime;
  playFeedbackTone(audioContext, 587.33, now, 0.08, "square");
  playFeedbackTone(audioContext, 739.99, now + 0.07, 0.08, "square");
  playFeedbackTone(audioContext, 880.0, now + 0.14, 0.14, "square");
}

function playPacmanEatGhostSound() {
  const audioContext = getFeedbackAudioContext();
  if (!audioContext) return;
  const now = audioContext.currentTime;
  playFeedbackTone(audioContext, 440, now, 0.06, "square");
  playFeedbackTone(audioContext, 660, now + 0.05, 0.06, "square");
  playFeedbackTone(audioContext, 880, now + 0.1, 0.08, "square");
  playFeedbackTone(audioContext, 1100, now + 0.15, 0.12, "square");
}

function playPacmanDeathSound() {
  const audioContext = getFeedbackAudioContext();
  if (!audioContext) return;
  const now = audioContext.currentTime;
  playFeedbackTone(audioContext, 440, now, 0.08, "sawtooth");
  playFeedbackTone(audioContext, 370, now + 0.07, 0.08, "sawtooth");
  playFeedbackTone(audioContext, 311, now + 0.14, 0.08, "sawtooth");
  playFeedbackTone(audioContext, 220, now + 0.21, 0.16, "sawtooth");
}

function canPacmanMoveTo(x, y) {
  if (y < 0 || y >= PACMAN_GRID.rows) return false;
  const wrappedX = (x + PACMAN_GRID.cols) % PACMAN_GRID.cols;
  const char = PACMAN_MAP_TEMPLATE[y][wrappedX];
  return char !== "1" && char !== "-" && char !== "G";
}

function canGhostMoveTo(x, y, isDoorAllowed = false) {
  if (y < 0 || y >= PACMAN_GRID.rows) return false;
  const wrappedX = (x + PACMAN_GRID.cols) % PACMAN_GRID.cols;
  const char = PACMAN_MAP_TEMPLATE[y][wrappedX];
  if (char === "1") return false;
  if ((char === "-" || char === "G") && !isDoorAllowed) return false;
  return true;
}

function createInitialPacmanDots() {
  const dots = new Set();
  const pellets = new Set();
  for (let y = 0; y < PACMAN_GRID.rows; y += 1) {
    for (let x = 0; x < PACMAN_GRID.cols; x += 1) {
      const c = PACMAN_MAP_TEMPLATE[y][x];
      if (c === ".") {
        dots.add(`${x}-${y}`);
      } else if (c === "o") {
        dots.add(`${x}-${y}`);
        pellets.add(`${x}-${y}`);
      }
    }
  }
  return { dots, pellets };
}

function createInitialViruses() {
  return VIRUS_DEFS.map((def) => ({
    id: def.id,
    name: def.name,
    personality: def.personality,
    releaseDelay: def.releaseDelay,
    x: def.spawnX,
    y: def.spawnY,
    prevX: def.spawnX,
    prevY: def.spawnY,
    dir: PACMAN_DIRECTIONS.up,
    status: "normal",
    inDen: def.spawnY >= 7 && def.spawnY <= 8 && def.spawnX >= 8 && def.spawnX <= 10,
    ticksAlive: 0
  }));
}

/* === PİKSEL KALPLER (TASARIMA UYGUN 8-BIT) === */
function PixelHeartIcon({ isLost = false }) {
  const fillColor = isLost ? "#4b5563" : "#d72d2d";
  const shadowColor = isLost ? "#1f2937" : "#8f171b";
  const outlineColor = isLost ? "#111827" : "#2b1613";

  return (
    <svg
      aria-hidden="true"
      className={`pacman-pixel-heart ${isLost ? "lost" : "active"}`}
      height="30"
      shapeRendering="crispEdges"
      viewBox="0 0 16 16"
      width="30"
    >
      {/* Çerçeve */}
      <rect fill={outlineColor} height="1" width="4" x="2" y="1" />
      <rect fill={outlineColor} height="1" width="4" x="10" y="1" />
      <rect fill={outlineColor} height="5" width="1" x="1" y="2" />
      <rect fill={outlineColor} height="1" width="4" x="6" y="2" />
      <rect fill={outlineColor} height="5" width="1" x="14" y="2" />
      <rect fill={outlineColor} height="2" width="1" x="2" y="7" />
      <rect fill={outlineColor} height="2" width="1" x="13" y="7" />
      <rect fill={outlineColor} height="2" width="1" x="3" y="9" />
      <rect fill={outlineColor} height="2" width="1" x="12" y="9" />
      <rect fill={outlineColor} height="1" width="2" x="4" y="11" />
      <rect fill={outlineColor} height="1" width="2" x="10" y="11" />
      <rect fill={outlineColor} height="2" width="1" x="6" y="12" />
      <rect fill={outlineColor} height="2" width="1" x="9" y="12" />
      <rect fill={outlineColor} height="1" width="2" x="7" y="14" />

      {/* Dolgu */}
      <rect fill={fillColor} height="5" width="4" x="2" y="2" />
      <rect fill={fillColor} height="5" width="4" x="10" y="2" />
      <rect fill={fillColor} height="4" width="4" x="6" y="3" />
      <rect fill={fillColor} height="2" width="10" x="3" y="7" />
      <rect fill={fillColor} height="2" width="8" x="4" y="9" />
      <rect fill={fillColor} height="1" width="4" x="6" y="11" />
      <rect fill={fillColor} height="2" width="2" x="7" y="12" />

      {/* Parlama Işığı */}
      {!isLost && (
        <>
          <rect fill="#fff3df" height="2" width="2" x="2" y="2" />
          <rect fill="#fff3df" height="2" width="1" x="10" y="2" />
        </>
      )}

      {/* Gölgeler */}
      <rect fill={shadowColor} height="2" width="2" x="12" y="6" />
      <rect fill={shadowColor} height="2" width="3" x="10" y="8" />
      <rect fill={shadowColor} height="2" width="2" x="9" y="10" />
      <rect fill={shadowColor} height="1" width="1" x="8" y="12" />
    </svg>
  );
}

/* === BİLGİSAYAR VİRÜSÜ İKONLARI === */

function TrojanVirusIcon({ isFlashing, isScared }) {
  const color = isScared ? (isFlashing ? "#ffffff" : "#1d4ed8") : "#ef4444";
  const eyeColor = isScared ? "#38bdf8" : "#fef08a";
  return (
    <svg className="virus-svg trojan" height="100%" viewBox="0 0 44 44" width="100%">
      <circle cx="22" cy="22" fill="rgba(239, 68, 68, 0.2)" r="20" stroke={color} strokeDasharray="4 2" strokeWidth="2" />
      <polygon fill={color} points="21,11 23,5 26,10" />
      <polygon fill={color} points="17,17 14,12 19,15" />
      <path d="M 12 34 L 14 26 L 16 18 L 22 10 L 28 14 L 33 16 L 35 22 L 31 24 L 27 22 L 26 28 L 32 34 Z" fill={color} />
      <circle cx="28" cy="18" fill={eyeColor} r="2.5" />
      {isScared ? (
        <path d="M 18 29 L 21 27 L 24 29 L 27 27" fill="none" stroke="#38bdf8" strokeWidth="2" />
      ) : (
        <path d="M 27 22 L 31 24 L 29 27" fill="none" stroke="#000000" strokeWidth="1.5" />
      )}
    </svg>
  );
}

function WormVirusIcon({ isFlashing, isScared }) {
  const color = isScared ? (isFlashing ? "#ffffff" : "#1d4ed8") : "#22c55e";
  const eyeColor = isScared ? "#38bdf8" : "#ffffff";
  return (
    <svg className="virus-svg worm" height="100%" viewBox="0 0 44 44" width="100%">
      <circle cx="22" cy="22" fill="rgba(34, 197, 94, 0.2)" r="20" stroke={color} strokeDasharray="3 3" strokeWidth="2" />
      <line stroke={color} strokeLinecap="round" strokeWidth="2.5" x1="28" x2="33" y1="12" y2="7" />
      <circle cx="34" cy="6" fill={color} r="2" />
      <line stroke={color} strokeLinecap="round" strokeWidth="2.5" x1="24" x2="22" y1="13" y2="7" />
      <circle cx="22" cy="6" fill={color} r="2" />
      <circle cx="14" cy="28" fill={color} r="6" />
      <circle cx="20" cy="24" fill={color} r="7" />
      <circle cx="27" cy="19" fill={color} r="8" />
      <line stroke={color} strokeWidth="2" x1="12" x2="8" y1="32" y2="36" />
      <line stroke={color} strokeWidth="2" x1="18" x2="16" y1="30" y2="36" />
      <line stroke={color} strokeWidth="2" x1="24" x2="26" y1="26" y2="34" />
      <circle cx="26" cy="17" fill={eyeColor} r="2.8" />
      <circle cx="31" cy="18" fill={eyeColor} r="2.2" />
      <circle cx="27" cy="17" fill="#000000" r="1.4" />
      <circle cx="32" cy="18" fill="#000000" r="1.1" />
    </svg>
  );
}

function RansomVirusIcon({ isFlashing, isScared }) {
  const color = isScared ? (isFlashing ? "#ffffff" : "#1d4ed8") : "#f43f5e";
  const eyeColor = isScared ? "#38bdf8" : "#ffffff";
  return (
    <svg className="virus-svg ransomware" height="100%" viewBox="0 0 44 44" width="100%">
      <circle cx="22" cy="22" fill="rgba(244, 63, 94, 0.2)" r="20" stroke={color} strokeDasharray="4 2" strokeWidth="2" />
      <path d="M 16 20 L 16 14 A 6 6 0 0 1 28 14 L 28 20" fill="none" stroke={color} strokeLinecap="round" strokeWidth="3" />
      <rect fill={color} height="16" rx="3" width="20" x="12" y="20" />
      {isScared ? (
        <path d="M 18 30 L 20 28 L 22 30 L 24 28 L 26 30" fill="none" stroke="#38bdf8" strokeWidth="2" />
      ) : (
        <>
          <circle cx="18" cy="26" fill={eyeColor} r="2.2" />
          <circle cx="26" cy="26" fill={eyeColor} r="2.2" />
          <circle cx="18" cy="26" fill="#000000" r="1.1" />
          <circle cx="26" cy="26" fill="#000000" r="1.1" />
          <polygon fill="#000000" points="20,31 24,31 22,34" />
        </>
      )}
    </svg>
  );
}

function SpywareVirusIcon({ isFlashing, isScared }) {
  const color = isScared ? (isFlashing ? "#ffffff" : "#1d4ed8") : "#a855f7";
  const pupilColor = isScared ? "#38bdf8" : "#ef4444";
  return (
    <svg className="virus-svg spyware" height="100%" viewBox="0 0 44 44" width="100%">
      <circle cx="22" cy="22" fill="rgba(168, 85, 247, 0.2)" r="20" stroke={color} strokeDasharray="3 3" strokeWidth="2" />
      <path d="M 10 22 Q 22 10 34 22 Q 22 34 10 22 Z" fill="#1e1b4b" stroke={color} strokeWidth="2.5" />
      <circle cx="22" cy="22" fill={color} r="6" />
      <circle cx="22" cy="22" fill={pupilColor} r="3" />
      <line stroke={color} strokeWidth="2" x1="22" x2="22" y1="12" y2="15" />
      <line stroke={color} strokeWidth="2" x1="22" x2="22" y1="29" y2="32" />
      <line stroke={color} strokeWidth="2" x1="12" x2="15" y1="22" y2="22" />
      <line stroke={color} strokeWidth="2" x1="29" x2="32" y1="22" y2="22" />
    </svg>
  );
}

function ReturningVirusIcon() {
  return (
    <svg className="virus-svg returning" height="100%" viewBox="0 0 44 44" width="100%">
      <circle cx="16" cy="22" fill="#ffffff" r="4.5" />
      <circle cx="28" cy="22" fill="#ffffff" r="4.5" />
      <circle cx="16" cy="22" fill="#2563eb" r="2.2" />
      <circle cx="28" cy="22" fill="#2563eb" r="2.2" />
    </svg>
  );
}

function PacmanSvg({ direction = PACMAN_DIRECTIONS.right, isChomping = true }) {
  const angle = direction?.angle ?? 0;
  return (
    <svg
      className={`pacman-sprite ${isChomping ? "chomping" : ""}`}
      style={{ transform: `rotate(${angle}deg)` }}
      viewBox="0 0 36 36"
    >
      <circle cx="18" cy="18" fill="#facc15" r="16" />
      <polygon className="pacman-mouth" fill="#090d16" points="18,18 36,8 36,28" />
      <circle cx="18" cy="8" fill="#000000" r="2.2" />
    </svg>
  );
}

function PacmanGame({
  activeGame,
  activeGroup,
  groups,
  isRunning,
  onAddScore,
  onCompleteTurn,
  onReset,
  onStartTurn,
  timeLeft
}) {
  const pointsPerDot = Number(activeGame?.pointsPerDot) || 1;
  const pointsPerPowerPellet = Number(activeGame?.pointsPerPowerPellet) || 10;
  const pointsPerVirus = Number(activeGame?.pointsPerVirus) || 30;
  const stepMs = Number(activeGame?.stepMs) || 180;
  const activeKey = `${activeGame?.id}-${activeGroup}`;

  const boardRef = useRef(null);
  const [initialData] = useState(() => createInitialPacmanDots());
  const [dots, setDots] = useState(() => new Set(initialData.dots));
  const [powerPellets] = useState(() => new Set(initialData.pellets));
  const [pacmanPos, setPacmanPos] = useState({ x: 9, y: 13 });
  const [pacmanDir, setPacmanDir] = useState(PACMAN_DIRECTIONS.right);
  const [requestedDir, setRequestedDir] = useState(PACMAN_DIRECTIONS.right);
  const [viruses, setViruses] = useState(() => createInitialViruses());
  const [lives, setLives] = useState(3);
  const [antivirusMsRemaining, setAntivirusMsRemaining] = useState(0);
  const [burst, setBurst] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [stepCounter, setStepCounter] = useState(0);

  const dotsRef = useRef(dots);
  const pacmanPosRef = useRef(pacmanPos);
  const pacmanDirRef = useRef(pacmanDir);
  const requestedDirRef = useRef(requestedDir);
  const virusesRef = useRef(viruses);
  const livesRef = useRef(lives);
  const isPausedRef = useRef(isPaused);
  const dragRef = useRef({ active: false, pointerId: null, startX: 0, startY: 0 });
  const stepCounterRef = useRef(0);
  const antivirusEndTimeRef = useRef(0);

  useEffect(() => {
    const fresh = createInitialPacmanDots();
    setDots(new Set(fresh.dots));
    dotsRef.current = new Set(fresh.dots);
    setPacmanPos({ x: 9, y: 13 });
    pacmanPosRef.current = { x: 9, y: 13 };
    setPacmanDir(PACMAN_DIRECTIONS.right);
    pacmanDirRef.current = PACMAN_DIRECTIONS.right;
    setRequestedDir(PACMAN_DIRECTIONS.right);
    requestedDirRef.current = PACMAN_DIRECTIONS.right;
    const freshViruses = createInitialViruses();
    setViruses(freshViruses);
    virusesRef.current = freshViruses;
    setLives(3);
    livesRef.current = 3;
    setAntivirusMsRemaining(0);
    antivirusEndTimeRef.current = 0;
    setIsPaused(false);
    isPausedRef.current = false;
    setBurst(null);
    stepCounterRef.current = 0;
    setStepCounter(0);
  }, [activeKey]);

  useEffect(() => { dotsRef.current = dots; }, [dots]);
  useEffect(() => { pacmanPosRef.current = pacmanPos; }, [pacmanPos]);
  useEffect(() => { pacmanDirRef.current = pacmanDir; }, [pacmanDir]);
  useEffect(() => { requestedDirRef.current = requestedDir; }, [requestedDir]);
  useEffect(() => { virusesRef.current = viruses; }, [viruses]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const requestDirection = useCallback((nextDir) => {
    if (!isRunning || !nextDir) return;
    setRequestedDir(nextDir);
    requestedDirRef.current = nextDir;
    if (canPacmanMoveTo(pacmanPosRef.current.x + nextDir.x, pacmanPosRef.current.y + nextDir.y)) {
      setPacmanDir(nextDir);
      pacmanDirRef.current = nextDir;
    }
  }, [isRunning]);

  // Klavye ok tuşları ve WASD
  useEffect(() => {
    if (!isRunning) return undefined;
    const handleKey = (e) => {
      const keyMap = {
        ArrowUp: PACMAN_DIRECTIONS.up,
        ArrowDown: PACMAN_DIRECTIONS.down,
        ArrowLeft: PACMAN_DIRECTIONS.left,
        ArrowRight: PACMAN_DIRECTIONS.right,
        w: PACMAN_DIRECTIONS.up,
        W: PACMAN_DIRECTIONS.up,
        s: PACMAN_DIRECTIONS.down,
        S: PACMAN_DIRECTIONS.down,
        a: PACMAN_DIRECTIONS.left,
        A: PACMAN_DIRECTIONS.left,
        d: PACMAN_DIRECTIONS.right,
        D: PACMAN_DIRECTIONS.right
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        requestDirection(dir);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRunning, requestDirection]);

  // Fare ve dokunma pozisyonundan yön belirleme
  const updateDirectionFromPointer = useCallback(
    (clientX, clientY) => {
      if (!boardRef.current || !isRunning || isPausedRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const cellW = rect.width / PACMAN_GRID.cols;
      const cellH = rect.height / PACMAN_GRID.rows;
      const pacmanPixelX = rect.left + (pacmanPosRef.current.x + 0.5) * cellW;
      const pacmanPixelY = rect.top + (pacmanPosRef.current.y + 0.5) * cellH;

      const dx = clientX - pacmanPixelX;
      const dy = clientY - pacmanPixelY;

      if (Math.abs(dx) > cellW * 0.45 || Math.abs(dy) > cellH * 0.45) {
        if (Math.abs(dx) > Math.abs(dy)) {
          requestDirection(dx > 0 ? PACMAN_DIRECTIONS.right : PACMAN_DIRECTIONS.left);
        } else {
          requestDirection(dy > 0 ? PACMAN_DIRECTIONS.down : PACMAN_DIRECTIONS.up);
        }
      }
    },
    [isRunning, requestDirection]
  );

  const onBoardPointerDown = useCallback(
    (e) => {
      dragRef.current = {
        active: true,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY
      };
      if (e.currentTarget.setPointerCapture) {
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
      }
      updateDirectionFromPointer(e.clientX, e.clientY);
    },
    [updateDirectionFromPointer]
  );

  const onBoardPointerMove = useCallback(
    (e) => {
      const drag = dragRef.current;
      if (!drag.active || drag.pointerId !== e.pointerId) {
        // Fareyle tahta üzerinde gezinirken de yönlendir
        updateDirectionFromPointer(e.clientX, e.clientY);
        return;
      }
      updateDirectionFromPointer(e.clientX, e.clientY);
    },
    [updateDirectionFromPointer]
  );

  const onBoardPointerEnd = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    dragRef.current = { active: false, pointerId: null, startX: 0, startY: 0 };
  }, []);

  // Oyun Döngüsü
  useEffect(() => {
    if (!isRunning) return undefined;

    const timerId = window.setInterval(() => {
      if (isPausedRef.current || livesRef.current <= 0) return;

      const now = Date.now();
      const currentAntivirusEnd = antivirusEndTimeRef.current;
      const isAntivirusActive = now < currentAntivirusEnd;
      const msLeft = Math.max(0, currentAntivirusEnd - now);
      setAntivirusMsRemaining(msLeft);

      stepCounterRef.current += 1;
      const step = stepCounterRef.current;
      setStepCounter(step);

      // --- PACMAN HAREKETİ ---
      const currPos = pacmanPosRef.current;
      const reqDir = requestedDirRef.current;
      let currDir = pacmanDirRef.current;

      const reqTargetX = (currPos.x + reqDir.x + PACMAN_GRID.cols) % PACMAN_GRID.cols;
      const reqTargetY = currPos.y + reqDir.y;
      if (canPacmanMoveTo(reqTargetX, reqTargetY)) {
        currDir = reqDir;
        setPacmanDir(reqDir);
        pacmanDirRef.current = reqDir;
      }

      const targetX = (currPos.x + currDir.x + PACMAN_GRID.cols) % PACMAN_GRID.cols;
      const targetY = currPos.y + currDir.y;
      let nextPos = currPos;
      if (canPacmanMoveTo(targetX, targetY)) {
        nextPos = { x: targetX, y: targetY };
        setPacmanPos(nextPos);
        pacmanPosRef.current = nextPos;
      }

      // Yem yeme kontrolü
      const cellKey = `${nextPos.x}-${nextPos.y}`;
      const currentDots = dotsRef.current;
      if (currentDots.has(cellKey)) {
        currentDots.delete(cellKey);
        setDots(new Set(currentDots));

        if (powerPellets.has(cellKey)) {
          void onAddScore(pointsPerPowerPellet, false);
          playPacmanPowerSound();
          const newEndTime = now + 7500;
          antivirusEndTimeRef.current = newEndTime;
          setAntivirusMsRemaining(7500);

          virusesRef.current = virusesRef.current.map((v) => ({
            ...v,
            status: v.status === "returning" ? "returning" : "scared",
            dir: { x: -v.dir.x, y: -v.dir.y }
          }));
          setViruses([...virusesRef.current]);

          setBurst({
            id: `power-${now}`,
            text: `+${pointsPerPowerPellet} ANTİVİRÜS!`,
            x: 50,
            y: 40
          });
        } else {
          void onAddScore(pointsPerDot, false);
          playPacmanWakaSound(step);
        }

        if (currentDots.size === 0) {
          void onAddScore(50, true);
          setBurst({
            id: `clear-${now}`,
            text: "+50 BÖLÜM GEÇİLDİ!",
            x: 50,
            y: 50
          });
          const fresh = createInitialPacmanDots();
          dotsRef.current = new Set(fresh.dots);
          setDots(new Set(fresh.dots));
        }
      }

      if (!isAntivirusActive) {
        let changed = false;
        virusesRef.current = virusesRef.current.map((v) => {
          if (v.status === "scared") {
            changed = true;
            return { ...v, status: "normal" };
          }
          return v;
        });
        if (changed) {
          setViruses([...virusesRef.current]);
        }
      }

      // --- VİRÜS HAREKETLERİ ---
      const allDirs = [
        PACMAN_DIRECTIONS.up,
        PACMAN_DIRECTIONS.down,
        PACMAN_DIRECTIONS.left,
        PACMAN_DIRECTIONS.right
      ];

      const updatedViruses = virusesRef.current.map((virus) => {
        let { dir, inDen, releaseDelay, status, ticksAlive, x, y } = virus;
        const prevX = x;
        const prevY = y;
        ticksAlive += 1;

        if (inDen) {
          if (ticksAlive >= releaseDelay) {
            if (x !== 9) {
              x += x < 9 ? 1 : -1;
            } else if (y > 6) {
              y -= 1;
            }
            if (y <= 6) {
              inDen = false;
              dir = PACMAN_DIRECTIONS.left;
            }
          }
          return { ...virus, dir, inDen, prevX, prevY, status, ticksAlive, x, y };
        }

        if (status === "returning") {
          if (x === 9 && y === 8) {
            return {
              ...virus,
              inDen: true,
              prevX,
              prevY,
              releaseDelay: 4,
              status: "normal",
              ticksAlive: 0,
              x: 9,
              y: 8
            };
          }

          const target = y < 7 ? { x: 9, y: 6 } : { x: 9, y: 8 };
          const validMoves = allDirs
            .map((d) => ({
              dir: d,
              x: (x + d.x + PACMAN_GRID.cols) % PACMAN_GRID.cols,
              y: y + d.y
            }))
            .filter((m) => canGhostMoveTo(m.x, m.y, true));

          validMoves.sort((a, b) => {
            const da = Math.hypot(a.x - target.x, a.y - target.y);
            const db = Math.hypot(b.x - target.x, b.y - target.y);
            return da - db;
          });

          if (validMoves.length > 0) {
            x = validMoves[0].x;
            y = validMoves[0].y;
            dir = validMoves[0].dir;
          }
          return { ...virus, dir, inDen, prevX, prevY, status, ticksAlive, x, y };
        }

        if (status === "scared" && step % 2 !== 0) {
          return { ...virus, prevX, prevY };
        }

        const validMoves = allDirs
          .map((d) => ({
            dir: d,
            x: (x + d.x + PACMAN_GRID.cols) % PACMAN_GRID.cols,
            y: y + d.y
          }))
          .filter((m) => canGhostMoveTo(m.x, m.y, false));

        if (validMoves.length === 0) {
          return { ...virus, prevX, prevY };
        }

        const nonReverse = validMoves.filter((m) => !(m.dir.x === -dir.x && m.dir.y === -dir.y));
        const candidates = nonReverse.length > 0 ? nonReverse : validMoves;

        let chosenMove = candidates[0];

        if (status === "scared") {
          candidates.sort((a, b) => {
            const da = Math.hypot(a.x - nextPos.x, a.y - nextPos.y);
            const db = Math.hypot(b.x - nextPos.x, b.y - nextPos.y);
            return db - da;
          });
          chosenMove = candidates[0];
        } else if (virus.personality === "chase") {
          candidates.sort((a, b) => {
            const da = Math.hypot(a.x - nextPos.x, a.y - nextPos.y);
            const db = Math.hypot(b.x - nextPos.x, b.y - nextPos.y);
            return da - db;
          });
          chosenMove = candidates[0];
        } else if (virus.personality === "ambush") {
          const target = {
            x: (nextPos.x + currDir.x * 3 + PACMAN_GRID.cols) % PACMAN_GRID.cols,
            y: Math.max(0, Math.min(PACMAN_GRID.rows - 1, nextPos.y + currDir.y * 3))
          };
          candidates.sort((a, b) => {
            const da = Math.hypot(a.x - target.x, a.y - target.y);
            const db = Math.hypot(b.x - target.x, b.y - target.y);
            return da - db;
          });
          chosenMove = candidates[0];
        } else if (virus.personality === "corner") {
          const dist = Math.hypot(x - nextPos.x, y - nextPos.y);
          const target = dist > 5 ? nextPos : { x: 17, y: 1 };
          candidates.sort((a, b) => {
            const da = Math.hypot(a.x - target.x, a.y - target.y);
            const db = Math.hypot(b.x - target.x, b.y - target.y);
            return da - db;
          });
          chosenMove = candidates[0];
        } else {
          const straight = candidates.find((m) => m.dir.x === dir.x && m.dir.y === dir.y);
          if (straight && Math.random() < 0.65) {
            chosenMove = straight;
          } else {
            chosenMove = candidates[Math.floor(Math.random() * candidates.length)];
          }
        }

        return {
          ...virus,
          dir: chosenMove.dir,
          inDen,
          prevX,
          prevY,
          status,
          ticksAlive,
          x: chosenMove.x,
          y: chosenMove.y
        };
      });

      virusesRef.current = updatedViruses;
      setViruses(updatedViruses);

      // Çarpışma kontrolü
      let pacmanHit = false;
      const postCollisionViruses = updatedViruses.map((v) => {
        const isOverlap = v.x === nextPos.x && v.y === nextPos.y;
        const isSwap =
          v.prevX === nextPos.x &&
          v.prevY === nextPos.y &&
          v.x === currPos.x &&
          v.y === currPos.y;

        if (isOverlap || isSwap) {
          if (v.status === "scared") {
            void onAddScore(pointsPerVirus, false);
            playPacmanEatGhostSound();
            setBurst({
              id: `eat-virus-${now}-${v.id}`,
              text: `+${pointsPerVirus} ${v.name} TEMİZLENDİ!`,
              x: 50,
              y: 45
            });
            return { ...v, status: "returning" };
          }
          if (v.status === "normal") {
            pacmanHit = true;
          }
        }
        return v;
      });

      virusesRef.current = postCollisionViruses;
      setViruses(postCollisionViruses);

      if (pacmanHit) {
        playPacmanDeathSound();
        const nextLives = livesRef.current - 1;
        livesRef.current = nextLives;
        setLives(nextLives);

        if (nextLives <= 0) {
          isPausedRef.current = true;
          setIsPaused(true);
          setBurst({
            id: `gameover-${now}`,
            text: "CANLAR BİTTİ!",
            x: 50,
            y: 50
          });
          window.setTimeout(() => {
            onCompleteTurn();
          }, 1200);
        } else {
          isPausedRef.current = true;
          setIsPaused(true);
          setBurst({
            id: `hit-${now}`,
            text: "DİKKAT! VİRÜSE YAKALANDIN!",
            x: 50,
            y: 50
          });

          window.setTimeout(() => {
            setPacmanPos({ x: 9, y: 13 });
            pacmanPosRef.current = { x: 9, y: 13 };
            setPacmanDir(PACMAN_DIRECTIONS.right);
            pacmanDirRef.current = PACMAN_DIRECTIONS.right;
            setRequestedDir(PACMAN_DIRECTIONS.right);
            requestedDirRef.current = PACMAN_DIRECTIONS.right;
            const resetViruses = createInitialViruses();
            virusesRef.current = resetViruses;
            setViruses(resetViruses);
            isPausedRef.current = false;
            setIsPaused(false);
          }, 900);
        }
      }
    }, stepMs);

    return () => window.clearInterval(timerId);
  }, [
    isRunning,
    onAddScore,
    onCompleteTurn,
    pointsPerDot,
    pointsPerPowerPellet,
    pointsPerVirus,
    powerPellets,
    stepMs
  ]);

  const isFlashing = antivirusMsRemaining > 0 && antivirusMsRemaining < 2500;
  const isAntivirusActive = antivirusMsRemaining > 0;

  // Izgara hücreleri (Duvarlar, kapı, yemler)
  const gridCells = useMemo(() => {
    const cells = [];
    for (let y = 0; y < PACMAN_GRID.rows; y += 1) {
      for (let x = 0; x < PACMAN_GRID.cols; x += 1) {
        const key = `${x}-${y}`;
        const char = PACMAN_MAP_TEMPLATE[y][x];
        const classNames = ["pacman-cell"];

        if (char === "1") {
          classNames.push("wall");
        } else if (char === "-") {
          classNames.push("door");
        } else if (char === "G") {
          classNames.push("den");
        } else if (dots.has(key)) {
          if (powerPellets.has(key)) {
            classNames.push("power");
          } else {
            classNames.push("dot");
          }
        } else {
          classNames.push("empty");
        }

        cells.push(<div className={classNames.join(" ")} key={key} />);
      }
    }
    return cells;
  }, [dots, powerPellets]);

  const pacmanStyle = {
    left: `${(pacmanPos.x / PACMAN_GRID.cols) * 100}%`,
    top: `${(pacmanPos.y / PACMAN_GRID.rows) * 100}%`,
    width: `${(1 / PACMAN_GRID.cols) * 100}%`,
    height: `${(1 / PACMAN_GRID.rows) * 100}%`
  };

  return (
    <main className="app-screen game-screen pacman-screen">
      <header className="game-header">
        <ScoreBox active={activeGroup === "A"} label="A Grubu" score={groups.A.score} />
        <div className="timer-box">{formatTime(timeLeft)}</div>
        <ScoreBox active={activeGroup === "B"} label="B Grubu" score={groups.B.score} />
      </header>

      {!isRunning ? (
        <section aria-label="Tur başlangıcı" className="turn-start">
          <div className="turn-label">{groups[activeGroup].name}</div>
          <button className="pixel-button start-button" onClick={onStartTurn} type="button">
            Başlat
          </button>
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
        </section>
      ) : (
        <section className="pacman-stage">
          <div className="pacman-topbar">
            <IconActionButton
              actionType="reset"
              className="small-button reset-button pacman-reset-button"
              onClick={onReset}
            />
            <div aria-label="Canlar" className="pacman-lives-box">
              {Array.from({ length: 3 }).map((_, i) => (
                <PixelHeartIcon isLost={i >= lives} key={i} />
              ))}
            </div>
            {isAntivirusActive && (
              <div className="pacman-antivirus-chip">
                ⚡ ANTİVİRÜS AKTİF! ({Math.ceil(antivirusMsRemaining / 1000)}s)
              </div>
            )}
          </div>

          <div className="pacman-play-area">
            <div
              className={`pacman-board ${isAntivirusActive ? "antivirus-active" : ""}`}
              onPointerCancel={onBoardPointerEnd}
              onPointerDown={onBoardPointerDown}
              onPointerMove={onBoardPointerMove}
              onPointerUp={onBoardPointerEnd}
              ref={boardRef}
            >
              {gridCells}

              <div className="pacman-entity" style={pacmanStyle}>
                <PacmanSvg direction={pacmanDir} isChomping={isRunning && !isPaused} />
              </div>

              {viruses.map((v) => {
                const virusStyle = {
                  left: `${(v.x / PACMAN_GRID.cols) * 100}%`,
                  top: `${(v.y / PACMAN_GRID.rows) * 100}%`,
                  width: `${(1 / PACMAN_GRID.cols) * 100}%`,
                  height: `${(1 / PACMAN_GRID.rows) * 100}%`
                };
                const isScared = v.status === "scared";
                const isReturning = v.status === "returning";

                return (
                  <div className="virus-entity" key={v.id} style={virusStyle}>
                    {isReturning ? (
                      <ReturningVirusIcon />
                    ) : v.id === "trojan" ? (
                      <TrojanVirusIcon isFlashing={isFlashing} isScared={isScared} />
                    ) : v.id === "worm" ? (
                      <WormVirusIcon isFlashing={isFlashing} isScared={isScared} />
                    ) : v.id === "ransom" ? (
                      <RansomVirusIcon isFlashing={isFlashing} isScared={isScared} />
                    ) : (
                      <SpywareVirusIcon isFlashing={isFlashing} isScared={isScared} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <CelebrationBurst burst={burst} />
        </section>
      )}
    </main>
  );
}

function PuzzleGame({
  activeGame,
  activeGroup,
  customPuzzles,
  groups,
  isRunning,
  onAddScore,
  onCompleteTurn,
  onReset,
  onStartTurn,
  timeLeft
}) {
  const [burst, setBurst] = useState(null);
  const cols = activeGame?.cols ?? PUZZLE_GRID.cols;
  const rows = activeGame?.rows ?? PUZZLE_GRID.rows;
  const pointsPerPiece = activeGame?.pointsPerCorrect ?? 10;
  const previewSeconds = activeGame?.previewSeconds ?? PUZZLE_PREVIEW_SECONDS;
  const scatterDuration = activeGame?.scatterMs ?? PUZZLE_SCATTER_MS;
  const pieces = useMemo(() => buildPuzzlePieces(cols, rows), [cols, rows]);
  const pieceCount = pieces.length;
  const trayColumns = useMemo(() => getPuzzleTrayColumns(pieceCount), [pieceCount]);
  const boardGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`
    }),
    [cols, rows]
  );
  const trayGridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${trayColumns}, minmax(0, 1fr))`
    }),
    [trayColumns]
  );
  const pieceById = useMemo(
    () => new Map(pieces.map((piece) => [piece.id, piece])),
    [pieces]
  );
  const puzzlePoolSignature = Array.isArray(customPuzzles)
    ? customPuzzles
      .map((entry) => entry?.imageUrl)
      .filter((imageUrl) => typeof imageUrl === "string" && imageUrl.trim())
      .join("|")
    : "";
  const puzzleImagePool = useMemo(() => {
    const defaultPool = PUZZLE_IMAGE_POOLS[activeGroup] ?? PUZZLE_IMAGE_POOLS.A;
    const customPool = puzzlePoolSignature
      ? puzzlePoolSignature.split("|").filter(Boolean)
      : [];
    return [...defaultPool, ...customPool];
  }, [activeGroup, puzzlePoolSignature]);
  const activeKey = `${activeGame?.id}-${activeGroup}`;
  const workspaceRef = useRef(null);
  const boardRef = useRef(null);
  const trayRef = useRef(null);
  const dragStateRef = useRef(null);
  const placedBySlotRef = useRef(Array(pieceCount).fill(null));
  const completedRef = useRef(false);
  const [selectedImage, setSelectedImage] = useState(
    randomFromList(puzzleImagePool, puzzleA1)
  );
  const [phase, setPhase] = useState("idle");
  const [previewCountdown, setPreviewCountdown] = useState(previewSeconds);
  const [trayPieceOrder, setTrayPieceOrder] = useState([]);
  const [placedBySlot, setPlacedBySlot] = useState(() =>
    Array(pieceCount).fill(null)
  );
  const [dragState, setDragState] = useState(null);
  const [scatterPieces, setScatterPieces] = useState([]);
  const [scatterActive, setScatterActive] = useState(false);

  const clearDragState = useCallback(() => {
    dragStateRef.current = null;
    setDragState(null);
  }, []);

  const getScatterFrames = useCallback(
    (pieceOrder) => {
      if (!workspaceRef.current || !boardRef.current || !trayRef.current) {
        return [];
      }

      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      const boardRect = boardRef.current.getBoundingClientRect();
      const trayRect = trayRef.current.getBoundingClientRect();
      const boardCellWidth = boardRect.width / cols;
      const boardCellHeight = boardRect.height / rows;
      const trayGap = 12;
      const trayPadding = 12;
      const trayCellWidth =
        (trayRect.width - trayPadding * 2 - trayGap * (trayColumns - 1)) / trayColumns;
      const pieceWidth = Math.max(52, Math.min(boardCellWidth, trayCellWidth));
      const pieceHeight = pieceWidth * (boardCellHeight / boardCellWidth);

      return pieceOrder.map((pieceId, index) => {
        const piece = pieceById.get(pieceId);
        const trayCol = index % trayColumns;
        const trayRow = Math.floor(index / trayColumns);
        const fromX =
          boardRect.left -
          workspaceRect.left +
          piece.col * boardCellWidth +
          (boardCellWidth - pieceWidth) / 2;
        const fromY =
          boardRect.top -
          workspaceRect.top +
          piece.row * boardCellHeight +
          (boardCellHeight - pieceHeight) / 2;
        const toX =
          trayRect.left -
          workspaceRect.left +
          trayPadding +
          trayCol * (pieceWidth + trayGap);
        const toY =
          trayRect.top -
          workspaceRect.top +
          trayPadding +
          trayRow * (pieceHeight + trayGap);

        return {
          pieceId,
          fromX,
          fromY,
          toX,
          toY,
          width: pieceWidth,
          height: pieceHeight,
          rotation: (Math.random() * 12 - 6).toFixed(2)
        };
      });
    },
    [cols, pieceById, rows, trayColumns]
  );

  const tryPlacePiece = useCallback(
    (pieceId, clientX, clientY) => {
      if (phase !== "play" || !boardRef.current) {
        return;
      }

      const boardRect = boardRef.current.getBoundingClientRect();
      const insideBoard =
        clientX >= boardRect.left &&
        clientX <= boardRect.right &&
        clientY >= boardRect.top &&
        clientY <= boardRect.bottom;

      if (!insideBoard) {
        return;
      }

      const slotWidth = boardRect.width / cols;
      const slotHeight = boardRect.height / rows;
      const slotCol = Math.min(
        cols - 1,
        Math.max(0, Math.floor((clientX - boardRect.left) / slotWidth))
      );
      const slotRow = Math.min(
        rows - 1,
        Math.max(0, Math.floor((clientY - boardRect.top) / slotHeight))
      );
      const slotIndex = slotRow * cols + slotCol;

      if (slotIndex !== pieceId) {
        return;
      }

      const currentSlots = placedBySlotRef.current;
      if (currentSlots[slotIndex] !== null) {
        return;
      }

      const nextSlots = [...currentSlots];
      nextSlots[slotIndex] = pieceId;
      placedBySlotRef.current = nextSlots;
      setPlacedBySlot(nextSlots);
      setBurst((previousBurst) => ({
        id: (previousBurst?.id ?? 0) + 1,
        x: `${((slotCol + 0.5) / cols) * 100}%`,
        y: `${((slotRow + 0.5) / rows) * 100}%`
      }));
      void onAddScore(pointsPerPiece);
    },
    [cols, onAddScore, phase, pointsPerPiece, rows]
  );

  const onTrayPiecePointerDown = useCallback(
    (event, pieceId) => {
      if (phase !== "play" || !isRunning || dragStateRef.current) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.setPointerCapture(event.pointerId);
      const nextDragState = {
        pieceId,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        width: rect.width,
        height: rect.height
      };

      dragStateRef.current = nextDragState;
      setDragState(nextDragState);
    },
    [isRunning, phase]
  );

  const onTrayPiecePointerMove = useCallback((event) => {
    const currentDrag = dragStateRef.current;
    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    const nextDragState = {
      ...currentDrag,
      x: event.clientX,
      y: event.clientY
    };

    dragStateRef.current = nextDragState;
    setDragState(nextDragState);
  }, []);

  const onTrayPiecePointerUp = useCallback(
    (event) => {
      const currentDrag = dragStateRef.current;
      if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      clearDragState();
      tryPlacePiece(currentDrag.pieceId, event.clientX, event.clientY);
    },
    [clearDragState, tryPlacePiece]
  );

  const onTrayPiecePointerCancel = useCallback(
    (event) => {
      const currentDrag = dragStateRef.current;
      if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      clearDragState();
    },
    [clearDragState]
  );

  useEffect(() => {
    const resetSlots = Array(pieceCount).fill(null);
    placedBySlotRef.current = resetSlots;
    setPlacedBySlot(resetSlots);
  }, [pieceCount]);

  useEffect(() => {
    if (!isRunning) {
      completedRef.current = false;
      setPhase("idle");
      setPreviewCountdown(previewSeconds);
      setScatterPieces([]);
      setScatterActive(false);
      clearDragState();
      return undefined;
    }

    const selectedFromPool = randomFromList(
      puzzleImagePool,
      PUZZLE_IMAGE_POOLS.A[0]
    );
    const nextTrayPieceIds = shuffle(pieces.map((piece) => piece.id));
    let scatterTimeoutId = null;
    let rafOne = null;
    let rafTwo = null;

    completedRef.current = false;
    setSelectedImage(selectedFromPool);
    setTrayPieceOrder(nextTrayPieceIds);
    const resetSlots = Array(pieceCount).fill(null);
    placedBySlotRef.current = resetSlots;
    setPlacedBySlot(resetSlots);
    setPreviewCountdown(previewSeconds);
    setPhase("preview");
    setScatterPieces([]);
    setScatterActive(false);
    clearDragState();

    const countdownId = window.setInterval(() => {
      setPreviewCountdown((currentValue) => Math.max(1, currentValue - 1));
    }, 1000);

    const previewTimeoutId = window.setTimeout(() => {
      window.clearInterval(countdownId);

      const nextScatterFrames = getScatterFrames(nextTrayPieceIds);

      if (nextScatterFrames.length === 0) {
        setPreviewCountdown(0);
        setPhase("play");
        return;
      }

      setPreviewCountdown(0);
      setScatterPieces(nextScatterFrames);
      setPhase("scatter");
      setScatterActive(false);
      rafOne = window.requestAnimationFrame(() => {
        rafTwo = window.requestAnimationFrame(() => {
          setScatterActive(true);
        });
      });
      scatterTimeoutId = window.setTimeout(() => {
        setScatterPieces([]);
        setScatterActive(false);
        setPhase("play");
      }, scatterDuration);
    }, previewSeconds * 1000);

    return () => {
      window.clearInterval(countdownId);
      window.clearTimeout(previewTimeoutId);
      if (scatterTimeoutId) {
        window.clearTimeout(scatterTimeoutId);
      }

      if (rafOne) {
        window.cancelAnimationFrame(rafOne);
      }

      if (rafTwo) {
        window.cancelAnimationFrame(rafTwo);
      }
    };
  }, [
    activeGroup,
    activeKey,
    clearDragState,
    getScatterFrames,
    isRunning,
    pieceCount,
    pieces,
    previewSeconds,
    puzzleImagePool,
    scatterDuration
  ]);

  const placedCount = useMemo(
    () => placedBySlot.reduce((total, pieceId) => (pieceId === null ? total : total + 1), 0),
    [placedBySlot]
  );
  const visibleTrayPieceIds = useMemo(() => {
    const placedSet = new Set(placedBySlot.filter((pieceId) => pieceId !== null));
    return trayPieceOrder.filter((pieceId) => !placedSet.has(pieceId));
  }, [placedBySlot, trayPieceOrder]);

  useEffect(() => {
    if (!isRunning || phase !== "play" || placedCount !== pieceCount || completedRef.current) {
      return;
    }

    completedRef.current = true;
    setPhase("complete");
    void onCompleteTurn();
  }, [isRunning, onCompleteTurn, phase, pieceCount, placedCount]);

  const dragPiece = dragState ? pieceById.get(dragState.pieceId) : null;

  return (
    <main className="app-screen game-screen puzzle-screen">
      <header className="game-header">
        <ScoreBox label="A Grubu" score={groups.A.score} active={activeGroup === "A"} />
        <div className="timer-box">{formatTime(timeLeft)}</div>
        <ScoreBox label="B Grubu" score={groups.B.score} active={activeGroup === "B"} />
      </header>

      {!isRunning ? (
        <section className="turn-start" aria-label="Tur başlangıcı">
          <div className="turn-label">{groups[activeGroup].name}</div>
          <button className="pixel-button start-button" onClick={onStartTurn}>
            Başlat
          </button>
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
        </section>
      ) : (
        <section className="puzzle-stage">
          <IconActionButton actionType="reset" className="small-button reset-button" onClick={onReset} />
          <div className="puzzle-workspace" ref={workspaceRef}>
            <div className="puzzle-board" ref={boardRef} style={boardGridStyle}>
              {Array.from({ length: pieceCount }, (_, slotIndex) => {
                const pieceId = placedBySlot[slotIndex];
                const piece = pieceId !== null ? pieceById.get(pieceId) : null;

                return (
                  <div className={`puzzle-slot ${piece ? "filled" : ""}`} key={slotIndex}>
                    {piece ? (
                      <div
                        className="puzzle-piece board-piece"
                        style={getPuzzlePieceBackgroundStyle(piece, selectedImage, cols, rows)}
                      />
                    ) : null}
                  </div>
                );
              })}
              {phase === "preview" ? (
                <div className="puzzle-preview">
                  <img alt="Puzzle Önizleme" src={selectedImage} />
                  <span>{previewCountdown}</span>
                </div>
              ) : null}
            </div>
            <div
              className={`puzzle-tray ${phase === "play" || phase === "scatter" ? "active" : ""}`}
              ref={trayRef}
              style={trayGridStyle}
            >
              {(phase === "play" || phase === "complete" || phase === "scatter")
                ? visibleTrayPieceIds.map((pieceId) => {
                  const piece = pieceById.get(pieceId);
                  const isDragging = dragState?.pieceId === pieceId;

                  return (
                    <button
                      className={`puzzle-piece tray-piece ${isDragging ? "drag-source" : ""}`}
                      key={pieceId}
                      onPointerCancel={onTrayPiecePointerCancel}
                      onPointerDown={(event) => onTrayPiecePointerDown(event, pieceId)}
                      onPointerMove={onTrayPiecePointerMove}
                      onPointerUp={onTrayPiecePointerUp}
                      style={getPuzzlePieceBackgroundStyle(piece, selectedImage, cols, rows)}
                      type="button"
                    />
                  );
                })
                : null}
            </div>
            {phase === "scatter" ? (
              <div className="puzzle-scatter-layer" aria-hidden="true">
                {scatterPieces.map((scatterPiece) => {
                  const piece = pieceById.get(scatterPiece.pieceId);
                  const style = {
                    ...getPuzzlePieceBackgroundStyle(piece, selectedImage, cols, rows),
                    width: `${scatterPiece.width}px`,
                    height: `${scatterPiece.height}px`,
                    left: `${scatterPiece.fromX}px`,
                    top: `${scatterPiece.fromY}px`,
                    transform: scatterActive
                      ? `translate(${scatterPiece.toX - scatterPiece.fromX}px, ${scatterPiece.toY - scatterPiece.fromY}px) rotate(${scatterPiece.rotation}deg)`
                      : "translate(0, 0) rotate(0deg)"
                  };

                  return (
                    <div
                      className="puzzle-piece scatter-piece"
                      key={`scatter-${scatterPiece.pieceId}`}
                      style={style}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
          <CelebrationBurst burst={burst} />
          {dragPiece && dragState ? (
            <div
              className="puzzle-piece puzzle-drag-piece"
              style={{
                ...getPuzzlePieceBackgroundStyle(dragPiece, selectedImage, cols, rows),
                width: `${dragState.width}px`,
                height: `${dragState.height}px`,
                left: `${dragState.x - dragState.offsetX}px`,
                top: `${dragState.y - dragState.offsetY}px`
              }}
            />
          ) : null}
        </section>
      )}
    </main>
  );
}

function WinnerScreen({ groups, onRestart }) {
  return (
    <main className="app-screen center-screen winner-screen">
      <section className="winner-panel">
        <h1>{getWinner(groups)}</h1>
        <div className="winner-scores">
          {GROUP_KEYS.map((groupKey) => (
            <div className="winner-score" key={groupKey}>
              <span>{groups[groupKey].name}</span>
              <strong>{groups[groupKey].score}</strong>
            </div>
          ))}
        </div>
        <button className="pixel-button start-button" onClick={onRestart}>
          Yeniden Başla
        </button>
      </section>
    </main>
  );
}

export default App;
