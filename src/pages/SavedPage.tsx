import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Search, X, Download, Upload, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWordStore } from "@/stores/wordStore";
import { useWordLookup } from "@/hooks/useWordLookup";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getAudioUrl, getPhoneticText } from "@/lib/api";
import WordCard from "@/components/WordCard";
import WordModal from "@/components/WordModal";
import EmptyState from "@/components/EmptyState";
import styles from "./SavedPage.module.css";

/** Mini card in the grid */
function MiniCard({
  word,
  onOpen,
  onRemove,
}: {
  word: string;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const { data } = useWordLookup(word);
  const { play } = useAudioPlayer();

  const entry = data?.[0];
  const phonetic = entry ? getPhoneticText(entry) : undefined;
  const audioUrl = entry ? getAudioUrl(entry) : undefined;
  const firstDef = entry?.meanings[0]?.definitions[0]?.definition;
  const pos = entry?.meanings[0]?.partOfSpeech;

  return (
    <motion.div
      className={styles.miniCard}
      onClick={onOpen}
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.miniTop}>
        <div className={styles.miniWordRow}>
          <span className={styles.miniWord}>{word}</span>
          {pos && <span className={styles.miniPos}>{pos}</span>}
        </div>
        <div className={styles.miniActions}>
          {audioUrl && (
            <button
              className={styles.miniIconBtn}
              onClick={(e) => {
                e.stopPropagation();
                play(audioUrl);
              }}
              aria-label="Pronounce"
            >
              <Volume2 size={13} strokeWidth={2} />
            </button>
          )}
          <button
            className={styles.miniRemoveBtn}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label={`Remove ${word}`}
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      {phonetic && <span className={styles.miniPhonetic}>{phonetic}</span>}
      {firstDef && (
        <p className={styles.miniDef}>
          {firstDef.length > 85 ? firstDef.slice(0, 85) + "…" : firstDef}
        </p>
      )}
    </motion.div>
  );
}

export default function SavedPage() {
  const navigate = useNavigate();
  const { getSavedWords, removeWord, exportData, importData } = useWordStore();
  const savedWords = getSavedWords();
  const [search, setSearch] = useState("");
  const [modalWord, setModalWord] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modalEntry = useWordLookup(modalWord ?? undefined);

  const sorted = useMemo(() => {
    const alpha = [...savedWords].sort((a, b) => a.word.localeCompare(b.word));
    if (!search.trim()) return alpha;
    const q = search.toLowerCase();
    return alpha.filter((w) => w.word.includes(q));
  }, [savedWords, search]);

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
            `Imported ${added} word${added !== 1 ? "s" : ""}` +
              (skipped > 0 ? ` · ${skipped} already saved` : ""),
          );
          setTimeout(() => setImportMsg(null), 4000);
        } catch {
          setImportMsg("Import failed — check the file format.");
          setTimeout(() => setImportMsg(null), 4000);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [importData],
  );

  if (savedWords.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h2 className={styles.title}>Saved</h2>
          <button
            className={styles.toolBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} strokeWidth={2} />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </header>
        {importMsg && <p className={styles.importMsg}>{importMsg}</p>}
        <EmptyState
          icon={<Heart size={28} />}
          title="No saved words yet"
          description="Heart any word while browsing, or import a collection."
          action={
            <button className={styles.ctaBtn} onClick={() => navigate("/search")}>
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
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Saved</h2>
          <span className={styles.count}>
            {savedWords.length} word{savedWords.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.toolBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} strokeWidth={2} />
            Import
          </button>
          <button className={styles.toolBtn} onClick={handleExport}>
            <Download size={14} strokeWidth={2} />
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

      {savedWords.length > 10 && (
        <div className={styles.filterBar}>
          <Search size={14} strokeWidth={2} className={styles.filterIcon} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter words…"
            className={styles.filterInput}
          />
        </div>
      )}

      {/* Mini card grid */}
      <div className={styles.cardGrid}>
        <AnimatePresence mode="popLayout">
          {sorted.map((sw) => (
            <MiniCard
              key={sw.word}
              word={sw.word}
              onOpen={() => setModalWord(sw.word)}
              onRemove={() => {
                if (modalWord === sw.word) setModalWord(null);
                removeWord(sw.word);
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {sorted.length === 0 && search.trim() && (
        <p className={styles.noResults}>No words match "{search}"</p>
      )}

      {/* Full word modal */}
      <WordModal isOpen={!!modalWord} onClose={() => setModalWord(null)}>
        {modalEntry.isLoading && (
          <div className={styles.modalLoading}>
            <div className={styles.spinner} />
          </div>
        )}
        {modalEntry.data && modalEntry.data[0] && <WordCard entry={modalEntry.data[0]} />}
      </WordModal>
    </div>
  );
}
