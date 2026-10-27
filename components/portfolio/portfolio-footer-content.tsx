'use client';

import {createElement,type ComponentType} from 'react';
import styles from './portfolio-footer-content.module.css';

export function withFooterTypography<P extends object>(Footer:ComponentType<P>) {
  return function FooterTypography(props:P) {
    return <div className={styles.content}>{createElement(Footer,props)}</div>;
  };
}
