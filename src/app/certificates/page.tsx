import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, certificates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
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
      <Navbar userId={userId} />

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
