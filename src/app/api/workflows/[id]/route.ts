/* eslint-disable @typescript-eslint/ban-ts-comment */
// app/api/workflows/[id]/route.ts
import { getServerSession } from 'next-auth';
// @ts-expect-error

import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
      include: {
        nodes: true,
        edges: true,
      },
    })

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT handler (for completeness)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, nodes, edges } = await request.json()

    // First delete all existing nodes and edges
    await prisma.$transaction([
      prisma.node.deleteMany({ where: { workflowId: params.id } }),
      prisma.edge.deleteMany({ where: { workflowId: params.id } })
    ])

    // Then update with new data
    const workflow = await prisma.workflow.update({
      where: { id: params.id },
      data: {
        name,
        description,
        nodes: {
          create: nodes.map((node: any) => ({
            type: node.type,
            positionX: node.positionX,
            positionY: node.positionY,
            data: node.data
          }))
        },
        edges: {
          create: edges.map((edge: any) => ({
            source: edge.source,
            target: edge.target,
            label: edge.label,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle
          }))
        }
      },
      include: {
        nodes: true,
        edges: true
      }
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify workflow exists and belongs to user
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id: params.id }
    });

    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    if (existingWorkflow.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this workflow' },
        { status: 403 }
      );
    }

    // Use transaction to delete workflow and all related data
    await prisma.$transaction(async (prisma) => {
      // Delete all nodes first (if cascade delete not set up in schema)
      await prisma.node.deleteMany({
        where: { workflowId: params.id }
      });

      // Delete all edges first (if cascade delete not set up in schema)
      await prisma.edge.deleteMany({
        where: { workflowId: params.id }
      });

      // Delete the workflow
      await prisma.workflow.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json(
      { message: 'Workflow deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}