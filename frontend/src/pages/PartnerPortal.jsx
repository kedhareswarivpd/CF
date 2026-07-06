import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../api/client.js';

const partnerData = {
  tier: 'Gold',
  since: '2024',
  benefits: [
    { icon: 'support', title: 'Priority Support', description: 'Dedicated partner success manager with 4-hour response SLA' },
    { icon: 'school', title: 'Joint Training', description: 'Free training and certification programs for partner teams' },
    { icon: 'campaign', title: 'Co-Marketing', description: 'Joint go-to-market programs and event sponsorships' },
    { icon: 'handshake', title: 'Revenue Share', description: 'Competitive margin structure with quarterly incentives' },
  ],
  resources: [
    { title: 'Partner Onboarding Guide', type: 'PDF' },
    { title: 'Solution Architecture Deck', type: 'PPTX' },
    { title: 'Integration API Documentation', type: 'HTML' },
    { title: 'Co-Branding Guidelines', type: 'PDF' },
  ],
  deals: [
    { name: 'Acme Financial Migration', value: '$450K', stage: 'negotiation', probability: '70%' },
    { name: 'MedTech AI Pilot', value: '$180K', stage: 'proposal', probability: '40%' },
    { name: 'RetailCloud Expansion', value: '$320K', stage: 'discovery', probability: '20%' },
  ],
};

const STAGE_VARIANTS = {
  negotiation: 'success',
  proposal: 'info',
  discovery: 'warning',
};

export default function PartnerPortal() {
  useDocumentTitle('Partner Portal | CoreFusion Technologies');
  const { isAuthenticated, user, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState(null);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    apiRequest('/partners', { token: accessToken })
      .then((res) => {
        if (res.data?.length) setPartnerName(res.data[0].name);
      })
      .catch(() => console.warn('Failed to fetch partners'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const { tier, since, benefits, resources, deals } = partnerData;
  const displayName = partnerName || user?.name || 'Partner Portal';

  if (loading) {
    return <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container"><LoadingSpinner /></div>;
  }

  if (!benefits.length && !resources.length && !deals.length) {
    return (
      <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
          <EmptyState icon="handshake" title="No partners yet" description="Create a partnership." />
        </div>
      </div>
    );
  }

  return (
    <div className="py-section-padding bg-surface-container dark:bg-dark-surface-container">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4 mb-stack-lg">
          <Avatar name={displayName} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-headline-md text-brand-dark dark:text-dark-brand">{displayName}</h1>
              <StatusBadge variant="warning">{tier} Partner</StatusBadge>
            </div>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Partner since {since}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
              <Icon name={b.icon} className="text-brand dark:text-dark-brand text-2xl mb-3" />
              <h3 className="font-body text-body-md font-semibold text-brand-dark dark:text-dark-brand mb-1">{b.title}</h3>
              <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{b.description}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-gutter">
          <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
            <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4">Resources & Assets</h3>
            <div className="space-y-3">
              {resources.map((r) => (
                <div key={r.title} className="flex items-center justify-between p-3 bg-surface-container dark:bg-dark-surface-container rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="description" className="text-brand dark:text-dark-brand text-xl" />
                    <span className="text-body-md text-brand-dark dark:text-dark-brand">{r.title}</span>
                  </div>
                  <StatusBadge variant="neutral">{r.type}</StatusBadge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-outline-variant dark:border-dark-outline-variant rounded-lg p-stack-lg">
            <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand mb-4">Active Deals</h3>
            <div className="space-y-3">
              {deals.map((d) => (
                <div key={d.name} className="p-3 bg-surface-container dark:bg-dark-surface-container rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{d.name}</span>
                    <StatusBadge variant={STAGE_VARIANTS[d.stage] || 'neutral'}>{d.stage}</StatusBadge>
                  </div>
                  <div className="flex items-center gap-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">
                    <span>Value: {d.value}</span>
                    <span>Probability: {d.probability}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
