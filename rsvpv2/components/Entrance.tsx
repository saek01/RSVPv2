"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "./I18nProvider";
import { Countdown } from "./Countdown";
import { ArrowDownIcon } from "./Icons";

const EASE = [0.77, 0, 0.175, 1] as const;
const DOOR_DURATION = 1.1;
const CONTENT_DELAY = 0.45;

export function Entrance() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  function handleOpen() {
    if (open) return;
    setOpen(true);
    try {
      sessionStorage.setItem("entrance.opened", "1");
    } catch {
      // Ignore storage errors.
    }
    window.dispatchEvent(new Event("entrance-opened"));
  }

  return (
    <div className="relative w-full" style={{ minHeight: "100vh" }}>
      {/* Doors */}
      <div className="absolute inset-0 flex">
        <motion.div
          className="door-panel"
          style={{
            background: "var(--leaf-700)",
            width: "50%",
            height: "100%",
          }}
          initial={{ x: "0%" }}
          animate={{ x: open ? "-100%" : "0%" }}
          transition={{ duration: DOOR_DURATION, ease: EASE }}
          aria-hidden
        />
        <motion.div
          className="door-panel"
          style={{
            background: "var(--leaf-500)",
            width: "50%",
            height: "100%",
          }}
          initial={{ x: "0%" }}
          animate={{ x: open ? "100%" : "0%" }}
          transition={{ duration: DOOR_DURATION, ease: EASE }}
          aria-hidden
        />
      </div>

      {/* Reveal content */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="entrance-content"
            className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-24"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: CONTENT_DELAY }}
          >
            <p
              className="font-script text-3xl"
              style={{ color: "var(--leaf-700)" }}
            >
              {t.entrance.dear} {t.entrance.guest}
            </p>

            <p
              className="mt-4 max-w-xl text-lg italic"
              style={{ color: "var(--ink-soft)" }}
            >
              {t.entrance.invitation}
            </p>

            <h1 className="couple-name mt-6">
              <span className="block">{t.info.brideName.split(" binti ")[0]}</span>
              <span className="couple-amp">{t.entrance.and}</span>
              <span className="block">{t.info.groomName.split(" bin ")[0]}</span>
            </h1>

            <p className="wedding-date mt-8">{t.entrance.date}</p>
            <p
              className="mt-2 text-sm uppercase tracking-[0.25em]"
              style={{ color: "var(--leaf-700)" }}
            >
              {t.entrance.venue}
            </p>

            <Countdown />

            <motion.span
              aria-hidden
              className="block mt-12 text-xs uppercase tracking-[0.3em]"
              style={{ color: "var(--leaf-700)" }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              scroll
              <motion.span
                className="block mx-auto mt-1"
                style={{ lineHeight: 1 }}
                animate={{ y: [0, 6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                }}
              >
                <ArrowDownIcon size={22} />
              </motion.span>
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap-to-open */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="entrance-cta"
            type="button"
            onClick={handleOpen}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
            aria-label={t.entrance.openDoors}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span
              className="font-script text-2xl italic"
              style={{ color: "white", textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
            >
              tap to begin
            </span>
            <motion.span
              className="px-8 py-4 text-lg"
              style={{
                background: "linear-gradient(135deg, var(--leaf-500), var(--leaf-700))",
                color: "white",
                boxShadow: "0 6px 22px rgba(252,211,77,0.45)",
                borderRadius: "999px",
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              {t.entrance.openDoors}
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
