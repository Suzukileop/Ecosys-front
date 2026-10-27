'use client';

import {createElement,type ComponentType} from 'react';
import styles from './info-portfolio-header-designs/info-header-content.module.css';

/** The same quiet header typography as Info, without overriding custom type settings. */
export function withSectionHeaderTypography<P extends object>(Header:ComponentType<P>) {
  return function SectionHeaderTypography(props:P) {
    return createElement('div',{className:styles.header},createElement(Header,props));
  };
}
