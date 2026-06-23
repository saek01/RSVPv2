"use client";

import { useI18n } from "@/components/I18nProvider";
import { RSVPForm } from "@/components/RSVPForm";

export function RSVPSection() {
  const { t } = useI18n();
  return (
    <div className="space-y-10">
      <header className="text-center space-y-2">
        <div className="divider-ornament" aria-hidden>
          <span>🍋</span>
          <span>✦</span>
          <span>🌿</span>
        </div>
        <h2 className="section-title">{t.rsvp.title}</h2>
        <p className="section-subtitle">{t.rsvp.subtitle}</p>
      </header>
      <RSVPForm />
    </div>
  );
}
