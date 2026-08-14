import useAuth from "../hooks/useAuth";


function ProfilePage() {
    const {
        user,
    } = useAuth();


    return (
        <section className="profile-page">
            <div className="profile-card">
                <p className="eyebrow">
                    YOUR PROFILE
                </p>

                <h1>
                    {user?.name}
                </h1>

                <p className="profile-email">
                    {user?.email}
                </p>

                <div className="profile-info">
                    <div>
                        <span>
                            User ID
                        </span>

                        <strong>
                            {user?.id}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Member since
                        </span>

                        <strong>
                            {user?.createdAt
                                ? new Date(
                                    user.createdAt
                                ).toLocaleDateString(
                                    "tr-TR"
                                )
                                : "-"}
                        </strong>
                    </div>
                </div>
            </div>
        </section>
    );
}


export default ProfilePage;