const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campground');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const catchAsync = require('../util/catchAsync');

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createNewCampground));


router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showDetails))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router