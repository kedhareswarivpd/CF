export const services = [
  {
    icon: 'domain',
    title: 'Enterprise Software',
    description:
      'Robust, architecturally sound applications designed to support mission-critical business processes at global scale.',
    features: ['Microservices Architecture', 'Legacy Modernization'],
    benefit: 'Reduced technical debt and increased operational agility.',
  },
  {
    icon: 'cloud_sync',
    title: 'Cloud Migration',
    description:
      'Seamlessly transition your infrastructure to AWS, Azure, or GCP with zero downtime strategies.',
    features: ['Hybrid Cloud Integration', 'Cost Optimization'],
    benefit: 'Significant reduction in TCO and elastic scaling capabilities.',
  },
  {
    icon: 'psychology',
    title: 'AI & Data Analytics',
    description:
      'Transform raw data into actionable intelligence through predictive modeling and ML pipelines.',
    features: ['Generative AI Workflows', 'Real-time Data Lakehouses'],
    benefit: 'Data-driven decision making that uncovers new opportunities.',
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
