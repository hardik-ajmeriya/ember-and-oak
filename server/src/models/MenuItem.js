import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    course: {
      type: String,
      required: true,
      enum: ['snacks', 'starters', 'mains', 'sides', 'desserts', 'cheese'],
      index: true,
    },
    description: { type: String, required: true, maxlength: 400 },
    price: { type: Number, required: true, min: 0 },
    // The kitchen rewrites the menu as produce changes; `season` drives the filter.
    season: { type: String, enum: ['spring', 'summer', 'autumn', 'winter', 'year-round'], default: 'year-round' },
    dietary: [{ type: String, enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'contains-nuts'] }],
    pairing: { type: String, trim: true },
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

menuItemSchema.index({ course: 1, order: 1 });

export default mongoose.model('MenuItem', menuItemSchema);
