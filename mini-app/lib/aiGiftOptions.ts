export const AI_RECIPIENTS = [
  { id: "ayol", label: "Ayolga", q: "ayol qiz" },
  { id: "erkak", label: "Erkakka", q: "erkak ota" },
  { id: "bola", label: "Bolaga", q: "bola bolalar" },
  { id: "hamma", label: "Har kimga", q: "sovg'a universal" },
] as const;

export const AI_OCCASIONS = [
  { id: "tug", label: "Tug‘ilgan kun", q: "tug'ilgan kun tort" },
  { id: "bayram", label: "Bayram", q: "bayram sovg'a" },
  { id: "nikoh", label: "To‘y / nikoh", q: "to'y nikoh" },
  { id: "rahmat", label: "Rahmat", q: "rahmat minnatdorlik" },
  { id: "ish", label: "Ish / muvaffaqiyat", q: "ish muvaffaqiyat" },
] as const;

export type AiRecipientId = (typeof AI_RECIPIENTS)[number]["id"];
export type AiOccasionId = (typeof AI_OCCASIONS)[number]["id"];

export function buildGiftSearchQuery(p: {
  recipient: string;
  occasion: string;
  extra: string;
}): string {
  const r = AI_RECIPIENTS.find((x) => x.id === p.recipient)?.q ?? "";
  const o = AI_OCCASIONS.find((x) => x.id === p.occasion)?.q ?? "";
  const bits = ["sovg'a", r, o, p.extra.trim()].filter(Boolean);
  return bits.join(" ");
}
