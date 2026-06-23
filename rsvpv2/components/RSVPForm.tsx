"use client";

import { useMemo, useState } from "react";
import { useI18n } from "./I18nProvider";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { LeafIcon, SparklesIcon, LemonIcon, CheckIcon, EnvelopeIcon } from "./Icons";

type Guest = {
  name: string;
  phone: string;
};

type FormState = {
  attending: "yes" | "no" | "";
  guestCount: number;
  guests: Guest[];
  wishes: string;
};

const EMPTY_GUEST: Guest = { name: "", phone: "" };
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/;

export function RSVPForm() {
  const { t } = useI18n();

  const initial: FormState = useMemo(
    () => ({
      attending: "",
      guestCount: 1,
      guests: [{ ...EMPTY_GUEST }],
      wishes: "",
    }),
    []
  );

  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function setAttending(value: "yes" | "no") {
    setForm((f) => ({ ...f, attending: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.attending;
      return next;
    });
  }

  function setGuestCount(n: number) {
    const safe = Math.min(10, Math.max(1, Math.floor(n) || 1));
    setForm((f) => {
      const guests = [...f.guests];
      if (safe > guests.length) {
        while (guests.length < safe) guests.push({ ...EMPTY_GUEST });
      } else {
        guests.length = safe;
      }
      return { ...f, guestCount: safe, guests };
    });
  }

  function setGuest(i: number, patch: Partial<Guest>) {
    setForm((f) => {
      const guests = f.guests.map((g, idx) =>
        idx === i ? { ...g, ...patch } : g
      );
      return { ...f, guests };
    });
  }

  function setWishes(value: string) {
    setForm((f) => ({ ...f, wishes: value }));
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!form.attending) errs.attending = t.rsvp.errors.attendance;

    if (form.attending === "yes") {
      if (!form.guestCount || form.guestCount < 1) {
        errs.guestCount = t.rsvp.errors.guestCount;
      }
      form.guests.forEach((g, i) => {
        if (!g.name.trim()) errs[`name-${i}`] = t.rsvp.errors.name;
        if (!g.phone.trim() || !PHONE_RE.test(g.phone.trim())) {
          errs[`phone-${i}`] = t.rsvp.errors.phone;
        }
      });
    } else if (form.attending === "no") {
      const primary = form.guests[0];
      if (!primary.name.trim()) errs["name-0"] = t.rsvp.errors.name;
      if (!primary.phone.trim() || !PHONE_RE.test(primary.phone.trim())) {
        errs["phone-0"] = t.rsvp.errors.phone;
      }
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      if (el && "scrollIntoView" in el) {
        (el as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    setSubmitting(true);

    const locale =
      typeof window !== "undefined"
        ? (document.cookie.match(/(?:^|; )locale=([^;]+)/)?.[1] ?? "en")
        : "en";

    const wishesText = form.wishes.trim();

    try {
      // 1. Persist the RSVP to Postgres.
      const rsvpRes = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attending: form.attending,
          guestCount: form.guestCount,
          guests: form.guests,
          wishes: wishesText || null,
          locale,
        }),
      });

      if (!rsvpRes.ok) {
        const payload = (await rsvpRes.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "RSVP submission failed");
      }

      // 2. If the user left a wish, persist it separately to Postgres.
      if (wishesText) {
        try {
          await fetch("/api/wishes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.guests[0].name.trim(),
              message: wishesText,
              locale,
            }),
          });
        } catch {
          // Wish persistence is best-effort; the RSVP itself succeeded.
        }
      }
    } catch (err) {
      setSubmitting(false);
      setErrors({
        _form:
          err instanceof Error
            ? err.message
            : "Could not submit. Please try again.",
      });
      return;
    }

    setSubmitting(false);
    setDone(true);
  }

  function reset() {
    setForm(initial);
    setErrors({});
    setDone(false);
  }

  if (done) return <SuccessPanel onAnother={reset} t={t} />;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-10"
      aria-label={t.rsvp.title}
    >
      {errors._form && (
        <p
          role="alert"
          className="rounded-2xl px-4 py-3 text-sm"
          style={{
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            color: "#991b1b",
          }}
        >
          {errors._form}
        </p>
      )}
      <AttendanceField
        value={form.attending}
        error={errors.attending}
        onChange={setAttending}
        t={t}
      />

      {form.attending === "yes" && (
        <GuestCountField
          value={form.guestCount}
          error={errors.guestCount}
          onChange={setGuestCount}
          t={t}
        />
      )}

      {(form.attending === "yes" || form.attending === "no") && (
        <GuestList
          guests={form.guests}
          errors={errors}
          onChange={setGuest}
          t={t}
        />
      )}

      <div data-field="wishes">
        <label htmlFor="wishes" className="field-label">
          {t.rsvp.wishes}
        </label>
        <textarea
          id="wishes"
          className="field-textarea"
          style={{ minHeight: "110px" }}
          value={form.wishes}
          onChange={(e) => setWishes(e.target.value)}
          placeholder={t.rsvp.wishesPlaceholder}
          maxLength={500}
        />
      </div>

      <div className="pt-2 flex justify-center">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
        >
          {submitting ? t.rsvp.submitting : t.rsvp.submit}
        </button>
      </div>
    </form>
  );
}

