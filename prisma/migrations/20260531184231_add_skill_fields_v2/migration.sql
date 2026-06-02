-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleGroup" TEXT NOT NULL DEFAULT 'specialist',
    "status" TEXT NOT NULL DEFAULT 'active',
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 4096,
    "systemPrompt" TEXT NOT NULL DEFAULT '',
    "formula" TEXT NOT NULL DEFAULT '',
    "tools" TEXT NOT NULL DEFAULT '[]',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "standards" TEXT NOT NULL DEFAULT '[]',
    "parentId" TEXT,
    "twinId" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "avatar" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Agent_twinId_fkey" FOREIGN KEY ("twinId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" TEXT NOT NULL DEFAULT '{}',
    "output" TEXT,
    "error" TEXT,
    "duration" INTEGER,
    "tokensUsed" INTEGER,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "AgentExecution_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "agentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "nodes" TEXT NOT NULL DEFAULT '[]',
    "edges" TEXT NOT NULL DEFAULT '[]',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FlowVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flowId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "nodes" TEXT NOT NULL DEFAULT '[]',
    "edges" TEXT NOT NULL DEFAULT '[]',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FlowVersion_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PipelineExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" TEXT,
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "PipelineExecution_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "Flow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "triggerType" TEXT NOT NULL DEFAULT 'manual',
    "triggerConfig" TEXT NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PipelineStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "agentId" TEXT,
    "roleGroup" TEXT,
    "action" TEXT NOT NULL DEFAULT 'process',
    "inputSchema" TEXT NOT NULL DEFAULT '{}',
    "outputSchema" TEXT NOT NULL DEFAULT '{}',
    "condition" TEXT NOT NULL DEFAULT '{}',
    "fallbackStepId" TEXT,
    "timeout" INTEGER NOT NULL DEFAULT 300,
    "retryPolicy" TEXT NOT NULL DEFAULT '{}',
    "config" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PipelineStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "taskContext" TEXT NOT NULL DEFAULT '{}',
    "input" TEXT NOT NULL DEFAULT '{}',
    "output" TEXT NOT NULL DEFAULT '{}',
    "error" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StepExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "agentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "inputData" TEXT NOT NULL DEFAULT '{}',
    "outputData" TEXT NOT NULL DEFAULT '{}',
    "error" TEXT,
    "thinking" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "StepExecution_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "WorkflowExecution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StepExecution_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "PipelineStep" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgentMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stepExecutionId" TEXT NOT NULL,
    "fromAgentId" TEXT NOT NULL,
    "toAgentId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'request',
    "content" TEXT NOT NULL DEFAULT '{}',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "sources" TEXT NOT NULL DEFAULT '[]',
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentMessage_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "StepExecution" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InteractionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromAgentId" TEXT NOT NULL,
    "toAgentId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'request',
    "status" TEXT NOT NULL DEFAULT 'success',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL DEFAULT '{}',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PromptHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "intent" TEXT NOT NULL DEFAULT '',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "formula" TEXT NOT NULL DEFAULT '',
    "avgScore" INTEGER NOT NULL DEFAULT 0,
    "verdict" TEXT NOT NULL DEFAULT '',
    "stepCount" INTEGER NOT NULL DEFAULT 0,
    "executionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "content" TEXT NOT NULL,
    "variables" TEXT NOT NULL DEFAULT '[]',
    "framework" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "systemPrompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "changelog" TEXT NOT NULL DEFAULT '',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromptVersion_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptRegistryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT NOT NULL DEFAULT '',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Contradiction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "relatedAgentId" TEXT,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "evidence" TEXT NOT NULL DEFAULT '{}',
    "autoDetected" BOOLEAN NOT NULL DEFAULT true,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AgentImport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "fileName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "detectedNodes" INTEGER NOT NULL DEFAULT 0,
    "detectedEdges" INTEGER NOT NULL DEFAULT 0,
    "parseResult" TEXT NOT NULL DEFAULT '{}',
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KeyValueStore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" TEXT NOT NULL DEFAULT 'string',
    "expiresAt" DATETIME,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "agentId" TEXT,
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "tags" TEXT NOT NULL DEFAULT '',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "agentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalCases" INTEGER NOT NULL DEFAULT 0,
    "passedCases" INTEGER NOT NULL DEFAULT 0,
    "failedCases" INTEGER NOT NULL DEFAULT 0,
    "errorCases" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "actualOutput" TEXT NOT NULL DEFAULT '{}',
    "judgeScore" INTEGER NOT NULL DEFAULT 0,
    "judgeLabel" TEXT NOT NULL DEFAULT '',
    "judgeReasoning" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "TestRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestResult_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CitationCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "verdict" TEXT NOT NULL DEFAULT 'pending',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "reasoning" TEXT NOT NULL DEFAULT '',
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT,
    "workflowId" TEXT,
    "stepId" TEXT,
    "action" TEXT NOT NULL,
    "actionType" TEXT NOT NULL DEFAULT 'general',
    "payload" TEXT NOT NULL DEFAULT '{}',
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "response" TEXT,
    "respondedBy" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ComparisonSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "agentAId" TEXT NOT NULL,
    "agentBId" TEXT,
    "versionA" INTEGER,
    "versionB" INTEGER,
    "diff" TEXT NOT NULL DEFAULT '{}',
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "summary" TEXT NOT NULL DEFAULT '',
    "findings" TEXT NOT NULL DEFAULT '[]',
    "regressionItems" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AnalysisSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '',
    "agentIds" TEXT NOT NULL,
    "findings" TEXT NOT NULL DEFAULT '[]',
    "conflicts" TEXT NOT NULL DEFAULT '[]',
    "suggestions" TEXT NOT NULL DEFAULT '[]',
    "metrics" TEXT NOT NULL DEFAULT '{}',
    "summary" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CostRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT,
    "executionType" TEXT NOT NULL DEFAULT 'workflow',
    "executionId" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "costUsd" REAL NOT NULL DEFAULT 0,
    "model" TEXT NOT NULL DEFAULT '',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LatencyAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT,
    "metric" TEXT NOT NULL,
    "currentValue" REAL NOT NULL,
    "threshold" REAL NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "message" TEXT NOT NULL DEFAULT '',
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SelfCorrectionSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT,
    "input" TEXT NOT NULL,
    "initialOutput" TEXT NOT NULL,
    "judgeScore" REAL NOT NULL,
    "judgeVerdict" TEXT NOT NULL DEFAULT 'pending',
    "judgeReasoning" TEXT,
    "revisedOutput" TEXT,
    "revisionScore" REAL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "maxRetries" INTEGER NOT NULL DEFAULT 2,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SelfCorrectionSession_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeedbackRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "traceId" TEXT NOT NULL,
    "traceType" TEXT NOT NULL DEFAULT 'step_execution',
    "agentId" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "sentiment" TEXT NOT NULL DEFAULT 'neutral',
    "comment" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KnowledgeCollection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileType" TEXT NOT NULL DEFAULT 'txt',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeDocument_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "KnowledgeCollection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "skillId" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT NOT NULL DEFAULT '',
    "longDescription" TEXT NOT NULL DEFAULT '',
    "inputSchema" TEXT NOT NULL DEFAULT '{}',
    "outputSchema" TEXT NOT NULL DEFAULT '{}',
    "code" TEXT NOT NULL DEFAULT '',
    "tests" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "triggers" TEXT NOT NULL DEFAULT '[]',
    "standardIds" TEXT NOT NULL DEFAULT '[]',
    "compatibility" TEXT NOT NULL DEFAULT 'both',
    "dependencies" TEXT NOT NULL DEFAULT '[]',
    "annotations" TEXT NOT NULL DEFAULT '{}',
    "author" TEXT NOT NULL DEFAULT '',
    "license" TEXT NOT NULL DEFAULT 'MIT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SkillFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skillId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'typescript',
    "role" TEXT NOT NULL DEFAULT 'code',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SkillFile_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Standard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT NOT NULL DEFAULT '',
    "rules" TEXT NOT NULL DEFAULT '[]',
    "severity" TEXT NOT NULL DEFAULT 'info',
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'system',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_twinId_key" ON "Agent"("twinId");

