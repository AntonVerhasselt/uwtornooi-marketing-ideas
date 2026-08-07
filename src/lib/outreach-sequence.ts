export type OutreachChannel = "facebook-comment" | "instagram-comment" | "dm" | "follow-up-dm";

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

/** Social cold outreach sequence for Flemish football clubs that recently organised a tournament. */
export const sequenceOverview = {
  name: "Post-tournament social sequence",
  windowDays: 14,
  channels: ["Facebook", "Instagram"] as const,
  principle:
    "Always reference a real tournament post. Never send a generic “try our software” blast.",
  ctaUrl: "https://uwtornooi.be",
  ctaLabel: "Gratis tornooisoftware op uwtornooi.be",
};

export const sequenceSteps: SequenceStep[] = [
  {
    id: "day0-react",
    day: 0,
    title: "Soft signal — react to their tournament post",
    channel: "facebook-comment",
    channelLabel: "Facebook or Instagram reaction + short comment",
    timing: "Same day or next morning after a tournament-organising post is found",
    goal: "Become a familiar name before any pitch. Show you actually saw their event.",
    whenToSkip:
      "Skip if the post is older than ~6 weeks, or if it is clearly about playing in someone else’s tournament (not organising).",
    templateNl: `Top georganiseerd, [club]! Ziet eruit als een geslaagd [jeugd]tornooi — veel succes met de rest van het seizoen ⚽`,
    notes: [
      "Prefer the platform where the tournament post lives (FB post → FB; IG reel → IG).",
      "Keep it human: one sentence, no link, no product name yet.",
      "Like/react first, then comment — never only emoji spam.",
    ],
  },
  {
    id: "day2-value-comment",
    day: 2,
    title: "Value comment — helpful, still public",
    channel: "instagram-comment",
    channelLabel: "Comment on the same post (or a related story/highlight)",
    timing: "Day 2 if they did not reply to day 0; skip if they already DM’d you",
    goal: "Add a useful organiser insight and plant UwTornooi without sounding salesy.",
    whenToSkip: "They already replied, asked a question, or the comment thread is locked/hostile.",
    templateNl: `Vraagje uit nieuwsgierigheid: hoe regelen jullie inschrijvingen + poules voor zo’n tornooi? Wij bouwen gratis software voor Vlaamse clubs (uwtornooi.be) — handig als je volgend seizoen minder Excel wil 😄`,
    notes: [
      "One soft CTA max. Link once as plain text or profile bio — not a hard sell.",
      "If the post is about results/photos only, ask about next edition timing instead of “Excel”.",
      "Do not tag random board members publicly.",
    ],
  },
  {
    id: "day5-dm",
    day: 5,
    title: "Personal DM — reference their specific tournament",
    channel: "dm",
    channelLabel: "Facebook Messenger or Instagram DM",
    timing: "Day 5 after the first touch, or immediately if they engaged with a comment",
    goal: "Start a 1:1 conversation with a concrete next step (try / demo / migrate).",
    whenToSkip:
      "No public tournament evidence, club page forbids DMs, or they asked not to be contacted.",
    templateNl: `Hey [voornaam of “beste vrijwilligers van club”],

Zag jullie post over het [naam/soort]tornooi van [datum of “vorige maand”] — lijkt me een mooie editie geweest.

Ik help Vlaamse clubs met gratis tornooisoftware (inschrijvingen, poules, knock-out, live standen) via uwtornooi.be.

Zou het nuttig zijn als ik jullie in 10 minuten toon hoe een volgend tornooi eruitziet zonder spreadsheet-chaos? Of stuur ik gewoon een korte link om zelf te klikken?`,
    notes: [
      "Fill every bracket from club-data signals — empty brackets = do not send.",
      "Offer choice: guided walkthrough vs self-serve link.",
      "Send from a real person profile/page, not a faceless brand bot.",
    ],
  },
  {
    id: "day10-follow-up",
    day: 10,
    title: "Follow-up DM — one bump, then stop",
    channel: "follow-up-dm",
    channelLabel: "Same DM thread",
    timing: "Day 10 if no reply; never more than one follow-up",
    goal: "Polite bump with a seasonal hook; protect reputation by ending the sequence.",
    whenToSkip: "They replied (even negatively), or the first DM was never delivered/seen.",
    templateNl: `Kleine bump — geen probleem als timing slecht is.

Als jullie later dit seizoen of volgende zomer opnieuw een tornooi plannen, staat uwtornooi.be klaar (gratis voor clubs). Ik laat het hierbij 👍`,
    notes: [
      "Closing the loop builds trust for next year’s signal.",
      "Mark status = closed-no-reply after this step.",
      "Never follow up a third time in the same window.",
    ],
  },
];

