"use client";

import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";
import { springSlow } from "../../lib/motion";

const tags = { span: motion.span, h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p };

/**
 * Masks its content behind an overflow-hidden box and slides it up into view.
 * Used for hero lines and section titles — the "editorial reveal" that gives
 * headline typography weight without a generic fade-in.
 */
export function RevealText({
  children,
  as = "span",
  className = "",
  delay = 0,
  once = true,
  amount = 0.4,
  immediate = false,
}: {
  children: ReactNode;
  as?: keyof typeof tags;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number;
  immediate?: boolean;
}) {
  const Tag = tags[as];
  const reveal: MotionProps = immediate ? { animate: { y: "0%", opacity: 1 } } : { whileInView: { y: "0%", opacity: 1 }, viewport: { once, amount } };
  return (
    <span className="block overflow-hidden">
      <Tag initial={{ y: "110%", opacity: 0 }} {...reveal} transition={{ ...springSlow, delay }} className={className}>
        {children}
      </Tag>
    </span>
  );
}
