// components/workflow/CustomHandle.tsx
'use client';

import { Handle, Position, HandleProps } from '@xyflow/react';

export function CustomHandle({
  type = 'source',
  position = Position.Bottom,
  ...props
}: HandleProps) {
  const positionClasses = {
    [Position.Top]: '-top-2',
    [Position.Bottom]: '-bottom-2',
    [Position.Left]: '-left-2',
    [Position.Right]: '-right-2',
  };

  const colorClasses = {
    source: 'bg-green-500',
    target: 'bg-blue-500',
  };

  return (
    <Handle
      type={type}
      position={position}
      className={`!w-3 !h-3 ${colorClasses[type]} ${positionClasses[position]}`}
      {...props}
    />
  );
}