import { HighScoreEntry } from "../types";

const LOCAL_STORAGE_KEY = "supermayc_highscores_v1";

const DEFAULT_HIGH_SCORES: HighScoreEntry[] = [
  {
    id: "default-1",
    name: "Maycon Bieber",
    score: 8500,
    coins: 32,
    levelName: "Jardim do Mayc",
    date: "2026-06-25"
  },
  {
    id: "default-2",
    name: "Justin Bieber",
    score: 6200,
    coins: 24,
    levelName: "Castelo de Lava",
    date: "2026-06-26"
  },
  {
    id: "default-3",
    name: "SuperMayc",
    score: 4800,
    coins: 18,
    levelName: "Subterrâneo Escuro",
    date: "2026-06-26"
  },
  {
    id: "default-4",
    name: "Bieber_Fã_99",
    score: 3500,
    coins: 14,
    levelName: "Jardim do Mayc",
    date: "2026-06-27"
  },
  {
    id: "default-5",
    name: "Luigi_Br",
    score: 2000,
    coins: 8,
    levelName: "Jardim do Mayc",
    date: "2026-06-27"
  }
];

export function getHighScores(): HighScoreEntry[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_HIGH_SCORES));
      return DEFAULT_HIGH_SCORES;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.score - a.score).slice(0, 5);
    }
    return DEFAULT_HIGH_SCORES;
  } catch (e) {
    console.error("Erro ao ler high scores:", e);
    return DEFAULT_HIGH_SCORES;
  }
}

export function saveHighScore(name: string, score: number, coins: number, levelName: string): HighScoreEntry[] {
  const currentScores = getHighScores();
  const newEntry: HighScoreEntry = {
    id: `hs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: name.trim() || "Anônimo",
    score,
    coins,
    levelName,
    date: new Date().toISOString().split("T")[0]
  };

  const updated = [...currentScores, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Erro ao salvar high score:", e);
  }

  return updated;
}

export function checkIsHighScore(score: number): boolean {
  if (score <= 0) return false;
  const currentScores = getHighScores();
  if (currentScores.length < 5) return true;
  return score > currentScores[currentScores.length - 1].score;
}
