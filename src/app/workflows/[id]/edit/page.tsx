'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { StartNode, ConditionNode, DelayNode, WebhookNode, LoggerNode, EndNode } from '@/components/workflow/nodes'
import { useStore } from '@/lib/store'
import type { WorkflowNode, WorkflowEdge, NodeData } from '@/types/workflow'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { signOut } from 'next-auth/react'
const nodeTypes = {
  start: StartNode,
  condition: ConditionNode,
  delay: DelayNode,
  webhook: WebhookNode,
  logger: LoggerNode,
  end: EndNode
}

const nodeTemplates = [
  { type: 'start', label: 'Start', bgColor: 'bg-green-500', disabled: true },
  { type: 'condition', label: 'Condition', bgColor: 'bg-purple-500' },
  { type: 'delay', label: 'Delay', bgColor: 'bg-yellow-500' },
  { type: 'webhook', label: 'Webhook', bgColor: 'bg-blue-500' },
  { type: 'logger', label: 'Logger', bgColor: 'bg-gray-500' },
  { type: 'end', label: 'End', bgColor: 'bg-red-500' }
]

export default function WorkflowEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const updateNodeData = useStore((state) => state.updateNodeData)
  const [showDropdown, setShowDropdown] = useState(false)

  // Load workflow data
  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await fetch(`/api/workflows/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch workflow')
        
        const data = await response.json()
        setName(data.name)
        setDescription(data.description || '')
        
        // Transform nodes
        const transformedNodes = data.nodes.map((node: any) => ({
          id: node.id,
          type: node.type.toLowerCase(),
          position: { x: node.positionX, y: node.positionY },
          data: node.data
        }))
        
        // Transform edges
        const transformedEdges = data.edges.map((edge: any) => ({
          id: `edge-${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#64748b' },
          ...(edge.sourceHandle && { sourceHandle: edge.sourceHandle }),
          ...(edge.targetHandle && { targetHandle: edge.targetHandle })
        }))
  
        setNodes(transformedNodes)
        setEdges(transformedEdges)
      } catch (error) {
        console.error('Error loading workflow:', error)
        router.push('/dashboard')
      }
    }
  
    if (params.id && status === 'authenticated') {
      fetchWorkflow()
    }
  }, [params.id, status, router, setNodes, setEdges]) // Add all dependencies

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
      const sourceNode = nodes.find(n => n.id === connection.source)
      const targetNode = nodes.find(n => n.id === connection.target)
      
      if (sourceNode?.type === 'start' || targetNode?.type === 'condition' || 
          targetNode?.type === 'delay' || targetNode?.type === 'webhook' ||  
          targetNode?.type === 'logger' || targetNode?.type === 'end') {
        setEdges((eds) => addEdge({
          ...connection,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#64748b' },
        }, eds))
      }
    },
    [nodes, setEdges]
  )

  const onInit = (rfi: ReactFlowInstance) => {
    setReactFlowInstance(rfi)
  }

  const addNode = (type: string) => {
    if (type === 'start' && nodes.some(n => n.type === 'start')) {
      return // Prevent adding multiple start nodes
    }
  
    // Default position
    let position = { x: 250, y: 100 }
    
    // Calculate center position if reactFlowInstance is available
    if (reactFlowInstance) {
      const viewport = reactFlowInstance.getViewport()
      const centerX = window.innerWidth / 2 / viewport.zoom - viewport.x
      const centerY = window.innerHeight / 2 / viewport.zoom - viewport.y
      position = { x: centerX, y: centerY }
    } else {
      // If no instance, place below existing nodes
      const lastNode = nodes[nodes.length - 1]
      if (lastNode) {
        position = { x: lastNode.position.x, y: lastNode.position.y + 100 }
      }
    }
  
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: type as any,
      position,
      data: getDefaultNodeData(type)
    }
  
    setNodes((nds) => nds.concat(newNode))
  }

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

  const handleSubmit = async () => {
    if (!session?.user?.id || !name.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/workflows/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          nodes: nodes.map(node => ({
            id: node.id,
            type: node.type.toUpperCase(),
            positionX: node.position.x,
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

      if (!response.ok) throw new Error('Failed to update workflow')

      router.push(`/workflows/${params.id}`)
    } catch (error) {
      console.error('Error updating workflow:', error)
      alert('Failed to update workflow. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') return <div className="p-4">Loading...</div>
  if (status === 'unauthenticated') {
    router.push('/signin')
    return null
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
<div className="p-4 border-b">
     {/* Top row with breadcrumbs and user menu */}
     <div className="flex items-center justify-between mb-4">
      {/* Breadcrumbs */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-2">
          <li>
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <Link href="/workflows" className="text-sm font-medium text-gray-500 hover:text-gray-700">
              All Workflows
            </Link>
          </li>
          <li>
            <span className="text-gray-400">/</span>
          </li>
          <li>
            <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
              {name || 'Untitled Workflow'}
            </span>
          </li>
        </ol>
      </nav>

      {/* User avatar and dropdown */}
      <div className="relative">
        <button 
          className="flex items-center space-x-2 focus:outline-none"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <button
              onClick={() => signOut()}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  <div className="max-w-7xl mx-auto">
 

    {/* Form fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
</div>

      <div className="flex flex-1">
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
            connectionRadius={20}
            snapToGrid={true}
            snapGrid={[15, 15]}
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
                    Updating...
                  </span>
                ) : 'Update Workflow'}
              </Button>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}