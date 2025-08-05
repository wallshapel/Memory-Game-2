// tests/unit/api/flags/fetchFlags.spec.ts
import { fetchFlags } from '../../../../src/api/flags/fetchFlags';
import { COUNTRY_CODES } from '../../../../src/utils/countryCodes';
import { describe, it, expect, beforeEach, vi } from "vitest";

describe('fetchFlags', () => {
  it('devuelve el número correcto de banderas', async () => {
    const flags = await fetchFlags(5);
    expect(flags).toHaveLength(5);
    flags.forEach(flag => {
      expect(COUNTRY_CODES).toContain(flag.id);
      expect(flag.name).toBe(flag.id);
      expect(flag.imageUrl).toMatch(/^https:\/\/flagsapi\.com\/[A-Z]{2}\/shiny\/64\.png$/);
    });
  });

  it('lanza error si se piden más flags que las disponibles', async () => {
    await expect(fetchFlags(COUNTRY_CODES.length + 1))
      .rejects
      .toThrow(/Cannot fetch more than/);
  });

  it('devuelve array vacío si se pide 0 o negativo', async () => {
    await expect(fetchFlags(0)).resolves.toEqual([]);
    await expect(fetchFlags(-3)).resolves.toEqual([]);
  });
});
