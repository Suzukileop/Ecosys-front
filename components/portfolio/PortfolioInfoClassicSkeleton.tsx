import type { CSSProperties } from 'react';
import styles from './portfolio-info-classic-skeleton.module.css';

/** Reuse the real Classic layout's responsive rails, bio width and education columns. */
export function PortfolioInfoClassicSkeleton(){
 const bone=(width:string,meta=false)=><span className={`${styles.bone}${meta?' '+styles.meta:''}`} style={{width}}/>;
 return <div className={`pf-about-classic ${styles.body}`} data-info-classic-skeleton="" style={{'--pf-about-classic-border':'var(--stack-skeleton-border)'} as CSSProperties}>
  <div className="pf-about-classic-bio">
   {[['80%','98%','100%','88%'],['100%','96%','98%','18%']].map((widths,i)=><div key={i} className={styles.paragraph}>{widths.map((w,j)=><span key={j}>{bone(w)}</span>)}</div>)}
  </div>
  <div className="pf-about-classic-blocks"><div className="pf-about-classic-block">
   <div className="pf-about-classic-block-label">{bone('104px')}</div>
   <div className="pf-about-classic-block-body"><ol className="pf-about-classic-edu-index">{[0,1].map(i=><li key={i} className="pf-about-classic-edu-row">
    <div className="pf-about-classic-edu-range">{bone('128px')}</div>
    <div className="pf-about-classic-edu-what">{bone(i?'82%':'88%')}{bone('94%',true)}</div>
   </li>)}</ol></div>
  </div></div>
 </div>;
}
