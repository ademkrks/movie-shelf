const express = require("express");
const router = express.Router();

const ratingController = require("../controllers/rating.controller");
const auth = require("../middleware/auth");

// Filme puan ekle
router.post(
    "/",
    auth,
    ratingController.addRating
);

// Filmin puanlarını getir
router.get(
    "/movie/:tmdbMovieId",
    ratingController.getMovieRatings
);

// Puanı güncelle
router.put(
    "/:id",
    auth,
    ratingController.updateRating
);

// Puanı sil
router.delete(
    "/:id",
    auth,
    ratingController.deleteRating
);

module.exports = router;