-- CreateIndex
CREATE INDEX "Agent_roleGroup_idx" ON "Agent"("roleGroup");

-- CreateIndex
CREATE INDEX "Agent_status_idx" ON "Agent"("status");

-- CreateIndex
CREATE INDEX "Agent_parentId_idx" ON "Agent"("parentId");

-- CreateIndex
CREATE INDEX "AgentExecution_agentId_idx" ON "AgentExecution"("agentId");

-- CreateIndex
CREATE INDEX "AgentExecution_status_idx" ON "AgentExecution"("status");

-- CreateIndex
CREATE INDEX "Flow_status_idx" ON "Flow"("status");

-- CreateIndex
CREATE INDEX "FlowVersion_flowId_idx" ON "FlowVersion"("flowId");

-- CreateIndex
CREATE UNIQUE INDEX "FlowVersion_flowId_version_key" ON "FlowVersion"("flowId", "version");

-- CreateIndex
CREATE INDEX "PipelineExecution_flowId_idx" ON "PipelineExecution"("flowId");

-- CreateIndex
CREATE INDEX "PipelineExecution_status_idx" ON "PipelineExecution"("status");

-- CreateIndex
CREATE INDEX "PromptTemplate_category_idx" ON "PromptTemplate"("category");

-- CreateIndex
CREATE INDEX "PromptVersion_agentId_isActive_idx" ON "PromptVersion"("agentId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromptVersion_agentId_version_key" ON "PromptVersion"("agentId", "version");

-- CreateIndex
CREATE INDEX "PromptRegistryEntry_category_idx" ON "PromptRegistryEntry"("category");

-- CreateIndex
CREATE INDEX "PromptRegistryEntry_isActive_idx" ON "PromptRegistryEntry"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PromptRegistryEntry_name_version_key" ON "PromptRegistryEntry"("name", "version");

-- CreateIndex
CREATE INDEX "Contradiction_agentId_idx" ON "Contradiction"("agentId");

-- CreateIndex
CREATE INDEX "Contradiction_category_idx" ON "Contradiction"("category");

-- CreateIndex
CREATE INDEX "Contradiction_severity_idx" ON "Contradiction"("severity");

-- CreateIndex
CREATE INDEX "Contradiction_autoDetected_idx" ON "Contradiction"("autoDetected");

-- CreateIndex
CREATE INDEX "AgentImport_status_idx" ON "AgentImport"("status");

-- CreateIndex
CREATE INDEX "AgentImport_sourceType_idx" ON "AgentImport"("sourceType");

-- CreateIndex
CREATE INDEX "KeyValueStore_scope_idx" ON "KeyValueStore"("scope");

-- CreateIndex
CREATE INDEX "KeyValueStore_key_idx" ON "KeyValueStore"("key");

-- CreateIndex
CREATE UNIQUE INDEX "KeyValueStore_scope_key_key" ON "KeyValueStore"("scope", "key");

-- CreateIndex
CREATE INDEX "TestCase_agentId_idx" ON "TestCase"("agentId");

-- CreateIndex
CREATE INDEX "TestRun_agentId_idx" ON "TestRun"("agentId");

-- CreateIndex
CREATE INDEX "TestRun_status_idx" ON "TestRun"("status");

-- CreateIndex
CREATE INDEX "TestRun_createdAt_idx" ON "TestRun"("createdAt");

-- CreateIndex
CREATE INDEX "TestResult_runId_idx" ON "TestResult"("runId");

-- CreateIndex
CREATE INDEX "TestResult_caseId_idx" ON "TestResult"("caseId");

-- CreateIndex
CREATE INDEX "TestResult_status_idx" ON "TestResult"("status");

-- CreateIndex
CREATE INDEX "CitationCheck_messageId_idx" ON "CitationCheck"("messageId");

-- CreateIndex
CREATE INDEX "CitationCheck_verdict_idx" ON "CitationCheck"("verdict");

-- CreateIndex
CREATE INDEX "ApprovalRequest_agentId_idx" ON "ApprovalRequest"("agentId");

-- CreateIndex
CREATE INDEX "ApprovalRequest_status_idx" ON "ApprovalRequest"("status");

-- CreateIndex
CREATE INDEX "ApprovalRequest_riskLevel_idx" ON "ApprovalRequest"("riskLevel");

-- CreateIndex
CREATE INDEX "ApprovalRequest_createdAt_idx" ON "ApprovalRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ComparisonSnapshot_type_idx" ON "ComparisonSnapshot"("type");

-- CreateIndex
CREATE INDEX "ComparisonSnapshot_agentAId_idx" ON "ComparisonSnapshot"("agentAId");

-- CreateIndex
CREATE INDEX "ComparisonSnapshot_createdAt_idx" ON "ComparisonSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "AnalysisSession_createdAt_idx" ON "AnalysisSession"("createdAt");

-- CreateIndex
CREATE INDEX "CostRecord_agentId_idx" ON "CostRecord"("agentId");

-- CreateIndex
CREATE INDEX "CostRecord_executionType_idx" ON "CostRecord"("executionType");

-- CreateIndex
CREATE INDEX "CostRecord_timestamp_idx" ON "CostRecord"("timestamp");

-- CreateIndex
CREATE INDEX "LatencyAlert_agentId_idx" ON "LatencyAlert"("agentId");

-- CreateIndex
CREATE INDEX "LatencyAlert_severity_idx" ON "LatencyAlert"("severity");

-- CreateIndex
CREATE INDEX "LatencyAlert_acknowledged_idx" ON "LatencyAlert"("acknowledged");

-- CreateIndex
CREATE INDEX "LatencyAlert_createdAt_idx" ON "LatencyAlert"("createdAt");

-- CreateIndex
CREATE INDEX "SelfCorrectionSession_agentId_idx" ON "SelfCorrectionSession"("agentId");

-- CreateIndex
CREATE INDEX "SelfCorrectionSession_status_idx" ON "SelfCorrectionSession"("status");

-- CreateIndex
CREATE INDEX "SelfCorrectionSession_createdAt_idx" ON "SelfCorrectionSession"("createdAt");

-- CreateIndex
CREATE INDEX "FeedbackRecord_traceId_idx" ON "FeedbackRecord"("traceId");

-- CreateIndex
CREATE INDEX "FeedbackRecord_agentId_idx" ON "FeedbackRecord"("agentId");

-- CreateIndex
CREATE INDEX "FeedbackRecord_createdAt_idx" ON "FeedbackRecord"("createdAt");

-- CreateIndex
CREATE INDEX "KnowledgeCollection_name_idx" ON "KnowledgeCollection"("name");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_collectionId_idx" ON "KnowledgeDocument"("collectionId");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_fileType_idx" ON "KnowledgeDocument"("fileType");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE INDEX "Skill_slug_idx" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "SkillFile_skillId_idx" ON "SkillFile"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillFile_skillId_path_key" ON "SkillFile"("skillId", "path");

-- CreateIndex
CREATE INDEX "Standard_category_idx" ON "Standard"("category");

-- CreateIndex
CREATE INDEX "Standard_severity_idx" ON "Standard"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
