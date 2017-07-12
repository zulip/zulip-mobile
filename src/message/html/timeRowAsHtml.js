import { humanDate } from '../../utils/date';

export default timestamp => `
  <div class="timerow">
    <div class="timerow-left"></div>
    ${humanDate(new Date(timestamp * 1000))}
    <div class="timerow-right"></div>
  </div>
`;
