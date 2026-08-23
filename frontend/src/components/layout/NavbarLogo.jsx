import { Link } from 'react-router-dom';

export default function NavbarLogo({ compact = false }) {
 return (
  <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="CoreFusion — Home">
   <div
    className={`overflow-hidden rounded-full border-2 border-brand/20 ${
     compact ? 'size-8' : 'size-10 md:size-11'
    }`}
   >
    <img
     src="/logo.jpeg"
     alt=""
     className="size-full scale-110 object-cover"
     loading="eager"
    />
   </div>
   <span
    className={`font-display font-bold tracking-tight text-brand-dark dark:text-white ${
     compact ? 'text-lg' : 'text-xl'
    }`}
   >
    Core<span className="text-brand">Fusion</span>
   </span>
  </Link>
 );
}
