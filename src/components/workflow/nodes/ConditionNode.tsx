// components/workflow/nodes/ConditionNode.tsx
'use client'

import { Handle, Position, useNodeId } from '@xyflow/react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { useStore } from '@/lib/store'
import { Toggle } from '@/components/ui/toggle'

type ConditionNodeData = {
  condition: string
  isTrue?: boolean
  trueLabel?: string
  falseLabel?: string
}

type ConditionNodeProps = {
  id: string
  data: ConditionNodeData
  selected?: boolean
}

export function ConditionNode({ id, data, selected }: ConditionNodeProps) {
  const nodeId = useNodeId()
  const [condition, setCondition] = useState(data.condition)
  const [isTrue, setIsTrue] = useState(data.isTrue ?? false)
  const [trueLabel, setTrueLabel] = useState(data.trueLabel || 'True')
  const [falseLabel, setFalseLabel] = useState(data.falseLabel || 'False')
  const updateNodeData = useStore((state) => state.updateNodeData)

  useEffect(() => {
    updateNodeData(nodeId!, { 
      condition,
      isTrue,
      trueLabel,
      falseLabel
    })
  }, [condition, isTrue, trueLabel, falseLabel, nodeId, updateNodeData])

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-purple-500'}`}>
      {/* Input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="w-3 h-3 !bg-gray-400"
        style={{ top: -6 }}
      />

      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <div className="text-xs font-bold">Condition</div>
        </div>
        
        <Input
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="Enter condition (e.g. amount > 100)"
          className="text-xs h-7"
        />

        <div className="flex items-center space-x-4 pt-1">
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={isTrue}
              onPressedChange={setIsTrue}
              className={`h-6 w-6 ${
                isTrue 
                  ? 'bg-green-500 hover:bg-green-600 data-[state=on]:bg-green-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            />
            <Input
              value={trueLabel}
              onChange={(e) => setTrueLabel(e.target.value)}
              className="text-xs h-7 w-20"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Toggle
              pressed={!isTrue}
              onPressedChange={(pressed) => setIsTrue(!pressed)}
              className={`h-6 w-6 ${
                !isTrue 
                  ? 'bg-red-500 hover:bg-red-600 data-[state=on]:bg-red-500' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            />
            <Input
              value={falseLabel}
              onChange={(e) => setFalseLabel(e.target.value)}
              className="text-xs h-7 w-20"
            />
          </div>
        </div>
      </div>

      {/* Output handles at bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 !bg-green-500"
        style={{ left: '25%', bottom: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 !bg-red-500"
        style={{ left: '75%', bottom: -6 }}
      />
    </div>
  )
}