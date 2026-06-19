export function normalizeSearchText(value = "") {
  return String(value)
    .trim()
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\u0640/g, "")
    .replace(/\p{M}/gu, "")
    .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .replace(/\s+/g, " ");
}

export function includesSearchText(value, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  return normalizeSearchText(value).includes(normalizedQuery);
}
