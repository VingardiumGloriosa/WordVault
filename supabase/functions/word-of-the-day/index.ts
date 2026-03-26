import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en";

// Large pool of interesting English words — the function picks one at random each day
const WORDS = [
  "abandon","aberrant","abscond","accolade","acrimony","adroit","affable","alacrity",
  "alchemy","allegory","amalgam","ambiguous","ameliorate","amulet","anachronism","anarchy",
  "anomaly","antithesis","apathy","apex","aplomb","apprehend","arbitrary","arcane",
  "ardent","articulate","ascetic","aspire","assiduous","astute","audacious","augment",
  "auspicious","austere","avarice","axiom","ballad","bastion","beacon","belligerent",
  "benevolent","bequeath","bespoke","bilateral","blithe","bolster","bombastic","brevity",
  "brusque","bucolic","burgeon","cacophony","cadence","cajole","calamity","candor",
  "capitulate","capricious","cardinal","cascade","catalyst","catharsis","caustic","cerebral",
  "chagrin","chimera","chronicle","circumvent","clandestine","clemency","coalesce","cognizant",
  "colloquial","combustion","complacent","concede","congenial","conjecture","consecrate","conspicuous",
  "contemplate","contrite","conundrum","convivial","copious","cordial","corroborate","cosmopolitan",
  "counterfeit","covert","crescendo","culminate","cursory","cynical","dalliance","dauntless",
  "debacle","debonair","decadent","decorum","deference","deft","deleterious","delineate",
  "deluge","demeanor","denounce","depict","deplorable","derelict","deride","derivative",
  "despondent","destitute","deter","deviate","dexterity","dialectic","diaphanous","dichotomy",
  "diffident","dilapidated","diligent","diminish","discern","discourse","disparate","disseminate",
  "dissonance","divergent","doctrine","dogmatic","dormant","dubious","duplicity","ebullient",
  "eclectic","edify","effervescent","egalitarian","elaborate","elated","elegy","elicit",
  "eloquence","elucidate","elusive","emanate","embellish","eminent","empathy","empirical",
  "emulate","encapsulate","endeavor","enduring","enigma","ennui","ephemeral","epitome",
  "equanimity","equivocal","erratic","erudite","esoteric","espionage","ethereal","euphemism",
  "evanescent","exacerbate","exemplary","exhilarate","exonerate","expedient","explicit","exquisite",
  "extravagant","exuberant","fabricate","facetious","fastidious","fatuous","fathom","fervent",
  "fidelity","figurative","finesse","flagrant","fledgling","flourish","fluctuate","foreboding",
  "formidable","fortuitous","foster","fracture","frivolous","frugal","fugitive","fulcrum",
  "galvanize","gambit","garner","garrison","gauntlet","genesis","germane","glacial",
  "gossamer","grandeur","gratuitous","gregarious","grudging","guile","habitual","halcyon",
  "hallmark","hamlet","hapless","harbinger","harmony","harrowing","haughty","hedonism",
  "heresy","hermetic","hierarchy","homage","hubris","humility","hyperbole","iconoclast",
  "idealism","idyllic","ignominy","illuminate","illusion","immaculate","imminent","impartial",
  "impasse","impeccable","impetuous","implicit","impromptu","impunity","incandescent","inception",
  "incisive","incongruous","indelible","indigenous","indolent","ineffable","inept","inexorable",
  "infallible","inflammatory","ingenious","inherent","innocuous","innuendo","insidious","insolent",
  "intangible","integral","integrity","interlude","intermittent","intimate","intrepid","intricate",
  "intrinsic","intuitive","invincible","iridescent","irrevocable","itinerant","jargon","jovial",
  "jubilant","judicious","juxtapose","kaleidoscope","keen","kindle","labyrinth","laconic",
  "lament","languish","largesse","latent","laudable","legacy","lethargy","levity",
  "lexicon","liaison","liberate","liminal","linger","litany","livid","lofty",
  "loquacious","lucid","luminous","magnanimous","malice","mandate","manifesto","maverick",
  "meander","melancholy","mellifluous","mercurial","meticulous","microcosm","milieu","mitigate",
  "modicum","mollify","momentous","monotony","morbid","mundane","myriad","mystique",
  "naive","nascent","nebulous","nefarious","negligent","nemesis","nocturnal","nomadic",
  "nonchalant","nostalgia","notorious","nuance","oblivion","obscure","obsolete","obstinate",
  "ominous","omnipotent","opalescent","opaque","opulent","oracle","ornate","orthodox",
  "oscillate","ostentatious","ostracize","palatable","panacea","paradigm","paradox","paragon",
  "paramount","pariah","partisan","pastoral","patronize","paucity","penchant","pensive",
  "perennial","perfunctory","perilous","peripheral","perpetual","perplexing","persevere","pertinent",
  "pervasive","petrichor","petulant","phenomenon","philanthropic","pinnacle","placate","platitude",
  "plethora","poignant","polarize","ponderous","pragmatic","precarious","precedent","preclude",
  "precocious","predilection","preeminent","premise","prescient","prevalent","pristine","prodigal",
  "prodigious","proficient","profound","prolific","propensity","prosaic","protagonist","provoke",
  "prudent","puerile","punctilious","quagmire","quaint","qualm","quandary","quarantine",
  "querulous","quiescent","quintessence","quixotic","rancor","rapport","ravenous","rebuke",
  "recalcitrant","reconcile","redolent","redundant","refute","relentless","relinquish","reminiscent",
  "remorse","renaissance","renounce","replenish","reprehensible","repudiate","requisite","resilient",
  "resolute","resonance","resplendent","restitution","reticent","reverence","reverie","rhetoric",
  "riveting","robust","rudimentary","sacrilege","sagacious","salient","sanctimonious","sanguine",
  "sardonic","scintillate","scrutinize","sedentary","semblance","serendipity","serene","shoddy",
  "silhouette","simile","sinister","skeptical","solemn","solitude","sonorous","sophisticated",
  "sovereign","sparse","speculate","spontaneous","spurious","stagnant","stalwart","steadfast",
  "stoic","stratagem","strident","sublime","subtle","succinct","superfluous","supplant",
  "surreptitious","sustain","symbiotic","symmetry","synopsis","taciturn","tangible","tantalize",
  "tedious","tempest","tenacious","tenebrous","tentative","terse","threshold","tirade",
  "torpid","transient","transparent","trepidation","trivial","tumultuous","ubiquitous","ulterior",
  "umbrage","unanimous","uncanny","underscore","undulate","unequivocal","unprecedented","unwieldy",
  "upheaval","urbane","usurp","utopia","vacillate","valor","vanguard","variance",
  "venerate","veracity","verbose","verdant","vestige","vicarious","vicissitude","vigilant",
  "vignette","vindicate","virtuoso","visceral","vivacious","volatile","voluminous","voracious",
  "vulnerable","wanderlust","wanton","whimsical","wistful","zealous","zenith","zephyr",
];

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date().toISOString().slice(0, 10);

  // Check if today already has a word
  const { data: existing } = await supabase
    .from("word_of_the_day")
    .select("word")
    .eq("date", today)
    .single();

  if (existing) {
    return Response.json({ word: existing.word, cached: true });
  }

  // Pick a random word and validate it has a dictionary entry
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  let selectedWord = shuffled[0];

  for (const word of shuffled.slice(0, 5)) {
    try {
      const res = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word)}`);
      if (res.ok) {
        selectedWord = word;
        break;
      }
    } catch {
      continue;
    }
  }

  const { error } = await supabase
    .from("word_of_the_day")
    .insert({ word: selectedWord, date: today });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ word: selectedWord, cached: false });
});
