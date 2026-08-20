import { projects } from "../lib/data";
export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": "https://gopalakrishnagenai.in/#webpage",
        url: "https://gopalakrishnagenai.in",
        name: "Gopalakrishna — Generative AI Engineer Portfolio",
        description:
          "Official portfolio of Gopalakrishna, a Generative AI Engineer specialized in LLMs, RAG architecture, agent frameworks, and inference optimization.",
        mainEntity: { "@id": "https://gopalakrishnagenai.in/#person" },
      },
      {
        "@type": "Person",
        "@id": "https://gopalakrishnagenai.in/#person",
        name: "Gopalakrishna Maddipalli",
        alternateName: "Gopalakrishna GenAI",
        email: "mailto:gopalgk53@yahoo.com",
        jobTitle: "Generative AI Engineer",
        url: "https://gopalakrishnagenai.in",
        sameAs: [
          "https://github.com/gopalgk53",
          "https://www.linkedin.com/in/maddipalli-gopalakrishna-b3598718b",
        ],
        knowsAbout: [
          "Generative AI",
          "Large Language Models",
          "Retrieval-Augmented Generation",
          "Autonomous AI Agents",
          "vLLM",
          "TensorRT-LLM",
          "LangGraph",
          "Qdrant Vector Database",
          "Model Quantization",
          "LoRA and QLoRA Fine-Tuning",
          "PyTorch",
        ],
        description:
          "Generative AI Engineer designing high-throughput LLM pipelines, stateful agentic workflows, and low-latency enterprise RAG solutions.",
      },
      {
        "@type": "ItemList",
        "@id": "https://gopalakrishnagenai.in/#projects",
        name: "Generative AI Engineering Projects",
        itemListElement: projects.map((project,index)=>({"@type":"ListItem",position:index+1,item:{"@type":"CreativeWork",name:project.title,description:project.goal,url:`https://gopalakrishnagenai.in/projects/${project.id}/`}})),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
