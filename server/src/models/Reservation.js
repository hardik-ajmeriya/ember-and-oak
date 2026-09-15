import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    partySize: { type: Number, required: true, min: 1, max: 12 },
    // Stored as a real Date so range queries and index scans work.
    startsAt: { type: Date, required: true, index: true },
    durationMins: { type: Number, default: 105 },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'DiningTable', required: true },
    occasion: {
      type: String,
      enum: ['none', 'birthday', 'anniversary', 'business', 'celebration'],
      default: 'none',
    },
    notes: { type: String, maxlength: 500 },
    dietary: { type: String, maxlength: 300 },
    status: {
      type: String,
      enum: ['confirmed', 'seated', 'completed', 'cancelled', 'no-show'],
      default: 'confirmed',
      index: true,
    },
    reference: { type: String, unique: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reservationSchema.virtual('endsAt').get(function endsAt() {
  return new Date(this.startsAt.getTime() + this.durationMins * 60000);
});

reservationSchema.index({ startsAt: 1, status: 1 });

reservationSchema.pre('validate', function ref(next) {
  if (!this.reference) {
    this.reference = `EO-${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 4)
      .toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Reservation', reservationSchema);
