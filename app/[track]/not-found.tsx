import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-5xl mb-4">🗺️</div>
      <h2 className="text-xl font-bold text-white mb-2">Track not found</h2>
      <p className="text-sm text-white/40 mb-6">This track doesn&apos;t exist yet.</p>
      <Link
        href="/dashboard"
        className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-semibold hover:bg-white/15 transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </div>
  )
}
