'use client'

import { KpiCard } from './kpi-card'
import { KPI_DATA } from '../data/constants'

export function KpiStrip() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_DATA.map((kpi) => (
        <KpiCard key={kpi.label} data={kpi} />
      ))}
    </div>
  )
}
