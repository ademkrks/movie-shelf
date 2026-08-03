function merhaba(isim){
    return `merhaba ${isim}`;
}
    console.log(merhaba("Ali"));

const express = require("express");
const app = express();
const PORT = 3000;

    app.get("/", (req,res)=>{
        res.send("Film Kütüphanesine Hoşgeldiniz");
    });
    app.listen(PORT, ()=>{
        console.log(`Server ${PORT} portunda çalışıyor`);
    });
    app.get("/about", (req,res)=>{
        res.send("Film Kütüphanesi Hakkında");
    });