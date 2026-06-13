import { lazy, type ComponentType } from "react";

const pages: Record<string, ComponentType> = {
  "overview": lazy(() => import("../pages/overview").then((m) => ({ default: m.OverviewPage }))),
  "quick-start": lazy(() => import("../pages/quick-start").then((m) => ({ default: m.QuickStartPage }))),
  "key-concepts": lazy(() => import("../pages/key-concepts").then((m) => ({ default: m.KeyConceptsPage }))),
  "hierarchy-model": lazy(() => import("../pages/hierarchy-model").then((m) => ({ default: m.HierarchyModelPage }))),
  "role-groups": lazy(() => import("../pages/role-groups").then((m) => ({ default: m.RoleGroupsPage }))),
  "scoring-formulas": lazy(() => import("../pages/scoring-formulas").then((m) => ({ default: m.ScoringFormulasPage }))),
  "edge-types": lazy(() => import("../pages/edge-types").then((m) => ({ default: m.EdgeTypesPage }))),
  "prompt-structure": lazy(() => import("../pages/prompt-structure").then((m) => ({ default: m.PromptStructurePage }))),
  "quality-scoring": lazy(() => import("../pages/quality-scoring").then((m) => ({ default: m.QualityScoringPage }))),
  "templates-wiki": lazy(() => import("../pages/templates-wiki").then((m) => ({ default: m.TemplatesWikiPage }))),
  "pipelines-wiki": lazy(() => import("../pages/pipelines-wiki").then((m) => ({ default: m.PipelinesWikiPage }))),
  "orchestration": lazy(() => import("../pages/orchestration").then((m) => ({ default: m.OrchestrationPage }))),
  "export-formats": lazy(() => import("../pages/export-formats").then((m) => ({ default: m.ExportFormatsPage }))),
  "rest-api": lazy(() => import("../pages/rest-api").then((m) => ({ default: m.RestApiPage }))),
  "quality-analyzer": lazy(() => import("../pages/quality-analyzer").then((m) => ({ default: m.QualityAnalyzerPage }))),
  "stsdev-vision": lazy(() => import("../pages/stsdev-vision").then((m) => ({ default: m.StsdevVisionPage }))),
};

export function getWikiPage(id: string): ComponentType | null {
  return pages[id] ?? null;
}
