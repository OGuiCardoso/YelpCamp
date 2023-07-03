const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

const catchAsync = require('../util/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createNewReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;