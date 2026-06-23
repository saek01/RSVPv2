import { Entrance } from "@/components/Entrance";
import { SectionReveal } from "@/components/sections/SectionReveal";
import { InfoSection } from "@/components/sections/InfoSection";
import { ItinerarySection } from "@/components/sections/ItinerarySection";
import { MapSection } from "@/components/sections/MapSection";
import { RSVPSection } from "@/components/sections/RSVPSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default async function HomePage() {
  return (
    <>
      {/* Hero — entrance doors, first viewport */}
      <Entrance />

      {/* All sections below the fold, each fades in as it scrolls into view */}
      <SectionReveal id="info" className="section max-w-3xl mx-auto px-4 sm:px-6">
        <InfoSection />
      </SectionReveal>

      <SectionReveal id="itinerary" className="section max-w-2xl mx-auto px-4 sm:px-6">
        <ItinerarySection />
      </SectionReveal>

      <SectionReveal id="map" className="section max-w-3xl mx-auto px-4 sm:px-6">
        <MapSection />
      </SectionReveal>

      <SectionReveal id="rsvp" className="section max-w-2xl mx-auto px-4 sm:px-6">
        <RSVPSection />
      </SectionReveal>

      <SectionReveal id="contact" className="section max-w-3xl mx-auto px-4 sm:px-6 pb-40 sm:pb-48">
        <ContactSection />
      </SectionReveal>
    </>
  );
}
