export const projects = [
  { id: "payment-risk", category: "Machine Learning", title: "Construction Payment Risk Prediction", goal: "Prioritize construction payment-protection workflows before delay or escalation becomes harder to manage.", impact: "Human-reviewed operational prioritization", stack: ["Python", "FastAPI", "AWS", "DataRobot", "SHAP"], flow: "S3 → Glue → Athena → SageMaker → ECS → CloudWatch" },
  { id: "multi-agent", category: "Agentic AI", title: "Autonomous Work Order Intelligence & Operations Platform", goal: "An evidence-aware, multi-agent architecture for construction payment-protection operations — processing work orders through specialist agents for intake, research, evidence, and discrepancy detection, with controlled correction and human-in-the-loop escalation for complex cases.", impact: "~99% target evaluation baseline", stack: ["Microsoft Foundry", "Python", "FastAPI", "MCP", "AWS", "Azure Container Apps"], flow: "Intake → Foundry planner → Specialist agents → MCP tools → Human review → Audit" },
  { id: "nto-operations-copilot", category: "Agentic AI", title: "NTO Operations Copilot", goal: "Guide new Notice to Owner researchers through the complete operational process, retrieve work-order evidence, explain exceptions, and recommend the next approved action without replacing human verification.", impact: "Deployed evidence-grounded research coach", stack: ["Microsoft Foundry", "MCP", "FastAPI", "Next.js", "AWS Lambda", "Azure App Service"], flow: "Work order → Intake evidence → Guided research → Notice selection → Human review" },
  { id: "document-ai", category: "Document AI", title: "Construction Document Intelligence", goal: "Extract structured, reviewable information from complex legal PDFs.", impact: "Reduced manual document processing", stack: ["Textract", "PaddleOCR", "spaCy", "PostgreSQL", "FastAPI"], flow: "PDF → OCR → NER → JSON → Database" },
  { id: "lien-engine", category: "Machine Learning", title: "Lien Recommendation Engine", goal: "Recommend notices, deadlines, and the next appropriate legal action.", impact: "Faster compliance decisions", stack: ["Python", "Machine Learning", "Rules Engine", "FastAPI"], flow: "Project data → Risk model → Rules → Recommendation" },
  { id: "lakehouse", category: "Data Engineering", title: "Construction Data Lakehouse", goal: "Create a governed source of truth for operational and executive analytics.", impact: "Unified reporting foundation", stack: ["PySpark", "AWS Glue", "Athena", "Redshift", "Power BI"], flow: "CRM → S3 → Glue → Athena → Dashboards" },
  { id: "legal-rag", category: "Generative AI", title: "AI Legal Assistant", goal: "Answer construction-law questions with grounded, source-aware retrieval.", impact: "95% retrieval accuracy target", stack: ["LangChain", "AWS Bedrock", "FAISS", "FastAPI"], flow: "Documents → Embeddings → Vector DB → Rerank → LLM" },
  { id: "claims", category: "Document AI", title: "Claims & Contract Intelligence", goal: "Analyze claims and contracts for obligations, risks, and missing evidence.", impact: "Accelerated contract review", stack: ["OCR", "Transformers", "RAG", "AWS"], flow: "Contract → Extraction → Risk analysis → Evidence" },
  { id: "explainable-risk", category: "Machine Learning", title: "Explainable Payment Intelligence", goal: "Turn payment predictions into clear, defensible business explanations.", impact: "Transparent risk decisions", stack: ["XGBoost", "SHAP", "LLMs", "Power BI"], flow: "ERP → ML → Explanation → Dashboard" },
  { id: "compliance-copilot", category: "Agentic AI", title: "Construction Compliance Copilot", goal: "Deliver end-to-end assistance across documents, deadlines, and communication.", impact: "Auditable human-AI collaboration", stack: ["LangGraph", "MCP", "CrewAI", "FastAPI"], flow: "Intake → Plan → Tools → Review → Audit trail" },
];

