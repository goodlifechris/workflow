import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, userId, nodes, edges } = await req.json();

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid workflow name' },
        { status: 400 }
      );
    }

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        { error: 'Invalid nodes or edges data' },
        { status: 400 }
      );
    }

    // Create workflow with nodes first
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        userId,
        nodes: {
          create: nodes.map((node) => ({
            type: node.type,
            positionX: node.positionX,
            positionY: node.positionY,
            data: node.data
          }))
        }
      },
      include: {
        nodes: true
      }
    });

    // Create a mapping of frontend IDs to database IDs
    const nodeIdMap = new Map();
    nodes.forEach((frontendNode, index) => {
      nodeIdMap.set(frontendNode.id, workflow.nodes[index].id);
    });

    // Now create edges with correct references
    await prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        edges: {
          create: edges.map((edge) => ({
            source: nodeIdMap.get(edge.source),
            target: nodeIdMap.get(edge.target),
            label: edge.label || null,
            ...(edge.sourceHandle && { sourceHandle: edge.sourceHandle }),
            ...(edge.targetHandle && { targetHandle: edge.targetHandle })
          }))
        }
      }
    });

    // Return the complete workflow
    const completeWorkflow = await prisma.workflow.findUnique({
      where: { id: workflow.id },
      include: {
        nodes: true,
        edges: true
      }
    });

    return NextResponse.json(completeWorkflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// app/api/workflows/[id]/route.ts
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, description, nodes, edges } = await req.json()

    // First delete all existing nodes and edges
    await prisma.workflow.update({
      where: { id: params.id },
      data: {
        nodes: { deleteMany: {} },
        edges: { deleteMany: {} }
      }
    })

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