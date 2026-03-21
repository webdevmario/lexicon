import type { QuizQuestion, QuizQuestionType, SavedWord, WordEntry } from "@/types";

/** Pick a random element from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shuffle an array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates a definition-match question:
 * "Which word means [definition]?" with 4 choices.
 */
function makeDefinitionMatch(
  target: WordEntry,
  distractorWords: string[],
): QuizQuestion | null {
  const firstDef = target.meanings[0]?.definitions[0]?.definition;
  if (!firstDef) return null;

  const options = shuffle([target.word, ...distractorWords.slice(0, 3)]);

  return {
    type: "definition-match",
    word: target.word,
    prompt: `Which word means: "${firstDef}"?`,
    correctAnswer: target.word,
    options,
  };
}

/**
 * Generates a reverse-lookup question:
 * "What is the definition of [word]?" with 4 definition choices.
 */
function makeReverseLookup(
  target: WordEntry,
  distractorEntries: WordEntry[],
): QuizQuestion | null {
  const correctDef = target.meanings[0]?.definitions[0]?.definition;
  if (!correctDef) return null;

  const wrongDefs = distractorEntries
    .map((e) => e.meanings[0]?.definitions[0]?.definition)
    .filter((d): d is string => !!d && d !== correctDef)
    .slice(0, 3);

  if (wrongDefs.length < 3) return null;

  const options = shuffle([correctDef, ...wrongDefs]);

  return {
    type: "reverse-lookup",
    word: target.word,
    prompt: `What does "${target.word}" mean?`,
    correctAnswer: correctDef,
    options,
  };
}

/**
 * Generates a synonym-pick question if synonyms are available.
 */
function makeSynonymPick(
  target: WordEntry,
  distractorWords: string[],
): QuizQuestion | null {
  const allSynonyms = target.meanings.flatMap((m) => m.synonyms ?? []);
  if (allSynonyms.length === 0) return null;

  const correctSynonym = pick(allSynonyms);
  const wrongWords = distractorWords
    .filter((w) => !allSynonyms.includes(w) && w !== target.word)
    .slice(0, 3);

  if (wrongWords.length < 3) return null;

  const options = shuffle([correctSynonym, ...wrongWords]);

  return {
    type: "synonym-pick",
    word: target.word,
    prompt: `Which is a synonym of "${target.word}"?`,
    correctAnswer: correctSynonym,
    options,
  };
}

/**
 * Builds a quiz of N questions from the user's saved words + their fetched entries.
 * Prioritizes words with lower mastery.
 */
export function generateQuiz(
  savedWords: SavedWord[],
  entries: Map<string, WordEntry>,
  count = 5,
): QuizQuestion[] {
  if (savedWords.length < 4) return [];

  // Weight towards less-mastered words
  const masteryWeight: Record<string, number> = {
    new: 4,
    learning: 3,
    familiar: 2,
    mastered: 1,
  };

  const weighted = savedWords.flatMap((sw) => {
    const weight = masteryWeight[sw.mastery] ?? 1;
    return Array(weight).fill(sw) as SavedWord[];
  });

  const questions: QuizQuestion[] = [];
  const usedWords = new Set<string>();
  const allWords = savedWords.map((sw) => sw.word);

  let attempts = 0;
  const maxAttempts = count * 10;

  while (questions.length < count && attempts < maxAttempts) {
    attempts++;

    const target = pick(weighted);
    if (usedWords.has(target.word)) continue;

    const entry = entries.get(target.word);
    if (!entry) continue;

    const distractorWords = allWords.filter((w) => w !== target.word);
    if (distractorWords.length < 3) break;

    const questionTypes: QuizQuestionType[] = [
      "definition-match",
      "reverse-lookup",
      "synonym-pick",
    ];
    const type = pick(questionTypes);

    let question: QuizQuestion | null = null;

    const distractorEntries = distractorWords
      .map((w) => entries.get(w))
      .filter((e): e is WordEntry => !!e);

    switch (type) {
      case "definition-match":
        question = makeDefinitionMatch(entry, shuffle(distractorWords));
        break;
      case "reverse-lookup":
        question = makeReverseLookup(entry, shuffle(distractorEntries));
        break;
      case "synonym-pick":
        question = makeSynonymPick(entry, shuffle(distractorWords));
        break;
    }

    if (question) {
      questions.push(question);
      usedWords.add(target.word);
    }
  }

  return shuffle(questions);
}
