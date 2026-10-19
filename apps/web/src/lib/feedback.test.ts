import { describe, expect, it } from 'vitest';
import { FEEDBACK_MAX_LENGTH, feedbackNotificationEmail, parseFeedbackBody } from './feedback';

describe('parseFeedbackBody', () => {
  it('acepta un mensaje mínimo y recorta espacios', () => {
    expect(parseFeedbackBody({ body: '  ¿Por qué dos guías de Tierra Santa?  ' })).toEqual({
      body: '¿Por qué dos guías de Tierra Santa?',
      email: null,
      fromPath: null,
    });
  });

  it('acepta email y ruta interna válidos', () => {
    expect(
      parseFeedbackBody({ body: 'Hola', email: ' ana@example.com ', fromPath: '/es/leer/gen/1' }),
    ).toEqual({ body: 'Hola', email: 'ana@example.com', fromPath: '/es/leer/gen/1' });
  });

  it('rechaza cuerpos no válidos', () => {
    expect(parseFeedbackBody(null)).toBeNull();
    expect(parseFeedbackBody('hola')).toBeNull();
    expect(parseFeedbackBody({})).toBeNull();
    expect(parseFeedbackBody({ body: 42 })).toBeNull();
    expect(parseFeedbackBody({ body: '   ' })).toBeNull();
    expect(parseFeedbackBody({ body: 'x'.repeat(FEEDBACK_MAX_LENGTH + 1) })).toBeNull();
  });

  it('rechaza el envío si el honeypot viene relleno', () => {
    expect(parseFeedbackBody({ body: 'Hola', website: 'http://spam.example' })).toBeNull();
    expect(parseFeedbackBody({ body: 'Hola', website: '' })).not.toBeNull();
  });

  it('rechaza emails con forma inválida, pero admite el campo vacío', () => {
    expect(parseFeedbackBody({ body: 'Hola', email: 'sin-arroba' })).toBeNull();
    expect(parseFeedbackBody({ body: 'Hola', email: 42 })).toBeNull();
    expect(parseFeedbackBody({ body: 'Hola', email: '  ' })).toEqual({
      body: 'Hola',
      email: null,
      fromPath: null,
    });
  });

  it('descarta en silencio rutas externas o malformadas', () => {
    for (const fromPath of ['https://evil.example', '//evil.example', 'leer', 42]) {
      expect(parseFeedbackBody({ body: 'Hola', fromPath })).toEqual({
        body: 'Hola',
        email: null,
        fromPath: null,
      });
    }
  });
});

describe('feedbackNotificationEmail', () => {
  const base = {
    body: 'Hola',
    contactEmail: null,
    withAccount: false,
    fromPath: null,
    siteUrl: 'https://proyectotabor.org',
  };

  it('pone el mensaje en el asunto y en el cuerpo', () => {
    const { subject, text } = feedbackNotificationEmail({
      ...base,
      body: '¿Dónde\nestaba Emaús?',
      contactEmail: 'ana@example.com',
      fromPath: '/es/leer/luc/24',
    });
    expect(subject).toBe('Buzón de Proyecto Tabor: «¿Dónde estaba Emaús?»');
    expect(text).toContain('De: ana@example.com\n');
    expect(text).toContain('Desde: https://proyectotabor.org/es/leer/luc/24');
    expect(text).toContain('---\n¿Dónde\nestaba Emaús?\n---');
    expect(text).toContain('Responde a este correo');
  });

  it('recorta el asunto de los mensajes largos', () => {
    const { subject } = feedbackNotificationEmail({ ...base, body: 'palabra '.repeat(20) });
    expect(subject).toBe(`Buzón de Proyecto Tabor: «${'palabra '.repeat(7).trimEnd()}…»`);
  });

  it('distingue cuenta, anónimo y página desconocida', () => {
    const withAccount = feedbackNotificationEmail({
      ...base,
      contactEmail: 'ana@example.com',
      withAccount: true,
    });
    expect(withAccount.text).toContain('De: ana@example.com (con cuenta)');

    const anonymous = feedbackNotificationEmail(base);
    expect(anonymous.text).toContain('De: anónimo, sin email de contacto');
    expect(anonymous.text).toContain('Desde: desconocida');
    expect(anonymous.text).toContain('No se puede responder');
  });
});
