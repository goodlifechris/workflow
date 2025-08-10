// app/dashboard/page.tsx
import prisma  from '@/lib/prisma';
import { notFound } from 'next/navigation';
import StatCard from '@/components/dashboard/StartCard';
import WorkflowCard from '@/components/dashboard/WorkFlowCard';
import { ChevronDown, FolderOpen, PlusIcon } from 'lucide-react';
import { Activity } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) return notFound();
// Get workflow count
const workflowCount = await prisma.workflow.count({
  where: { userId: user.id },
});

// Get active workflow count
const activeWorkflows = await prisma.workflow.count({
  where: {
    userId: user.id,
    isActive: true,
  },
});

// Get total node count by first getting all workflows with their nodes
const workflowsWithNodes = await prisma.workflow.findMany({
  where: { userId: user.id },
  select: {
    nodes: {
      select: { id: true },
    },
  },
});

// Calculate total nodes across all workflows
const totalNodes = workflowsWithNodes.reduce(
  (sum, workflow) => sum + workflow.nodes.length,
  0
);


  const recentWorkflows = await prisma.workflow.findMany({
    where: { userId: user.id },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      nodes: {
        select: { id: true },
      },
    },
  });



  return (
    <div className="p-6">
      <div className="flex flex-col ">
<div className="p-4 border-b">
  {/* Top row with breadcrumbs and user menu */}
  <div className="flex items-center justify-between mb-4">
    {/* Breadcrumbs */}
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <span className="text-gray-400">/</span>
        </li>
        <li>
          <Link
            href="/workflows"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            All Workflows
          </Link>
        </li>
        <li>
          <span className="text-gray-400">/</span>
        </li>
   
      </ol>
    </nav>

    {/* User avatar and dropdown */}
    <div className="relative">
      <button
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown menu */}
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          {/* <button
            onClick={() => signOut()}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          >
            Sign out
          </button> */}
        </div>
    </div>
  </div>
  </div>

  </div>
      {/* <h1 className="text-2xl font-bold mb-6">Dashboard</h1> */}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8">
      <StatCard 
          title="Total Workflows" 
          value={workflowCount} 
          icon={<LayoutTemplate className="h-5 w-5" />}
        />
        <StatCard 
          title="Total Nodes" 
          value={totalNodes} 
          icon={<LayoutTemplate className="h-5 w-5" />}
        />
        <StatCard 
          title="Active Workflows" 
          value={activeWorkflows} 
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Workflows</h2>
    

    <div className='flex gap-5 items-center'>


          <Link className="text-sm text-blue-600 hover:text-blue-800" href="/workflows/new">Create New Workflow</Link>
          <Link href="/workflows"             className="text-sm  text-blue-600 hover:text-blue-800"
          >View All</Link>

     
    </div>
        </div>
        
        {recentWorkflows.length > 0 ? (
          <div className="space-y-3">
            {recentWorkflows.map(workflow => (
              <WorkflowCard 
                key={workflow.id}
                workflow={workflow}
                nodeCount={workflow.nodes.length}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first workflow.
            </p>
            <div className="mt-6">
              
      
<Link
  href="/workflows/new"
  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
>
  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
  New Workflow
</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}