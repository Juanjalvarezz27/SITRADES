"use client";

import { usePathname } from "next/navigation";

export default function HomeTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div 
      key={pathname} 
      className="animate-page-transition h-full flex flex-col flex-1"
    >
      {children}
    </div>
  );
}