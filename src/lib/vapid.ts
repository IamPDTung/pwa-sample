import webpush from "web-push";

declare global {
  var __pwa_vapid_keys: { publicKey: string; privateKey: string } | undefined;
}

function getKeys() {
  if (!globalThis.__pwa_vapid_keys) {
    globalThis.__pwa_vapid_keys = webpush.generateVAPIDKeys();
  }
  return globalThis.__pwa_vapid_keys;
}

export function getVapidPublicKey(): string {
  return getKeys().publicKey;
}

export function getWebPush() {
  const keys = getKeys();
  webpush.setVapidDetails(
    "mailto:demo@pwa-sample.local",
    keys.publicKey,
    keys.privateKey
  );
  return webpush;
}
