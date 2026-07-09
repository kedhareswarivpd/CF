import { industryFilters, serviceFilters } from '../../data/projects.js';

function FilterGroup({ label, options, active, onSelect, multi = false }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="font-label-caps text-label-caps uppercase text-brand mr-2">{label}</span>
      {options.map((option) => {
        const isActive = multi ? active.includes(option) : active === option;
        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`px-4 py-1.5 border rounded-full font-label-caps text-label-caps uppercase transition-all ${
              isActive
                ? 'bg-brand text-white border-brand'
                : 'border-outline dark:border-dark-outline text-white hover:border-brand'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterBar({ industry, onIndustryChange, activeServices, onServiceToggle }) {
  return (
    <section className="bg-surface-bright dark:bg-dark-surface-bright py-stack-md border-b border-outline-variant dark:border-dark-outline-variant sticky top-20 z-40">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <FilterGroup label="Industry:" options={industryFilters} active={industry} onSelect={onIndustryChange} />
        <FilterGroup
          label="Service:"
          options={serviceFilters}
          active={activeServices}
          onSelect={onServiceToggle}
          multi
        />
      </div>
    </section>
  );
}
