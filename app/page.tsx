export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Xplender Platform
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Service running.
        </p>
      </main>
    </div>
  );
}
