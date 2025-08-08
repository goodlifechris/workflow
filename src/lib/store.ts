// lib/store.ts
import { create } from 'zustand'
import type {
  StartNodeData,
  ConditionNodeData,
  DelayNodeData,
  WebhookNodeData,
  LoggerNodeData,
  EndNodeData,
//   LoggerNodeData,
//   EndNodeData
} from '@/types/workflow'

// Union type for all possible node data
type NodeData =
  | StartNodeData
  | ConditionNodeData
  | DelayNodeData
  | WebhookNodeData
  | LoggerNodeData
  | EndNodeData

type WorkflowState = {
  // Update any node's data
  updateNodeData: <T extends NodeData>(nodeId: string, data: Partial<T>) => void
  
  // For workflow execution
  executionState: {
    activeNodeId: string | null
    nodeResults: Record<string, any>
  }
  
  // Update execution state
  setActiveNode: (nodeId: string | null) => void
  setNodeResult: (nodeId: string, result: any) => void
  
  // For condition node testing
  toggleCondition: (nodeId: string, value: boolean) => void
}

export const useStore = create<WorkflowState>((set) => ({
  updateNodeData: (nodeId, data) => {
    // Implementation will be connected in the parent component
  },
  
  executionState: {
    activeNodeId: null,
    nodeResults: {}
  },
  
  setActiveNode: (nodeId) => 
    set((state) => ({
      executionState: {
        ...state.executionState,
        activeNodeId: nodeId
      }
    })),
    
  setNodeResult: (nodeId, result) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        nodeResults: {
          ...state.executionState.nodeResults,
          [nodeId]: result
        }
      }
    })),
    
  toggleCondition: (nodeId, value) => {
    // This will be implemented in the parent component
  }
}))