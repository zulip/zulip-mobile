export const normalizeRecipients = (recipients) => {
  const ret = recipients
  .map((s) => s.email.trim())
  .filter((s) => s.length > 0)
  .sort()
  .join(',');
  return ret;
};

export const sameRecipient = (msg1, msg2) => {
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
  }

  //Invariant
  return false;
};