// hooks/use-workflow-viewer.ts
import { useEffect, useState } from 'react'
import { Node, Edge } from '@xyflow/react'

export function useWorkflowViewer(id: string) {
  const [workflow, setWorkflow] = useState<any>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  useEffect(() => {
    const fetchWorkflow = async () => {
      const res = await fetch(`/api/workflows/${id}`)
      const data = await res.json()
      setWorkflow(data)
      setNodes(JSON.parse(data.nodes))
      setEdges(JSON.parse(data.edges))
    }
    fetchWorkflow()
  }, [id])

  return { workflow, nodes, edges }
}