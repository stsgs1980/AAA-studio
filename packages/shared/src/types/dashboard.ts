// ============================================================================
// Dashboard & navigation types
// ============================================================================

/** Dashboard KPI */
export interface KpiMetric {
  label: string;
  value: number;
  change?: number;
  unit?: string;
  icon?: string;
}

/** Navigation item for sidebar */
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}
