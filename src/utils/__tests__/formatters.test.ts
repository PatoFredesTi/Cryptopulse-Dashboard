import { describe, expect, it } from 'vitest';
import { calculateRangeChange, formatNumber, formatPercent, getChangeTone, stripHtml } from '../formatters';

describe('formatters', () => {
  it('formats positive percentages with an explicit sign', () => {
    expect(formatPercent(12.345)).toBe('+12.35%');
  });

  it('detects tone from numeric changes', () => {
    expect(getChangeTone(1)).toBe('positive');
    expect(getChangeTone(-1)).toBe('negative');
    expect(getChangeTone(0)).toBe('neutral');
  });

  it('calculates range change from chart tuples', () => {
    expect(calculateRangeChange([[1, 100], [2, 125]])).toBe(25);
  });

  it('strips basic html content from API descriptions', () => {
    expect(stripHtml('<p>Bitcoin&nbsp;&amp;&nbsp;crypto</p>')).toBe('Bitcoin & crypto');
  });

  it('returns N/A for invalid numbers', () => {
    expect(formatNumber(Number.NaN)).toBe('N/A');
  });
});
