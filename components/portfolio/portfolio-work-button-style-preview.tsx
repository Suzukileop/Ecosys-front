import styles from './portfolio-work-button-style-preview.module.css';

/** Small, non-interactive sample of the actual CTA anatomy, in panel-neutral ink. */
export function WorkButtonStylePreview({variant,label,arrow='diagonal'}:{
  variant:'text'|'link'|'underline'|'outline'|'solid'|'pill';label:string;
  arrow?:'diagonal'|'right';
}) {
  return <span className={styles.stage} aria-hidden>
    <span className={styles.button} data-variant={variant}>
      <span className={styles.label}>{label}</span><span className={styles.arrow}>{arrow==='right'?'→':'↗'}</span>
    </span>
  </span>;
}
