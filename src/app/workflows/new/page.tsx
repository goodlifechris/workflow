'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ReactFlow, 
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  addEdge,
  Connection,
  ReactFlowInstance
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { StartNode, ConditionNode, DelayNode , WebhookNode, LoggerNode,EndNode} from '@/components/workflow/nodes'
import { useStore } from '@/lib/store'
import type { WorkflowNode, WorkflowEdge, NodeData } from '@/types/workflow'

const nodeTypes = {
  start: StartNode,
  condition: ConditionNode,
  delay: DelayNode,
  webhook: WebhookNode,
  logger: LoggerNode,
  end: EndNode
}

const initialNodes: WorkflowNode[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 100 },
    data: { description: 'Workflow starts here' }
  }
]

const initialEdges: WorkflowEdge[] = []

const nodeTemplates = [
  { type: 'start', label: 'Start', bgColor: 'bg-green-500', disabled: true },
  { type: 'condition', label: 'Condition', bgColor: 'bg-purple-500' },
  { type: 'delay', label: 'Delay', bgColor: 'bg-yellow-500' },
  { type: 'webhook', label: 'Webhook', bgColor: 'bg-blue-500' },
  { type: 'logger', label: 'Logger', bgColor: 'bg-gray-500' },
  { type: 'end', label: 'End', bgColor: 'bg-red-500' }
]

export default function NewWorkflowPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const updateNodeData = useStore((state) => state.updateNodeData)

  // Connect store to ReactFlow instance
  useEffect(() => {
    useStore.setState({
      updateNodeData: (nodeId: string, data: Partial<NodeData>) => {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...data
                }
              }
            }
            return node
          })
        )
      }
    })
  }, [setNodes])

  const onConnect = useCallback(
    (connection: Connection) => {
      // Only allow connections from Start to Condition nodes
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      
      if (sourceNode?.type === 'start' || targetNode?.type === 'condition' || targetNode?.type === 'delay' || targetNode?.type === 'webhook' ||  targetNode?.type === 'logger' || targetNode?.type === 'end') {
        setEdges((eds) => addEdge({
          ...connection,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#64748b' }, // slate-500
        }, eds));
      }
    },
    [nodes, setEdges]
  );

  const onInit = (rfi: ReactFlowInstance) => {
    setReactFlowInstance(rfi)
  }
  const addNode = (type: string) => {
    if (type === 'start' && nodes.some(n => n.type === 'start')) {
      return // Prevent adding multiple start nodes
    }
  
    // Default position
    let position = { x: 250, y: 100 };
    
    // Calculate center position if reactFlowInstance is available
    if (reactFlowInstance) {
      const viewport = reactFlowInstance.getViewport();
      const centerX = window.innerWidth / 2 / viewport.zoom - viewport.x;
      const centerY = window.innerHeight / 2 / viewport.zoom - viewport.y;
      position = { x: centerX, y: centerY };
    } else {
      // If no instance, place below existing nodes
      const lastNode = nodes[nodes.length - 1];
      if (lastNode) {
        position = { x: lastNode.position.x, y: lastNode.position.y + 100 };
      }
    }
  
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(), // Use UUID instead of timestamp
      type: type as any,
      position,
      data: getDefaultNodeData(type)
    };
  
  
    setNodes((nds) => nds.concat(newNode));
  };

  const getDefaultNodeData = (type: string): NodeData => {
    switch (type) {
      case 'start': return { description: 'Start node' }
      case 'condition': return { condition: 'true', trueLabel: 'Yes', falseLabel: 'No' }
      case 'delay': return { duration: '30', unit: 'seconds' }
      case 'webhook': return { url: '', method: 'POST', headers: {}, body: '' }
      case 'logger': return { message: 'Log message', level: 'info' }
      case 'end': return { outcome: 'Completed' }
      default: return {}
    }
  }

  if (status === 'loading') return <div className="p-4">Loading...</div>
  if (status === 'unauthenticated') {
    router.push('/signin')
    return null
  }

  const handleSubmit = async () => {
    if (!session?.user?.id || !name.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          userId: session.user.id,
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type.toUpperCase(),
            positionX: node.position.x,  // Extract x from position
            positionY: node.position.y, 
            data: node.data
          })),
          edges: edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            label: edge.label,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to create workflow')

        await response.json()
        router.push(`/dashboard`)
    } catch (error) {
      console.error('Error creating workflow:', error)
      alert('Failed to create workflow. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Workflow Header Form */}
      <div className="p-4 border-b">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Workflow"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workflow does..."
              rows={2}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Workflow Editor */}
      <div className="flex flex-1">
        {/* Left Panel - Node Palette */}
        <div className="w-64 p-4 border-r bg-gray-50">
          <h3 className="font-medium mb-4">Nodes</h3>
          <div className="space-y-2">
            {nodeTemplates.map((template) => (
              <button
                key={template.type}
                className={`p-3 border rounded w-full text-left transition-colors ${
                  template.disabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white hover:bg-gray-50 cursor-pointer'
                }`}
                onClick={() => !template.disabled && addNode(template.type)}
                disabled={template.disabled}
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${template.bgColor} mr-2`}></div>
                  <span>{template.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Flow Area */}
        <div className="flex-1">
        <ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  nodeTypes={nodeTypes}
  onInit={onInit}
  fitView
  connectionRadius={20} // Makes connecting easier
  snapToGrid={true} // Optional: for cleaner alignment
  snapGrid={[15, 15]} // Optional: grid size
>
            <Background />
            <Controls />
            <Panel position="top-right">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Workflow'}
              </Button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}