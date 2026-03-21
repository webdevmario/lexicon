import { useNavigate } from "react-router-dom";
import styles from "./WordChip.module.css";

interface WordChipProps {
  word: string;
  variant?: "default" | "outline" | "accent";
}

export default function WordChip({ word, variant = "default" }: WordChipProps) {
  const navigate = useNavigate();

  return (
    <button
      className={`${styles.chip} ${styles[variant]}`}
      onClick={() => navigate(`/search?q=${encodeURIComponent(word)}`)}
    >
      {word}
    </button>
  );
}
