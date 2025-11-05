import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "NeoX",
  description: "Manage your personal training sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header>
            <nav>
              <Link href="/">NeoX</Link>
              <div className="nav-links">
                <Link href="/sessions">Sessions</Link>
                <Link href="/profile">Profile</Link>
              </div>
            </nav>
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
