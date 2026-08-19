// Shared motion constants. Every animated component in this codebase should
// import these instead of redefining spring physics locally.

export const spring = { type: "spring" as const, stiffness: 200, damping: 25 };

// Used for large masked-text reveals and other big, slow-settling movement
// where the snappier default spring would feel jittery at scale.
export const springSlow = { type: "spring" as const, stiffness: 120, damping: 24 };

// Stagger helper for list/grid reveal animations.
export function staggerChild(index: number, step = 0.045) {
  return { ...spring, delay: index * step };
}
