export default function Icon({ name, className = '', ...rest }) {
  return (
    <span className={`material-symbols-outlined ${className}`} {...rest}>
      {name}
    </span>
  );
}
