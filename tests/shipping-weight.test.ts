import { describe, it, expect } from 'vitest';
import { calcShippingByWeight } from '../src/order';

describe('calcShippingByWeight', () => {
  describe('діапазон до 5 кг включно — 50 грн', () => {
    it.each([
      [0.01, 50],
      [1, 50],
      [4.99, 50],
      [5, 50],
    ])('вага %s кг → %s грн', (weight, expected) => {
      expect(calcShippingByWeight(weight)).toBe(expected);
    });
  });

  describe('діапазон понад 5 до 15 кг включно — 90 грн', () => {
    it.each([
      [5.01, 90],
      [10, 90],
      [14.99, 90],
      [15, 90],
    ])('вага %s кг → %s грн', (weight, expected) => {
      expect(calcShippingByWeight(weight)).toBe(expected);
    });
  });

  describe('діапазон понад 15 до 30 кг включно — 150 грн', () => {
    it.each([
      [15.01, 150],
      [25, 150],
      [29.99, 150],
      [30, 150],
    ])('вага %s кг → %s грн', (weight, expected) => {
      expect(calcShippingByWeight(weight)).toBe(expected);
    });
  });

  describe('надбавка за перевищення 30 кг (10 грн за розпочатий кг)', () => {
    it.each([
      { weight: 30.01, expected: 160 }, // розпочато 1 кг понад ліміт
      { weight: 31, expected: 160 }, // рівно 1 кг понад ліміт
      { weight: 31.01, expected: 170 }, // розпочато 2-й кілограм
      { weight: 35, expected: 200 },
      { weight: 100, expected: 850 },
    ])(
      'вага $weight кг → $expected грн',
      ({ weight, expected }) => {
        expect(calcShippingByWeight(weight)).toBe(expected);
      },
    );

    it('вартість зростає зі збільшенням ваги понад ліміт', () => {
      expect(calcShippingByWeight(40)).toBeGreaterThan(
        calcShippingByWeight(32),
      );
    });
  });

  describe('некоректні вхідні дані', () => {
    it.each([0, -1, -0.01, NaN, Infinity, -Infinity])(
      'відхиляє вагу %s кодом INVALID_WEIGHT',
      (weight) => {
        expect(() => calcShippingByWeight(weight)).toThrow('INVALID_WEIGHT');
      },
    );
  });
});
