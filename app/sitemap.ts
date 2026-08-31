import type { MetadataRoute } from "next";
import {projects} from "../lib/data";
export const dynamic="force-static";
export default function sitemap():MetadataRoute.Sitemap{const base="https://gopalakrishnagenai.in";return[{url:base,lastModified:new Date(),changeFrequency:"monthly",priority:1},{url:`${base}/projects`,changeFrequency:"monthly",priority:.9},...projects.map(project=>({url:`${base}/projects/${project.id}`,changeFrequency:"monthly" as const,priority:.75})),{url:`${base}/changelog`,changeFrequency:"weekly",priority:.5},{url:`${base}/api-docs`,changeFrequency:"monthly",priority:.4}]}
