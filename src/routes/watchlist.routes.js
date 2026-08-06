const express = require("express");
const router = express.Router();

const watchlistController = require("../controllers/watchlist.controller");
const auth = require("../middleware/auth");

// İzleme listesine ekle
router.post(
    "/",
    auth,
    watchlistController.addWatchlist
);

// İzleme listesini getir
router.get(
    "/",
    auth,
    watchlistController.getWatchlist
);

// İzleme listesinden kaldır
router.delete(
    "/:tmdbMovieId",
    auth,
    watchlistController.removeWatchlist
);

module.exports = router;