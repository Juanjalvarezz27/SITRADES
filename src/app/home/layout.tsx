import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Sidebar from "../components/layout/Sidebar";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    // ¡AQUÍ ESTÁ LA MAGIA RESPONSIVE! (flex-col md:flex-row)
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-bg">
      <Sidebar userRol={session.user.rol} />
      
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}