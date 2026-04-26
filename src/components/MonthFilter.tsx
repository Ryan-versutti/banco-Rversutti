"use client";

import { formatMonthKey } from "@/utils/date";

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthFilter({ year, month, onChange }: Props) {
  const value = formatMonthKey(year, month);
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="muted">Mês:</span>
      <input
        type="month"
        value={value}
        onChange={(e) => {
          const [y, m] = e.target.value.split("-").map(Number);
          onChange(y, m - 1);
        }}
        className="input"
      />
    </label>
  );
}
