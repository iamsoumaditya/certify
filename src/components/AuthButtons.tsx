"use client";

import { useClerk } from "@clerk/nextjs";

export function AuthButtons() {
  const { openSignIn, openSignUp } = useClerk();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => openSignIn()}
        className="px-4 py-2 rounded-md bg-transparent text-slate-700 font-medium hover:bg-slate-100 transition-colors text-sm"
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => openSignUp()}
        className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm"
      >
        Create Account
      </button>
    </div>
  );
}
