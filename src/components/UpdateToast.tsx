import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * UpdateToast — shown when a new Service Worker version is waiting.
 * Uses registerType: "prompt" so the SW never auto-applies; user must confirm.
 *
 * Test flow:
 *   1. npm run build && npm run preview
 *   2. Load the app — SW installs (first visit: no toast)
 *   3. Make a change, rebuild. Reload the tab.
 *   4. Toast appears → click "Refresh" → page reloads with new version.
 */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('[PWA] SW registered:', r);
    },
    onRegisterError(error) {
      console.error('[PWA] SW registration error:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-950/95 px-4 py-3 shadow-2xl shadow-violet-900/40 backdrop-blur-md">
        {/* Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
          <RefreshCw className="h-4 w-4 text-violet-300" />
        </div>

        {/* Message */}
        <p className="flex-1 text-sm font-medium text-violet-100">
          New version available
        </p>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={() => updateServiceWorker(true)}
            className="h-7 px-3 text-xs bg-violet-500 hover:bg-violet-400 text-white border-0"
          >
            Refresh
          </Button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            aria-label="Dismiss update notification"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-violet-400 hover:text-violet-200 hover:bg-violet-800/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
