import mongoose from 'mongoose';

const todaysOfferSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      validate: {
        validator: (arr) => arr.length <= 4,
        message: 'Maximum 4 products allowed.',
      },
      default: [],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

const TodaysOffer = mongoose.model('TodaysOffer', todaysOfferSchema, 'todays_offers');

export default TodaysOffer;
