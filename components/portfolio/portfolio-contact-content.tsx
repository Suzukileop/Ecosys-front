'use client';

import {createElement,type ComponentType} from 'react';
import styles from './portfolio-contact-content.module.css';

export function withContactTypography<P extends object>(Section:ComponentType<P>) {
  return function ContactTypography(props:P) {
    return <div className={styles.content}>{createElement(Section,props)}</div>;
  };
}
