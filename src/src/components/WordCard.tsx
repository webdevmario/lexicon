import { motion } from "framer-motion";
import { Heart, Volume2, ExternalLink } from "lucide-react";
import { getAudioUrl, getPhoneticText } from "@/lib/api";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useWordStore } from "@/stores/wordStore";
import type { WordEntry } from "@/types";
import styles from "./WordCard.module.css";

interface WordCardProps {
  entry: WordEntry;
  /** If true, shows a compact inline version */
  compact?: boolean;
}

const MASTERY_LABELS: Record<string, string> = {
  new: "New",
  learning: "Learning",
  familiar: "Familiar",
  mastered: "Mastered",
};

export default function WordCard({ entry, compact = false }: WordCardProps) {
  const { isSaved, saveWord, removeWord, words } = useWordStore();
  const { play, isPlaying } = useAudioPlayer();

  const saved = isSaved(entry.word);
  const savedData = words[entry.word.toLowerCase()];
  const audioUrl = getAudioUrl(entry);
  const phonetic = getPhoneticText(entry);

  const handleHeart = () => {
    if (saved) {
      removeWord(entry.word);
    } else {
      saveWord(entry.word);
    }
  };

  const handlePronounce = () => {
    if (audioUrl) play(audioUrl);
  };

  return (
    <motion.article
      className={`${styles.card} ${compact ? styles.compact : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.wordGroup}>
          <h1 className={compact ? styles.wordCompact : styles.word}>{entry.word}</h1>
          {phonetic && <span className={styles.phonetic}>{phonetic}</span>}
          {saved && savedData && (
            <span className={styles.masteryBadge} data-level={savedData.mastery}>
              {MASTERY_LABELS[savedData.mastery]}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          {audioUrl && (
            <button
              className={`${styles.iconBtn} ${isPlaying ? styles.playing : ""}`}
              onClick={handlePronounce}
              aria-label="Pronounce word"
              title="Hear pronunciation"
            >
              <Volume2 size={18} strokeWidth={2} />
            </button>
          )}
          <button
            className={`${styles.heartBtn} ${saved ? styles.hearted : ""}`}
            onClick={handleHeart}
            aria-label={saved ? "Remove from saved" : "Save word"}
            title={saved ? "Remove from saved" : "Save word"}
          >
            <Heart size={18} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      {/* Meanings */}
      <div className={styles.meanings}>
        {entry.meanings.map((meaning, i) => (
          <section key={`${meaning.partOfSpeech}-${i}`} className={styles.pos}>
            <div className={styles.posHeader}>
              <span className={styles.posLabel}>{meaning.partOfSpeech}</span>
              <div className={styles.posDivider} />
            </div>

            <ol className={styles.defList}>
              {meaning.definitions.slice(0, compact ? 2 : 6).map((def, j) => (
                <li
                  key={j}
                  className={styles.defItem}
                  style={{ animationDelay: `${(i * 3 + j) * 60}ms` }}
                >
                  <p className={styles.defText}>{def.definition}</p>
                  {def.example && !compact && (
                    <p className={styles.example}>"{def.example}"</p>
                  )}
                </li>
              ))}
            </ol>

            {/* Synonyms */}
            {!compact && meaning.synonyms && meaning.synonyms.length > 0 && (
              <div className={styles.synonyms}>
                <span className={styles.synLabel}>Synonyms</span>
                <div className={styles.synTags}>
                  {meaning.synonyms.slice(0, 6).map((syn) => (
                    <span key={syn} className={styles.synTag}>
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms */}
            {!compact && meaning.antonyms && meaning.antonyms.length > 0 && (
              <div className={styles.synonyms}>
                <span className={styles.synLabel}>Antonyms</span>
                <div className={styles.synTags}>
                  {meaning.antonyms.slice(0, 6).map((ant) => (
                    <span key={ant} className={`${styles.synTag} ${styles.antTag}`}>
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Origin */}
      {!compact && entry.origin && (
        <section className={styles.origin}>
          <h3 className={styles.originTitle}>Etymology</h3>
          <p className={styles.originText}>{entry.origin}</p>
        </section>
      )}

      {/* Source link */}
      {!compact && entry.sourceUrls && entry.sourceUrls.length > 0 && (
        <footer className={styles.footer}>
          <a
            href={entry.sourceUrls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            Source <ExternalLink size={12} />
          </a>
        </footer>
      )}
    </motion.article>
  );
}
