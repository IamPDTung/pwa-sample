"use client";

import { useState, useEffect, useCallback } from "react";

type Status = "idle" | "granted" | "denied" | "unsupported";

export default function PushNoti() {
  const [permission, setPermission] = useState<Status>("idle");
  const [intervalRunning, setIntervalRunning] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission as Status);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
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

  return (
    <div className="flex flex-col items-center gap-4">
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
        {permission === "granted"
          ? intervalRunning
            ? "SW interval running — works even if tab is closed (browser must stay open)"
            : "Click 'Send Now' for immediate notification (requires tab open). Click 'Start Auto' for SW-based recurring notifications."
          : permission === "unsupported"
            ? ""
            : 'Click "Enable Notifications" above to get started.'}
      </p>
    </div>
  );
}
