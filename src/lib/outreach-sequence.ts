export type OutreachChannel =
  | "instagram-dm"
  | "facebook-dm"
  | "email"
  | "phone";

export type SequenceStep = {
  id: string;
  day: number;
  title: string;
  channel: OutreachChannel;
  channelLabel: string;
  timing: string;
  goal: string;
  whenToSkip: string;
  templateNl: string;
  notes: string[];
};

export type MessageAngle = {
  id: string;
  title: string;
  trigger: string;
  angle: string;
  exampleHookNl: string;
};

export type ChannelRule = {
  id: string;
  title: string;
  do: string[];
  dont: string[];
};

export type TrackingField = {
  field: string;
  purpose: string;
};

/**
 * Direct cold outreach for Flemish football clubs that organised a tournament
 * in past seasons (from club-data signals) — no waiting for a new post.
 */
export const sequenceOverview = {
  name: "Direct cold sequence (past tournament signal)",
  windowDays: 5,
  channels: ["Instagram DM", "Facebook DM", "Email", "Phone"] as const,
  principle:
    "We already know they organised a tournament last year from historical data. Reach out directly — don’t wait for a new post.",
  ctaUrl: "https://uwtornooi.be",
  ctaLabel: "Gratis tornooisoftware op uwtornooi.be",
  loomUrl: "https://www.loom.com",
};

/** Exit the cadence as soon as anyone replies — switch to a real conversation. */
export const onReplyRule = {
  title: "When you get a reply",
  summary:
    "The sequence stops immediately. Cancel every remaining step (DM / email / call) and continue as a normal conversation on the channel they used.",
  do: [
    "Mark sequence_step = in-conversation and clear any scheduled day 2 / 4 / 5 touches.",
    "Reply in-thread with a clear next step: answer their question, send a Loom demo, or book a short call.",
    "Keep one owner on the thread so the club isn’t pinged from multiple people.",
  ],
  dont: [
    "Don’t keep blasting the rest of the cadence “because it’s on the calendar”.",
    "Don’t open a second channel the same day just to “reinforce” — stay where they replied.",
    "Don’t send a Loom (or anything else) if they clearly said no — close the lead.",
  ],
};

/** Async video walkthrough — free to record and share. */
export const loomDemoTip = {
  title: "Loom video demo",
  summary:
    "A short Loom walkthrough of UwTornooi is almost always a good next step once you’re in a conversation. It’s free, async-friendly for volunteers, and beats a wall of text.",
  url: "https://www.loom.com",
  urlLabel: "loom.com",
  tips: [
    "Keep it under ~3 minutes: create a sample tournament, show inschrijvingen + poules + live standen.",
    "Send the link in the same thread they replied on (IG / FB / email).",
    "Offer a live call only if they want one — Loom is the default demo.",
  ],
};

