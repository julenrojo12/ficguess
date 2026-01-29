import styles from './Tag.module.css';

interface TagProps {
  label: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  size?: 'sm' | 'md';
  onClick?: () => void;
  selected?: boolean;
}

export function Tag({
  label,
  icon,
  variant = 'default',
  size = 'md',
  onClick,
  selected = false,
}: TagProps) {
  const isClickable = !!onClick;

  const classes = [
    styles.tag,
    styles[variant],
    styles[size],
    isClickable ? styles.clickable : '',
    selected ? styles.selected : '',
  ]
    .filter(Boolean)
    .join(' ');

  const Component = isClickable ? 'button' : 'span';

  return (
    <Component
      className={classes}
      onClick={onClick}
      type={isClickable ? 'button' : undefined}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {label}
    </Component>
  );
}
