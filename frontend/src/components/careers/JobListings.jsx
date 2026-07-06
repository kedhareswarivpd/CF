import Reveal from '../ui/Reveal.jsx';
import JobCard from './JobCard.jsx';

export default function JobListings({ jobs }) {
  return (
    <section className="py-section-padding">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
        <p className="text-body-md text-ink-muted mb-6">{jobs.length} open positions</p>
        <div className="space-y-stack-md">
          {jobs.map((job, i) => (
            <Reveal key={job.slug} from="left" delay={i * 80}>
              <JobCard job={job} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
