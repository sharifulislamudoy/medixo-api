import { AsyncLocalStorage } from "node:async_hooks";

export type Actor = { id: string; name: string; role: string; email: string };
export const sessionScope = new AsyncLocalStorage<Actor>();
export const authOptions = {};

export async function getServerSession(_options?: unknown) {
  const user = sessionScope.getStore();
  return user ? { user } : null;
}
