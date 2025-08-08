import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { Providers } from '@/app/providers/providers'
import { redirect } from 'next/navigation'
import { type Session } from 'next-auth'

export default async function WorkflowEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect unauthenticated users
  if (!session) {
    redirect('/signin?callbackUrl=/workflows/new')
  }

  return (
    <Providers session={session as Session}>
      <div className="flex flex-col h-full">
        {children}
      </div>
    </Providers>
  )
}