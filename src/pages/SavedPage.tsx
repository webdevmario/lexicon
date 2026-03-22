import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  X,
  Download,
  Upload,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWordStore } from "@/stores/wordStore";
import { useWordLookup } from "@/hooks/useWordLookup";
import { useListStore, type WordList } from "@/stores/listStore";
import WordCard from "@/components/WordCard";
import WordModal from "@/components/WordModal";
import EmptyState from "@/components/EmptyState";
import styles from "./SavedPage.module.css";

/** A single row in the word list */
function WordRow({
  word,
  onOpen,
}: {
  word: string;
  onOpen: () => void;
}) {
  const { data } = useWordLookup(word);
  const entry = data?.[0];
  const firstDef = entry?.meanings[0]?.definitions[0]?.definition;

  return (
    <motion.button
      className={styles.wordRow}
      onClick={onOpen}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <span className={styles.wordRowWord}>{word}</span>
      <span className={styles.wordRowDef}>
        {firstDef ?? ""}
      </span>
      <ChevronRight size={14} className={styles.wordRowChevron} />
    </motion.button>
  );
}

/** A single list card on the saved page */
function ListCard({
  list,
  onOpen,
}: {
  list: WordList;
  onOpen: () => void;
}) {
  return (
    <motion.button
      className={styles.listCard}
      onClick={onOpen}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.listCardInfo}>
        <span className={styles.listCardName}>{list.name}</span>
        <span className={styles.listCardCount}>
          {list.words.length} word{list.words.length !== 1 ? "s" : ""}
        </span>
      </div>
      <ChevronRight size={16} className={styles.listCardArrow} />
    </motion.button>
  );
}

/** Detail view when a list is opened */
function ListDetail({
  list,
  onBack,
}: {
  list: WordList;
  onBack: () => void;
}) {
  const { removeWordFromList, deleteList, renameList } = useListStore();
  const [modalWord, setModalWord] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const modalEntry = useWordLookup(modalWord ?? undefined);

  const handleRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== list.name) {
      renameList(list.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    onBack();
    deleteList(list.id);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
            Back
          </button>
          {isEditing ? (
            <input
              className={styles.renameInput}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setEditName(list.name);
                  setIsEditing(false);
                }
              }}
              autoFocus
            />
          ) : (
            <h2
              className={styles.title}
              onDoubleClick={() => setIsEditing(true)}
            >
              {list.name}
            </h2>
          )}
          <span className={styles.count}>
            {list.words.length} word{list.words.length !== 1 ? "s" : ""}
          </span>
        </div>
        {!list.isDefault && (
          <button className={styles.toolBtn} onClick={handleDelete}>
            <Trash2 size={14} strokeWidth={2} />
            Delete
          </button>
        )}
      </header>

      {list.words.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="This list is empty"
          description="Add words to this list from any word card."
        />
      ) : (
        <div className={styles.wordList}>
          <AnimatePresence mode="popLayout">
            {list.words.map((word) => (
              <WordRow
                key={word}
                word={word}
                onOpen={() => setModalWord(word)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <WordModal isOpen={!!modalWord} onClose={() => setModalWord(null)}>
        {modalEntry.isLoading && (
          <div className={styles.modalLoading}>
            <div className={styles.spinner} />
          </div>
        )}
        {modalEntry.data && modalEntry.data[0] && (
          <WordCard entry={modalEntry.data[0]} />
        )}
      </WordModal>
    </div>
  );
}

export default function SavedPage() {
  const navigate = useNavigate();
  const { getSavedWords, removeWord, exportData, importData } = useWordStore();
  const { lists, createList } = useListStore();
  const savedWords = getSavedWords();
  const [search, setSearch] = useState("");
  const [modalWord, setModalWord] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [showNewList, setShowNewList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modalEntry = useWordLookup(modalWord ?? undefined);

  const activeList = activeListId
    ? lists.find((l) => l.id === activeListId)
    : null;

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

  const handleCreateList = () => {
    const trimmed = newListName.trim();
    if (trimmed) {
      createList(trimmed);
      setNewListName("");
      setShowNewList(false);
    }
  };

  // Show list detail view
  if (activeList) {
    return (
      <ListDetail
        list={activeList}
        onBack={() => setActiveListId(null)}
      />
    );
  }

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

        {/* Lists section even when no saved words */}
        <section className={styles.listsSection}>
          <div className={styles.listsSectionHeader}>
            <h3 className={styles.listsSectionTitle}>Lists</h3>
            <button
              className={styles.newListBtn}
              onClick={() => setShowNewList(true)}
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
          {showNewList && (
            <div className={styles.newListRow}>
              <input
                className={styles.newListInput}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateList();
                  if (e.key === "Escape") {
                    setShowNewList(false);
                    setNewListName("");
                  }
                }}
                placeholder="List name…"
                autoFocus
              />
              <button className={styles.newListSave} onClick={handleCreateList}>
                Create
              </button>
            </div>
          )}
          <div className={styles.listGrid}>
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onOpen={() => setActiveListId(list.id)}
              />
            ))}
          </div>
        </section>

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

      {/* Lists */}
      <section className={styles.listsSection}>
        <div className={styles.listsSectionHeader}>
          <h3 className={styles.listsSectionTitle}>Lists</h3>
          <button
            className={styles.newListBtn}
            onClick={() => setShowNewList(true)}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
        {showNewList && (
          <div className={styles.newListRow}>
            <input
              className={styles.newListInput}
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateList();
                if (e.key === "Escape") {
                  setShowNewList(false);
                  setNewListName("");
                }
              }}
              placeholder="List name…"
              autoFocus
            />
            <button className={styles.newListSave} onClick={handleCreateList}>
              Create
            </button>
          </div>
        )}
        <div className={styles.listGrid}>
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onOpen={() => setActiveListId(list.id)}
            />
          ))}
        </div>
      </section>

      {/* All saved words */}
      <section>
        <div className={styles.allWordsHeader}>
          <h3 className={styles.listsSectionTitle}>All Words</h3>
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
              <button
                className={`${styles.filterClear} ${search ? styles.filterClearVisible : ""}`}
                onClick={() => setSearch("")}
                tabIndex={search ? 0 : -1}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.wordList}>
          <AnimatePresence mode="popLayout">
            {sorted.map((sw) => (
              <WordRow
                key={sw.word}
                word={sw.word}
                onOpen={() => setModalWord(sw.word)}
              />
            ))}
          </AnimatePresence>
        </div>

        {sorted.length === 0 && search.trim() && (
          <p className={styles.noResults}>No words match "{search}"</p>
        )}
      </section>

      {/* Full word modal */}
      <WordModal isOpen={!!modalWord} onClose={() => setModalWord(null)}>
        {modalEntry.isLoading && (
          <div className={styles.modalLoading}>
            <div className={styles.spinner} />
          </div>
        )}
        {modalEntry.data && modalEntry.data[0] && (
          <WordCard entry={modalEntry.data[0]} />
        )}
      </WordModal>
    </div>
  );
}
