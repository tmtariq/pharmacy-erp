import mongoose from 'mongoose';

const saasSupportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true, index: true },
    companyName: { type: String, required: true },
    companyCode: { type: String, required: true },
    category: {
      type: String,
      enum: ['Billing issue', 'Payment issue', 'Login issue', 'ERP issue', 'Feature request', 'Bug report', 'Subscription request'],
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium', index: true },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'],
      default: 'Open',
      index: true
    },
    assignedTo: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin', default: null },
      name: { type: String, default: 'Unassigned' }
    },
    conversation: [
      {
        senderName: { type: String, required: true },
        senderRole: { type: String, required: true }, // e.g. 'Owner', 'Super Admin', 'Support Admin'
        message: { type: String, required: true },
        isInternalNote: { type: Boolean, default: false }, // Notes hidden from customer
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

saasSupportTicketSchema.index({ createdAt: -1 });

export default mongoose.model('SaasSupportTicket', saasSupportTicketSchema);
