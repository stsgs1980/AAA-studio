'use client'

import { FORMULA_DATA } from '../data/constants'

export function FormulaGrid() {
  return (
    <div className="rounded-[10px] p-5 transition-colors duration-200"
      style={{ background: '#0A0A0F', border: '1px solid #27272a' }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: '#a1a1aa' }}>Formula-Agent Mapping</h3>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-semibold text-left py-2 px-3 uppercase tracking-wide"
                style={{ color: '#52525b', borderBottom: '1px solid #27272a' }}>
                Formula
              </th>
              <th className="text-[11px] font-semibold text-left py-2 px-3 uppercase tracking-wide"
                style={{ color: '#52525b', borderBottom: '1px solid #27272a' }}>
                Agents
              </th>
              <th className="text-[11px] font-semibold text-left py-2 px-3 uppercase tracking-wide"
                style={{ color: '#52525b', borderBottom: '1px solid #27272a' }}>
                Category
              </th>
            </tr>
          </thead>
          <tbody>
            {FORMULA_DATA.map((row) => (
              <tr key={row.name} className="transition-colors duration-150 hover:bg-[rgba(6,182,212,0.03)]">
                <td className="py-2.5 px-3 font-semibold"
                  style={{ color: '#fafafa', borderBottom: '1px solid #1a1a22', fontFamily: "'JetBrains Mono', monospace" }}>
                  {row.name}
                </td>
                <td className="py-2.5 px-3 font-medium"
                  style={{ color: '#06B6D4', borderBottom: '1px solid #1a1a22' }}>
                  {row.agents}
                </td>
                <td className="py-2.5 px-3" style={{ borderBottom: '1px solid #1a1a22' }}>
                  <span className="text-[11px] px-2 py-0.5 rounded"
                    style={{ background: '#111118', color: '#a1a1aa', border: '1px solid #27272a' }}>
                    {row.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
