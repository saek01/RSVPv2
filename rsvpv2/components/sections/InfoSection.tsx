"use client";

import { useI18n } from "@/components/I18nProvider";
import { wedding } from "@/lib/wedding-data";
import { WishesList } from "@/components/WishesList";

export function InfoSection() {
  const { t } = useI18n();
  return (
    <div className="space-y-20">
      <header className="text-center space-y-2">
        <div className="divider-ornament" aria-hidden>
          <span>🍋</span>
          <span>✦</span>
          <span>🌿</span>
        </div>
        <h2 className="section-title">{t.info.title}</h2>
        <p className="section-subtitle">{t.info.welcome}</p>
      </header>

      {/* Couple — just text */}
      <div className="text-center space-y-10">
        <div>
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--leaf-700)" }}
          >
            {t.info.bride}
          </p>
          <h3
            className="couple-name mt-3"
            style={{ fontSize: "clamp(2.2rem, 7vw, 3.4rem)" }}
          >
            {wedding.bride.fullName}
          </h3>
          <p className="mt-3 text-base italic" style={{ color: "var(--ink-muted)" }}>
            {wedding.bride.father} &amp; {wedding.bride.mother}
          </p>
        </div>

        <span
          className="couple-amp"
          style={{ fontSize: "2.5rem", color: "var(--leaf-600)" }}
        >
          &amp;
        </span>

        <div>
          <p
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: "var(--leaf-700)" }}
          >
            {t.info.groom}
          </p>
          <h3
            className="couple-name mt-3"
            style={{ fontSize: "clamp(2.2rem, 7vw, 3.4rem)" }}
          >
            {wedding.groom.fullName}
          </h3>
          <p className="mt-3 text-base italic" style={{ color: "var(--ink-muted)" }}>
            {wedding.groom.father} &amp; {wedding.groom.mother}
          </p>
        </div>
      </div>

      {/* Details */}
      <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-10">
        <DetailRow label={t.info.dateLabel} value={t.info.dateValue} />
        <DetailRow label={t.info.timeLabel} value={t.info.timeValue} />
        <DetailRow label={t.info.venueLabel} value={t.info.venueValue} />
        <DetailRow label={t.info.dresscode} value={t.info.dresscodeValue} />
      </dl>

      {/* Wishes */}
      <div>
        <h3 className="section-title text-2xl sm:text-3xl mb-8 text-center">
          {t.info.wishesTitle}
        </h3>
        <WishesList />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <dt
        className="text-xs uppercase tracking-[0.25em]"
        style={{ color: "var(--leaf-700)" }}
      >
        {label}
      </dt>
      <dd
        className="mt-2 text-lg"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          color: "var(--ink)",
        }}
      >
        {value}
      </dd>
    </div>
  );
}
