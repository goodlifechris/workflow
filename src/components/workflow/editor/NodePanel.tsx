// components/workflow/NodePanel.tsx
'use client';

import React from 'react';
import { CircleDot, Timer, Code2, Terminal, Send, Flag } from 'lucide-react';

const NODE_TYPES = [
  {
    type: 'start',
    label: 'Start',
    icon: <CircleDot className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  // ... other node types
];

export default function NodePanel() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Nodes</h2>
      <div className="space-y-2">
        {NODE_TYPES.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
            className={`flex items-center p-2 rounded-md border cursor-grab ${node.color} hover:shadow-md transition-shadow`}
          >
            <div className="p-1 mr-2 rounded-full bg-white">
              {node.icon}
            </div>
            <div>
              <p className="font-medium text-sm">{node.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}