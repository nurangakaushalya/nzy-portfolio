export interface ContactFormValues {
  name: string;
  service: string;
  message: string;
}

export interface ContactValidationErrors {
  name?: string;
  service?: string;
  message?: string;
}

export function validateContactForm(values: ContactFormValues): ContactValidationErrors {
  const errors: ContactValidationErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!values.service.trim()) {
    errors.service = 'Please select the service you need.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please include a short description of your project.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'Please share a bit more detail (at least 10 characters).';
  }

  return errors;
}

export function buildWhatsAppMessage(values: ContactFormValues): string {
  const cleanName = values.name.trim();
  const cleanService = values.service.trim();
  const cleanMessage = values.message.trim();

  const lines = ['Hello Nzy,', ''];
  if (cleanName) {
    lines.push(`Name: ${cleanName}`);
  }
  if (cleanService) {
    lines.push(`Service needed: ${cleanService}`);
  }
  if (cleanMessage) {
    lines.push('', 'Project brief:', cleanMessage);
  }
  if (!cleanName && !cleanMessage) {
    lines.push("I'd like to discuss a project with you.");
  }
  return lines.join('\n');
}

export interface WhatsAppLinkResult {
  isConfigured: boolean;
  normalizedNumber: string;
  encodedMessage: string;
  url: string | null;
}

export function normalizeWhatsAppNumber(rawNumber: string): string {
  return rawNumber.replace(/\D/g, '');
}

export function buildWhatsAppUrl(
  businessNumber: string,
  plainMessage: string
): WhatsAppLinkResult {
  const normalizedNumber = normalizeWhatsAppNumber(businessNumber);
  const encodedMessage = encodeURIComponent(plainMessage);
  const isConfigured = normalizedNumber.length >= 7;

  return {
    isConfigured,
    normalizedNumber,
    encodedMessage,
    url: isConfigured ? `https://wa.me/${normalizedNumber}?text=${encodedMessage}` : null,
  };
}
