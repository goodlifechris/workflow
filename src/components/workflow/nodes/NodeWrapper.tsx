// components/workflow/nodes/NodeWrapper.tsx
import { Handle, Position } from '@xyflow/react';

export function NodeWrapper({
  children,
  selected,
  hasSource = true,
  hasTarget = false,
}: {
  children: React.ReactNode;
  selected?: boolean;
  hasSource?: boolean;
  hasTarget?: boolean;
}) {
  return (
    <div className={`
      px-3 py-2 rounded-md shadow-sm border-2
      ${selected ? 'border-blue-500' : 'border-green-500'}
      bg-white hover:shadow-md transition-all
      w-[180px] relative
    `}>
      {hasSource && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="w-3 h-3 bg-green-500 !-bottom-2"
        />
      )}
      {hasTarget && (
        <Handle 
          type="target" 
          position={Position.Top} 
          className="w-3 h-3 bg-blue-500 !-top-2"
        />
      )}
      {children}
    </div>
  );
}