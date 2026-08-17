import CollectionPage from "../components/CollectionPage";

import {
    getFavorites,
    removeFavorite,
} from "../api/library.api";


function FavoritesPage() {
    return (
        <CollectionPage
            eyebrow="YOUR FAVORITES"
            title="Favorite Movies"
            description="Movies you loved and want to keep close."
            emptyMessage="Add movies to your favorites and they will appear here."
            removeLabel="Remove Favorite"
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