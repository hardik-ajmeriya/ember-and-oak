import mongoose from 'mongoose';

/**
 * The physical room. Reservations are matched against these, so changing the
 * floor plan here immediately changes what the booking widget offers.
 */
const diningTableSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true },
    seats: { type: Number, required: true, min: 1, max: 14 },
    zone: {
      type: String,
      required: true,
      enum: ['main-room', 'window', 'counter', 'mezzanine', 'private'],
    },
    combinable: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('DiningTable', diningTableSchema);
