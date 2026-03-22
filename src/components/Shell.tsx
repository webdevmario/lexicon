import { useState, useCallback, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search, Sparkles, Heart, GraduationCap, BookOpen } from "lucide-react";
import SearchModal from "@/components/SearchModal";
import styles from "./Shell.module.css";

const NAV_ITEMS = [
  { to: "/", icon: Sparkles, label: "Discover" },
  { to: "/saved", icon: Heart, label: "Saved" },
  { to: "/practice", icon: GraduationCap, label: "Practice" },
] as const;

export default function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [initialWord, setInitialWord] = useState("");

  // Open search modal if navigated to /search directly (e.g. from WordChip)
  useEffect(() => {
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      setInitialWord(params.get("q") ?? "");
      setSearchOpen(true);
    }
  }, [location.pathname, location.search]);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const openSearch = useCallback(() => {
    setInitialWord("");
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setInitialWord("");
    // If on /search, navigate home so we don't sit on a search route
    if (location.pathname === "/search") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar}>
        <div className={styles.brand}>
          <BookOpen size={20} strokeWidth={2.5} />
          <span className={styles.brandName}>Lexicon</span>
        </div>

        {/* Search trigger */}
        <button className={styles.searchTrigger} onClick={openSearch}>
          <Search size={15} strokeWidth={2} />
          <span className={styles.searchTriggerText}>Look up a word…</span>
          <kbd className={styles.searchTriggerKbd}>&#8984;K</kbd>
        </button>

        <ul className={styles.navList}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
              >
                <Icon size={17} strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className={styles.content}>
        <Outlet />
      </main>

      <SearchModal isOpen={searchOpen} onClose={closeSearch} initialWord={initialWord} />
    </div>
  );
}
