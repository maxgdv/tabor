import { describe, expect, it } from 'vitest';
import { authErrorKey } from './auth-errors';

describe('authErrorKey', () => {
  it('mapea los códigos conocidos', () => {
    expect(authErrorKey('USER_ALREADY_EXISTS')).toBe('errors.userExists');
    expect(authErrorKey('INVALID_EMAIL_OR_PASSWORD')).toBe('errors.invalidCredentials');
    expect(authErrorKey('PASSWORD_TOO_SHORT')).toBe('errors.passwordTooShort');
    expect(authErrorKey('INVALID_EMAIL')).toBe('errors.invalidEmail');
  });

  it('cae al genérico con códigos desconocidos, undefined o null', () => {
    expect(authErrorKey('ALGO_NUEVO')).toBe('errors.generic');
    expect(authErrorKey(undefined)).toBe('errors.generic');
    expect(authErrorKey(null)).toBe('errors.generic');
  });
});
