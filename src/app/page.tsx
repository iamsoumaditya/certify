import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Navbar } from "@/components/Navbar";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white selection:bg-gold/20">
      {/* Disclaimer Banner */}
      <div className="bg-navy text-white text-xs py-2 px-4 text-center z-50 relative">
        <span className="text-gold">⚠️</span> These certificates are completely fake. Udemy will not verify them. Your employer probably will though — we believe in you.
      </div>

      <Navbar userId={userId} />

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-6 py-24 md:py-32 text-center flex flex-col items-center space-y-8">
          <h1 className="font-serif font-bold text-5xl md:text-[80px] leading-[1.1] text-navy tracking-tight max-w-3xl">
            You Deserve a Certificate. For Anything.
          </h1>
          <p className="text-lg md:text-[18px] text-gray-500 max-w-2xl leading-relaxed font-sans">
            Certify generates beautiful, completely unofficial Udemy-style certificates for any course you claim to have completed. No judgment. No verification. Just vibes.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            {!userId ? (
              <>
                <Link href="/sign-up" className="bg-gold hover:bg-[#a68800] text-navy font-semibold px-8 py-4 rounded-md transition-colors text-lg flex items-center justify-center gap-2 shadow-sm">Get Certified &rarr;</Link>
                <Link href="/sign-in" className="bg-white border-2 border-navy text-navy font-semibold px-8 py-4 rounded-md hover:bg-gray-50 transition-colors text-lg flex items-center justify-center gap-2 shadow-sm">Sign In</Link>
              </>
            ) : (
              <Link href="/dashboard" className="bg-navy hover:bg-navy/90 text-white font-semibold px-8 py-4 rounded-md transition-colors text-lg flex items-center gap-2 inline-flex shadow-sm">
                Go to Dashboard &rarr;
              </Link>
            )}
          </div>
        </section>

        {/* Fake Social Proof */}
        <div className="w-full bg-gray-50 py-6 border-y border-gray-100 text-center text-sm text-gray-500 font-sans">
          Trusted by <strong className="text-gold font-bold">0</strong> real employers &middot; <strong className="text-gold font-bold">12,483 </strong> certificates generated &middot; Verified by absolutely nobody
        </div>

        {/* Features Section */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24">
          <h2 className="font-serif font-bold text-[40px] text-navy text-center mb-16">Why Certify?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="font-bold text-navy text-lg mb-3">Looks Incredibly Real</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Pixel-perfect Udemy certificate design. Custom certificate number, reference number, URL. Even your mom will be impressed.
              </p>
            </div>
            <div className="bg-white border border-gray-200 p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-bold text-navy text-lg mb-3">Takes 30 Seconds</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Fill a form. Click a button. You are now a certified expert in whatever you typed. No studying required.
              </p>
            </div>
            <div className="bg-white border border-gray-200 p-8 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="font-bold text-navy text-lg mb-3">Permanent Link</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Every certificate gets its own URL at getcertified.tech/certificate/UC-xxxxx. Share it. Frame it. Put it on LinkedIn. We dare you.
              </p>
            </div>
          </div>
        </section>

        {/* Sample Certificate Preview */}
        <section className="w-full max-w-5xl mx-auto px-6 py-24 text-center">
          <h2 className="font-serif font-bold text-[40px] text-navy mb-12">What it looks like</h2>
          <div className="w-full max-w-[70%] mx-auto bg-white border-[12px] border-gray-100 p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.1)] text-left relative overflow-hidden">
            {/* Watermark-ish effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-serif font-bold text-gray-50 opacity-50 pointer-events-none whitespace-nowrap">
              CERTIFY
            </div>
            
            <div className="relative z-10">
              <div className="text-gold font-serif font-bold text-xl mb-12">CERTIFY</div>
              <div className="text-gray-500 tracking-widest text-xs font-bold uppercase mb-4">Certificate of Completion</div>
              <h3 className="font-serif text-4xl text-navy mb-8">Advanced Napping Techniques</h3>
              <div className="mb-8">
                <div className="text-sm text-gray-500 mb-1">Instructors</div>
                <div className="font-bold text-navy">Dr. Sleep</div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Presented to</div>
                  <div className="font-serif text-2xl text-navy italic">Alex Johnson</div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <div>Reference: 0001</div>
                  <div>Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white py-12 text-center flex flex-col items-center gap-4">
        <div className="font-serif text-xl">Certify &mdash; Because effort is overrated.</div>
        <div className="text-gray-400 text-sm">Not affiliated with Udemy. Not affiliated with anyone, really.</div>
        <Link href="https://github.com/iamsoumaditya/certify" className="text-gray-500 hover:text-white transition-colors mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.34 6.52-1.6 6.52-7.09a5.5 5.5 0 0 0-1.53-3.9 5.5 5.5 0 0 0-.15-3.8s-1.3-.41-4.2 1.55a14.8 14.8 0 0 0-8 0c-2.9-1.96-4.2-1.55-4.2-1.55a5.5 5.5 0 0 0-.15 3.8 5.5 5.5 0 0 0-1.53 3.9c0 5.49 3.34 6.75 6.52 7.09a4.8 4.8 0 0 0-1 3.03V22"></path><path d="M9 20c-5 1.5-5-2.5-7-3"></path></svg>
        </Link>
      </footer>
    </div>
  );
}