export const messageAngles: MessageAngle[] = [
  {
    id: "just-ran",
    title: "Just ran a tournament",
    trigger: "Post announcing or recapping a self-organised tournament ≤ 6 weeks ago",
    angle: "Congratulate + offer less admin next edition",
    exampleHookNl:
      "Zag jullie tornooirecap — mooie editie. Volgende keer inschrijvingen + poules zonder Excel?",
  },
  {
    id: "registration-open",
    title: "Registrations open / call for teams",
    trigger: "Post asking teams to register for an upcoming club tournament",
    angle: "Help with registrations and live standings right now",
    exampleHookNl:
      "Zien dat inschrijvingen lopen — willen jullie live standen + poules digitaal delen met de teams?",
  },
  {
    id: "excel-pain",
    title: "Spreadsheet / WhatsApp chaos signal",
    trigger: "Post or comment mentioning Excel, formulieren, WhatsApp-lijsten, of “wie speelt waar?”",
    angle: "Replace the pain tool with free software",
    exampleHookNl:
      "Herkenbaar, die Excel/WhatsApp-chaos… wij maken dat gratis overzichtelijk voor Vlaamse clubs.",
  },
  {
    id: "photo-dump",
    title: "Photo dump after the weekend",
    trigger: "Album/reel of the club’s own tournament weekend",
    angle: "Compliment first; soft ask about next edition tooling",
    exampleHookNl:
      "Wat een sfeerbeelden van jullie tornooi. Plannen jullie al een volgende editie? Dan help ik graag met de digitale kant.",
  },
  {
    id: "youth-festival",
    title: "Youth / multi-day festival",
    trigger: "U10–U15, meisjes, of meerdaags jeugdtornooi",
    angle: "Emphasise parents + coaches seeing live brackets on phone",
    exampleHookNl:
      "Voor jeugdtornooien is live poules op de gsm van ouders goud waard — gratis te proberen op uwtornooi.be.",
  },
];

export const channelRules: ChannelRule[] = [
  {
    id: "comment-vs-dm",
    title: "Comment vs DM",
    do: [
      "Start public (reaction/comment) so the first touch feels social, not spammy.",
      "Move to DM once there is a reply, a question, or day 5 of the sequence.",
      "Keep public comments under ~2 sentences; put detail in DM.",
    ],
    dont: [
      "Don’t drop a cold sales pitch as the first public comment.",
      "Don’t DM without a real tournament signal from idea 1.",
      "Don’t @-mention private volunteers who didn’t post as the club.",
    ],
  },
  {
    id: "follow-up",
    title: "Follow-up rules",
    do: [
      "One follow-up only (day 10), then close the lead for this window.",
      "If they say “later”, note a seasonal reminder (e.g. 8 weeks before typical tournament month).",
      "If they ask pricing/features, answer in Dutch and link to uwtornooi.be.",
    ],
    dont: [
      "Don’t stack Facebook + Instagram DMs on the same day.",
      "Don’t argue about competitors in comments.",
      "Don’t buy fake engagement or use automation that violates Meta rules.",
    ],
  },
  {
    id: "tone",
    title: "Tone & compliance",
    do: [
      "Write like a helpful Flemish football person — short, concrete, respectful of volunteers.",
      "Always personalise with club name + tournament cue.",
      "Stop immediately on “niet geïnteresseerd” / block / no-DM preference.",
    ],
    dont: [
      "Don’t claim you “partner with Voetbal Vlaanderen” unless true.",
      "Don’t scrape and paste private emails into Meta forms.",
      "Don’t send English templates to Dutch-speaking club pages.",
    ],
  },
];

export const trackingFields: TrackingField[] = [
  { field: "club_id / club_name", purpose: "Join back to idea 1 lead list" },
  { field: "tournament_post_url", purpose: "Evidence + personalisation source" },
  { field: "platform", purpose: "facebook | instagram" },
  { field: "sequence_step", purpose: "day0 | day2 | day5 | day10 | closed" },
  { field: "last_touch_at", purpose: "Schedule next step; avoid double-messaging" },
  { field: "reply_status", purpose: "none | engaged | interested | not-interested | bounced" },
  { field: "owner", purpose: "Who sent the message (human accountable)" },
  { field: "notes", purpose: "Seasonal reminder, contact name, objections" },
];

export const successMetrics = [
  "Reply rate on DMs (target: contextual > generic cold)",
  "Qualified conversations → trial/signup on uwtornooi.be",
  "Zero spam complaints / page blocks in the pilot cohort",
  "Time-to-first-touch after a new tournament signal (< 48h)",
];
