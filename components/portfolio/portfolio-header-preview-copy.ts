import type {Translator} from '@/lib/i18n/translate';

/** Translated demo copy only. Never merge it into saved or public page settings. */
export function headerPreviewCopy(section:string,t:Translator){
 const titles:Record<string,string>={stack:t('Core stack'),info:t('About me'),work:t('Selected work'),tools:t('Tools'),services:t('Services'),experience:t('Experience'),team:t('Our team'),gallery:t('Selected moments'),faq:t('Frequently asked questions'),footer:t('Contact')};
 const title=titles[section]??t('Contact');
 const upper=(s:string)=>s.toLocaleUpperCase(t.locale);
 const subtitle=section==='experience'?t('A journey that makes a difference.'):section==='gallery'?t('A different perspective.'):t('From vision to detail.');
 const lead=section==='experience'?t('Learning. Creating. Growing.'):section==='gallery'?t('Selected moments'):t('Ideas brought to life.');
 return {
  headerEditorialLabelText:upper(title),headerEditorialTitleText:title,headerEditorialSubtitleText:subtitle,
  headerAccentCountBadgeText:'{count} '+title,headerAccentCountLeadText:lead,
  headerSerifLeadLabelText:upper(title),headerSerifLeadTitleText:lead,headerSerifLeadSubtitleText:subtitle,
  headerIndexLabelText:upper(title),headerIndexTitleText:title,headerIndexCountLabelText:upper(title),headerIndexSubtitleText:subtitle,
  headerBillboardBigWord:upper(title),headerBillboardTitleText:title,headerBillboardCountText:'{count} — '+upper(title),
  headerSplitHeadingTitleText:title,headerSplitHeadingLabelText:upper(title),
  headerMastheadLine1Text:upper(t('An idea.')),headerMastheadLine2Text:upper(t('A conversation.')),headerMastheadLine3Text:upper(t('A project.')),
  headerMarqueeWord1Text:upper(title),headerMarqueeWord2Text:upper(title),headerMarqueeWord3Text:upper(title),headerMarqueeWord4Text:upper(title),
  ...(section==='footer'?{
   headerEditorialTitleText:upper(t("Let's create together.")),headerEditorialSubtitleText:t("An idea? Let's talk about your project."),
   headerSerifLeadLabelText:upper(t('A new beginning')),headerSerifLeadTitleText:t("Let's bring your ideas to life."),headerSerifLeadSubtitleText:t('The next project starts here.'),
   headerIndexTitleText:t("Let's stay in touch"),headerIndexSubtitleText:t('A conversation, new possibilities.'),
   headerBillboardBigWord:upper(t('Hello')),headerHeroTitleText:t("Let's create together."),headerHeroCtaLabel:t("Let's talk about your project"),
   headerTimezoneKickerText:upper(t('Available for you')),headerTimezoneTitleText:t('Here to listen.'),headerTimezoneDescriptionText:t("From anywhere, let's connect."),
  }:{}),
 };
}
