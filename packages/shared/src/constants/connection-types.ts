// ============================================================================
// Connection type configuration — visual styles & semantic rules
// ============================================================================

import type { ConnectionType, DataType, NodeCategory } from "../types";

/** Visual config for a connection type */
export interface ConnectionTypeConfig {
  type: ConnectionType;
  label: string;
  description: string;
  color: string;           // Tailwind-compatible HSL
  strokeDasharray: string; // SVG dash pattern
  animated: boolean;       // Particle animation
  /** Source categories that typically originate this connection */
  fromCategories: NodeCategory[];
  /** Target categories that typically receive this connection */
  toCategories: NodeCategory[];
}

/** All 7 connection types with visual & semantic config */
export const CONNECTION_TYPE_CONFIG: Record<ConnectionType, ConnectionTypeConfig> = {
  command: {
    type: "command",
    label: "Command",
    description: "Directive one-way. Source sends task, target must execute.",
    color: "hsl(0, 70%, 50%)",        // red
    strokeDasharray: "none",           // solid
    animated: false,
    fromCategories: ["management"],
    toCategories: ["ai", "management", "data", "integration"],
  },
  sync: {
    type: "sync",
    label: "Sync",
    description: "Bidirectional handshake. Both exchange data & acknowledge.",
    color: "hsl(221, 70%, 50%)",      // blue
    strokeDasharray: "8 4",            // dashed
    animated: false,
    fromCategories: ["management", "ai"],
    toCategories: ["management", "ai"],
  },
  twin: {
    type: "twin",
    label: "Twin",
    description: "Parallel mirror agents. Same input, compare outputs.",
    color: "hsl(280, 70%, 50%)",      // purple
    strokeDasharray: "4 4",            // dotted
    animated: true,
    fromCategories: ["ai"],
    toCategories: ["ai"],
  },
  delegate: {
    type: "delegate",
    label: "Delegate",
    description: "Subtask with result return. Source delegates, target returns.",
    color: "hsl(142, 70%, 40%)",      // green
    strokeDasharray: "12 4",           // long dash
    animated: true,
    fromCategories: ["management"],
    toCategories: ["ai", "management"],
  },
  feedback: {
    type: "feedback",
    label: "Feedback",
    description: "Loop-back correction. Target evaluates, feeds back to source.",
    color: "hsl(38, 70%, 50%)",       // amber
    strokeDasharray: "2 6",            // sparse dots
    animated: true,
    fromCategories: ["ai", "management"],
    toCategories: ["ai", "management"],
  },
  supervise: {
    type: "supervise",
    label: "Supervise",
    description: "Monitoring & oversight. Supervisor watches subordinate.",
    color: "hsl(330, 70%, 50%)",      // pink
    strokeDasharray: "8 2 2 2",       // dash-dot
    animated: false,
    fromCategories: ["management"],
    toCategories: ["ai", "management"],
  },
  broadcast: {
    type: "broadcast",
    label: "Broadcast",
    description: "One-to-many. Source broadcasts to multiple targets.",
    color: "hsl(25, 70%, 50%)",       // orange
    strokeDasharray: "none",           // solid
    animated: true,
    fromCategories: ["management", "ai"],
    toCategories: ["ai", "management", "data", "integration"],
  },
};

/** Data type compatibility matrix: output → compatible inputs */
const TYPE_COMPAT: Record<DataType, DataType[]> = {
  text:      ["text", "json", "any"],
  json:      ["json", "any"],
  embedding: ["embedding", "any"],
  query:     ["query", "text", "any"],
  results:   ["results", "json", "any"],
  any:       ["text", "json", "embedding", "query", "results", "any"],
};

/** Check if source output type is compatible with target input type */
export function isDataTypeCompatible(
  sourceType: DataType,
  targetType: DataType,
): boolean {
  return TYPE_COMPAT[sourceType]?.includes(targetType) ?? false;
}
