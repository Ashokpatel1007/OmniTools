import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-shell py-20 text-center">
      <h1 className="text-3xl font-semibold text-slate-950 dark:text-slate-50">Page not found</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">The tool or page you asked for does not exist.</p>

      <Link href="/" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">Return home</Link>
    </div>
  );
}
