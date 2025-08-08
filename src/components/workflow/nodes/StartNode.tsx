'use client'

import { Handle, Position, useNodeId, useUpdateNodeInternals } from '@xyflow/react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'

type StartNodeData = {
  description: string
}

type StartNodeProps = {
  id: string
  data: StartNodeData
  selected?: boolean
}

export function StartNode({ id, data, selected }: StartNodeProps) {
  const nodeId = useNodeId()
  const updateNodeInternals = useUpdateNodeInternals()
  const [description, setDescription] = useState(data.description)
  const updateNodeData = useStore((state) => state.updateNodeData)

  // Handle external data changes and update node internals
  useEffect(() => {
    setDescription(data.description)
    updateNodeInternals(nodeId!)
  }, [data.description, nodeId, updateNodeInternals])

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value
    setDescription(newDescription)
    updateNodeData(nodeId!, { description: newDescription })
    updateNodeInternals(nodeId!) // Update node internals on change
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-green-500'}`}>      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <div className="text-xs font-bold">Start</div>
        </div>
        
        <div className="mt-1">
          <Input
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter start description..."
            className="text-xs h-7 w-full"
          />
        </div>
      </div>

      {/* Single output handle at the bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output" // Added explicit ID
        className="w-3 h-3 !bg-gray-400"
        style={{ bottom: -6 }}
      />
    </div>
  )
}