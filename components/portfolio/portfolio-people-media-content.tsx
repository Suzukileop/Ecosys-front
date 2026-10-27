'use client';

import {createElement,type ComponentType} from 'react';
import styles from './portfolio-people-media-content.module.css';

/** Keep gallery/team content styling separate from their headers and settings. */
export function withPeopleMediaTypography<P extends object>(Section:ComponentType<P>) {
  return function PeopleMediaTypography(props:P) {
    return <div className={styles.content}>{createElement(Section,props)}</div>;
  };
}
