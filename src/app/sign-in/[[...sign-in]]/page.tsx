import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 items-center justify-center p-4">
      <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" appearance={{ elements: { formButtonPrimary: 'bg-navy hover:bg-navy/90 text-white' } }} />
    </div>
  );
}
