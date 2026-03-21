/** A single meaning/sense of a word within a part of speech */
export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

/** A group of definitions under one part of speech */
export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

/** Phonetic information for a word */
export interface Phonetic {
  text?: string;
  audio?: string;
}

/** Full word entry from the dictionary API */
export interface WordEntry {
  word: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  origin?: string;
  sourceUrls?: string[];
}

/** A word saved to the user's personal collection */
export interface SavedWord {
  id: string;
  word: string;
  savedAt: number;
  note?: string;
  mastery: MasteryLevel;
  quizHistory: QuizAttempt[];
}

/** How well the user knows a word */
export type MasteryLevel = "new" | "learning" | "familiar" | "mastered";

/** A single quiz attempt record */
export interface QuizAttempt {
  timestamp: number;
  correct: boolean;
  questionType: QuizQuestionType;
}

/** Types of quiz questions */
export type QuizQuestionType =
  | "definition-match"
  | "fill-blank"
  | "synonym-pick"
  | "reverse-lookup";

/** A quiz question presented to the user */
export interface QuizQuestion {
  type: QuizQuestionType;
  word: string;
  prompt: string;
  correctAnswer: string;
  options: string[];
}
