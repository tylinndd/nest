export type TeamMember = {
  name: string;
  role: string;
  detail: string;
  contributions: readonly string[];
  avatarSrc?: string;
};

export const TEAM: readonly TeamMember[] = [
  {
    name: "Stephen Sookra",
    role: "Frontend & Pitch",
    detail: "KSU CS · builds the user-facing Nest you see here.",
    contributions: [
      "Designed and built the onboarding, Path, Navigator, Vault, and Deadlines pages in React 19 + Tailwind.",
      "Shaped the visual language — typography, motion, and the privacy-first copy that runs through every screen.",
      "Runs the C-Day pitch and the judge-mode presenter flow.",
    ],
    avatarSrc: "/img/avatar-stephen.webp",
  },
  {
    name: "Tylin Simon",
    role: "Backend & AI",
    detail: "Runs the FastAPI + LangChain retrieval that grounds every answer.",
    contributions: [
      "Built the retrieval-augmented generation pipeline: ChromaDB vector store, LangChain retriever, Groq LLM client.",
      "Designed the Passage schema that lets Navigator show the actual cited text behind every answer.",
      "Wrote the crisis-routing and fallback logic so Nest never fabricates an answer under retrieval pressure.",
    ],
    avatarSrc: "/img/avatar-tylin.webp",
  },
  {
    name: "Brenden Harris",
    role: "Engineering",
    detail: "Pipelines the Georgia docs Nest draws its citations from.",
    contributions: [
      "Sourced and ingested the Georgia policy corpus — DFCS Division 5, Chafee rules, Medicaid extensions, KSU ASCEND guidance.",
      "Normalized document metadata so every passage in the vector store ships with a source name and contact URL.",
      "Owns the document-ops side of Nest — what's in the index, when it was indexed, what still needs to be added.",
    ],
    avatarSrc: "/img/avatar-brenden.webp",
  },
];
