import CollectionPage from "../components/CollectionPage";

import {
    getWatchlist,
    removeFromWatchlist,
} from "../api/library.api";


function WatchlistPage() {
    return (
        <CollectionPage
            eyebrow="İZLEME LİSTEN"
            title="İzleme Listesi"
            description="Bir sonraki film gecende izlemek için bekleyen filmler."
            emptyMessage="Filmleri izleme listene eklediğinde burada görünecekler."
            removeLabel="Listeden Kaldır"
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