import mongoose from 'mongoose';

const aboutUsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      trim: true,
      default: '',
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    mapUrl: {
      type: String,
      trim: true,
      default: '',
    },
    businessType: {
      type: String,
      trim: true,
      default: '',
    },
    workingHours: {
      regular: { type: String, trim: true, default: '' },
      friday:  { type: String, trim: true, default: '' },
    },
    highlights: {
      type: [String],
      default: [],
    },
    products: {
      type: [String],
      default: [],
    },
    repairServices: {
      type: [String],
      default: [],
    },
    paymentOptions: {
      type: [String],
      default: [],
    },
    emiInfo: {
      available:   { type: Boolean, default: false },
      description: { type: String, trim: true, default: '' },
    },
    contacts: {
      type: [
        {
          name:      { type: String, trim: true, default: '' },
          role:      { type: String, trim: true, default: '' },
          call:      { type: String, trim: true, default: '' },
          whatsapp:  { type: String, trim: true, default: '' },
        },
      ],
      default: [],
    },
    galleryImages: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const AboutUs = mongoose.model('AboutUs', aboutUsSchema, 'about_us');

export default AboutUs;
