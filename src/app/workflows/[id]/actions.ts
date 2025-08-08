// app/workflows/[id]/actions.ts
'use server';

import  prisma  from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveWorkflow({
  id,
  name,
  nodes,
  edges,
}: {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
}) {
  // First delete all existing nodes and edges
  await prisma.node.deleteMany({ where: { workflowId: id } });
  await prisma.edge.deleteMany({ where: { workflowId: id } });

  // Then recreate them
  await prisma.workflow.update({
    where: { id },
    data: {
      name,
      nodes: {
        create: nodes.map(node => ({
          type: node.type,
          positionX: node.positionX,
          positionY: node.positionY,
          data: node.data,
        })),
      },
      edges: {
        create: edges.map(edge => ({
          source: edge.source,
          target: edge.target,
          label: edge.label || null,
        })),
      },
    },
  });

  revalidatePath('/workflows');
  revalidatePath(`/workflows/${id}`);
}