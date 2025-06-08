'use client';

export default function Offline() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Vous êtes hors ligne
        </h1>
        <p className="text-gray-600">
          Vérifiez votre connexion internet et réessayez.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-gradient-to-r from-[#ff761e] to-[#ff9500] px-4 py-2 font-medium text-white hover:opacity-90"
        >
          Réessayer
        </button>
      </div>
    </main>
  );
}
