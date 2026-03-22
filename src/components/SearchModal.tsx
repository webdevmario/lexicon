import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWordLookup } from "@/hooks/useWordLookup";
import WordCard from "@/components/WordCard";
import styles from "./SearchModal.module.css";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
}

export default function SearchModal({ isOpen, onClose, initialWord = "" }: SearchModalProps) {
  const [query, setQuery] = useState(initialWord);
  const [activeWord, setActiveWord] = useState(initialWord);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, error } = useWordLookup(activeWord);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) setActiveWord(trimmed);
    },
    [query],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setActiveWord("");
    inputRef.current?.focus();
  }, []);

  // Focus input when opened, seed with initialWord, reset when closed
  useEffect(() => {
    if (isOpen) {
      setQuery(initialWord);
      setActiveWord(initialWord);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setActiveWord("");
    }
  }, [isOpen, initialWord]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input area */}
            <form className={styles.searchBar} onSubmit={handleSubmit}>
              <Search
                size={20}
                strokeWidth={2}
                className={styles.searchIcon}
              />
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Look up any word…"
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
              />
              <button
                type="button"
                className={`${styles.clearBtn} ${query ? styles.clearBtnVisible : ""}`}
                onClick={handleClear}
                aria-label="Clear"
                tabIndex={query ? 0 : -1}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </form>

            {/* Results */}
            <div className={styles.results}>
              {!activeWord && !isLoading && (
                <div className={styles.hint}>
                  <span className={styles.hintText}>
                    Type a word and press Enter
                  </span>
                  <kbd className={styles.kbd}>&#9166;</kbd>
                </div>
              )}

              {isLoading && (
                <div className={styles.loadingWrap}>
                  <div className={styles.spinner} />
                </div>
              )}

              {error && (
                <div className={styles.errorWrap}>
                  <AlertCircle size={20} strokeWidth={2} />
                  <span>No results found for "{activeWord}"</span>
                </div>
              )}

              {data &&
                data.map((entry, i) => (
                  <WordCard key={`${entry.word}-${i}`} entry={entry} />
                ))}
            </div>

            {/* Close button */}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close search"
            >
              <span className={styles.closeBtnLabel}>esc</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
