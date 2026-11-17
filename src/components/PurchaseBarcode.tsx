import React, { useMemo } from 'react';

interface PurchaseBarcodeProps {
  /** Demonstration order-reference value encoded visually */
  referenceValue: string;
  caption?: string;
  height?: number;
}

/**
 * Local SVG Code-128 style demonstration order-reference barcode.
 * Purely for exhibition receipt and order-reference demonstration (not a payment barcode).
 */
export const PurchaseBarcode: React.FC<PurchaseBarcodeProps> = ({
  referenceValue,
  caption = 'ORDER REFERENCE BARCODE · DEMO',
  height = 38,
}) => {
  const bars = useMemo(() => {
    // Deterministic bar widths (1 to 4 units) derived from the reference string
    const pattern: Array<{ x: number; width: number }> = [];
    let cursor = 0;

    // Code-128 start guard bars
    const startGuard = [2, 1, 1, 2, 1, 4];
    startGuard.forEach((w, idx) => {
      if (idx % 2 === 0) pattern.push({ x: cursor, width: w });
      cursor += w;
    });

    for (let i = 0; i < referenceValue.length; i++) {
      const code = referenceValue.charCodeAt(i);
      const weights = [
        ((code >> 4) & 3) + 1,
        ((code >> 2) & 1) + 1,
        (code & 3) + 1,
        ((code >> 5) & 1) + 1,
        ((code + i) % 3) + 1,
        1,
      ];
      weights.forEach((w, idx) => {
        if (idx % 2 === 0) {
          pattern.push({ x: cursor, width: w });
        }
        cursor += w;
      });
    }

    // Stop guard bars
    const stopGuard = [2, 3, 3, 1, 1, 2];
    stopGuard.forEach((w, idx) => {
      if (idx % 2 === 0) pattern.push({ x: cursor, width: w });
      cursor += w;
    });

    return { pattern, totalWidth: cursor };
  }, [referenceValue]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      <svg
        viewBox={`0 0 ${bars.totalWidth} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`Order reference barcode ${referenceValue}`}
      >
        {bars.pattern.map((bar, index) => (
          <rect
            key={`${bar.x}-${index}`}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill="#111111"
          />
        ))}
      </svg>
      <div className="mt-1.5 w-full flex items-center justify-between text-[9px] font-mono tracking-[0.14em] text-[#737373] uppercase">
        <span>{referenceValue}</span>
        <span>{caption}</span>
      </div>
    </div>
  );
};
