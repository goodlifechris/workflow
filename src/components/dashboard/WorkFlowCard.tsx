"use client"
import Link from 'next/link';
import { Workflow } from '@prisma/client';
import { formatDate } from '@/lib/utils';
import { Activity, Network, Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WorkflowCardProps {
  workflow: Workflow & { nodes: { id: string }[]; id: string };
  nodeCount: number;
}

export default function WorkflowCard({ workflow, nodeCount }: WorkflowCardProps) {
  const router = useRouter();

  const handleAction = (e: React.MouseEvent, action: 'view' | 'edit' | 'delete') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action === 'view') {
      router.push(`/workflows/${workflow.id}`);
    } else if (action === 'edit') {
      router.push(`/workflows/${workflow.id}/edit`);
    } else if (action === 'delete') {
      // Implement delete logic here or call a passed onDelete prop
      console.log('Delete workflow', workflow.id);
    }
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors relative">
      {/* Action Icons */}
      <div className="absolute top-3 right-3 flex space-x-1">
        <button 
          onClick={(e) => handleAction(e, 'view')}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button 
          onClick={(e) => handleAction(e, 'edit')}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button 
          onClick={(e) => handleAction(e, 'delete')}
          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content - Now clickable via the view action */}
      <div onClick={(e) => handleAction(e, 'view')} className="cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{workflow.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(workflow.createdAt)}
            </p>
          </div>
          {workflow.isActive && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          )}
        </div>
        
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Network className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <span>{nodeCount} nodes</span>
          </div>
          <div className="flex items-center">
            <Activity className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <span>
              {workflow.lastRunAt 
                ? `Last run ${formatDate(workflow.lastRunAt, true)}`
                : 'Never run'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}