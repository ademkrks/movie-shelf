const express = require('express');
const router = express.Router();

    router.get("/", (req,res)=>{
        res.json({
            message:"Movie Router Çalışıyor"
        });
    });
    module.exports = router;