const express = require("express");
const router = express.Router();

const reviewController = require("../controllers/review.controller");
const auth = require("../middleware/auth");

// Yorum ekle
router.post(
    "/",
    auth,
    reviewController.addReview
);

// Filmin yorumlarını getir
router.get(
    "/movie/:tmdbMovieId",
    reviewController.getMovieReviews
);

// Yorumu güncelle
router.put(
    "/:id",
    auth,
    reviewController.updateReview
);

// Yorumu sil
router.delete(
    "/:id",
    auth,
    reviewController.deleteReview
);

module.exports = router;