export const sequenceSteps: SequenceStep[] = [
  {
    id: "day1-instagram-dm",
    day: 1,
    title: "Instagram DM",
    channel: "instagram-dm",
    channelLabel: "Instagram direct message",
    timing: "Day 1 — first touch, ideally ~8–12 weeks before their typical tournament month from last year",
    goal: "Open a direct conversation with a concrete past-tournament hook and a clear ask.",
    whenToSkip: "No Instagram account found, DMs closed, or club already in an active conversation.",
    templateNl: `Hey [club / voornaam],

Jullie organiseerden vorig jaar rond [maand] een [jeugd]tornooi — klopt dat?

Wij maken gratis tornooisoftware voor Vlaamse clubs (inschrijvingen, poules, knock-out, live standen): uwtornooi.be

Plannen jullie dit seizoen opnieuw iets? Dan zet ik jullie in 10 minuten op weg.`,
    notes: [
      "Personalise with last year’s month + tournament type from club data — never send empty brackets.",
      "Lead with the fact, not the product.",
      "If they reply: stop the sequence, stay in conversation, send a Loom demo when useful.",
    ],
  },
  {
    id: "day2-facebook-dm",
    day: 2,
    title: "Facebook DM",
    channel: "facebook-dm",
    channelLabel: "Facebook Messenger / page DM",
    timing: "Day 2 if no Instagram reply (or no IG account) — same offer, different channel",
    goal: "Hit the channel clubs often check for page inbox; stay short and direct.",
    whenToSkip: "They replied on Instagram, Facebook DMs unavailable, or they opted out.",
    templateNl: `Beste [club],

Korte vraag: jullie draaiden vorig seizoen een tornooi rond [maand]. Organiseren jullie dit jaar opnieuw?

UwTornooi is gratis software voor inschrijvingen + poules + live standen: uwtornooi.be

Mag ik jullie een korte demo sturen, of liever even bellen?`,
    notes: [
      "Don’t copy-paste the Instagram text verbatim — slight rewrite, same offer.",
      "If Instagram already bounced/undelivered, treat Facebook as day-1 equivalent and keep the calendar.",
      "Still reference last year’s tournament — that’s the cold open.",
    ],
  },
  {
    id: "day4-email",
    day: 4,
    title: "Email",
    channel: "email",
    channelLabel: "Club / board email from club data",
    timing: "Day 4 if no reply on IG or FB",
    goal: "Put a written offer in the inbox volunteers actually use for club admin.",
    whenToSkip: "No usable email, or they already replied on social.",
    templateNl: `Onderwerp: Tornooi [club] — gratis software voor dit seizoen?

Hallo,

Ik zag dat [club] vorig jaar rond [maand] een tornooi organiseerde.

Wij bouwen UwTornooi (uwtornooi.be): gratis software voor Vlaamse clubs om inschrijvingen, poules, knock-out en live standen te regelen — zonder Excel.

Als jullie dit seizoen opnieuw een tornooi plannen, stuur ik graag een korte Loom-demo (gratis async video) of we bellen 10 minuten.

Wat past jullie het best?

Met sportieve groet,
[jouw naam]
[telefoon]
uwtornooi.be`,
    notes: [
      "Subject line must name the club or tournament month — generic subjects die.",
      "One CTA: propose a call (sets up day 5) or self-serve link.",
      "CC only if you have a second relevant board address; never blast the whole club list.",
    ],
  },
  {
    id: "day5-call",
    day: 5,
    title: "Phone call",
    channel: "phone",
    channelLabel: "Call club phone / known organiser",
    timing: "Day 5 — after email, same window as their planning season",
    goal: "Close the loop live: confirm next tournament plans and book a setup/demo.",
    whenToSkip: "No phone number, they asked for email-only, or they already booked/declined.",
    templateNl: `Script (kort):

1. “Hallo, [naam] van UwTornooi — bel ik gelegen?”
2. “Ik zag dat jullie vorig jaar rond [maand] een tornooi organiseerden. Plannen jullie dit seizoen opnieuw?”
3. Als ja: “Wij hebben gratis software voor inschrijvingen en poules. Mag ik jullie in 10 minuten tonen hoe dat werkt, of meteen een tornooi klaarzetten?”
4. Als nee / onzeker: “Geen probleem — mag ik een link mailen voor als het wel speelt? uwtornooi.be”
5. Afsluiten: noteren van contactpersoon + wanneer ze typisch inschrijvingen openen.`,
    notes: [
      "Call the number from club data; ask for de tornooi-verantwoordelijke / secretaris.",
      "Voicemail: 20 seconds max — name, last year’s tournament cue, callback number, uwtornooi.be.",
      "After day 5 with no engagement: mark closed for this season window; don’t keep chasing.",
    ],
  },
];

