'use client';

// Router-specific configuration panel -- extracted from config-tab.tsx for anti-monolith compliance

interface RouteConfig {
  id: string;
  label: string;
  keywords?: string[];
  targetAgentId?: string;
}

export function RouterConfig({ data, set }: {
  data: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
}) {
  const routes = (data.routes as RouteConfig[]) || [];
  const strategy = (data.routingStrategy as string) || 'keyword';
  const classificationPrompt = (data.classificationPrompt as string) || '';
  const fallbackRouteId = (data.fallbackRouteId as string) || '';

  const updateRoutes = (next: RouteConfig[]) => set('routes', next);

  const addRoute = () => {
    const idx = routes.length;
    const id = `out-${idx}`;
    updateRoutes([...routes, { id, label: `Route ${idx}`, keywords: [] }]);
  };

  const removeRoute = (idx: number) => {
    updateRoutes(routes.filter((_, i) => i !== idx));
  };

  const updateRoute = (idx: number, patch: Partial<RouteConfig>) => {
    updateRoutes(routes.map((r, i) => i === idx ? { ...r, ...patch } : r));
  };

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Routing</h4>

      <div className="space-y-1">
        <label className="text-[11px] font-medium text-foreground">Strategy</label>
        <select value={strategy}
          onChange={(e) => set('routingStrategy', e.target.value)}
          className="w-full rounded border border-input bg-input text-foreground px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="keyword">Keyword Match</option>
          <option value="llm">LLM Classification</option>
        </select>
      </div>

      {strategy === 'llm' && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">Classification Prompt</label>
          <textarea value={classificationPrompt}
            onChange={(e) => set('classificationPrompt', e.target.value)}
            placeholder="Classify the input into one of: {categories}. Respond with ONLY the category name."
            rows={3}
            className="w-full rounded border border-input bg-input text-foreground px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-foreground">Routes</span>
          <button onClick={addRoute}
            className="text-[10px] text-primary hover:text-primary/80 font-medium">+ Add</button>
        </div>
        {routes.map((r, i) => (
          <div key={r.id} className="space-y-1 rounded border border-border p-2">
            <div className="flex items-center gap-1.5">
              <input type="text" value={r.label}
                onChange={(e) => updateRoute(i, { label: e.target.value })}
                placeholder="Route label"
                className="flex-1 rounded border border-input bg-input text-foreground px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              <button onClick={() => removeRoute(i)}
                className="text-[10px] text-red-600 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 px-1">x</button>
            </div>
            {strategy === 'keyword' && (
              <input type="text"
                value={(r.keywords || []).join(', ')}
                onChange={(e) => updateRoute(i, { keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="Keywords (comma-separated)"
                className="w-full rounded border border-input bg-input text-foreground px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
            )}
          </div>
        ))}
      </div>

      {routes.length > 0 && (
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-foreground">Fallback Route</label>
          <select value={fallbackRouteId}
            onChange={(e) => set('fallbackRouteId', e.target.value)}
            className="w-full rounded border border-input bg-input text-foreground px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">First route</option>
            {routes.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
