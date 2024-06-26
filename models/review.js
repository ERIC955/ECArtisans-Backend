const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
	{
		UserID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Users',
		},
		rate: {
			type: Number,
			require: [true, '請選擇評價'],
		},
		comment: {
			type: String,
		},
		createAt: {
			type: Date,
			default: Date.now,
			select: false,
		},
	},
	{ versionKey: false }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
