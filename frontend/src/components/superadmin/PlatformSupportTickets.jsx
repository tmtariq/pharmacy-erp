import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  MessageSquare, Search, RefreshCw, Eye, Tag, AlertCircle,
  Clock, ShieldAlert, User, CheckCircle2, CornerDownLeft, Plus
} from 'lucide-react';
import { useToast } from '../ui';

export default function PlatformSupportTickets() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Ticket Dialog State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Status & Priority Updates State
  const [updatingProperties, setUpdatingProperties] = useState(false);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined
      };
      const res = await API.get('/saas-admin/tickets', {
        headers: getAdminHeaders(),
        params
      });
      setTickets(res.data || []);
    } catch {
      toast.error('Failed to load platform support tickets');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, categoryFilter, priorityFilter, statusFilter, search, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSelectTicket = async (ticket) => {
    try {
      const res = await API.get(`/saas-admin/tickets/${ticket.ticketId}`, { headers: getAdminHeaders() });
      setSelectedTicket(res.data);
    } catch {
      toast.error('Failed to load support ticket conversation');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await API.post(`/saas-admin/tickets/${selectedTicket.ticketId}/messages`, {
        message: replyMessage,
        isInternalNote
      }, { headers: getAdminHeaders() });
      setSelectedTicket(res.data);
      setReplyMessage('');
      toast.success(isInternalNote ? 'Internal note added' : 'Reply sent to company contact');
      fetchTickets();
    } catch {
      toast.error('Failed to add message to conversation');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpdateProperties = async (updates) => {
    setUpdatingProperties(true);
    try {
      const res = await API.put(`/saas-admin/tickets/${selectedTicket.ticketId}`, updates, { headers: getAdminHeaders() });
      setSelectedTicket(res.data);
      toast.success('Ticket properties updated');
      fetchTickets();
    } catch {
      toast.error('Failed to update ticket properties');
    } finally {
      setUpdatingProperties(false);
    }
  };

  const getPriorityBadge = (p) => {
    const maps = {
      Low: 'bg-slate-800 text-slate-400 border-slate-700',
      Medium: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      High: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      Critical: 'bg-red-500/15 text-red-300 border-red-500/30 font-black animate-pulse'
    };
    return maps[p] || maps.Medium;
  };

  const getStatusBadge = (s) => {
    const maps = {
      'Open': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      'In Progress': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      'Waiting for Customer': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      'Resolved': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      'Closed': 'bg-slate-850 text-slate-500 border-slate-800'
    };
    return maps[s] || maps.Open;
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              SaaS Cross-Company Customer Support Desk
            </h3>
            <p className="text-xs text-slate-400">
              Manage billing issues, bug reports, and ERP operational queries filed by tenant pharmacies.
            </p>
          </div>

          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Ticket ID, Company, Title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-550 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All Ticket Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for Customer">Waiting for Customer</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All Ticket Categories</option>
            <option value="Billing issue">Billing issue</option>
            <option value="Payment issue">Payment issue</option>
            <option value="Login issue">Login issue</option>
            <option value="ERP issue">ERP issue</option>
            <option value="Feature request">Feature request</option>
            <option value="Bug report">Bug report</option>
            <option value="Subscription request">Subscription request</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Tickets List */}
        <div className="lg:col-span-2 space-y-3.5">
          {loading ? (
            <div className="bg-slate-900/60 p-12 text-center rounded-3xl border border-slate-800 text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-400 mb-2" />
              Fetching support desk dispatches...
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-slate-900/60 p-12 text-center rounded-3xl border border-slate-800 text-slate-500 text-xs">
              No active customer support tickets match your active filter scope.
            </div>
          ) : (
            tickets.map(ticket => (
              <div
                key={ticket._id}
                onClick={() => handleSelectTicket(ticket)}
                className={`p-5 rounded-3xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                  selectedTicket?.ticketId === ticket.ticketId
                    ? 'bg-slate-900 border-purple-500/40 shadow-lg shadow-purple-950/20'
                    : 'bg-slate-900/60 hover:bg-slate-800/20 border-slate-800/80'
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-400">{ticket.ticketId}</span>
                    <span className="px-2 py-0.2 rounded-full border text-[9px] font-bold uppercase bg-slate-950 text-slate-300 border-slate-800">
                      {ticket.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs truncate max-w-[320px]">{ticket.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="font-semibold">{ticket.companyName} ({ticket.companyCode})</span>
                    <span>•</span>
                    <span>Last updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 1 Column: Active Conversation Feed */}
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md max-h-[640px] flex flex-col justify-between">
          {!selectedTicket ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 text-slate-700 mb-2.5" />
              Select a customer ticket from the directory list to process communication and resolve issues.
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full space-y-4">
              
              {/* Conversation Top Header */}
              <div className="border-b border-slate-850 pb-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono font-bold text-indigo-400">{selectedTicket.ticketId}</span>
                  <span className={`px-2 py-0.2 rounded-full border font-bold ${getPriorityBadge(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs mt-1">{selectedTicket.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Contact: {selectedTicket.companyName}</p>

                {/* Status Controls */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-850 text-[10px]">
                  <select
                    disabled={updatingProperties}
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateProperties({ status: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-semibold outline-none"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for Customer">Waiting for Customer</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <select
                    disabled={updatingProperties}
                    value={selectedTicket.priority}
                    onChange={(e) => handleUpdateProperties({ priority: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-semibold outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs max-h-[320px]">
                {selectedTicket.conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border ${
                      msg.isInternalNote
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                        : msg.senderRole.includes('Admin')
                        ? 'bg-slate-950 border-slate-850 text-slate-200'
                        : 'bg-purple-950/20 border-purple-500/20 text-purple-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1 border-b border-slate-800/40 pb-1">
                      <span>{msg.senderName} ({msg.senderRole})</span>
                      {msg.isInternalNote && <span className="text-amber-400 uppercase text-[8px] font-black">Internal Note</span>}
                    </div>
                    <p className="leading-relaxed">{msg.message}</p>
                    <span className="text-[9px] text-slate-500 block text-right mt-1 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chat Reply Form */}
              <form onSubmit={handlePostReply} className="border-t border-slate-850 pt-3 space-y-2">
                <textarea
                  required
                  rows={2}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={isInternalNote ? 'Add internal support notes (hidden from client)...' : 'Type reply to the client owner...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-550 outline-none focus:border-indigo-500"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400 font-bold">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-slate-800 text-purple-600 focus:ring-0 bg-slate-950"
                    />
                    Add as Internal Note
                  </label>

                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 transition cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    {submittingReply ? 'Posting...' : 'Post Message'}
                  </button>
                </div>
              </form>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
