import { useState } from 'react';
import { ShieldAlert, CornerDownLeft, X } from 'lucide-react';

/**
 * Standard confirmation dialog for dangerous or sensitive SaaS operations.
 * Requests: Action, Reason, and explicit confirmation before dispatching.
 */
export default function PlatformConfirmationModal({
  isOpen,
  title = 'Confirm Dangerous Action',
  description = 'You are about to perform a highly sensitive administrative operation. Please provide a justification details.',
  onConfirm,
  onClose,
  confirmButtonText = 'Confirm & Execute'
}) {
  const [reason, setReason] = useState('');
  const [typedConfirm, setTypedConfirm] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A valid operational reason is required for audit logs.');
      return;
    }
    if (typedConfirm.toLowerCase() !== 'confirm') {
      setError('Please type "confirm" to verify the action.');
      return;
    }

    setError('');
    onConfirm(reason);
    setReason('');
    setTypedConfirm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] font-sans">
      <div className="bg-slate-900 border border-red-500/20 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-slate-450 hover:text-white absolute right-4 top-4 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{title}</h3>
            <p className="text-xs text-slate-450 mt-1">{description}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-400 font-bold mb-1">Reason / Justification (Audit Trail)</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Client requested temporary suspension due to migration delays..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-white placeholder-slate-550 outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">
              Type <span className="font-mono text-red-400 font-bold">confirm</span> to execute
            </label>
            <input
              type="text"
              required
              value={typedConfirm}
              onChange={(e) => setTypedConfirm(e.target.value)}
              placeholder="confirm"
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500 font-mono"
            />
          </div>

          {error && (
            <p className="text-red-400 font-bold text-[11px] bg-red-500/5 p-2 rounded-lg border border-red-500/10">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-350 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-red-600/20"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              {confirmButtonText}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
