"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Status = "idle" | "granted" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNoti() {
  const [permission, setPermission] = useState<Status>("idle");
  const [intervalRunning, setIntervalRunning] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [subEndpoint, setSubEndpoint] = useState<string | null>(null);
  const [notifTitle, setNotifTitle] = useState("Hello from Backend");
  const [notifBody, setNotifBody] = useState("This push was sent from the Node.js server!");
  const [sending, setSending] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission as Status);
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        swRef.current = reg;
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setPushSubscribed(true);
            setSubEndpoint(sub.endpoint);
          }
        });
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result as Status);
  }, []);

  const sendImmediate = useCallback(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    new Notification("My PWA Notification", {
      body: "This is a direct notification — sent from the page when tab is open.",
      icon: "/icon-192.png",
      tag: "immediate",
    });
  }, []);

  const toggleInterval = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;

    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) return;

    if (intervalRunning) {
      reg.active.postMessage({ type: "STOP_INTERVAL" });
      setIntervalRunning(false);
    } else {
      if (Notification.permission !== "granted") {
        const result = await Notification.requestPermission();
        if (result !== "granted") return;
        setPermission(result);
      }
      reg.active.postMessage({ type: "START_INTERVAL", interval: 5000 });
      setIntervalRunning(true);
    }
  }, [intervalRunning]);

  const subscribeToPush = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;

      const keyResp = await fetch("/api/push/vapid-key");
      const { publicKey } = await keyResp.json();

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setPushSubscribed(true);
      setSubEndpoint(subscription.endpoint);
      setPushResult("Subscribed to Web Push");
    } catch (err: unknown) {
      setPushResult(`Subscribe failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }, []);

  const unsubscribeFromPush = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: "DELETE",
        });
      }

      setPushSubscribed(false);
      setSubEndpoint(null);
      setPushResult("Unsubscribed from Web Push");
    } catch (err: unknown) {
      setPushResult(`Unsubscribe failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }, []);

  const sendFromBackend = useCallback(async () => {
    setSending(true);
    setPushResult(null);
    try {
      const resp = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notifTitle, body: notifBody }),
      });
      const data = await resp.json();

      if (resp.ok) {
        setPushResult(`Sent: ${data.ok} ok, ${data.gone} expired, ${data.error} errors`);
      } else {
        setPushResult(`Error: ${data.error}`);
      }
    } catch (err: unknown) {
      setPushResult(`Request failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSending(false);
    }
  }, [notifTitle, notifBody]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      {/* ====== SECTION 1: Direct + SW Interval (local) ====== */}
      <div className="flex flex-col items-center gap-4 w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Local Notifications
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {permission === "unsupported" && (
            <p className="text-sm text-zinc-400">
              Notifications are not supported in this browser.
            </p>
          )}

          {permission !== "granted" && permission !== "unsupported" && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Enable Notifications
            </button>
          )}

          {permission === "granted" && (
            <>
              <button
                onClick={sendImmediate}
                className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Send Now (tab open)
              </button>

              <button
                onClick={toggleInterval}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  intervalRunning
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                }`}
              >
                {intervalRunning
                  ? "Stop Auto (every 5s)"
                  : "Start Auto (every 5s)"}
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-zinc-400">
          {intervalRunning
            ? "SW interval running — works when tab is closed (browser must stay open)"
            : "Direct = tab must be open. Auto = SW timer (browser open)."}
        </p>
      </div>

      {/* ====== SECTION 2: Web Push from Backend ====== */}
      {permission === "granted" && (
        <div className="flex flex-col items-center gap-4 w-full border border-violet-200 dark:border-violet-800 rounded-xl p-6 bg-violet-50/30 dark:bg-violet-950/20">
          <h2 className="text-sm font-semibold text-violet-500 uppercase tracking-wider">
            Web Push (from Backend)
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            The backend sends push via the browser&apos;s push service.
            Works even when the <strong>browser is completely closed</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!pushSubscribed ? (
              <button
                onClick={subscribeToPush}
                className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
              >
                Subscribe to Web Push
              </button>
            ) : (
              <button
                onClick={unsubscribeFromPush}
                className="px-4 py-2 rounded-full bg-zinc-500 text-white text-sm font-medium hover:bg-zinc-600 transition-colors"
              >
                Unsubscribe
              </button>
            )}
          </div>

          {pushSubscribed && (
            <>
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
                  placeholder="Notification title"
                />
                <input
                  type="text"
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
                  placeholder="Notification body"
                />
              </div>

              <button
                onClick={sendFromBackend}
                disabled={sending}
                className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {sending ? "Sending..." : "Send from Backend"}
              </button>

              {subEndpoint && (
                <p className="text-[10px] text-zinc-400 break-all text-center leading-relaxed">
                  Sub endpoint: {subEndpoint.slice(0, 60)}...
                </p>
              )}
            </>
          )}

          {pushResult && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              {pushResult}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
