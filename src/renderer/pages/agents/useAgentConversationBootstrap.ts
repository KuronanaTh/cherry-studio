import { useMemo } from 'react'

import { useAgent } from '@renderer/hooks/agent/useAgent'
import type { AgentSessionSource } from '@renderer/hooks/agent/useSession'
import { useModelById } from '@renderer/hooks/useModel'
import type { AgentSessionEntity } from '@shared/data/api/schemas/agentSessions'
import type { AgentEntity } from '@shared/data/types/agent'
import type { Model, UniqueModelId } from '@shared/data/types/model'

export interface AgentConversationResources {
  agent?: AgentEntity
  agentLoading: boolean
  model?: Model
  modelLoading: boolean
}

export interface AgentConversationBootstrap {
  session: AgentSessionEntity | null
  sessionLoading: boolean
  sessionSource: AgentSessionSource
  resources: AgentConversationResources
}

interface UseAgentConversationBootstrapOptions {
  session: AgentSessionEntity | null
  sessionLoading: boolean
  sessionSource: AgentSessionSource
  agentHint?: Pick<AgentEntity, 'id' | 'model'>
}

/**
 * Page-owned read model for the active agent conversation.
 *
 * The list agent is only a key hint: it lets the model request start while the canonical by-id
 * agent query is still resolving. Once that query returns, its model id wins. A session-level
 * model override (`session.model`) takes precedence over the agent's base model.
 */
export function useAgentConversationBootstrap({
  session,
  sessionLoading,
  sessionSource,
  agentHint
}: UseAgentConversationBootstrapOptions): AgentConversationBootstrap {
  const agentId = session?.agentId ?? null
  const { agent, isLoading: agentLoading } = useAgent(agentId)
  const hintedModelId = agentHint?.id === agentId ? agentHint.model : undefined
  // Session-level model override wins; null inherits the agent's model.
  const modelId = agent ? ((session?.model ?? agent.model) as UniqueModelId | null) : hintedModelId
  const { model, isLoading: modelLoading } = useModelById(modelId)

  const resources = useMemo<AgentConversationResources>(
    () => ({ agent, agentLoading, model, modelLoading }),
    [agent, agentLoading, model, modelLoading]
  )

  return useMemo(
    () => ({ session, sessionLoading, sessionSource, resources }),
    [resources, session, sessionLoading, sessionSource]
  )
}
