import { describe, expect, it } from 'vitest';
import { FEEDBACK_MAX_LENGTH, parseFeedbackBody } from './feedback';

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
