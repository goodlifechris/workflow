// components/workflow/nodes/DelayNode.tsx
'use client'

import { Handle, Position, useNodeId } from '@xyflow/react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore } from '@/lib/store'

type DelayNodeData = {
  duration: number
  unit: 'seconds' | 'minutes' | 'hours'
}

type DelayNodeProps = {
  id: string
  data: DelayNodeData
  selected?: boolean
}

export function DelayNode({ id, data, selected }: DelayNodeProps) {
  const nodeId = useNodeId()
  const [duration, setDuration] = useState<number>(data.duration || 30)
  const [inputValue, setInputValue] = useState<string>(String(data.duration || 30))
  const [unit, setUnit] = useState<'seconds' | 'minutes' | 'hours'>(data.unit || 'seconds')
  const updateNodeData = useStore((state) => state.updateNodeData)

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Allow empty input temporarily
    if (value === '') {
      setInputValue('')
      return
    }
    
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      const numValue = parseInt(value)
      // Set maximum limit if needed
      const clampedValue = Math.min(numValue, 9999)
      setInputValue(value)
      setDuration(clampedValue)
    }
  }

  const handleBlur = () => {
    // When input loses focus, validate and set final value
    let finalValue = parseInt(inputValue)
    if (isNaN(finalValue) || finalValue < 1) {
      finalValue = 1
    }
    setDuration(finalValue)
    setInputValue(String(finalValue))
  }

  useEffect(() => {
    updateNodeData(nodeId!, { 
      duration,
      unit
    })
  }, [duration, unit, nodeId, updateNodeData])

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-yellow-500'}`}>
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
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="text-xs font-bold">Delay</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleDurationChange}
            onBlur={handleBlur}
            className="text-xs h-7 w-20"
          />
          <Select
            value={unit}
            onValueChange={(value: 'seconds' | 'minutes' | 'hours') => setUnit(value)}
          >
            <SelectTrigger className="h-7 text-xs w-24">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Output handle at bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="w-3 h-3 !bg-gray-400"
        style={{ bottom: -6 }}
      />
    </div>
  )
}