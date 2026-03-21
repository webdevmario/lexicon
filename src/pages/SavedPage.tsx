import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Search, Trash2, Download, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWordStore } from "@/stores/wordStore";
import { useWordLookup } from "@/hooks/useWordLookup";
import WordCard from "@/components/WordCard";
import EmptyState from "@/components/EmptyState";
import type { MasteryLevel } from "@/types";
import styles from "./SavedPage.module.css";

const MASTERY_FILTERS: { label: string; value: MasteryLevel | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Learning", value: "learning" },
  { label: "Familiar", value: "familiar" },
  { label: "Mastered", value: "mastered" },
];

function SavedWordRow({
  word,
  isExpanded,
  onToggle,
  onRemove,
}: {
  word: string;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { data } = useWordLookup(isExpanded ? word : undefined);
  const savedData = useWordStore((s) => s.words[word]);

  return (
    <motion.div
      className={styles.wordRow}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.rowHeader} onClick={onToggle}>
        <div className={styles.rowLeft}>
          <span className={styles.rowWord}>{word}</span>
          {savedData && (
            <span className={styles.rowBadge} data-level={savedData.mastery}>
              {savedData.mastery}
            </span>
          )}
        </div>
        <div className={styles.rowRight}>
          <span className={styles.rowDate}>
            {savedData &&
              new Date(savedData.savedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
          </span>
          <button
            className={styles.removeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label={`Remove ${word}`}
            title="Remove word"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && data && data[0] && (
          <motion.div
            className={styles.expandedCard}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <WordCard entry={data[0]} compact />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SavedPage() {
  const navigate = useNavigate();
  const { getSavedWords, removeWord, exportData, importData } = useWordStore();
  const savedWords = getSavedWords();
  const [filter, setFilter] = useState<MasteryLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = savedWords;
    if (filter !== "all") {
      result = result.filter((w) => w.mastery === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((w) => w.word.includes(q));
    }
    return result;
  }, [savedWords, filter, search]);

  const handleExport = useCallback(() => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lexicon-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const json = ev.target?.result as string;
          const { added, skipped } = importData(json);
          setImportMsg(
            `Imported ${added} new word${added !== 1 ? "s" : ""}` +
              (skipped > 0 ? ` (${skipped} already saved)` : ""),
          );
          setTimeout(() => setImportMsg(null), 4000);
        } catch {
          setImportMsg("Import failed — check that the file is valid JSON.");
          setTimeout(() => setImportMsg(null), 4000);
        }
      };
      reader.readAsText(file);

      // Reset so the same file can be re-imported if needed
      e.target.value = "";
    },
    [importData],
  );

  if (savedWords.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h2 className={styles.title}>Saved Words</h2>
          <div className={styles.headerActions}>
            <button
              className={styles.toolbarBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Import words from file"
            >
              <Upload size={15} strokeWidth={2} />
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </div>
        </header>
        {importMsg && <p className={styles.importMsg}>{importMsg}</p>}
        <EmptyState
          icon={<Heart size={28} />}
          title="No saved words yet"
          description="Heart any word while browsing, or import an existing collection."
          action={
            <button className={styles.ctaBtn} onClick={() => navigate("/search")}>
              <Search size={16} />
              Start looking up words
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Saved Words</h2>
          <p className={styles.subtitle}>
            {savedWords.length} word{savedWords.length !== 1 ? "s" : ""} in your
            collection
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.toolbarBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Import words from file"
          >
            <Upload size={15} strokeWidth={2} />
            Import
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={handleExport}
            title="Export words to JSON file"
          >
            <Download size={15} strokeWidth={2} />
            Export
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </div>
      </header>

      {importMsg && <p className={styles.importMsg}>{importMsg}</p>}

      {/* Filter bar */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {MASTERY_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              className={`${styles.filterBtn} ${filter === value ? styles.filterActive : ""}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.searchMini}>
          <Search size={14} strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter…"
            className={styles.searchMiniInput}
          />
        </div>
      </div>

      {/* Word list */}
      <div className={styles.list}>
        <AnimatePresence mode="popLayout">
          {filtered.map((sw) => (
            <SavedWordRow
              key={sw.word}
              word={sw.word}
              isExpanded={expandedWord === sw.word}
              onToggle={() => setExpandedWord(expandedWord === sw.word ? null : sw.word)}
              onRemove={() => {
                if (expandedWord === sw.word) setExpandedWord(null);
                removeWord(sw.word);
              }}
            />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className={styles.noResults}>No words match your current filters.</p>
        )}
      </div>
    </div>
  );
}
