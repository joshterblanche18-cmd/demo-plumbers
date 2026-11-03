// Runs in ordinary code before the AI is called, so an emergency always gets official advice.
// It leans towards caution: a false alarm costs a moment, and a missed emergency could cost far more.
export type Emergency = "gas" | "fire" | "electric";

const SMELL = "smell|smells|smelling|smelt|smel|whiff|stink|stinks|stinking|odou?r|odou?rs|scent|reek|reeks|reeking";
const SYMPTOM = "dizzy|dizziness|headaches?|nausea|nauseous|feel(?:ing)? sick|faint|fainting|drowsy|breathless|collapsed";
const APPLIANCE = "boiler|heating|heater|gas fire|cooker|hob|flue";

const GAS = [
  new RegExp(`\\b(${SMELL})\\b[\\s\\S]{0,50}\\bgas+\\b`, "i"),
  /\bgaz\w*\b/i,
  /\bfuga\b[^.?!]{0,10}\bgas\b/i,
  new RegExp(`\\bgas\\b[^.?!]{0,20}\\b(${SMELL}|leak|leaks|leaking|escape|escaping|hiss|hisses|hissing|alarm|detector)\\b`, "i"),
  /\b(leak|leaks|leaking|escaping|hissing)\b[^.?!]{0,20}\bgas\b/i,
  /\brotten[\s-]*eggs?\b/i,
  /\bcarbon[\s-]*monoxide\b/i,
  /\bmonoxide\b/i,
  /\bCO2?[\s-]*(alarm|detector|monitor|poisoning|leak|sensor)s?\b/i,
  /\balarm\b[^.?!]{0,25}\b(boiler|flue|heater)\b/i,
  /\b(soot|sooty|black\s+marks?|scorch\w*)\b[^.?!]{0,25}\b(boiler|flue|heater)\b/i,
  new RegExp(`\\bfumes?\\b[^.?!]{0,25}\\b(${APPLIANCE})\\b`, "i"),
  new RegExp(`\\b(${APPLIANCE})\\b[^.?!]{0,25}\\bfumes?\\b`, "i"),
  new RegExp(`\\b(${SYMPTOM})\\b[^.?!]{0,40}\\b(${APPLIANCE})\\b`, "i"),
  new RegExp(`\\b(${APPLIANCE})\\b[^.?!]{0,40}\\b(${SYMPTOM})\\b`, "i"),
  /\b(yellow|orange|floppy)\s+flames?\b/i,
];

const FIRE = [
  /\bon\s+fire\b/i,
  /\bcaught\s+fire\b/i,
  /\b(explod\w*|explosion)\b/i,
  /\bfire\s+(in|at|from|near|coming|started|has\s+started)\b/i,
  /\b(a|the|house|electrical|boiler|kitchen)\s+fire\b/i,
  /\bflames?\s+(coming|from|out\s+of|everywhere|shooting)\b/i,
  /\bsmoke\s+alarm\b[^.?!]{0,20}\b(going\s+off|gone\s+off|sounding|beeping|ringing)\b/i,
  /\b(smoke|smoking)\b[^.?!]{0,25}\b(from|out\s+of|coming|boiler|cupboard|pipe|socket|radiator)\b/i,
  /\b(boiler|cupboard|socket|radiator)\b[^.?!]{0,20}\b(smoke|smoking)\b/i,
  /\bburning\s+(smell|plastic|odou?r)\b/i,
  /\bsmell\w*\s+(of\s+)?burning\b/i,
  /\b(spark|sparks|sparking)\b/i,
];

const WATER = /\b(water|wet|flood|floods|flooded|flooding|leak|leaks|leaking|dripping|pouring|soaked|soaking)\b/i;
const ELECTRICS =
  /\b(electrics|electrical|electricity|electric\s+meter|fuse\s*box|fusebox|fuse\s*board|fuses?|consumer\s*unit|sockets?|(?<!(?:bath|sink|basin|shower|waste)\s)plugs?(?![^.?!]{0,20}\b(?:sink|basin|bath|shower)\b)|wiring|live\s+wires?|(?:the|ceiling|kitchen|bathroom|hall|landing)\s+lights?|light\s+fittings?|light\s+switch(es)?)\b/i;
const SHOCK = /\b(electric(al)?\s+shock|shock\s+from)\b/i;

// A general question about the work, with no sign of anything happening now. These get a normal answer,
// and the assistant's own safety rule is still there behind it.
const GENERAL_QUESTION = /^\s*(do you|does (a|the|your)|how much|is there a (charge|price|cost)|what does|can you (fit|install|supply|replace))\b/i;
const HAPPENING_NOW = /\b(my|i|i'm|im|we|our|us|me|now|going off|beeping|sounding|urgent|help)\b/i;

export function detectEmergency(message: string): Emergency | null {
  if (GENERAL_QUESTION.test(message) && !HAPPENING_NOW.test(message)) return null;
  if (GAS.some((re) => re.test(message))) return "gas";
  if (FIRE.some((re) => re.test(message))) return "fire";
  if (SHOCK.test(message) || (WATER.test(message) && ELECTRICS.test(message))) return "electric";
  return null;
}
