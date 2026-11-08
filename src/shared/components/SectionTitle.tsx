import type { ReactNode } from 'react';
import styles from './SectionTitle.module.css';

interface Props {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  tone?: 'primary' | 'accent';
  size?: 'lg' | 'md';
}

/** Título de sección con la barra diagonal de color. */
export function SectionTitle({ children, as: Tag = 'h2', tone = 'primary', size = 'lg' }: Props) {
  return (
    <div className={styles.wrap}>
      <span className={`${styles.bar} ${styles[tone]}`} aria-hidden="true" />
      <Tag className={`${styles.title} ${styles[size]}`}>{children}</Tag>
    </div>
  );
}
