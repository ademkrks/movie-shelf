import {
    Link,
} from "react-router";

import "../styles/not-found.css";


function NotFoundPage() {
    return (
        <section className="not-found-page">
            <div
                className="not-found-glow not-found-glow-one"
                aria-hidden="true"
            />

            <div
                className="not-found-glow not-found-glow-two"
                aria-hidden="true"
            />

            <div className="not-found-content">
                <div
                    className="not-found-symbol"
                    aria-hidden="true"
                >
                    <span>
                        404
                    </span>
                </div>

                <p className="eyebrow">
                    KATALOGDA KAYBOLDUN
                </p>

                <h1>
                    Bu sayfa final
                    kurguda yer almadı.
                </h1>

                <p className="not-found-description">
                    Aradığın sayfa mevcut
                    değil, taşınmış olabilir
                    veya artık kullanılamıyor.
                </p>

                <div className="not-found-actions">
                    <Link
                        to="/"
                        className="primary-button not-found-primary"
                    >
                        <span aria-hidden="true">
                            ←
                        </span>

                        Keşfe Dön
                    </Link>
                </div>

                <div
                    className="not-found-meta"
                    aria-hidden="true"
                >
                    <span>
                        MovieShelf
                    </span>

                    <span className="not-found-meta-dot" />

                    <span>
                        Hata 404
                    </span>
                </div>
            </div>
        </section>
    );
}


export default NotFoundPage;