const express = require("express");
const router = express.Router();

const favoriteController = require("../controllers/favorite.controller");
const auth = require("../middleware/auth");

// Favoriye film ekle
router.post(
    "/",
    auth,
    favoriteController.addFavorite
);

// Favorileri listele
router.get(
    "/",
    auth,
    favoriteController.getFavorites
);

// Favoriden kaldır
router.delete(
    "/:tmdbMovieId",
    auth,
    favoriteController.removeFavorite
);

module.exports = router;