export const skills = [
  { group: "Models & Fine-Tuning", items: ["Llama 3", "Qwen", "DeepSeek", "LoRA / QLoRA", "Axolotl", "Unsloth", "Hugging Face", "GPT-5-mini", "DataRobot AutoML", "SHAP", "scikit-learn"] },
  { group: "Inference & Optimization", items: ["vLLM", "TensorRT-LLM", "Ollama", "AWQ", "GGUF", "GPTQ", "FlashAttention"] },
  { group: "Orchestration & Agents", items: ["LangChain", "LangGraph", "AutoGen", "Semantic Kernel", "Bot Framework", "CrewAI", "LlamaIndex", "DSPy", "Microsoft Foundry", "MCP"] },
  { group: "Vector Databases & RAG", items: ["Qdrant", "Pinecone", "Milvus", "Chroma", "Hybrid Search", "RRF"] },
  { group: "Engineering & Infrastructure", items: ["PyTorch", "Python", "FastAPI", "Docker", "Ray", "Triton", "CUDA", "AWS / GCP", "AWS S3", "AWS Glue", "Amazon Athena", "AWS IAM", "Amazon SageMaker", "Amazon ECS", "Amazon CloudWatch", "AWS Lambda", "API Gateway"] },
  // Where the agents run and how they ship: Google Cloud items come from the
  // Google Cloud AI Agents Professional Certificate (Gemini Enterprise,
  // Vertex AI Agent Engine, Cloud Run, GKE, Memory Bank); Azure OpenAI, Azure
  // Functions and Azure Logic Apps come from the Microsoft Generative and
  // Agentic AI Basics specialization; the Microsoft AI Agents Professional
  // Certificate adds Semantic Kernel and Bot Framework to the agent group
  // above. The other Azure and AWS items are what the case studies deploy on.
  { group: "Deployment", items: ["Gemini Enterprise", "Google ADK", "Vertex AI Agent Engine", "Cloud Run", "GKE", "Memory Bank", "Azure", "Azure OpenAI", "Azure Functions", "Azure Logic Apps", "Azure Container Apps", "Azure App Service", "Microsoft Foundry", "AWS Bedrock", "GitHub Actions", "OIDC", "pytest"] },
];

