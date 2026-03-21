import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getWordOfTheDay, getDiscoveryWords } from "@/lib/wotd";
import { useWordLookup } from "@/hooks/useWordLookup";
import { useWordStore } from "@/stores/wordStore";
import WordCard from "@/components/WordCard";
import WordChip from "@/components/WordChip";
import SearchInput from "@/components/SearchInput";
import styles from "./DiscoverPage.module.css";

export default function DiscoverPage() {
  const navigate = useNavigate();
  const todaysWord = getWordOfTheDay();
  const discoveryWords = getDiscoveryWords(6);
  const { data, isLoading, error } = useWordLookup(todaysWord);
  const savedCount = useWordStore((s) => s.count());

  const handleSearch = (word: string) => {
    navigate(`/search?q=${encodeURIComponent(word)}`);
  };

  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.page}>
      {/* Hero */}
      <motion.header
        className={styles.hero}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={styles.date}>{dateString}</span>
        <h1 className={styles.title}>
          Good{" "}
          {today.getHours() < 12
            ? "morning"
            : today.getHours() < 18
              ? "afternoon"
              : "evening"}
          .
        </h1>
        <p className={styles.subtitle}>
          {savedCount === 0
            ? "Start building your vocabulary — one word at a time."
            : `You've collected ${savedCount} word${savedCount !== 1 ? "s" : ""}. Keep going.`}
        </p>
      </motion.header>

      {/* Search */}
      <motion.div
        className={styles.searchWrap}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <SearchInput
          onSearch={handleSearch}
          size="large"
          placeholder="Look up any word…"
        />
      </motion.div>

      {/* Word of the Day */}
      <motion.section
        className={styles.wotdSection}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLabel}>
            <Sparkles size={16} strokeWidth={2.5} />
            <span>Word of the Day</span>
          </div>
        </div>

        {isLoading && (
          <div className={styles.skeleton}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} style={{ width: "70%" }} />
          </div>
        )}

        {error && (
          <p className={styles.errorText}>Could not load today's word. Try refreshing.</p>
        )}

        {data && data[0] && <WordCard entry={data[0]} />}
      </motion.section>

      {/* Explore More */}
      <motion.section
        className={styles.exploreSection}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Explore</span>
          <button className={styles.seeAllBtn} onClick={() => navigate("/search")}>
            Search <ArrowRight size={14} />
          </button>
        </div>
        <div className={styles.chipGrid}>
          {discoveryWords.map((word) => (
            <WordChip key={word} word={word} variant="outline" />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
