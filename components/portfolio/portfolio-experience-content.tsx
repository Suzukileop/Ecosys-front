'use client';

import {createContext, createElement, useContext, type ComponentType} from 'react';
import styles from './portfolio-experience-content.module.css';
import { useT as useTranslation } from '@/lib/i18n/I18nProvider';
const TaskMarkersContext = createContext(true);
const StatusLabelsContext = createContext<{ ongoingStatusLabel?: string; finishedStatusLabel?: string }>({});
export const useExperienceTaskMarkers = () => useContext(TaskMarkersContext);
export function useExperienceTranslation(): ReturnType<typeof useTranslation> {
  const translate = useTranslation();
  const labels = useContext(StatusLabelsContext);
  return Object.assign((...args: Parameters<typeof translate>) => {
    const custom = args[0] === 'Ongoing' ? labels.ongoingStatusLabel : args[0] === 'Done' || args[0] === 'Finished' ? labels.finishedStatusLabel : undefined;
    return custom?.trim() || translate(...args);
  }, translate);
}

export function withExperienceTypography<P extends object>(Gallery:ComponentType<P>) {
  return function ExperienceTypography(props:P) {
    const presentation = (props as { presentation?: { showTaskMarkers?: boolean; ongoingStatusLabel?: string; finishedStatusLabel?: string } }).presentation;
    return <StatusLabelsContext.Provider value={presentation ?? {}}><TaskMarkersContext.Provider value={presentation?.showTaskMarkers !== false}><div className={styles.content}>{createElement(Gallery,props)}</div></TaskMarkersContext.Provider></StatusLabelsContext.Provider>;
  };
}