export const certifications = [
  ["Post Graduate Program in Artificial Intelligence and Machine Learning", "McCombs School of Business, The University of Texas at Austin · Great Learning · Jan 2021", "https://vrfy.digital/WXBBc"],
  ["Microsoft AI Agents: From Foundations to Applications", "Microsoft · Coursera Professional Certificate · 4 courses · Oct 2026", "https://coursera.org/share/43e0a2494bf64ce635c4270aec839fa3"],
  ["Microsoft Generative and Agentic AI Basics", "Microsoft · Coursera Specialization · 4 courses · Oct 2026", "https://www.coursera.org/account/accomplishments/specialization/HP31RN6BMHGI"],
  ["Google Cloud AI Agents: From Foundations to Enterprise Scale", "Google Cloud · Coursera Professional Certificate · 12 courses · Oct 2026", "https://coursera.org/share/a66ec1aecf8f5811f889820c3c77f272"],
  ["Agent Architect", "Founderz AI & Business School · Certificate of Completion · Sep 2026", "https://learn.founderz.com/certificate/agent-architect/5b79855a-a697-486b-8efb-36d560bad6f3"],
  ["Agent Explorer", "Founderz AI & Business School · Certificate of Completion · 2026", "https://learn.founderz.com/certificate/agent-explorer/5b79855a-a697-486b-8efb-36d560bad6f3"],
  ["Generative AI for Data Scientists", "IBM · Coursera Specialization · Sep 2026", "https://coursera.org/share/d608cb41bfbdd55f85b280772f6ebff9"],
  ["Generative AI for Data Analysts", "IBM · Coursera Specialization · Sep 2026", "https://coursera.org/share/e453902c46df4de213d408ab7f725a56"],
  ["Generative AI: Elevate your Software Development Career", "IBM · Coursera · Sep 2026", "https://coursera.org/share/4bcd8687cdd0e19277b4717fe25a4cc9"],
  ["Statistical Methods for Decision Making", "Great Learning · May 2020", "https://olympus1.greatlearning.in/course_certificate/GWSUYGPZ"],
  ["Machine Learning Engineering for Production (MLOps) Specialization", "Coursera · Nov 2021", "https://www.coursera.org/account/accomplishments/specialization/certificate/JM8WZRKMAZJW"],
  ["Practical Data Science Specialization", "Coursera · Sep 2021", "https://www.coursera.org/account/accomplishments/specialization/certificate/7HAFEBY7E6S6"],
  ["Neural Networks and Deep Learning", "Coursera · Sep 2020", "https://www.coursera.org/account/accomplishments/certificate/88PLY2RRMEHM"],
  ["Facial Expression Recognition with Keras", "Coursera · Sep 2020", "https://coursera.org/verify/4NWV6JTMPL7P"],
  ["Introduction to Explainable AI using LIME", "Analyttica Datalab · Jul 2020", "https://leapsdata.analyttica.com//certificates/00e2a76f-76e9-4059-9416-7a1c1c2b256f/certificate_LEAPS60MS00000721.png"],
  ["Reinforcement Learning Explained", "Microsoft · Jun 2020", "https://courses.edx.org/certificates/9cd9ef86a71d471f995ef84efb6cc4c1"],
  ["Building Conversational Experiences with Dialogflow", "Coursera · Jun 2020", "https://www.coursera.org/account/accomplishments/certificate/SNHUREAKNUR7"],
  ["Machine Learning Pipelines with Azure ML Studio", "Coursera · Jun 2020", "https://www.coursera.org/account/accomplishments/certificate/2MAG6WF2KZBP"],
  ["Predictive Modelling with Azure Machine Learning Studio", "Coursera", "https://www.coursera.org/account/accomplishments/certificate/GBPFVZDMT2G9"],
  ["SQL Tips, Tricks, & Techniques", "LinkedIn Learning · Sep 2020", "https://www.linkedin.com/learning/certificates/ee1644c911662406b5545424ff7c5fd8754be1d7f00a00624a1b9c9c08d982a7/?trk=backfilled_certificate"],
  ["Advanced SQL for Data Scientists", "LinkedIn Learning · Sep 2020", "https://www.linkedin.com/learning/certificates/c75de9d4b142867a138122e255caaa2b5d3379c1057be83d6c1f7fc7e90550aa/?trk=backfilled_certificate"],
  ["SQL: Data Reporting and Analysis", "LinkedIn Learning · Sep 2020", "https://www.linkedin.com/learning/certificates/275b02b4f850d35d040e5ccb94ae2b14a339ea58e14f03082a233cf94fe3c580/?trk=backfilled_certificate"],
  ["Learning SQL Programming", "LinkedIn Learning · Aug 2020", "https://www.linkedin.com/learning/certificates/1e29a61a380e3cfbba9292e4100ed982bbeb9e45e602b0972ee8ee82f8449e22/?trk=backfilled_certificate"],
  ["SQL Essential Training", "LinkedIn Learning · Aug 2020", "https://www.linkedin.com/learning/certificates/0f2be91dd84616e96c2bfbd0d9efb3197af5e29394651f96f245893ff0b3c90a/?trk=backfilled_certificate"],
  ["Financial Risk Analytics", "Great Learning · Apr 2020", "https://olympus1.greatlearning.in/course_certificate/GQICJVMU"],
  ["Introduction to R", "Great Learning · Apr 2020", "https://olympus1.greatlearning.in/course_certificate/WGNGFBLP"],
  ["Marketing and Retail Analytics", "Great Learning · Apr 2020", "https://olympus1.greatlearning.in/course_certificate/OKECFULR"],
  ["Data Visualization using Tableau", "Great Learning · Apr 2020", "https://olympus1.greatlearning.in/course_certificate/XGDOLAHN"],
  ["Statistics Foundations: 1", "LinkedIn Learning · Sep 2019", "https://www.linkedin.com/learning/certificates/84b4349bdf33df26e4e41d1f49632a0f57dd7bf41be649dca7e2a766987098a0/?trk=backfilled_certificate"],
  ["Programming Foundations: Fundamentals", "LinkedIn Learning · Sep 2019", "https://www.linkedin.com/learning/certificates/b14cd2708db9821047fcf9109245aa533eae7423949e03cb5af954d19e6ddf66/?trk=backfilled_certificate"],
  ["Introduction to Geometric Dimensioning and Tolerancing", "LinkedIn Learning · Aug 2019", "https://www.linkedin.com/learning/certificates/3fa9e657f5994bbb0431b541b43458e39ab5a0f564466a928efb8e4ef1bdf022/?trk=backfilled_certificate"],
];

// Credly badge wallet. Linked as one public profile rather than listing each
// badge, so new badges appear without a site change. Count, issuers and topics
// were read from the live profile on 12 Oct 2026.
export const credly = {
  title: "Credly badge wallet",
  url: "https://www.credly.com/users/gopalakrishna-maddipalli",
  summary: "14 verified badges · Google Cloud and Coursera (IBM)",
  topics: "Prompt Design in Vertex AI, Agent Development Kit (ADK), Generative AI for Data Scientists and Data Analysts, Prompt Engineering, Python for Data Science and AI",
  latest: "Oct 2026",
};

// Microsoft Learn public profile. Counts and topics were read from the live
// profile on 12 Oct 2026; all items were completed 23–27 Jun 2021.
export const microsoftLearn = {
  title: "Microsoft Learn achievements",
  url: "https://learn.microsoft.com/en-us/users/gopalakrishnashepherd-9861/achievements",
  summary: "51 module badges · 13 learning-path trophies · Level 8",
  topics: "Azure AI Fundamentals, Azure AI Vision, Language and Speech, Azure Machine Learning designer and AutoML, Azure IoT Edge with MLOps, Power BI",
  completed: "Jun 2021",
};
