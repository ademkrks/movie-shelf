import CollectionPage from "../components/CollectionPage";

import {
    getFavorites,
    removeFavorite,
} from "../api/library.api";


function FavoritesPage() {
    return (
        <CollectionPage
            eyebrow="FAVORİLERİN"
            title="Favori Filmler"
            description="Sevdiğin ve koleksiyonunda tutmak istediğin filmler."
            emptyMessage="Filmleri favorilerine eklediğinde burada görünecekler."
            removeLabel="Favorilerden Kaldır"
            loadCollection={
                getFavorites
            }
            removeMovie={
                removeFavorite
            }
        />
    );
}


export default FavoritesPage;