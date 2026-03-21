import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useWordLookup } from "@/hooks/useWordLookup";
import SearchInput from "@/components/SearchInput";
import WordCard from "@/components/WordCard";
import EmptyState from "@/components/EmptyState";
import styles from "./SearchPage.module.css";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const queryParam = params.get("q") ?? "";
  const [activeWord, setActiveWord] = useState(queryParam);

  const { data, isLoading, error } = useWordLookup(activeWord);

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
      <div className={styles.searchWrap}>
        <SearchInput
          onSearch={handleSearch}
          initialValue={queryParam}
          autoFocus
          size="large"
          placeholder="Type a word…"
        />
      </div>

      <div className={styles.results}>
        {isLoading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        )}

        {error && (
          <EmptyState
            icon={<AlertCircle size={24} />}
            title="Not found"
            description={error.message}
          />
        )}

        {data &&
          data.map((entry, i) => (
            <WordCard key={`${entry.word}-${i}`} entry={entry} />
          ))}
      </div>
    </div>
  );
}
