const CURATED_WORDS: string[] = [
  "ephemeral", "petrichor", "mellifluous", "sonder", "defenestration",
  "serendipity", "luminous", "querulous", "ineffable", "sanguine",
  "laconic", "halcyon", "ebullient", "languor", "penumbra",
  "susurrus", "vellichor", "reverie", "dulcet", "ethereal",
  "solitude", "eloquence", "vestige", "labyrinth", "enigma",
  "clandestine", "bucolic", "effervescent", "diaphanous", "sonorous",
  "quixotic", "insouciance", "limerence", "evanescent", "palimpsest",
  "numinous", "hiraeth", "gossamer", "catharsis", "wistful",
  "aplomb", "redolent", "chiaroscuro", "demure", "ennui",
  "incandescent", "meridian", "lissome", "opulent", "plethora",
  "quintessence", "raconteur", "sagacious", "talisman", "ubiquitous",
  "verdant", "wanderlust", "zenith", "aesthetic", "beguile",
  "cascade", "dalliance", "elegy", "fugacious", "iridescent",
  "harbinger", "idyllic", "juxtapose", "kaleidoscope", "lithe",
  "melancholy", "nebulous", "oblivion", "paradox", "resplendent",
  "silhouette", "transient", "umbra", "vivacious", "whimsical",
  "arcane", "benevolent", "cipher", "dissolution", "epiphany",
  "felicity", "grandiloquent", "heuristic", "illustrious", "jejune",
  "kinetic", "liminal", "mercurial", "nascent", "oscillate",
  "panacea", "reticent", "scintillate", "tenebrous", "undulate",
  "vicissitude", "wisteria", "ablaze", "brevity", "crescendo",
  "dulcimer", "elixir", "flicker", "gambit", "harmonic",
  "implore", "jubilant", "kismet", "languish", "mosaic",
  "nocturne", "opalescent", "pristine", "requiem", "solace",
  "tempest", "utopia", "vignette", "wraith", "xeric",
  "yearning", "zephyr", "aurora", "bibliophile", "confluence",
  "denouement", "equanimity", "flourish", "gossamer", "illusory",
  "juxtaposition", "keen", "loquacious", "maelstrom", "nuance",
  "ode", "phosphorescence", "quiescent", "rhapsody", "somnolent",
  "taciturn", "vertiginous", "alchemy", "chrysalis", "dusk",
];

export function getWordOfTheDay(): string {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return CURATED_WORDS[dayIndex % CURATED_WORDS.length];
}
