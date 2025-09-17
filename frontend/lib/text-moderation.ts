"use client";
import * as leo from "leo-profanity";

let inited = false;
export function initProfanity(extra: string[] = []) {
  if (!inited) {
    leo.loadDictionary("en"); // you can load other built-ins too
    if (extra.length) leo.add(extra);
    inited = true;
  }
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}+/gu, "")    // strip accents
    .replace(/[@\$]+/g, "s").replace(/0/g, "o").replace(/1/g, "l") // leetspeak
    .replace(/\s+/g, " ").trim();
}

export function quickProfanityCheck(text: string) {
  initProfanity();
  const t = normalize(text);
  const isProfane = leo.check(t);
const badWords: string[] = isProfane ? leo.list().filter((w: string) => t.includes(w)) : [];
  return { isProfane, badWords };
}
