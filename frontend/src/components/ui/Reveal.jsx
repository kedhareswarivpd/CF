import useScrollReveal from '../../hooks/useScrollReveal.js';

export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const [ref, visible] = useScrollReveal();

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
