export default function ErrorToast({ message, onRetry, onDismiss }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-[fade-in-up_0.4s_ease-out_forwards]">
      <div
        className="rounded-xl px-5 py-4 flex items-start gap-4"
        style={{
          background: 'rgba(159, 5, 25, 0.15)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 113, 108, 0.15)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
      >
        <p className="text-sm text-red-300 flex-1 font-body">{message}</p>
        <div className="flex gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-semibold text-on-surface px-4 py-1.5 rounded-full transition-all cursor-pointer font-body"
              style={{
                background: 'rgba(255, 113, 108, 0.2)',
                border: '1px solid rgba(255, 113, 108, 0.2)',
              }}
            >
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-xs text-red-400/60 hover:text-red-300 px-2 py-1.5 transition-colors cursor-pointer font-body"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
