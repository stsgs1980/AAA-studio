'use client'

import { FORMULA_DATA } from '../data/constants'

export function FormulaGrid() {
  return (
    <div className="rounded-[10px] bg-card border border-border p-5 transition-colors duration-200">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground">Formula-Agent Mapping</h3>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-semibold text-left py-2 px-3 uppercase tracking-wide text-muted-foreground border-b border-border">
                Formula
              </th>
              <th className="text-[11px] font-semibold text-left py-2 px-3 uppercase tracking-wide text-muted-foreground border-b border-border">
                Agents
              </th>
              <th className="text-[11px] font-semibold text-left py-2 px-3 uppercase tracking-wide text-muted-foreground border-b border-border">
                Category
              </th>
            </tr>
          </thead>
          <tbody>
            {FORMULA_DATA.map((row) => (
              <tr key={row.name} className="transition-colors duration-150 hover:bg-[rgba(6,182,212,0.03)]">
                <td className="py-2.5 px-3 font-semibold text-foreground border-b border-border font-mono">
                  {row.name}
                </td>
                <td className="py-2.5 px-3 font-medium text-cyan-500 border-b border-border">
                  {row.agents}
                </td>
                <td className="py-2.5 px-3 border-b border-border">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
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
