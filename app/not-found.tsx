import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-zinc-600 text-sm font-mono">404</p>
        <h1 className="text-white text-xl font-medium mt-2">page not found</h1>
        <Link
          href="/"
          className="text-zinc-500 text-sm mt-5 inline-block hover:text-white transition-colors"
        >
          go home
        </Link>
      </div>
    </main>
  );
}
