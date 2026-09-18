"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.4, rotate: -35 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className="icon-badge grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--accent)]"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </motion.span>
  );
}

export function SurfaceCard({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`surface-card ${className}`}>{children}</div>;
}

export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-tile">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export function PillTag({ children, status }: { children: ReactNode; status?: "good" | "bad" }) {
  const className = status === "good" ? "pill-tag pill-tag--status-good" : status === "bad" ? "pill-tag pill-tag--status-bad" : "pill-tag";
  return <span className={className}>{children}</span>;
}

export function FlowColumn({
  icon: Icon,
  title,
  rows,
}: {
  icon: LucideIcon;
  title: string;
  rows: { icon: LucideIcon; label: string; sublabel: string }[];
}) {
  return (
    <SurfaceCard className="flow-column p-5">
      <div className="flow-column-head">
        <IconBadge icon={Icon} />
        <strong>{title}</strong>
      </div>
      {rows.map((row) => (
        <div className="flow-row" key={row.label}>
          <row.icon className="mt-[2px] h-4 w-4 shrink-0" style={{ color: "var(--faint)" }} aria-hidden="true" />
          <div>
            <strong>{row.label}</strong>
            <span>{row.sublabel}</span>
          </div>
        </div>
      ))}
    </SurfaceCard>
  );
}

export function DocLinkRow({ icon: Icon, title, sublabel, href }: { icon: LucideIcon; title: string; sublabel: string; href: string }) {
  return (
    <a href={href} className="doc-link-row">
      <IconBadge icon={Icon} />
      <span>
        <strong>{title}</strong>
        <span>{sublabel}</span>
      </span>
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

export function ScenarioCard({
  index,
  title,
  id,
  steps,
  humanReview,
  corrections,
}: {
  index: number;
  title: string;
  id: string;
  steps: string[];
  humanReview: boolean;
  corrections: number;
}) {
  return (
    <SurfaceCard className="scenario-card p-6">
      <span className="scenario-badge">{String(index).padStart(2, "0")}</span>
      <strong style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text)" }}>{title}</strong>
      <span className="scenario-id">{id}</span>
      <p className="scenario-steps">
        {steps.map((step, i) => (
          <span key={step}>
            {i > 0 && <i aria-hidden="true"> {"→"} </i>}
            {step}
          </span>
        ))}
      </p>
      <div className="flex flex-wrap gap-2">
        <PillTag status={humanReview ? "bad" : "good"}>Human review: {humanReview ? "yes" : "no"}</PillTag>
        <PillTag>Corrections: {corrections}</PillTag>
      </div>
    </SurfaceCard>
  );
}
