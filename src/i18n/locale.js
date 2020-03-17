/* @flow strict-local */
/* eslint-disable spellcheck/spell-checker */

import { addLocaleData } from 'react-intl';
import ar from 'react-intl/locale-data/ar';
import bg from 'react-intl/locale-data/bg';
import ca from 'react-intl/locale-data/ca';
import cs from 'react-intl/locale-data/cs';
import da from 'react-intl/locale-data/da';
import de from 'react-intl/locale-data/de';
import el from 'react-intl/locale-data/el';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import fa from 'react-intl/locale-data/fa';
import fi from 'react-intl/locale-data/fi';
import fr from 'react-intl/locale-data/fr';
import gl from 'react-intl/locale-data/gl';
import hi from 'react-intl/locale-data/hi';
import hr from 'react-intl/locale-data/hr';
import hu from 'react-intl/locale-data/hu';
import id from 'react-intl/locale-data/id';
import it from 'react-intl/locale-data/it';
import ja from 'react-intl/locale-data/ja';
import ko from 'react-intl/locale-data/ko';
import lt from 'react-intl/locale-data/lt';
import ml from 'react-intl/locale-data/ml';
import nb from 'react-intl/locale-data/nb';
import nl from 'react-intl/locale-data/nl';
import pl from 'react-intl/locale-data/pl';
import pt from 'react-intl/locale-data/pt';
import ro from 'react-intl/locale-data/ro';
import ru from 'react-intl/locale-data/ru';
import sr from 'react-intl/locale-data/sr';
import sv from 'react-intl/locale-data/sv';
import ta from 'react-intl/locale-data/ta';
import tr from 'react-intl/locale-data/tr';
import uk from 'react-intl/locale-data/uk';
import uz from 'react-intl/locale-data/uz';
import vi from 'react-intl/locale-data/vi';
import zh from 'react-intl/locale-data/zh';

[
  ar,
  bg,
  ca,
  cs,
  da,
  de,
  el,
  en,
  es,
  fa,
  fi,
  fr,
  gl,
  hi,
  hr,
  hu,
  id,
  it,
  ja,
  ko,
  lt,
  ml,
  nb,
  nl,
  pl,
  pt,
  ro,
  ru,
  sr,
  sv,
  ta,
  tr,
  uk,
  uz,
  vi,
  zh,
].forEach(locale => addLocaleData(locale));
