-- CreateIndex
CREATE INDEX "Favorite_userId_createdAt_idx" ON "Favorite"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Rating_tmdbMovieId_createdAt_idx" ON "Rating"("tmdbMovieId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_tmdbMovieId_createdAt_idx" ON "Review"("tmdbMovieId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Watchlist_userId_createdAt_idx" ON "Watchlist"("userId", "createdAt" DESC);
