const nodemailer = require("nodemailer");

const env = require("../config/env");
const AppError = require("../utils/AppError");


// SMTP bağlantısını oluşturur
const transporter = nodemailer.createTransport({
    host: env.emailHost,
    port: env.emailPort,
    secure: env.emailSecure,

    auth: {
        user: env.emailUser,
        pass: env.emailPass,
    },
});


// Şifre sıfırlama URL'sini oluşturur
const createPasswordResetUrl = (
    resetToken
) => {
    const resetUrl = new URL(
        "/reset-password",
        env.frontendUrl
    );

    resetUrl.searchParams.set(
        "token",
        resetToken
    );

    return resetUrl.toString();
};


// Şifre sıfırlama e-postası gönderir
const sendPasswordResetEmail = async (
    email,
    resetToken
) => {
    const resetUrl =
        createPasswordResetUrl(
            resetToken
        );

    try {
        await transporter.sendMail({
            from: env.emailFrom,
            to: email,

            subject:
                "MovieShelf Şifre Sıfırlama",

            text:
                "MovieShelf hesabınızın şifresini sıfırlamak için " +
                `aşağıdaki bağlantıyı kullanın:\n\n${resetUrl}\n\n` +
                "Bu bağlantı 15 dakika boyunca geçerlidir. " +
                "Bu isteği siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.",

            html: `
                <h2>
                    MovieShelf Şifre Sıfırlama
                </h2>

                <p>
                    Hesabınızın şifresini
                    sıfırlamak için aşağıdaki
                    bağlantıyı kullanın.
                </p>

                <p>
                    <a href="${resetUrl}">
                        Şifremi Sıfırla
                    </a>
                </p>

                <p>
                    Bu bağlantı 15 dakika
                    boyunca geçerlidir.
                </p>

                <p>
                    Bu isteği siz yapmadıysanız
                    bu e-postayı görmezden
                    gelebilirsiniz.
                </p>
            `,
        });
    } catch (error) {
        console.error(
            "Password reset email error:",
            error.message
        );

        throw new AppError(
            "Şifre sıfırlama e-postası gönderilemedi.",
            502
        );
    }
};


module.exports = {
    sendPasswordResetEmail,
};