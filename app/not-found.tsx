import { ErrorMode } from "./components/ErrorMode";
import { GoHome } from "./components/GoHome";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <ErrorMode />
      <div className="text-center">
        <p className="text-zinc-600 text-sm font-mono">404</p>
        <h1 className="text-white text-xl font-medium mt-2">page not found</h1>
        <GoHome />
      </div>
    </main>
  );
}