function AttendanceField({
  value,
  error,
  onChange,
  t,
}: {
  value: "yes" | "no" | "";
  error?: string;
  onChange: (v: "yes" | "no") => void;
  t: Dictionary;
}) {
  return (
    <fieldset data-field="attending">
      <legend className="field-label">{t.rsvp.attending}</legend>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("yes")}
          className="rounded-2xl border-2 px-4 py-3 font-medium transition inline-flex items-center justify-center gap-2"
          style={
            value === "yes"
              ? {
                  borderColor: "var(--leaf-500)",
                  background: "var(--leaf-50)",
                  color: "var(--leaf-700)",
                }
              : {
                  borderColor: "var(--leaf-200)",
                  color: "var(--ink-soft)",
                  background: "transparent",
                }
          }
        >
          <CheckIcon size={18} />
          <span>{t.rsvp.yes}</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("no")}
          className="rounded-2xl border-2 px-4 py-3 font-medium transition inline-flex items-center justify-center gap-2"
          style={
            value === "no"
              ? {
                  borderColor: "var(--ink-soft)",
                  background: "var(--lemon-50)",
                  color: "var(--ink)",
                }
              : {
                  borderColor: "var(--leaf-200)",
                  color: "var(--ink-soft)",
                  background: "transparent",
                }
          }
        >
          <EnvelopeIcon size={18} />
          <span>{t.rsvp.no}</span>
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

function GuestCountField({
  value,
  error,
  onChange,
  t,
}: {
  value: number;
  error?: string;
  onChange: (n: number) => void;
  t: Dictionary;
}) {
  return (
    <div data-field="guestCount">
      <label htmlFor="guestCount" className="field-label">
        {t.rsvp.guestCount}
      </label>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          className="btn btn-ghost"
          style={{ width: "44px", height: "44px", padding: 0, fontSize: "1.25rem" }}
          aria-label="−"
        >
          −
        </button>
        <input
          id="guestCount"
          type="number"
          inputMode="numeric"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="field-input text-center"
          style={{ width: "84px" }}
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="btn btn-ghost"
          style={{ width: "44px", height: "44px", padding: 0, fontSize: "1.25rem" }}
          aria-label="+"
        >
          +
        </button>
        <span className="text-xs italic ml-2" style={{ color: "var(--ink-muted)" }}>
          {t.rsvp.guestCountHint}
        </span>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function GuestList({
  guests,
  errors,
  onChange,
  t,
}: {
  guests: Guest[];
  errors: Record<string, string>;
  onChange: (i: number, patch: Partial<Guest>) => void;
  t: Dictionary;
}) {
  return (
    <div className="space-y-10">
      {guests.map((g, i) => (
        <div
          key={i}
          className="space-y-5"
          style={{
            paddingTop: i === 0 ? 0 : "2rem",
            borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
          }}
        >
          <p
            className="text-xs uppercase tracking-[0.25em]"
            style={{ color: "var(--leaf-700)" }}
          >
            {t.rsvp.guestName} #{i + 1}
          </p>
          <div data-field={`name-${i}`}>
            <label htmlFor={`name-${i}`} className="field-label">
              {t.rsvp.guestName}
            </label>
            <input
              id={`name-${i}`}
              type="text"
              className={`field-input ${errors[`name-${i}`] ? "error" : ""}`}
              value={g.name}
              onChange={(e) => onChange(i, { name: e.target.value })}
              placeholder={t.rsvp.guestNamePlaceholder}
              autoComplete="name"
            />
            {errors[`name-${i}`] && (
              <p className="field-error">{errors[`name-${i}`]}</p>
            )}
          </div>
          <div data-field={`phone-${i}`}>
            <label htmlFor={`phone-${i}`} className="field-label">
              {t.rsvp.phone}
            </label>
            <input
              id={`phone-${i}`}
              type="tel"
              className={`field-input ${errors[`phone-${i}`] ? "error" : ""}`}
              value={g.phone}
              onChange={(e) => onChange(i, { phone: e.target.value })}
              placeholder={t.rsvp.phonePlaceholder}
              autoComplete="tel"
            />
            {errors[`phone-${i}`] && (
              <p className="field-error">{errors[`phone-${i}`]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SuccessPanel({
  onAnother,
  t,
}: {
  onAnother: () => void;
  t: Dictionary;
}) {
  return (
    <div className="text-center space-y-6 py-12 page-rise">
      <div
        className="inline-flex items-center justify-center gap-2"
        style={{ color: "var(--leaf-600)" }}
        aria-hidden
      >
        <LeafIcon size={28} />
        <SparklesIcon size={22} />
        <LemonIcon size={28} />
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.9rem",
          color: "var(--leaf-700)",
        }}
      >
        {t.rsvp.successTitle}
      </h2>
      <p
        className="max-w-md mx-auto"
        style={{ color: "var(--ink-soft)" }}
      >
        {t.rsvp.successMessage}
      </p>
      <button type="button" onClick={onAnother} className="btn btn-ghost">
        {t.rsvp.another}
      </button>
    </div>
  );
}
