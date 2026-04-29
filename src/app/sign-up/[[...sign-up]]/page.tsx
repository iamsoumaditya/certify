import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 items-center justify-center p-4">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" appearance={{ elements: { formButtonPrimary: 'bg-navy hover:bg-navy/90 text-white' } }} />
    </div>
  );
}
