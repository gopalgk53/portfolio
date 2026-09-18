"use client";

import dynamic from "next/dynamic";

export const ConceptNetwork = dynamic(() => import("./3d/concept-network").then((mod) => mod.ConceptNetwork), { ssr: false });
