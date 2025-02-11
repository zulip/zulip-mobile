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
  ace: require('../../static/translations/messages_ace.json'),
  am: require('../../static/translations/messages_am.json'),
  ar: require('../../static/translations/messages_ar.json'),
  be: require('../../static/translations/messages_be.json'),
  bg: require('../../static/translations/messages_bg.json'),
  bn: require('../../static/translations/messages_bn.json'),
  bqi: require('../../static/translations/messages_bqi.json'),
  ca: require('../../static/translations/messages_ca.json'),
  cy: require('../../static/translations/messages_cy.json'),
  cs: require('../../static/translations/messages_cs.json'),
  da: require('../../static/translations/messages_da.json'),
  de: require('../../static/translations/messages_de.json'),
  el: require('../../static/translations/messages_el.json'),
  en: require('../../static/translations/messages_en.json'),
  'en-GB': require('../../static/translations/messages_en_GB.json'),
  eo: require('../../static/translations/messages_eo.json'),
  es: require('../../static/translations/messages_es.json'),
  eu: require('../../static/translations/messages_eu.json'),
  fa: require('../../static/translations/messages_fa.json'),
  fi: require('../../static/translations/messages_fi.json'),
  fr: require('../../static/translations/messages_fr.json'),
  gl: require('../../static/translations/messages_gl.json'),
  gu: require('../../static/translations/messages_gu.json'),
  ha: require('../../static/translations/messages_ha.json'),
  hi: require('../../static/translations/messages_hi.json'),
  hr: require('../../static/translations/messages_hr.json'),
  hu: require('../../static/translations/messages_hu.json'),
  id: require('../../static/translations/messages_id.json'),
  ig: require('../../static/translations/messages_ig.json'),
  it: require('../../static/translations/messages_it.json'),
  ja: require('../../static/translations/messages_ja.json'),
  ko: require('../../static/translations/messages_ko.json'),
  kw: require('../../static/translations/messages_kw.json'),
  lt: require('../../static/translations/messages_lt.json'),
  lv: require('../../static/translations/messages_lv.json'),
  ml: require('../../static/translations/messages_ml.json'),
  mn: require('../../static/translations/messages_mn.json'),
  my: require('../../static/translations/messages_my.json'),
  nl: require('../../static/translations/messages_nl.json'),
  no: require('../../static/translations/messages_no.json'),
  pa: require('../../static/translations/messages_pa.json'),
  pcm: require('../../static/translations/messages_pcm.json'),
  pl: require('../../static/translations/messages_pl.json'),
  pt: require('../../static/translations/messages_pt.json'),
  'pt-BR': require('../../static/translations/messages_pt_BR.json'),
  'pt-PT': require('../../static/translations/messages_pt_PT.json'),
  ro: require('../../static/translations/messages_ro.json'),
  ru: require('../../static/translations/messages_ru.json'),
  sco: require('../../static/translations/messages_sco.json'),
  si: require('../../static/translations/messages_si.json'),
  sk: require('../../static/translations/messages_sk.json'),
  sl: require('../../static/translations/messages_sl.json'),
  sr: require('../../static/translations/messages_sr.json'),
  sv: require('../../static/translations/messages_sv.json'),
  ta: require('../../static/translations/messages_ta.json'),
  te: require('../../static/translations/messages_te.json'),
  tl: require('../../static/translations/messages_tl.json'),
  tr: require('../../static/translations/messages_tr.json'),
  uk: require('../../static/translations/messages_uk.json'),
  ur: require('../../static/translations/messages_ur.json'),
  uz: require('../../static/translations/messages_uz.json'),
  vi: require('../../static/translations/messages_vi.json'),
  yo: require('../../static/translations/messages_yo.json'),
  yue: require('../../static/translations/messages_yue.json'),
  'zh-Hans': require('../../static/translations/messages_zh-Hans.json'),
  'zh-Hant': require('../../static/translations/messages_zh-Hant.json'),
  'zh-TW': require('../../static/translations/messages_zh_TW.json'),
};
