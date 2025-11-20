import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm font-serif">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm leading-none">Silvia&apos;s List</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Tech Recruitment Switzerland</span>
            </div>
          </div>
          <div className="text-sm text-slate-500 flex gap-8">
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">
              Contact
            </Link>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            © 2025 Silvia&apos;s List.
          </div>
        </div>
      </div>
    </footer>
  );
}
