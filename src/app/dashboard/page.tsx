// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Add this import
import { Plus } from "lucide-react"; // Add this import
import prisma from "@/lib/prisma"
import { LogoutButton } from "@/components/dashboard/logout-button";
export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
    }
  });



 

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* User Header */}
      <Card className="mb-8 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://reactflow.dev/favicon.ico" />
              <AvatarFallback>
                {user?.name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">{user?.name || "User"}</h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </Card>

      {/* Dashboard Content */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Workflow Analytics</h2>
          <Button asChild>
            <a href={`/workflows/new`} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Workflow
            </a>
          </Button>
        </div>

      </div>
    </div>
  );
}