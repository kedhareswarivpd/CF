import { useEffect, useState } from 'react';
import CareersHero from '../components/careers/CareersHero.jsx';
import JobListings from '../components/careers/JobListings.jsx';
import CultureSection from '../components/careers/CultureSection.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { apiRequest } from '../api/client.js';
import { jobs as fallbackJobs, benefits, cultureValues } from '../data/careers.js';

function adaptJobs(apiJobs) {
  return apiJobs.map((j) => ({
    slug: j.slug,
    title: j.title,
    department: j.department || 'General',
    location: j.location || 'Remote',
    type: j.employment_type || 'Full-time',
    experience: j.experience_required || '',
    description: j.description || '',
    responsibilities: j.responsibilities || [],
    requirements: j.requirements || [],
  }));
}

export default function Careers() {
  useDocumentTitle('Careers | CoreFusion Technologies');
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/careers?limit=20')
      .then((res) => setJobs(adaptJobs(res.data || [])))
      .catch(() => { console.warn('Failed to fetch careers, using fallback'); setJobs(fallbackJobs); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <CareersHero />
      <SectionHeading
        eyebrow="Open Positions"
        title="Join Our Team"
        description="Explore opportunities to work on cutting-edge technology with talented teams across the globe."
        align="center"
        className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop [&_p]:!text-white [&_h2]:!text-white"
      />
      {loading ? (
        <div className="text-center py-8 text-body-md text-ink-muted">Loading positions...</div>
      ) : (
        <JobListings jobs={jobs} />
      )}
      <CultureSection values={cultureValues} benefits={benefits} />
      <CtaBanner />
    </>
  );
}
