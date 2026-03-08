"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">Algo deu errado</h2>
      <p className="mt-2 text-sm text-red-600">{error.message}</p>
    </div>
  );
}

