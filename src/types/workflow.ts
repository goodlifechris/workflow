// types/workflow.ts
import { Node, Edge, XYPosition, Position } from '@xyflow/react'

// ======================
// Node Data Types
// ======================
export type StartNodeData = {
  description: string
}

export type ConditionNodeData = {
  condition: string
  isTrue?: boolean // For simulation/testing
  trueLabel?: string
  falseLabel?: string
}

export type DelayNodeData = {
  duration: number // e.g. "30s", "5m", "1h"
  unit?: 'seconds' | 'minutes' | 'hours'
}

export type WebhookNodeData = {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: string
}

export type LoggerNodeData = {
  message: string
  level: 'info' | 'warn' | 'error'
}

export type EndNodeData = {
  outcome?: string
}

// ======================
// Node Type Definitions
// ======================
export type NodeType = 
  | 'start'
  | 'condition'
  | 'delay'
  | 'webhook'
  | 'logger'
  | 'end'

// Union type for all possible node data
export type NodeData = 
  | StartNodeData
  | ConditionNodeData
  | DelayNodeData
  | WebhookNodeData
  | LoggerNodeData
  | EndNodeData

// ======================
// Concrete Node Types
// ======================
export type StartNode = Node<StartNodeData, 'start'>
export type ConditionNode = Node<ConditionNodeData, 'condition'>
export type DelayNode = Node<DelayNodeData, 'delay'>
export type WebhookNode = Node<WebhookNodeData, 'webhook'>
export type LoggerNode = Node<LoggerNodeData, 'logger'>
export type EndNode = Node<EndNodeData, 'end'>

// ======================
// Workflow Types
// ======================
export type WorkflowNode = 
  | StartNode
  | ConditionNode
  | DelayNode
  | WebhookNode
  | LoggerNode
  | EndNode

export type WorkflowEdge = Edge & {
  label?: string
  condition?: boolean
}

// ======================
// Type Guards
// ======================
export function isStartNode(node: WorkflowNode): node is StartNode {
  return node.type === 'start'
}

export function isConditionNode(node: WorkflowNode): node is ConditionNode {
  return node.type === 'condition'
}

export function isDelayNode(node: WorkflowNode): node is DelayNode {
  return node.type === 'delay'
}

export function isWebhookNode(node: WorkflowNode): node is WebhookNode {
  return node.type === 'webhook'
}

export function isLoggerNode(node: WorkflowNode): node is LoggerNode {
  return node.type === 'logger'
}

export function isEndNode(node: WorkflowNode): node is EndNode {
  return node.type === 'end'
}

// ======================
// Helper Types
// ======================
export type ExtractNodeType<T extends NodeType> = 
  T extends 'start' ? StartNode :
  T extends 'condition' ? ConditionNode :
  T extends 'delay' ? DelayNode :
  T extends 'webhook' ? WebhookNode :
  T extends 'logger' ? LoggerNode :
  T extends 'end' ? EndNode :
  never

export type ExtractNodeDataType<T extends NodeType> = 
  T extends 'start' ? StartNodeData :
  T extends 'condition' ? ConditionNodeData :
  T extends 'delay' ? DelayNodeData :
  T extends 'webhook' ? WebhookNodeData :
  T extends 'logger' ? LoggerNodeData :
  T extends 'end' ? EndNodeData :
  never