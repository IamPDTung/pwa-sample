declare global {
  var __pwa_push_subscriptions: PushSubscription[];
}

export function getSubscriptions(): PushSubscription[] {
  if (!globalThis.__pwa_push_subscriptions) {
    globalThis.__pwa_push_subscriptions = [];
  }
  return globalThis.__pwa_push_subscriptions;
}

export function addSubscription(sub: PushSubscription): void {
  const subs = getSubscriptions();
  const existing = subs.findIndex((s) => s.endpoint === sub.endpoint);
  if (existing >= 0) {
    subs[existing] = sub;
  } else {
    subs.push(sub);
  }
}

export function removeSubscription(endpoint: string): void {
  const subs = getSubscriptions();
  const idx = subs.findIndex((s) => s.endpoint === endpoint);
  if (idx >= 0) subs.splice(idx, 1);
}
