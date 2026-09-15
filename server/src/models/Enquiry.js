import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    kind: {
      type: String,
      enum: ['general', 'private-dining', 'press', 'careers', 'large-party'],
      default: 'general',
    },
    message: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['new', 'replied', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('Enquiry', enquirySchema);
