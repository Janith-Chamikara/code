declare module "leo-profanity" {
  // Minimal type definitions to satisfy TypeScript. Adjust as needed.
  export function clean(text: string, replaceWith?: string): string;
  export function check(text: string): boolean;
  export function add(words: string | string[]): void;
  export function remove(words: string | string[]): void;
  export function clearList(): void;
  export function list(): string[];
  export function reset(): void;
  export function loadDictionary(lang?: string): void;
  export function setWhitelist(words: string | string[]): void;
  export function getWhitelist(): string[];

  const _default: {
    clean: typeof clean;
    check: typeof check;
    add: typeof add;
    remove: typeof remove;
    clearList: typeof clearList;
    list: typeof list;
    reset: typeof reset;
    loadDictionary: typeof loadDictionary;
    setWhitelist: typeof setWhitelist;
    getWhitelist: typeof getWhitelist;
  };
  export default _default;
}
