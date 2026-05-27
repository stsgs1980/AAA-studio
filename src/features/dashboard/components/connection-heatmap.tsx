'use client'

import { HEATMAP_DATA, GROUP_LABELS } from '../data/constants'

function getCellColor(value: number): string {
  if (value === 0) return 'transparent'
  if (value <= 2) return 'rgb(6 182 212 / 0.15)'
  if (value <= 5) return 'rgb(6 182 212 / 0.4)'
  return 'rgb(6 182 212 / 0.75)'
}

function getCellStroke(value: number): string {
  if (value === 0) return 'rgb(100 116 139 / 0.2)'
  return 'rgb(6 182 212 / 0.1)'
}

const CELL_SIZE = 36
const LABEL_OFFSET = 32

export function ConnectionHeatmap() {
  const gridW = LABEL_OFFSET + CELL_SIZE * 8
  const gridH = LABEL_OFFSET + CELL_SIZE * 8

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Agent Connection Matrix
      </h3>
      <div className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${gridW + 60} ${gridH + 30}`} className="w-full max-w-lg h-auto">
          <defs>
            <style>{`
              .heat-label { font-size: 9px; fill: rgb(148 163 184); text-anchor: end; dominant-baseline: middle; }
              .heat-label-bot { font-size: 9px; fill: rgb(148 163 184); text-anchor: middle; dominant-baseline: hanging; }
              .heat-val { font-size: 8px; fill: rgb(203 213 225); text-anchor: middle; dominant-baseline: central; }
            `}</style>
          </defs>
          {GROUP_LABELS.map((label, row) =>
            GROUP_LABELS.map((_, col) => {
              const val = HEATMAP_DATA[row][col]
              const cx = LABEL_OFFSET + col * CELL_SIZE + CELL_SIZE / 2
              const cy = LABEL_OFFSET + row * CELL_SIZE + CELL_SIZE / 2
              const isDiag = row === col

              return (
                <g key={`${row}-${col}`}>
                  {row === 0 && (
                    <text x={cx} y={LABEL_OFFSET - 8} className="heat-label-bot">
                      {GROUP_LABELS[col]}
                    </text>
                  )}
                  {col === 0 && (
                    <text x={LABEL_OFFSET - 6} y={cy} className="heat-label">
                      {label}
                    </text>
                  )}
                  {val === 0 ? null : isDiag ? (
                    <rect
                      x={cx - 10}
                      y={cy - 10}
                      width={20}
                      height={20}
                      rx={2}
                      transform={`rotate(45 ${cx} ${cy})`}
                      fill={getCellColor(val)}
                      stroke={getCellStroke(val)}
                    />
                  ) : (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={Math.max(6, (val / 8) * 14)}
                      fill={getCellColor(val)}
                      stroke={getCellStroke(val)}
                    />
                  )}
                  {val > 0 && (
                    <text x={cx} y={cy} className="heat-val">
                      {val}
                    </text>
                  )}
                </g>
              )
            })
          )}
          <g transform={`translate(${gridW + 12}, ${LABEL_OFFSET})`}>
            {['Low', 'Med', 'High'].map((lbl, i) => (
              <g key={lbl}>
                <rect
                  x={0}
                  y={i * 20}
                  width={12}
                  height={12}
                  rx={2}
                  fill={getCellColor((i + 1) * 3)}
                />
                <text x={18} y={i * 20 + 6} className="heat-label" textAnchor="start">
                  {lbl}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
