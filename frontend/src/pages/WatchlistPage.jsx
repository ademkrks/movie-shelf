import CollectionPage from "../components/CollectionPage";

import {
    getWatchlist,
    removeFromWatchlist,
} from "../api/library.api";


function WatchlistPage() {
    return (
        <CollectionPage
            eyebrow="YOUR WATCHLIST"
            title="Watchlist"
            description="Movies waiting for your next movie night."
            emptyMessage="Add movies to your watchlist and they will appear here."
            removeLabel="Remove"
            loadCollection={
                getWatchlist
            }
            removeMovie={
                removeFromWatchlist
            }
        />
    );
}


export default WatchlistPage;