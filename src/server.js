//app.js dosyasındaki express uygulamasını içe aktarır
const app = require('./app');
//sunucunun çalışacağı port
const PORT =3000;
    //sunucuyu başlatır
    app.listen(PORT,()=>{
        console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
    });