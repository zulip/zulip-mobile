import { Recipient } from '../types';

export const normalizeRecipients = (recipients: Recipient[]) =>
  (!Array.isArray(recipients) ?
    recipients :
    recipients
      .map((s) => s.email.trim())
      .filter(x => x.length > 0)
      .sort()
      .join(','));

export const isSameRecipient = (msg1, msg2): boolean => {
  if (msg1 === undefined || msg2 === undefined) {
    return false;
  }

  if (msg1.type !== msg2.type) {
    return false;
  }

  switch (msg1.type) {
    case 'private':
      return (normalizeRecipients(msg1.display_recipient).toLowerCase() ===
              normalizeRecipients(msg2.display_recipient).toLowerCase());
    case 'stream':
      return (msg1.display_recipient.toLowerCase() === msg2.display_recipient.toLowerCase() &&
              msg1.subject.toLowerCase() === msg2.subject.toLowerCase());
    default:
      // Invariant
      return false;
  }
};
