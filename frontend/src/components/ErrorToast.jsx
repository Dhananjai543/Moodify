export default function ErrorToast({ message, onRetry, onDismiss }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-red-950 border border-red-800 rounded-lg px-5 py-4 flex items-start gap-4 shadow-lg">
        <p className="text-sm text-red-200 flex-1">{message}</p>
        <div className="flex gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-medium text-white bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-xs text-red-400 hover:text-red-200 px-2 py-1.5 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
