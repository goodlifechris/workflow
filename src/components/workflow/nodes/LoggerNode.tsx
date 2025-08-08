// components/workflow/nodes/LoggerNode.tsx
'use client'

import { Handle, Position, useNodeId } from '@xyflow/react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type LoggerNodeData = {
  message: string
  level: 'info' | 'warn' | 'error'
  lastLogged?: string
}

type LoggerNodeProps = {
  id: string
  data: LoggerNodeData
  selected?: boolean
}

export function LoggerNode({ id, data, selected }: LoggerNodeProps) {
  const nodeId = useNodeId()
  const [message, setMessage] = useState(data.message || '')
  const [level, setLevel] = useState<'info' | 'warn' | 'error'>(data.level || 'info')
  const [lastLogged, setLastLogged] = useState(data.lastLogged || '')
  const [isTesting, setIsTesting] = useState(false)
  const updateNodeData = useStore((state) => state.updateNodeData)

  const testLogging = async () => {
    setIsTesting(true)
    try {
      // Simulate logging (in a real app, this would send to your logging system)
      const timestamp = new Date().toISOString()
      setLastLogged(timestamp)
      
      // Update node data with the test log
      updateNodeData(nodeId!, { 
        message,
        level,
        lastLogged: timestamp
      })

      // Console log for demonstration
      const logMethod = {
        info: console.info,
        warn: console.warn,
        error: console.error
      }[level]
      
      logMethod(`[LoggerNode ${timestamp}]`, message)
    } finally {
      setIsTesting(false)
    }
  }

  useEffect(() => {
    updateNodeData(nodeId!, { 
      message,
      level
    })
  }, [message, level, nodeId, updateNodeData])

  const getLevelColor = () => {
    switch (level) {
      case 'info': return 'bg-blue-500'
      case 'warn': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-gray-300'}`}>
      {/* Input handle at top */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="w-3 h-3 !bg-gray-400"
        style={{ top: -6 }}
      />

      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
            <div className="text-xs font-bold">Logger</div>
          </div>
          <Badge 
            className={cn(
              'text-xs h-4 px-1.5',
              getLevelColor(),
              !lastLogged && 'opacity-50'
            )}
          >
            {level.toUpperCase()}
          </Badge>
        </div>

        <Select
          value={level}
          onValueChange={(value: 'info' | 'warn' | 'error') => setLevel(value)}
        >
          <SelectTrigger className="h-7 text-xs w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter log message..."
          className="text-xs h-16"
        />

        <div className="flex items-center justify-between">
          <Button
            onClick={testLogging}
            disabled={isTesting || !message}
            size="sm"
            className="h-7 text-xs"
          >
            {isTesting ? 'Logging...' : 'Test Log'}
          </Button>
          
          {lastLogged && (
            <span className="text-xs text-gray-500">
              Last: {new Date(lastLogged).toLocaleTimeString()}
            </span>
          )}
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