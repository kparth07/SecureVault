import { useState, useEffect } from 'react';
import { generateSecurePassword, checkPasswordStrength } from '../crypto/password';

export default function PasswordGenerator({ onBack }: { onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleGenerate();
  }, [length, options]);

  const handleGenerate = async () => {
    const pwd = await generateSecurePassword({ length, ...options });
    setPassword(pwd);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = checkPasswordStrength(password);
  const strengthColors = ['bg-error', 'bg-error', 'bg-amber-400', 'bg-emerald-400', 'bg-primary'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return (
    <div className="max-w-2xl mx-auto py-12 px-gutter animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant dark:text-gray-400 hover:text-primary dark:text-indigo-400 mb-8 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Dashboard
      </button>

      <div className="bg-surface-container-lowest dark:bg-gray-900/50 rounded-3xl p-8 border border-outline-variant/30 dark:border-gray-700 shadow-xl shadow-indigo-500/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/20 dark:bg-indigo-900/40 text-primary dark:text-indigo-400 flex items-center justify-center">
            <span className="material-symbols-outlined">key</span>
          </div>
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface dark:text-gray-100">Password Generator</h2>
            <p className="text-body-sm text-on-surface-variant dark:text-gray-400">Create a cryptographically secure password</p>
          </div>
        </div>

        {/* Password Display */}
        <div className="relative group mb-8">
          <div className="w-full bg-surface-container-low dark:bg-gray-800 border border-outline-variant/30 dark:border-gray-700 rounded-2xl p-6 text-headline-sm font-mono text-center break-all select-all min-h-[5.5rem] flex items-center justify-center">
            {password}
          </div>
          <button 
            onClick={handleCopy}
            className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 transition-all shadow-md opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Copy password"
          >
            <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
          </button>
        </div>

        {/* Strength Meter */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 text-label-md">
            <span className="text-on-surface-variant dark:text-gray-400">Strength</span>
            <span className={`font-medium ${strength.score >= 3 ? 'text-emerald-500' : strength.score >= 2 ? 'text-amber-500' : 'text-error'}`}>
              {strengthLabels[strength.score]}
            </span>
          </div>
          <div className="flex gap-1 h-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <div 
                key={index} 
                className={`flex-1 rounded-full ${index <= strength.score ? strengthColors[strength.score] : 'bg-surface-container-high dark:bg-gray-700est'}`}
              />
            ))}
          </div>
          {strength.feedback.warning && (
            <p className="text-label-sm text-error mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              {strength.feedback.warning}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-body-md text-on-surface dark:text-gray-100 font-medium">Password Length</label>
              <span className="text-primary dark:text-indigo-400 font-mono bg-primary/10 px-3 py-1 rounded-lg text-label-md">{length}</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="64" 
              value={length} 
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20 dark:border-gray-800">
            {Object.entries({
              uppercase: 'Uppercase (A-Z)',
              lowercase: 'Lowercase (a-z)',
              numbers: 'Numbers (0-9)',
              symbols: 'Symbols (!@#$)'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low dark:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20 dark:border-gray-800">
                <input 
                  type="checkbox" 
                  checked={options[key as keyof typeof options]} 
                  onChange={(e) => {
                    // Prevent unchecking the last option
                    const activeCount = Object.values(options).filter(Boolean).length;
                    if (activeCount === 1 && !e.target.checked) return;
                    setOptions({ ...options, [key]: e.target.checked });
                  }}
                  className="w-5 h-5 rounded text-primary dark:text-indigo-400 focus:ring-primary accent-primary"
                />
                <span className="text-body-sm text-on-surface-variant dark:text-gray-400 select-none">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full mt-8 bg-primary text-on-primary py-4 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">refresh</span>
          Regenerate Password
        </button>
      </div>
    </div>
  );
}


