import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, certificates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function CertificatesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);

  let userCertificates: typeof certificates.$inferSelect[] = [];
  
  if (dbUser) {
    userCertificates = await db.select().from(certificates).where(eq(certificates.userId, dbUser.id)).orderBy(desc(certificates.createdAt));
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-navy selection:bg-gold/20">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-[22px] text-gold">Certify</Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="https://github.com/iamsoumaditya/certify" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-navy transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.34 6.52-1.6 6.52-7.09a5.5 5.5 0 0 0-1.53-3.9 5.5 5.5 0 0 0-.15-3.8s-1.3-.41-4.2 1.55a14.8 14.8 0 0 0-8 0c-2.9-1.96-4.2-1.55-4.2-1.55a5.5 5.5 0 0 0-.15 3.8 5.5 5.5 0 0 0-1.53 3.9c0 5.49 3.34 6.75 6.52 7.09a4.8 4.8 0 0 0-1 3.03V22"></path><path d="M9 20c-5 1.5-5-2.5-7-3"></path></svg>
              <span className="hidden sm:inline font-semibold">Star Us</span>
            </Link>
            <Link href="/dashboard" className="text-navy hover:text-navy/70 transition-colors">
              Dashboard
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-navy mb-4">My Certificates</h1>
          <p className="text-gray-500 text-lg">A glorious record of all your completely unofficial achievements.</p>
        </div>

        {userCertificates.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
            <div className="text-6xl mb-6">📜</div>
            <h2 className="font-serif font-bold text-2xl text-navy mb-4">No certificates yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              You haven't generated any fake credentials to impress your friends or employers yet.
            </p>
            <Link href="/dashboard" className="bg-gold hover:bg-[#a68800] text-navy font-semibold px-8 py-4 rounded-md transition-colors inline-flex items-center gap-2 shadow-sm">
              Generate Your First Certificate &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCertificates.map((cert) => (
              <div key={cert.id} className="bg-white border border-gray-200 p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300 shadow-sm group">
                <div className="text-xs font-bold uppercase tracking-widest text-gold mb-4">Certificate</div>
                <h3 className="font-serif font-bold text-2xl text-navy leading-tight mb-2 flex-1">
                  {cert.courseName || "Untitled Course"}
                </h3>
                <div className="text-sm text-gray-500 mb-6 space-y-1">
                  <p>Instructor: <span className="font-medium text-navy">{cert.instructorName || "N/A"}</span></p>
                  <p>Completed: <span className="font-medium text-navy">{cert.completionDate ? new Date(cert.completionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown"}</span></p>
                  <p>Duration: <span className="font-medium text-navy">{cert.courseLength || "N/A"}</span></p>
                </div>
                
                <Link href={`/certificate/${cert.id}`} className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between text-navy font-semibold group-hover:text-gold transition-colors">
                  View Certificate
                  <span className="text-lg">&rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
