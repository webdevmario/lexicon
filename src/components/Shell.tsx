import { NavLink, Outlet } from "react-router-dom";
import { Search, Sparkles, Heart, GraduationCap, BookOpen } from "lucide-react";
import styles from "./Shell.module.css";

const NAV_ITEMS = [
  { to: "/", icon: Sparkles, label: "Discover" },
  { to: "/search", icon: Search, label: "Look Up" },
  { to: "/saved", icon: Heart, label: "Saved" },
  { to: "/practice", icon: GraduationCap, label: "Practice" },
] as const;

export default function Shell() {
  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar}>
        <div className={styles.brand}>
          <BookOpen size={22} strokeWidth={2.5} />
          <span className={styles.brandName}>Lexicon</span>
        </div>

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
                <Icon size={18} strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.sidebarFooter}>
          <span className={styles.footerText}>
            Words are tools.
            <br />
            Collect the sharp ones.
          </span>
        </div>
      </nav>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
