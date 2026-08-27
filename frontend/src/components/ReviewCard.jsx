function ReviewCard({
    review,
    currentUserId,
    isEditing,
    editContent,
    isSaving,
    isDeleting,
    onStartEdit,
    onCancelEdit,
    onEditContentChange,
    onSaveEdit,
    onDelete,
}) {
    const isOwner =
        review.user?.id ===
        currentUserId;


    const date =
        review.createdAt
            ? new Date(
                review.createdAt
            ).toLocaleDateString(
                "tr-TR",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }
            )
            : "";


    return (
        <article className="review-card">
            <div className="review-card-header">
                <div className="review-user">
                    <div className="review-avatar">
                        {review.user?.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "?"}
                    </div>

                    <div>
                        <strong>
                            {review.user
                                ?.name ||
                                "MovieShelf Kullanıcısı"}
                        </strong>

                        <span>
                            {date}
                        </span>
                    </div>
                </div>

                {isOwner &&
                    !isEditing && (
                        <div className="review-owner-actions">
                            <button
                                type="button"
                                onClick={
                                    onStartEdit
                                }
                            >
                                Düzenle
                            </button>

                            <button
                                type="button"
                                className="review-delete-link"
                                onClick={
                                    onDelete
                                }
                                disabled={
                                    isDeleting
                                }
                            >
                                {isDeleting
                                    ? "Siliniyor..."
                                    : "Sil"}
                            </button>
                        </div>
                    )}
            </div>

            {isEditing ? (
                <div className="review-edit-area">
                    <textarea
                        value={
                            editContent
                        }
                        onChange={(
                            event
                        ) =>
                            onEditContentChange(
                                event.target
                                    .value
                            )
                        }
                        maxLength="1000"
                        rows="5"
                    />

                    <div className="review-edit-footer">
                        <span>
                            {
                                editContent.length
                            }
                            /1000
                        </span>

                        <div>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    onCancelEdit
                                }
                                disabled={
                                    isSaving
                                }
                            >
                                İptal
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={
                                    onSaveEdit
                                }
                                disabled={
                                    isSaving
                                }
                            >
                                {isSaving
                                    ? "Kaydediliyor..."
                                    : "Kaydet"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="review-content">
                    {review.content}
                </p>
            )}
        </article>
    );
}


export default ReviewCard;