// utils/nodeFactory.ts
import { XYPosition } from '@xyflow/react';
import { NodeType, WorkflowNode, StartNodeData } from '@/types/workflow';

export function createNode(
  type: NodeType,
  position: XYPosition,
  data?: Partial<StartNodeData>
): WorkflowNode {
  const baseNode = {
    id: `${Date.now()}`,
    type,
    position,
  };

  switch (type) {
    case 'start':
      return {
        ...baseNode,
        data: {
          label: 'Start Node',
          ...data,
        },
      };
    default:
      return {
        ...baseNode,
        data: {},
      };
  }
}