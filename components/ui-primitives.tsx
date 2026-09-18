import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export type ChipColor = "blue" | "green" | "amber" | "purple" | "red";

const CHIP_VAR: Record<ChipColor, string> = {
  blue: "var(--chip-blue)",
  green: "var(--chip-green)",
  amber: "var(--chip-amber)",
  purple: "var(--chip-purple)",
  red: "var(--chip-red)",
};

function chipStyle(color: ChipColor): CSSProperties {
  return { "--chip-color": CHIP_VAR[color] } as CSSProperties;
}

export function IconBadge({ icon: Icon, color = "blue" }: { icon: LucideIcon; color?: ChipColor }) {
  return (
    <span className="icon-badge-chip" style={chipStyle(color)}>
      <Icon aria-hidden="true" />
    </span>
  );
}

export function SurfaceCard({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`surface-card ${className}`}>{children}</div>;
}

export function StatTile({ icon: Icon, color = "blue", value, label }: { icon?: LucideIcon; color?: ChipColor; value: string; label: string }) {
  return (
    <div className="stat-tile">
      {Icon && <IconBadge icon={Icon} color={color} />}
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
  color = "blue",
  title,
  rows,
}: {
  icon: LucideIcon;
  color?: ChipColor;
  title: string;
  rows: { icon: LucideIcon; label: string; sublabel: string }[];
}) {
  return (
    <SurfaceCard className="flow-column p-5">
      <div className="flow-column-head">
        <IconBadge icon={Icon} color={color} />
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
  color,
  title,
  id,
  steps,
  humanReview,
  corrections,
}: {
  index: number;
  color: ChipColor;
  title: string;
  id: string;
  steps: string[];
  humanReview: boolean;
  corrections: number;
}) {
  return (
    <SurfaceCard className="scenario-card p-6">
      <span className="scenario-badge" style={chipStyle(color)}>
        {String(index).padStart(2, "0")}
      </span>
      <strong style={{ color: CHIP_VAR[color], fontSize: "1.05rem", fontWeight: 600 }}>{title}</strong>
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
