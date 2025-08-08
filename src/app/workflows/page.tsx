// app/workflows/page.tsx
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import WorkflowCard from '@/components/dashboard/WorkFlowCard'
import { FolderOpen, PlusIcon } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import Link from 'next/link'

export default async function WorkflowsPage() {
  const user = await getCurrentUser()
  if (!user) return notFound()

  const workflows = await prisma.workflow.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      nodes: {
        select: { id: true },
      },
    },
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Workflows</h1>
        <Link
          href="/workflows/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          New Workflow
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {workflows.length > 0 ? (
          <div className="space-y-3">
            {workflows.map(workflow => (
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
  )
}