export const messageAngles: MessageAngle[] = [
  {
    id: "same-month-again",
    title: "Same month as last year",
    trigger: "Historical data shows a tournament in a recurring month (e.g. May / August)",
    angle: "Assume they may run it again and offer setup before registrations open",
    exampleHookNl:
      "Vorig jaar organiseerden jullie rond mei een tornooi — plannen jullie dat dit seizoen opnieuw?",
  },
  {
    id: "youth-recurring",
    title: "Recurring youth tournament",
    trigger: "Past signal was a jeugdtornooi / multi-age weekend",
    angle: "Parents + coaches need live brackets; pitch free digital standings",
    exampleHookNl:
      "Voor jullie jeugdtornooi vorig jaar: willen jullie dit seizoen live poules op de gsm van ouders?",
  },
  {
    id: "excel-replacement",
    title: "Replace spreadsheet admin",
    trigger: "Any past self-organised tournament with no known software vendor",
    angle: "Direct swap: Excel/WhatsApp → UwTornooi, free",
    exampleHookNl:
      "Veel clubs regelen inschrijvingen nog in Excel — wij doen dat gratis digitaal voor Vlaamse clubs.",
  },
  {
    id: "early-planning",
    title: "Planning window before registrations",
    trigger: "Outreach timed ~8–12 weeks before last year’s tournament month",
    angle: "Help before chaos starts — setup now, registrations later",
    exampleHookNl:
      "Als jullie rond [maand] opnieuw draaien, kunnen we nu al inschrijvingen + poules klaarzetten.",
  },
];

export const channelRules: ChannelRule[] = [
  {
    id: "direct-cold",
    title: "Direct cold outreach",
    do: [
      "Use last year’s tournament month/type from club data as the open — that’s the personalisation.",
      "Run the channels in order: IG DM → FB DM → email → call.",
      "Any reply = sequence over → switch to conversation (see on-reply rule).",
    ],
    dont: [
      "Don’t wait for a new tournament post before messaging.",
      "Don’t start with public comments — this sequence is inbox/phone only.",
      "Don’t send remaining steps after they have already answered.",
    ],
  },
  {
    id: "channel-order",
    title: "Channel order & gaps",
    do: [
      "Day 1 Instagram, day 2 Facebook, day 4 email, day 5 call.",
      "If a channel is missing (no IG, no email), skip that step and keep the calendar for the rest.",
      "Keep day 3 quiet on purpose — give social time to land before email.",
    ],
    dont: [
      "Don’t DM Instagram and Facebook on the same day.",
      "Don’t call before the email has had a day in the inbox (unless they asked to be called).",
      "Don’t add extra follow-ups after day 5 in the same window.",
    ],
  },
  {
    id: "conversation-and-loom",
    title: "Conversation + Loom demo",
    do: [
      "Once in conversation, default to sending a free Loom video demo (loom.com) of UwTornooi.",
      "Record once, reuse the same Loom for many clubs; personalise only the message around it.",
      "Use the call step for warm leads who want live help — not as the only demo format.",
    ],
    dont: [
      "Don’t keep the cadence running in parallel with an active chat.",
      "Don’t send a Loom before any reply (cold Loom spam).",
      "Don’t make the Loom longer than a busy volunteer will watch.",
    ],
  },
  {
    id: "tone",
    title: "Tone",
    do: [
      "Be direct and concrete — volunteers don’t have time for soft nurture.",
      "Always name the past tournament cue (month / type).",
      "Write and speak Dutch.",
    ],
    dont: [
      "Don’t pretend you just “saw their latest post” if you’re using historical data.",
      "Don’t hard-sell against Tournify unless they bring it up.",
      "Don’t ignore a clear no — close the lead.",
    ],
  },
];

export const trackingFields: TrackingField[] = [
  { field: "club_id / club_name", purpose: "Join back to idea 1 lead list" },
  {
    field: "last_tournament_month / year",
    purpose: "Cold open + timing of the sequence window",
  },
  { field: "instagram / facebook / email / phone", purpose: "Available channels from club data" },
  {
    field: "sequence_step",
    purpose: "day1-ig | day2-fb | day4-email | day5-call | in-conversation | closed",
  },
  { field: "last_touch_at", purpose: "Schedule next step; avoid double-messaging" },
  {
    field: "reply_status",
    purpose: "none | engaged | interested | not-interested | wrong-contact",
  },
  { field: "loom_sent", purpose: "Whether a Loom demo link was shared in the conversation" },
  { field: "owner", purpose: "Who sent/called (human accountable)" },
  { field: "notes", purpose: "Organiser name, next tournament plans, callback time" },
];

export const successMetrics = [
  "Reply rate across IG + FB + email (any positive engagement)",
  "First reply → sequence stopped and conversation owned",
  "Loom demos sent after reply → trials / signups on uwtornooi.be",
  "Calls used for warm leads, not as the only demo path",
];
