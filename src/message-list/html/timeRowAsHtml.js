import { humanDate } from '../../utils/date';

export default (timestamp) => `
  <div class="timerow">
    ${humanDate(new Date(timestamp * 1000))}
  </div>
`;
