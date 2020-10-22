/* @flow strict-local */
/* eslint-disable global-require */

/**
 * Message data for all languages we have message data for.
 *
 * Keys here are IETF BCP 47 language tags.
 *
 * The languages we offer in the UI are a subset of these; see
 * `src/settings/languages.js`.
 */
// Note that the filenames reflect a slightly different convention for
// language names: they have the names given to them by the `tx` Transifex
// client, which are based on the language names that appear in Transifex.
export default {
  ar: require('../../static/translations/messages_ar.json'),
  bg: require('../../static/translations/messages_bg.json'),
  bn: require('../../static/translations/messages_bn.json'),
  ca: require('../../static/translations/messages_ca.json'),
  cs: require('../../static/translations/messages_cs.json'),
  da: require('../../static/translations/messages_da.json'),
  de: require('../../static/translations/messages_de.json'),
  el: require('../../static/translations/messages_el.json'),
  en: require('../../static/translations/messages_en.json'),
  'en-GB': require('../../static/translations/messages_en_GB.json'),
  eo: require('../../static/translations/messages_eo.json'),
  es: require('../../static/translations/messages_es.json'),
  fa: require('../../static/translations/messages_fa.json'),
  fi: require('../../static/translations/messages_fi.json'),
  fr: require('../../static/translations/messages_fr.json'),
  'fr-FR': require('../../static/translations/messages_fr_FR.json'),
  gl: require('../../static/translations/messages_gl.json'),
  gu: require('../../static/translations/messages_gu.json'),
  hi: require('../../static/translations/messages_hi.json'),
  hr: require('../../static/translations/messages_hr.json'),
  'hr-HR': require('../../static/translations/messages_hr_HR.json'),
  hu: require('../../static/translations/messages_hu.json'),
  id: require('../../static/translations/messages_id.json'),
  it: require('../../static/translations/messages_it.json'),
  ja: require('../../static/translations/messages_ja.json'),
  ko: require('../../static/translations/messages_ko.json'),
  lt: require('../../static/translations/messages_lt.json'),
  ml: require('../../static/translations/messages_ml.json'),
  nl: require('../../static/translations/messages_nl.json'),
  no: require('../../static/translations/messages_no.json'),
  pa: require('../../static/translations/messages_pa.json'),
  pl: require('../../static/translations/messages_pl.json'),
  pt: require('../../static/translations/messages_pt.json'),
  'pt-BR': require('../../static/translations/messages_pt_BR.json'),
  'pt-PT': require('../../static/translations/messages_pt_PT.json'),
  ro: require('../../static/translations/messages_ro.json'),
  ru: require('../../static/translations/messages_ru.json'),
  sk: require('../../static/translations/messages_sk.json'),
  sr: require('../../static/translations/messages_sr.json'),
  sv: require('../../static/translations/messages_sv.json'),
  ta: require('../../static/translations/messages_ta.json'),
  te: require('../../static/translations/messages_te.json'),
  tl: require('../../static/translations/messages_tl.json'),
  tr: require('../../static/translations/messages_tr.json'),
  uk: require('../../static/translations/messages_uk.json'),
  uz: require('../../static/translations/messages_uz.json'),
  vi: require('../../static/translations/messages_vi.json'),
  'zh-Hans': require('../../static/translations/messages_zh-Hans.json'),
  'zh-Hant': require('../../static/translations/messages_zh-Hant.json'),
  'zh-TW': require('../../static/translations/messages_zh_TW.json'),
};
