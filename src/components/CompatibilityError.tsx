interface Props {
  reason?: string;
}

export default function CompatibilityError({ reason }: Props) {
  return (
    <div className="min-h-screen bg-surface dark:bg-[#0d1117] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-full bg-error-container/20 dark:bg-red-900/30 text-error dark:text-red-400 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">desktop_access_disabled</span>
        </div>
        <h1 className="text-headline-sm font-headline-sm text-on-surface dark:text-gray-100">
          SecureVault can't safely run in this browser.
        </h1>
        <div className="bg-surface-container-low dark:bg-gray-800 p-4 rounded-xl text-left border border-outline-variant/30 dark:border-gray-700">
          <p className="text-body-sm text-error dark:text-red-400 font-mono">
            {reason || 'A required cryptographic primitive is missing.'}
          </p>
        </div>
        <p className="text-body-md text-on-surface-variant dark:text-gray-400">
          For your security, SecureVault refuses to silently downgrade to weaker cryptography. Please use a modern browser (Chrome, Edge, Firefox, Safari) and ensure you are on a secure connection (HTTPS).
        </p>
      </div>
    </div>
  );
}



