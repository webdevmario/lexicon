import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWordStore } from "@/stores/wordStore";
import { useWordLookup } from "@/hooks/useWordLookup";
import { generateQuiz } from "@/lib/quiz";
import EmptyState from "@/components/EmptyState";
import type { QuizQuestion, WordEntry } from "@/types";
import styles from "./PracticePage.module.css";

/** Small helper to fetch entries for multiple words */
function useMultiWordLookup(words: string[]) {
  const results = new Map<string, WordEntry>();
  const queries = words.map((w) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useWordLookup(w);
    if (data && data[0]) results.set(w, data[0]);
    return data;
  });

  const loading = queries.some((d) => d === undefined);
  return { entries: results, loading };
}

type QuizState = "loading" | "ready" | "question" | "result" | "complete";

export default function PracticePage() {
  const navigate = useNavigate();
  const { getSavedWords, addQuizAttempt } = useWordStore();
  const savedWords = getSavedWords();

  const wordStrings = savedWords.map((sw) => sw.word);
  const { entries, loading } = useMultiWordLookup(wordStrings);

  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const currentQ = questions[currentIndex] ?? null;
  const isCorrect = selectedAnswer === currentQ?.correctAnswer;
  const totalQuestions = questions.length;

  // Generate quiz once entries are loaded
  useEffect(() => {
    if (!loading && entries.size >= 4 && quizState === "loading") {
      const q = generateQuiz(savedWords, entries, 5);
      if (q.length > 0) {
        setQuestions(q);
        setQuizState("ready");
      }
    }
  }, [loading, entries, savedWords, quizState]);

  const startQuiz = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizState("question");
  }, []);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer || !currentQ) return;
      setSelectedAnswer(answer);
      setQuizState("result");

      const correct = answer === currentQ.correctAnswer;
      if (correct) setScore((s) => s + 1);

      addQuizAttempt(currentQ.word, {
        timestamp: Date.now(),
        correct,
        questionType: currentQ.type,
      });
    },
    [selectedAnswer, currentQ, addQuizAttempt],
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      setQuizState("complete");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setQuizState("question");
    }
  }, [currentIndex, totalQuestions]);

  const restartQuiz = useCallback(() => {
    const q = generateQuiz(savedWords, entries, 5);
    setQuestions(q);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizState("ready");
  }, [savedWords, entries]);

  // Not enough words
  if (savedWords.length < 4) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h2 className={styles.title}>Practice</h2>
        </header>
        <EmptyState
          icon={<Heart size={28} />}
          title="Save at least 4 words"
          description="You need at least 4 saved words to start a practice quiz. Keep exploring and saving words you like."
          action={
            <button className={styles.ctaBtn} onClick={() => navigate("/search")}>
              Find words to save
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>Practice</h2>
        <p className={styles.subtitle}>
          Test your knowledge of saved words. Mastery updates automatically.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {/* Loading */}
        {(quizState === "loading" || loading) && (
          <motion.div
            key="loading"
            className={styles.stateCard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.spinner} />
            <p className={styles.stateText}>Preparing your quiz…</p>
          </motion.div>
        )}

        {/* Ready */}
        {quizState === "ready" && (
          <motion.div
            key="ready"
            className={styles.stateCard}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.readyIcon}>
              <GraduationCap size={32} strokeWidth={1.5} />
            </div>
            <h3 className={styles.readyTitle}>{totalQuestions} Questions Ready</h3>
            <p className={styles.readyDesc}>
              Questions are generated from your {savedWords.length} saved words, weighted
              toward words you're still learning.
            </p>
            <button className={styles.startBtn} onClick={startQuiz}>
              Start Quiz
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {/* Question / Result */}
        {(quizState === "question" || quizState === "result") && currentQ && (
          <motion.div
            key={`q-${currentIndex}`}
            className={styles.questionCard}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Progress */}
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <motion.div
                  className={styles.progressFill}
                  animate={{
                    width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className={styles.progressText}>
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* Prompt */}
            <p className={styles.prompt}>{currentQ.prompt}</p>

            {/* Options */}
            <div className={styles.options}>
              {currentQ.options.map((option) => {
                let optionClass = styles.optionBtn;
                if (selectedAnswer) {
                  if (option === currentQ.correctAnswer) {
                    optionClass += ` ${styles.correct}`;
                  } else if (
                    option === selectedAnswer &&
                    option !== currentQ.correctAnswer
                  ) {
                    optionClass += ` ${styles.incorrect}`;
                  } else {
                    optionClass += ` ${styles.dimmed}`;
                  }
                }

                return (
                  <button
                    key={option}
                    className={optionClass}
                    onClick={() => handleAnswer(option)}
                    disabled={!!selectedAnswer}
                  >
                    <span className={styles.optionText}>{option}</span>
                    {selectedAnswer && option === currentQ.correctAnswer && (
                      <CheckCircle2 size={18} className={styles.optionIcon} />
                    )}
                    {selectedAnswer &&
                      option === selectedAnswer &&
                      option !== currentQ.correctAnswer && (
                        <XCircle size={18} className={styles.optionIcon} />
                      )}
                  </button>
                );
              })}
            </div>

            {/* Result feedback + Next */}
            <AnimatePresence>
              {quizState === "result" && (
                <motion.div
                  className={styles.feedback}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <span
                    className={isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}
                  >
                    {isCorrect ? "Correct!" : "Not quite."}
                  </span>
                  <button className={styles.nextBtn} onClick={nextQuestion}>
                    {currentIndex + 1 >= totalQuestions ? "See Results" : "Next"}
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Complete */}
        {quizState === "complete" && (
          <motion.div
            key="complete"
            className={styles.stateCard}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.scoreCircle}>
              <span className={styles.scoreNumber}>{score}</span>
              <span className={styles.scoreTotal}>/ {totalQuestions}</span>
            </div>
            <h3 className={styles.readyTitle}>
              {score === totalQuestions
                ? "Perfect!"
                : score >= totalQuestions * 0.6
                  ? "Nice work!"
                  : "Keep practicing!"}
            </h3>
            <p className={styles.readyDesc}>
              Your mastery levels have been updated based on your answers.
            </p>
            <div className={styles.completeActions}>
              <button className={styles.startBtn} onClick={restartQuiz}>
                <RotateCcw size={16} />
                Try Again
              </button>
              <button className={styles.secondaryBtn} onClick={() => navigate("/saved")}>
                View Saved Words
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
