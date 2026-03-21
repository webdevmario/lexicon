/**
 * A curated list of interesting, learnable words for Word of the Day.
 * Rotates deterministically by date so every user sees the same word each day.
 */
const CURATED_WORDS = [
  "ephemeral",
  "sonder",
  "petrichor",
  "mellifluous",
  "serendipity",
  "luminous",
  "ineffable",
  "eloquence",
  "sanguine",
  "ethereal",
  "resplendent",
  "verisimilitude",
  "pernicious",
  "laconic",
  "ebullient",
  "clandestine",
  "magnanimous",
  "insouciant",
  "pulchritude",
  "susurrus",
  "halcyon",
  "limerence",
  "redolent",
  "sagacious",
  "paradigm",
  "quintessence",
  "sonorous",
  "languid",
  "incandescent",
  "felicity",
  "obfuscate",
  "perspicacious",
  "diaphanous",
  "evanescent",
  "harbinger",
  "ubiquitous",
  "juxtapose",
  "cacophony",
  "surreptitious",
  "bucolic",
  "aplomb",
  "cadence",
  "effulgent",
  "nascent",
  "reverie",
  "taciturn",
  "dulcet",
  "verdant",
  "zenith",
  "audacious",
  "phosphorescence",
  "numinous",
  "gossamer",
  "labyrinthine",
  "palimpsest",
  "chrysalis",
  "aurora",
  "solitude",
  "resonance",
  "wanderlust",
  "catharsis",
  "perennial",
  "epiphany",
  "sublime",
  "enigma",
  "cascade",
  "vestige",
  "transcend",
  "iridescent",
  "penumbra",
  "equanimity",
  "confluence",
  "luminescence",
  "rhapsody",
  "silhouette",
  "panorama",
  "tessellate",
  "archipelago",
  "crescendo",
  "ephemera",
  "kaleidoscope",
  "phenomenon",
  "renaissance",
  "symbiosis",
  "catalyst",
  "eloquent",
  "pristine",
  "ambrosial",
  "cerulean",
  "demure",
  "elysian",
  "idyllic",
  "opulent",
  "scintilla",
] as const;

/**
 * Returns a deterministic "word of the day" based on the current date.
 * Same word for everyone on the same calendar day.
 */
export function getWordOfTheDay(): string {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / 86_400_000);
  const index = daysSinceEpoch % CURATED_WORDS.length;
  return CURATED_WORDS[index];
}

/**
 * Returns a small batch of discovery words (excludes today's WOTD).
 * Useful for "explore more" sections.
 */
export function getDiscoveryWords(count = 4): string[] {
  const today = getWordOfTheDay();
  const now = new Date();
  const seed = Math.floor(now.getTime() / 86_400_000);

  const pool = CURATED_WORDS.filter((w) => w !== today);
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    const idx = (seed * (i + 7) + i * 31) % pool.length;
    const word = pool[idx];
    if (!result.includes(word)) {
      result.push(word);
    }
  }

  return result;
}
