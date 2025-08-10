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
    const { name, description, nodes, edges } = await req.json();

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workflow name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json(
        { error: 'Nodes data is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(edges)) {
      return NextResponse.json(
        { error: 'Edges data must be an array' },
        { status: 400 }
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Start transaction
    const workflow = await prisma.$transaction(async (prisma) => {
      // Create workflow with nodes
      const workflow = await prisma.workflow.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          userId: user.id,
          nodes: {
            create: nodes.map((node) => ({
              type: node.type,
              positionX: node.positionX,
              positionY: node.positionY,
              data: node.data || {}
            }))
          }
        },
        include: {
          nodes: true
        }
      });

      // Create node ID mapping
      const nodeIdMap = new Map();
      nodes.forEach((frontendNode, index) => {
        nodeIdMap.set(frontendNode.id, workflow.nodes[index].id);
      });

      // Create edges
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          edges: {
            create: edges.map((edge) => ({
              source: nodeIdMap.get(edge.source),
              target: nodeIdMap.get(edge.target),
              label: edge.label || null,
              sourceHandle: edge.sourceHandle || null,
              targetHandle: edge.targetHandle || null
            }))
          }
        }
      });

      return workflow;
    });

    // Fetch complete workflow with relations
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, nodes, edges } = await req.json();

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workflow name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json(
        { error: 'Nodes data is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(edges)) {
      return NextResponse.json(
        { error: 'Edges data must be an array' },
        { status: 400 }
      );
    }

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
        { error: 'Unauthorized to update this workflow' },
        { status: 403 }
      );
    }

    // Use transaction for atomic update
    const updatedWorkflow = await prisma.$transaction(async (prisma) => {
      // Delete existing nodes and edges
      await prisma.node.deleteMany({
        where: { workflowId: params.id }
      });

      await prisma.edge.deleteMany({
        where: { workflowId: params.id }
      });

      // Update workflow with new data
      const workflow = await prisma.workflow.update({
        where: { id: params.id },
        data: {
          name: name.trim(),
          description: description?.trim(),
          nodes: {
            create: nodes.map((node) => ({
              type: node.type,
              positionX: node.positionX,
              positionY: node.positionY,
              data: node.data || {}
            }))
          }
        },
        include: {
          nodes: true
        }
      });

      // Create node ID mapping
      const nodeIdMap = new Map();
      nodes.forEach((frontendNode, index) => {
        nodeIdMap.set(frontendNode.id, workflow.nodes[index].id);
      });

      // Create edges
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: {
          edges: {
            create: edges.map((edge) => ({
              source: nodeIdMap.get(edge.source),
              target: nodeIdMap.get(edge.target),
              label: edge.label || null,
              sourceHandle: edge.sourceHandle || null,
              targetHandle: edge.targetHandle || null
            }))
          }
        }
      });

      return workflow;
    });

    // Fetch complete updated workflow
    const completeWorkflow = await prisma.workflow.findUnique({
      where: { id: updatedWorkflow.id },
      include: {
        nodes: true,
        edges: true
      }
    });

    return NextResponse.json(completeWorkflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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