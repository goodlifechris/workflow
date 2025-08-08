'use client'

import { useParams } from 'next/navigation'
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { StartNode, ConditionNode, DelayNode, WebhookNode, LoggerNode, EndNode } from '@/components/workflow/nodes'
import { useEffect, useState } from 'react'
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow'

const nodeTypes = {
  start: StartNode,
  condition: ConditionNode,
  delay: DelayNode,
  webhook: WebhookNode,
  logger: LoggerNode,
  end: EndNode
}

export default function WorkflowViewPage() {
  const params = useParams()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)
  const [workflowName, setWorkflowName] = useState('')

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await fetch(`/api/workflows/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch workflow')
        
        const data = await response.json()
        
        console.log(data)
        setWorkflowName(data.name)
        
        // Transform nodes from API format to ReactFlow format
        const transformedNodes = data.nodes.map((node: any) => ({
          id: node.id,
          type: node.type.toLowerCase(),
          position: { x: node.positionX, y: node.positionY },
          data: node.data
        }))
        
        setNodes(transformedNodes)
        setEdges(data.edges)
      } catch (error) {
        console.error('Error loading workflow:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflow()
  }, [params.id,setEdges,setNodes])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading workflow...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">{workflowName}</h1>
      </div>
      
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}