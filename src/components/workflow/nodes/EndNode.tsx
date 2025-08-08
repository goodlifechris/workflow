// components/workflow/nodes/EndNode.tsx
'use client'

import { Handle, Position, useNodeId } from '@xyflow/react'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { useEffect } from 'react'
import { useState } from 'react'

type EndNodeData = {
  description: string
}

type EndNodeProps = {
  id: string
  data: EndNodeData
  selected?: boolean
}

export function EndNode({ id, data, selected }: EndNodeProps) {
  const nodeId = useNodeId()
  const [description, setDescription] = useState(data.description || '')
  const updateNodeData = useStore((state) => state.updateNodeData)

  useEffect(() => {
    updateNodeData(nodeId!, { description })
  }, [description, nodeId, updateNodeData])

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-red-500'}`}>
      {/* Input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="w-3 h-3 !bg-gray-400"
        style={{ top: -6 }}
      />

      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div className="text-xs font-bold">End</div>
        </div>
        
        <div className="mt-1">
          <Input
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Enter end description..."
            className="text-xs h-7 w-full"
          />
        </div>
      </div>

      {/* No output handles since this is an end node */}
    </div>
  )
}