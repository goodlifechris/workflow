// components/workflow/nodes/WebhookNode.tsx
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

type WebhookNodeData = {
  url: string
  method: 'GET' | 'POST'
  headers: Record<string, string>
  body: string
  lastStatus?: number
}

type WebhookNodeProps = {
  id: string
  data: WebhookNodeData
  selected?: boolean
}

export function WebhookNode({ id, data, selected }: WebhookNodeProps) {
  const nodeId = useNodeId()
  const [url, setUrl] = useState(data.url || '')
  const [method, setMethod] = useState<'GET' | 'POST'>(data.method || 'POST')
  const [headers, setHeaders] = useState(JSON.stringify(data.headers || {}, null, 2))
  const [body, setBody] = useState(data.body || '')
  const [lastStatus, setLastStatus] = useState(data.lastStatus)
  const [isTesting, setIsTesting] = useState(false)
  const updateNodeData = useStore((state) => state.updateNodeData)

  const testWebhook = async () => {
    setIsTesting(true)
    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          method,
          headers: JSON.parse(headers),
          body: method === 'POST' ? body : undefined
        })
      })
      
      const status = response.status
      setLastStatus(status)
      updateNodeData(nodeId!, { 
        url,
        method,
        headers: JSON.parse(headers),
        body,
        lastStatus: status
      })
    } catch (error) {
      setLastStatus(0) // 0 indicates network error
    } finally {
      setIsTesting(false)
    }
  }

  useEffect(() => {
    updateNodeData(nodeId!, { 
      url,
      method,
      headers: tryParseHeaders(headers),
      body
    })
  }, [url, method, headers, body, nodeId, updateNodeData])

  const tryParseHeaders = (headersString: string): Record<string, string> => {
    try {
      return JSON.parse(headersString)
    } catch {
      return {}
    }
  }

  const getStatusColor = () => {
    if (!lastStatus) return 'bg-gray-500'
    if (lastStatus >= 200 && lastStatus < 300) return 'bg-green-500'
    if (lastStatus >= 400 && lastStatus < 500) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${selected ? 'border-blue-500' : 'border-blue-300'}`}>
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
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <div className="text-xs font-bold">Webhook</div>
          </div>
          <Badge 
            className={cn(
              'text-xs h-4 px-1.5',
              getStatusColor(),
              !lastStatus && 'opacity-50'
            )}
          >
            {lastStatus ? lastStatus : 'Untested'}
          </Badge>
        </div>
        
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/endpoint"
          className="text-xs h-7"
        />

        <div className="flex items-center space-x-2">
          <Select
            value={method}
            onValueChange={(value: 'GET' | 'POST') => setMethod(value)}
          >
            <SelectTrigger className="h-7 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={testWebhook}
            disabled={isTesting || !url}
            size="sm"
            className="h-7 text-xs"
          >
            {isTesting ? 'Testing...' : 'Test'}
          </Button>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500">Headers (JSON)</label>
          <Textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            className="text-xs h-16 font-mono"
            placeholder={`{\n  "Content-Type": "application/json"\n}`}
          />
        </div>

        {method === 'POST' && (
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Request Body</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="text-xs h-16 font-mono"
              placeholder={`{\n  "key": "value"\n}`}
            />
          </div>
        )}
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