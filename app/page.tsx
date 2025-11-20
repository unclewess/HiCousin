import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-navy-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-navy-700 p-8 text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            hiCousins 👋
          </h1>
          <p className="text-navy-100 font-sans">
            No more awkward money conversations.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-coral-50 rounded-2xl border border-coral-100">
              <p className="text-coral-800 font-medium">
                "The ancestors are watching 👀"
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-coral-500/30">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <div className="flex flex-col items-center gap-2">
                  <UserButton showName />
                  <p className="text-sm text-gray-500">Welcome back, Cousin!</p>
                </div>
              </SignedIn>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
          v1.0.0 MVP • Nairobi Edition
        </div>
      </div>
    </main>
  );
}
