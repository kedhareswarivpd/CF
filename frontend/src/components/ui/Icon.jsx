// Material Symbols icons render via ligature text (the span's own text
// content is the literal icon name, e.g. "dashboard", "folder") — without
// aria-hidden, that text is exposed to assistive tech and gets concatenated
// into the accessible name of any parent button/link ("dashboard Overview"
// instead of "Overview"). These icons are always decorative pairings with
// visible adjacent text in this app, so they're hidden from the
// accessibility tree by default; a caller can still override via props.
export default function Icon({ name, className = '', ...rest }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${className}`} {...rest}>
      {name}
    </span>
  );
}
