import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, AlertCircle } from "lucide-react";
import { useWordLookup } from "@/hooks/useWordLookup";
import SearchInput from "@/components/SearchInput";
import WordCard from "@/components/WordCard";
import EmptyState from "@/components/EmptyState";
import styles from "./SearchPage.module.css";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const queryParam = params.get("q") ?? "";
  const [activeWord, setActiveWord] = useState(queryParam);

  const { data, isLoading, error, isFetched } = useWordLookup(activeWord);

  // Sync with URL query param
  useEffect(() => {
    const q = params.get("q");
    if (q && q !== activeWord) {
      setActiveWord(q);
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (word: string) => {
    setActiveWord(word);
    setParams({ q: word });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>Look Up</h2>
        <p className={styles.subtitle}>
          Search any English word for definitions, pronunciation, and etymology.
        </p>
      </header>

      <div className={styles.searchWrap}>
        <SearchInput
          onSearch={handleSearch}
          initialValue={queryParam}
          autoFocus
          size="large"
        />
      </div>

      <div className={styles.results}>
        {isLoading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <span className={styles.loadingText}>Looking up "{activeWord}"…</span>
          </div>
        )}

        {error && (
          <EmptyState
            icon={<AlertCircle size={28} />}
            title="Word not found"
            description={error.message}
          />
        )}

        {data &&
          data.map((entry, i) => <WordCard key={`${entry.word}-${i}`} entry={entry} />)}

        {!activeWord && !isLoading && !isFetched && (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="Start exploring"
            description="Type any word above to see its full definition, pronunciation, synonyms, and etymology."
          />
        )}
      </div>
    </div>
  );
}
