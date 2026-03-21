import { useState, useCallback, useRef, useEffect } from "react";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  onSearch: (word: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
  size?: "default" | "large";
  placeholder?: string;
}

export default function SearchInput({
  onSearch,
  initialValue = "",
  autoFocus = false,
  size = "default",
  placeholder = "Search for a word…",
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed) onSearch(trimmed);
    },
    [value, onSearch],
  );

  return (
    <form
      className={`${styles.form} ${size === "large" ? styles.large : ""}`}
      onSubmit={handleSubmit}
    >
      <SearchIcon
        className={styles.icon}
        size={size === "large" ? 22 : 18}
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
      />
      {value.trim() && (
        <button type="submit" className={styles.submitBtn} aria-label="Search">
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      )}
    </form>
  );
}
