import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    kind: { type: String, enum: ['wine-dinner', 'chefs-table', 'masterclass', 'seasonal'], required: true },
    summary: { type: String, required: true, maxlength: 260 },
    description: { type: String, required: true },
    image: { type: String, required: true },
    startsAt: { type: Date, required: true, index: true },
    pricePerHead: { type: Number, required: true, min: 0 },
    seats: { type: Number, required: true, min: 1 },
    seatsTaken: { type: Number, default: 0 },
    host: { type: String, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

eventSchema.virtual('seatsLeft').get(function left() {
  return Math.max(this.seats - this.seatsTaken, 0);
});

export default mongoose.model('Event', eventSchema);
