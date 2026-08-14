import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  ShieldCheck, CheckCircle2, XCircle, AlertCircle,
  HelpCircle, Lock, Eye, FileText, Download,
  Clock, Calendar, User, Phone, Mail, Building2,
  RefreshCw, ChevronRight, ExternalLink, Send
} from 'lucide-react';
import { useToast } from '../ui';

export default function PendingApprovals() {
  const toast = useToast();
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { type: 'approve' | 'reject' | 'request_info' | 'suspend', company: obj }
  const [actionNotes, setActionNotes] = useState('');
  const [assignedPlan, setAssignedPlan] = useState('Professional');
  const [submitting, setSubmitting] = useState(false);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchPendingRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/saas-admin/companies/pending', { headers: getAdminHeaders() });
      setPendingList(res.data || []);
    } catch (err) {
      toast.error('Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, toast]);

  useEffect(() => {
    fetchPendingRegistrations();
  }, [fetchPendingRegistrations]);

  const handleExecuteReview = async (e) => {
    e.preventDefault();
    if (!actionModal) return;

    setSubmitting(true);
    try {
      const payload = {
        action: actionModal.type,
        reason: actionNotes,
        notes: actionNotes,
        assignedPlan: actionModal.type === 'approve' ? assignedPlan : undefined
      };

      const res = await API.post(
        `/saas-admin/companies/${actionModal.company._id}/review`,
        payload,
        { headers: getAdminHeaders() }
      );

      toast.success(res.data?.message || 'Review action processed successfully');
      setActionModal(null);
      setSelectedCompany(null);
      setActionNotes('');
      fetchPendingRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process review action');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Visual Workflow Steps Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Company Onboarding & Verification Gatekeeper
            </h3>
            <p className="text-xs text-slate-400">
              New pharmacies must complete business document & payment verification before ERP access is provisioned.
            </p>
          </div>
          <button
            onClick={fetchPendingRegistrations}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 7-Step Workflow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: '1', label: 'Registration', status: 'done' },
            { step: '2', label: 'Pending Review', status: 'current' },
            { step: '3', label: 'Plan Selected', status: 'done' },
            { step: '4', label: 'Payment', status: 'done' },
            { step: '5', label: 'Verification', status: 'current' },
            { step: '6', label: 'SuperAdmin Approval', status: 'pending' },
            { step: '7', label: 'ERP Access Granted', status: 'pending' }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${
                item.status === 'done'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : item.status === 'current'
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-md shadow-purple-500/10'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 border border-current flex items-center justify-center font-bold text-[10px]">
                {item.step}
              </span>
              <span className="font-semibold text-[11px] leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Reviews Queue Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              Pending Pharmacy Applications Awaiting Review ({pendingList.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Strict gatekeeping enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Company Information</th>
                <th className="px-4 py-3.5">Owner Contact</th>
                <th className="px-4 py-3.5">Requested Plan</th>
                <th className="px-4 py-3.5">Payment Status</th>
                <th className="px-4 py-3.5">Verification</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5">Documents</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">Loading pending applications...</td>
                </tr>
              ) : pendingList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    🎉 All pharmacy applications have been reviewed! No pending approvals.
                  </td>
                </tr>
              ) : (
                pendingList.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Company Info */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-purple-400" />
                        <span>{item.companyName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-purple-300">ID: {item.companyCode}</div>
                    </td>

                    {/* Owner Info */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200 font-medium">{item.owner?.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.owner?.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.phone}</div>
                    </td>

                    {/* Requested Plan */}
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-bold">
                        {item.selectedPlan}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.paymentStatus === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.paymentStatus === 'paid' ? 'Verified Paid' : 'Pending Verification'}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        item.companyStatus === 'info_requested'
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.companyStatus === 'info_requested' ? 'Info Requested' : 'Pending Review'}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {formatDate(item.registrationDate)}
                    </td>

                    {/* Documents */}
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {item.uploadedDocuments?.length || 2} Uploaded
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Details */}
                        <button
                          onClick={() => setSelectedCompany(item)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>

                        {/* Approve */}
                        <button
                          onClick={() => setActionModal({ type: 'approve', company: item })}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>

                        {/* Request More Info */}
                        <button
                          onClick={() => setActionModal({ type: 'request_info', company: item })}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition cursor-pointer"
                          title="Request More Information"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => setActionModal({ type: 'reject', company: item })}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer"
                          title="Reject Registration"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL REVIEW & AUDIT DETAIL MODAL */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  🏢
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedCompany.companyName}</h3>
                  <p className="text-xs font-mono text-purple-400">ID: {selectedCompany.companyCode} • Awaiting SuperAdmin Approval</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Authorized Owner</span>
                <span className="font-bold text-white mt-0.5 block">{selectedCompany.owner?.name}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Owner Email</span>
                <span className="font-mono text-slate-200 mt-0.5 block">{selectedCompany.owner?.email}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Contact Phone</span>
                <span className="font-mono text-slate-200 mt-0.5 block">{selectedCompany.phone}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Selected Subscription</span>
                <span className="font-bold text-purple-400 mt-0.5 block">{selectedCompany.selectedPlan}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Payment Verification</span>
                <span className="font-bold text-amber-400 mt-0.5 block capitalize">{selectedCompany.paymentStatus}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Registration Date</span>
                <span className="font-mono text-slate-200 mt-0.5 block">{formatDate(selectedCompany.registrationDate)}</span>
              </div>
            </div>

            {/* Uploaded Business Documents Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Uploaded Business & Pharmacy Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCompany.uploadedDocuments?.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">{doc.docType}</div>
                        <div className="text-[10px] text-slate-500">PDF Document • 2.4 MB</div>
                      </div>
                    </div>
                    <a
                      href={doc.docUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-lg transition"
                      title="Inspect Document"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Notes */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 font-semibold block">Review Notes & Status:</span>
              <p className="text-slate-300">{selectedCompany.notes}</p>
            </div>

            {/* Modal Bottom Review Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActionModal({ type: 'reject', company: selectedCompany });
                  }}
                  className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setActionModal({ type: 'request_info', company: selectedCompany });
                  }}
                  className="px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Request Info
                </button>
                <button
                  onClick={() => {
                    setActionModal({ type: 'approve', company: selectedCompany });
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-emerald-600/20 transition"
                >
                  Approve & Grant ERP Access
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRMATION / ACTION PROMPT MODAL */}
      {actionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {actionModal.type === 'approve' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {actionModal.type === 'reject' && <XCircle className="w-5 h-5 text-red-400" />}
              {actionModal.type === 'request_info' && <HelpCircle className="w-5 h-5 text-blue-400" />}
              {actionModal.type === 'approve' ? 'Approve Pharmacy Application' : actionModal.type === 'reject' ? 'Reject Pharmacy Application' : 'Request Additional Information'}
            </h3>

            <p className="text-xs text-slate-400">
              Company: <strong className="text-white">{actionModal.company?.companyName}</strong> ({actionModal.company?.companyCode})
            </p>

            <form onSubmit={handleExecuteReview} className="space-y-3">
              {actionModal.type === 'approve' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Plan Tier</label>
                  <select
                    value={assignedPlan}
                    onChange={(e) => setAssignedPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Starter">Starter (Single Branch)</option>
                    <option value="Professional">Professional (Up to 5 Branches)</option>
                    <option value="Enterprise">Enterprise (Unlimited Branches)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {actionModal.type === 'reject' ? 'Reason for Rejection *' : actionModal.type === 'request_info' ? 'Required Information / Document Details *' : 'Approval Remarks (Optional)'}
                </label>
                <textarea
                  required={actionModal.type !== 'approve'}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    actionModal.type === 'reject'
                      ? 'e.g. Pharmacy license expired or unverifiable business tax ID.'
                      : actionModal.type === 'request_info'
                      ? 'e.g. Please re-upload a clear scanned copy of your national health authority license.'
                      : 'Verified license and bank wire payment.'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 min-h-[90px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg ${
                    actionModal.type === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : actionModal.type === 'reject'
                      ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
