'use client';

import {createElement,type ComponentType} from 'react';
import styles from './portfolio-faq-content.module.css';

export function withFaqTypography<P extends object>(Gallery:ComponentType<P>) {
  return function FaqTypography(props:P) {
    return <div className={styles.content}>{createElement(Gallery,props)}</div>;
  };
}
