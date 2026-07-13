// Mapea los códigos de error de Better-Auth a claves del namespace `auth`
// de i18n. Función pura — testeable sin red ni BD.

const ERROR_KEYS: Record<string, string> = {
  USER_ALREADY_EXISTS: 'errors.userExists',
  INVALID_EMAIL_OR_PASSWORD: 'errors.invalidCredentials',
  PASSWORD_TOO_SHORT: 'errors.passwordTooShort',
  PASSWORD_TOO_LONG: 'errors.generic',
  INVALID_EMAIL: 'errors.invalidEmail',
  INVALID_PASSWORD: 'errors.invalidCredentials',
};

/** Clave i18n (relativa al namespace `auth`) para un código de error. */
export function authErrorKey(code: string | undefined | null): string {
  return (code && ERROR_KEYS[code]) || 'errors.generic';
}
