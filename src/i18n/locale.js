/* @flow strict */
/* eslint-disable spellcheck/spell-checker */

import { addLocaleData } from 'react-intl';
import ar from 'react-intl/locale-data/ar';
import bg from 'react-intl/locale-data/bg';
import ca from 'react-intl/locale-data/ca';
import cs from 'react-intl/locale-data/cs';
import de from 'react-intl/locale-data/de';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import fr from 'react-intl/locale-data/fr';
import hi from 'react-intl/locale-data/hi';
import hu from 'react-intl/locale-data/hu';
import id from 'react-intl/locale-data/id';
import it from 'react-intl/locale-data/it';
import ja from 'react-intl/locale-data/ja';
import ko from 'react-intl/locale-data/ko';
import ml from 'react-intl/locale-data/ml';
import nl from 'react-intl/locale-data/nl';
import pl from 'react-intl/locale-data/pl';
import pt from 'react-intl/locale-data/pt';
import ru from 'react-intl/locale-data/ru';
import sr from 'react-intl/locale-data/sr';
import sv from 'react-intl/locale-data/sv';
import ta from 'react-intl/locale-data/ta';
import tr from 'react-intl/locale-data/tr';
import zh from 'react-intl/locale-data/zh';

[
  ar,
  bg,
  ca,
  cs,
  de,
  en,
  es,
  fr,
  hi,
  hu,
  id,
  it,
  ja,
  ko,
  ml,
  nl,
  pl,
  pt,
  ru,
  sr,
  sv,
  ta,
  tr,
  zh,
].forEach(locale => addLocaleData(locale));
