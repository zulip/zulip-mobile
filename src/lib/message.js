type Recipient = {
  display_recipient: string,
  subject: string,
  email: string,
};

export const normalizeRecipients = (recipients: Recipient[]) =>
  recipients
    .map((s) => s.email.trim())
    .filter((s) => s.length > 0)
    .sort()
    .join(',');

export const sameRecipient = (msg1, msg2): boolean => {
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

export const rewriteLink = (uri, realm, authHeader) => {
  if (uri.startsWith('/')) {
    return {
      uri: `${realm}${uri}`,
      headers: {
        Authorization: authHeader,
      },
    };
  }
  return { uri };
};
