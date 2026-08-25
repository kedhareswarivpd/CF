export const services = [
  {
    slug: 'custom-software',
    icon: 'terminal',
    title: 'Custom Software',
    description:
      'Bespoke software built end-to-end around a business’s exact requirements, from architecture through long-term support.',
    features: ['Tailored Workflows', 'Custom Integrations'],
    benefit: 'Perfect process fit with full ownership of the codebase — no vendor lock-in.',
  },
  {
    slug: 'enterprise-software',
    icon: 'domain',
    title: 'Enterprise Software',
    description:
      'Robust, architecturally sound applications designed to support mission-critical business processes at global scale.',
    features: ['Microservices Architecture', 'Legacy Modernization'],
    benefit: 'Reduced technical debt and increased operational agility.',
  },
  {
    slug: 'cloud-migration',
    icon: 'cloud_sync',
    title: 'Cloud Migration',
    description:
      'Seamlessly transition your infrastructure to AWS, Azure, or GCP with zero downtime strategies.',
    features: ['Hybrid Cloud Integration', 'Cost Optimization'],
    benefit: 'Significant reduction in TCO and elastic scaling capabilities.',
  },
  {
    slug: 'cloud-infrastructure',
    icon: 'cloud',
    title: 'Cloud Infrastructure',
    description:
      'Design and management of secure, scalable cloud infrastructure that stays resilient under real-world load.',
    features: ['Multi-Cloud Architecture', 'Autoscaling & FinOps'],
    benefit: 'Elastic scaling and higher availability at a lower infrastructure cost.',
  },
  {
    slug: 'ai-solutions',
    icon: 'psychology',
    title: 'AI Solutions',
    description:
      'Applied AI systems that automate decisions and unlock new capabilities across core operations.',
    features: ['Generative AI Workflows', 'Human-in-the-Loop Rollout'],
    benefit: 'Reduced manual effort and faster turnaround with higher accuracy.',
  },
  {
    slug: 'data-analytics',
    icon: 'analytics',
    title: 'Data Analytics',
    description:
      'Turn raw operational data into decision-ready insight through predictive modeling and ML pipelines.',
    features: ['Real-Time Data Lakehouses', 'Executive Dashboards'],
    benefit: 'Data-driven decision making that uncovers new opportunities.',
  },
  {
    slug: 'cyber-security',
    icon: 'shield_lock',
    title: 'Cyber Security',
    description:
      'Securing enterprise systems against modern threats with a defensible, compliance-aligned security posture.',
    features: ['Zero Trust Architecture', 'Penetration Testing & Audits'],
    benefit: 'Reduced breach risk and regulatory compliance across applications and infrastructure.',
  },
];

export const engagementProcess = [
  { step: '01', title: 'Consulting', icon: 'architecture', description: 'Strategic mapping of technical requirements to goals.' },
  { step: '02', title: 'Development', icon: 'code', description: 'Agile execution with bi-weekly sprints and automation.' },
  { step: '03', title: 'Testing', icon: 'fact_check', description: 'Rigorous QA, penetration testing, and stress-tests.' },
  { step: '04', title: 'Deployment', icon: 'rocket_launch', description: 'Zero-downtime releases and automated scaling.' },
  { step: '05', title: 'Maintenance', icon: 'support_agent', description: 'Continuous monitoring and security patching.' },
];

export const faqs = [
  {
    question: 'What is your standard engagement model?',
    answer:
      'We offer flexible engagement models including Dedicated Teams (Managed Services), Fixed-Price Project Delivery, and Time & Materials for elastic R&D needs. Most enterprise partners start with a 3-month pilot phase.',
  },
  {
    question: 'How do you handle data security during development?',
    answer:
      'We operate under strict SOC2 Type II and GDPR compliance. All developers work within secure, air-gapped virtual environments when handling sensitive IP, and we employ rigorous data masking for testing phases.',
  },
  {
    question: 'Can you modernize legacy COBOL or mainframe systems?',
    answer:
      'Yes. Our "Strangler Fig" modernization pattern allows us to wrap and gradually replace legacy components with modern microservices, ensuring business continuity throughout the transition.',
  },
  {
    question: 'Do you provide post-deployment support?',
    answer:
      'Absolutely. We offer 24/7 L1-L3 support tiers with guaranteed response times. Our DevOps teams also handle ongoing infrastructure management and security updates.',
  },
];
