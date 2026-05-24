"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-600 text-sm font-mono">error</p>
        <h1 className="text-white text-xl font-medium mt-2">something went wrong</h1>
        <button
          onClick={reset}
          className="text-zinc-500 text-sm mt-5 hover:text-white transition-colors"
        >
          try again
        </button>
      </div>
    </main>
  );
}
