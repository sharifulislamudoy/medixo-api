export type LegacyRoute = {
  pattern: RegExp;
  handlers: Record<string, unknown>;
};
