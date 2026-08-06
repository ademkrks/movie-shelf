const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const userController = require("../controllers/user.controller");

// Profil
router.get("/me", auth, userController.getProfile);

module.exports = router;