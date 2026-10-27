'use client';

import { Children, Fragment, cloneElement, isValidElement, type ReactNode } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import styles from './portfolio-stack-rail-controls.module.css';
import { SettingsControlSection } from './portfolio-settings-control-section';

/** Flatten conditional fragments, but retain each complete control and its handler. */
function controls(children: ReactNode, parentKey = 'controls'): ReactNode[] {
  return Children.toArray(children).flatMap(child => {
    if (!isValidElement<{children?:ReactNode}>(child)) return [child];
    // Keys from Children.toArray are local to each fragment. Retain the full
    // ancestor path when merging fragments so `.0` / `.1` cannot collide.
    const key = `${parentKey}/${encodeURIComponent(String(child.key))}`;
    return child.type === Fragment
      ? controls(child.props.children, key)
      : [cloneElement(child, { key })];
  });
}

function controlLabel(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (!isValidElement<{label?:string;title?:string;children?:ReactNode}>(node)) return '';
  if (typeof node.props.label === 'string') return node.props.label;
  if (typeof node.props.title === 'string') return node.props.title;
  for (const child of Children.toArray(node.props.children)) {
    const label=controlLabel(child);
    if (label) return label;
  }
  return '';
}

export function ToolsControlGroups({children}:{children:ReactNode}) {
  const t=useT();
  const organization=new Set(['Row order','Category filter'].map(label=>t(label)));
  const interaction=new Set(['Scroll mode','Slide navigation','Auto-advance','Focus mode','Scroll motion','Scroll cascade effect','Entry expand','Entry animation','Animation style','Scroll parallax'].map(label=>t(label)));
  const levels=new Set(['Level display','Level display size','Bar style','Bar & % size','Bar size','Percentage size','Thickness','Thickness & % size','Show level name'].map(label=>t(label)));
  const appearance=new Set(['Logo size','Ring size','Card size','Icon placement','Card style','Card frame','Logo visibility','Cell style','Thumbnail size','Thumbnail radius','Thumbnail height','Thumbnail effect','Frame color','Frame radius','Striped rows','Status presentation','Period / timeline','Screen frame color','Screen frame radius','Thumbnail','Image','Image corners','Image height','Image width','Image shape','Quote card','Frame','Quote background','Background colour','Frame background'].map(label=>t(label)));
  const text=new Set(['Title weight','Title size','Hero title','Prefix weight','Accent style','Accent size','Subtitle style','Accent underline','Underline style','Stack label','Responsibilities label','Headline','Headline color','Headline size'].map(label=>t(label)));
  const groups:Record<string,ReactNode[]>={Layout:[],Appearance:[],Text:[],Interaction:[],Levels:[],Organization:[]};
  for (const child of controls(children)) {
    const label=controlLabel(child);
    const group=organization.has(label)?'Organization':interaction.has(label)?'Interaction':levels.has(label)?'Levels':appearance.has(label)?'Appearance':text.has(label)?'Text':'Layout';
    groups[group].push(child);
  }
  return <div className={styles.controls}>{Object.entries(groups).filter(([,items])=>items.length).map(([name,items])=>
    <SettingsControlSection key={name} className={styles.settingsGroup} title={t(name)}>
      {items}
    </SettingsControlSection>)}
  </div>;
}

/** Shared alias for sections which use the same presentation-only grouping. */
export { ToolsControlGroups as LayoutControlGroups };
