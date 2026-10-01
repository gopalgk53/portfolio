"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { spring } from "../lib/motion";

// A persistent way to reach the contact form from anywhere in a very long
// mobile page. Phones only (md:hidden), because on desktop the nav already
// carries it. Shows once the hero is behind the reader and steps aside when
// the Contact section itself is on screen, so it never covers the form.
export function MobileContactCta() {
  const [pastHero, setPastHero] = useState(false);
  const [atContact, setAtContact] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const contact = document.getElementById("contact");
    const observer = contact
      ? new IntersectionObserver(([entry]) => setAtContact(entry.isIntersecting), { threshold: 0.05 })
      : null;
    if (contact && observer) observer.observe(contact);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, []);

  const visible = pastHero && !atContact;

  return (
    <AnimatePresence>
      {visible && (
        // Fixed positioning and md:hidden live on this wrapper rather than the
        // link: .btn-pill sets position and display outside Tailwind's layers,
        // so on the link itself they silently beat `fixed` and `md:hidden` —
        // the button rendered in normal flow, and showed on desktop.
        // pointer-events-none keeps the full-width strip from swallowing taps
        // meant for the page beneath it.
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12 }}
          transition={spring}
          // Centred between the 3D-intensity control (left) and the assistant
          // orb (right), which already own the bottom corners.
          className="no-print pointer-events-none fixed inset-x-0 bottom-5 z-[85] flex justify-center md:hidden"
        >
          <a
            href="#contact"
            className="btn-pill btn-pill--solid pointer-events-auto shadow-[0_18px_40px_-14px_rgba(37,99,235,.55)]"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Contact
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
