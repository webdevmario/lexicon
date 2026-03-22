import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Volume2, ExternalLink, ListPlus, Check } from "lucide-react";
import { getAudioUrl, getPhoneticText } from "@/lib/api";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useWordStore } from "@/stores/wordStore";
import { useListStore } from "@/stores/listStore";
import type { WordEntry } from "@/types";
import styles from "./WordCard.module.css";

interface WordCardProps {
  entry: WordEntry;
  compact?: boolean;
}

export default function WordCard({ entry, compact = false }: WordCardProps) {
  const { isSaved, saveWord, removeWord } = useWordStore();
  const { play, isPlaying } = useAudioPlayer();
  const { lists, addWordToList, removeWordFromList } = useListStore();
  const [showListMenu, setShowListMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const saved = isSaved(entry.word);
  const audioUrl = getAudioUrl(entry);
  const phonetic = getPhoneticText(entry);

  const handleHeart = () => {
    if (saved) removeWord(entry.word);
    else saveWord(entry.word);
  };

  const handlePronounce = () => {
    if (audioUrl) play(audioUrl);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showListMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowListMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showListMenu]);

  const wordLower = entry.word.toLowerCase();
  const wordListCount = lists.filter((l) => l.words.includes(wordLower)).length;

  return (
    <motion.article
      className={`${styles.card} ${compact ? styles.compact : ""}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Word heading */}
      <header className={styles.header}>
        <h1 className={compact ? styles.wordCompact : styles.word}>
          {entry.word}
        </h1>
        {phonetic && <span className={styles.phonetic}>{phonetic}</span>}
      </header>

      {/* Actions — below the word */}
      <div className={styles.actions}>
        {audioUrl && (
          <button
            className={`${styles.actionBtn} ${isPlaying ? styles.playing : ""}`}
            onClick={handlePronounce}
            aria-label="Pronounce word"
          >
            <Volume2 size={15} strokeWidth={2} />
            <span>Listen</span>
          </button>
        )}
        <button
          className={`${styles.actionBtn} ${saved ? styles.hearted : ""}`}
          onClick={handleHeart}
          aria-label={saved ? "Remove from saved" : "Save word"}
        >
          <Heart
            size={15}
            strokeWidth={2}
            fill={saved ? "currentColor" : "none"}
          />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>
        <div className={styles.listMenuWrap} ref={menuRef}>
          <button
            className={`${styles.actionBtn} ${wordListCount > 0 ? styles.listed : ""}`}
            onClick={() => setShowListMenu((v) => !v)}
            aria-label="Add to list"
          >
            <ListPlus size={15} strokeWidth={2} />
            <span>{wordListCount > 0 ? `In ${wordListCount} list${wordListCount !== 1 ? "s" : ""}` : "Add to List"}</span>
          </button>
          {showListMenu && (
            <div className={styles.listMenu}>
              {lists.map((list) => {
                const inList = list.words.includes(wordLower);
                return (
                  <button
                    key={list.id}
                    className={`${styles.listMenuItem} ${inList ? styles.listMenuItemActive : ""}`}
                    onClick={() => {
                      if (inList) {
                        removeWordFromList(list.id, entry.word);
                      } else {
                        addWordToList(list.id, entry.word);
                        setShowListMenu(false);
                      }
                    }}
                  >
                    <span>{list.name}</span>
                    {inList && <Check size={14} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Meanings */}
      <div className={styles.meanings}>
        {entry.meanings.map((meaning, i) => (
          <section key={`${meaning.partOfSpeech}-${i}`} className={styles.pos}>
            <div className={styles.posHeader}>
              <span className={styles.posLabel}>{meaning.partOfSpeech}</span>
              <div className={styles.posDivider} />
            </div>

            <ol className={styles.defList}>
              {meaning.definitions.slice(0, compact ? 2 : 5).map((def, j) => (
                <li
                  key={j}
                  className={styles.defItem}
                  style={{ animationDelay: `${(i * 3 + j) * 50}ms` }}
                >
                  <p className={styles.defText}>{def.definition}</p>
                  {def.example && !compact && (
                    <p className={styles.example}>"{def.example}"</p>
                  )}
                </li>
              ))}
            </ol>

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
          </section>
        ))}
      </div>

      {!compact && entry.origin && (
        <section className={styles.origin}>
          <h3 className={styles.originTitle}>Etymology</h3>
          <p className={styles.originText}>{entry.origin}</p>
        </section>
      )}

      {!compact && (
        <footer className={styles.footer}>
          {entry.sourceUrls && entry.sourceUrls.length > 0 && (
            <a
              href={entry.sourceUrls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceLink}
            >
              Source <ExternalLink size={11} />
            </a>
          )}
          <a
            href={`https://www.merriam-webster.com/dictionary/${encodeURIComponent(entry.word)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            Merriam-Webster <ExternalLink size={11} />
          </a>
        </footer>
      )}
    </motion.article>
  );
}
