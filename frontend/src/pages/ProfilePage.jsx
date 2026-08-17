import {
    useState,
} from "react";

import {
    useNavigate,
} from "react-router";

import useAuth from "../hooks/useAuth";

import "../styles/profile.css";


function ProfilePage() {
    const navigate =
        useNavigate();


    const {
        user,
        updateProfile,
        changePassword,
    } = useAuth();


    const [
        profileForm,
        setProfileForm,
    ] = useState(() => ({
        name:
            user?.name || "",
        email:
            user?.email || "",
    }));


    const [
        passwordForm,
        setPasswordForm,
    ] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });


    const [
        profileError,
        setProfileError,
    ] = useState("");

    const [
        profileSuccess,
        setProfileSuccess,
    ] = useState("");

    const [
        passwordError,
        setPasswordError,
    ] = useState("");


    const [
        isProfileSubmitting,
        setIsProfileSubmitting,
    ] = useState(false);

    const [
        isPasswordSubmitting,
        setIsPasswordSubmitting,
    ] = useState(false);


    const handleProfileChange =
        (event) => {
            const {
                name,
                value,
            } = event.target;


            setProfileForm(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );
        };


    const handlePasswordChange =
        (event) => {
            const {
                name,
                value,
            } = event.target;


            setPasswordForm(
                (current) => ({
                    ...current,
                    [name]: value,
                })
            );
        };


    const handleProfileSubmit =
        async (event) => {
            event.preventDefault();

            setProfileError("");
            setProfileSuccess("");


            const name =
                profileForm.name.trim();

            const email =
                profileForm.email
                    .trim()
                    .toLowerCase();


            if (!name) {
                setProfileError(
                    "Name cannot be empty."
                );

                return;
            }


            if (name.length > 100) {
                setProfileError(
                    "Name can be at most 100 characters."
                );

                return;
            }


            if (!email) {
                setProfileError(
                    "Email cannot be empty."
                );

                return;
            }


            if (email.length > 255) {
                setProfileError(
                    "Email is too long."
                );

                return;
            }


            setIsProfileSubmitting(
                true
            );


            try {
                const result =
                    await updateProfile({
                        name,
                        email,
                    });


                setProfileForm({
                    name:
                        result.data.name,
                    email:
                        result.data.email,
                });


                setProfileSuccess(
                    result.message ||
                    "Profile updated successfully."
                );
            } catch (requestError) {
                setProfileError(
                    requestError.message
                );
            } finally {
                setIsProfileSubmitting(
                    false
                );
            }
        };


    const handlePasswordSubmit =
        async (event) => {
            event.preventDefault();

            setPasswordError("");


            const {
                currentPassword,
                newPassword,
                confirmPassword,
            } = passwordForm;


            if (!currentPassword) {
                setPasswordError(
                    "Enter your current password."
                );

                return;
            }


            if (newPassword.length < 8) {
                setPasswordError(
                    "New password must be at least 8 characters."
                );

                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {
                setPasswordError(
                    "New passwords do not match."
                );

                return;
            }


            if (
                currentPassword ===
                newPassword
            ) {
                setPasswordError(
                    "New password must be different from your current password."
                );

                return;
            }


            setIsPasswordSubmitting(
                true
            );


            try {
                const result =
                    await changePassword({
                        currentPassword,
                        newPassword,
                    });


                navigate(
                    "/login",
                    {
                        replace: true,

                        state: {
                            message:
                                result.message ||
                                "Password changed successfully. Please sign in again.",
                        },
                    }
                );
            } catch (requestError) {
                setPasswordError(
                    requestError.message
                );

                setIsPasswordSubmitting(
                    false
                );
            }
        };


    return (
        <section className="account-page">
            <div className="account-header">
                <div>
                    <p className="eyebrow">
                        ACCOUNT
                    </p>

                    <h1>
                        Profile & Security
                    </h1>

                    <p>
                        Manage your personal
                        information and account
                        security.
                    </p>
                </div>

                <div className="account-identity">
                    <div className="account-avatar">
                        {user?.name
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"}
                    </div>

                    <div>
                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            {user?.email}
                        </span>
                    </div>
                </div>
            </div>


            <div className="account-summary">
                <div>
                    <span>
                        User ID
                    </span>

                    <strong>
                        #{user?.id}
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


            <div className="account-grid">
                <article className="account-card">
                    <div className="account-card-header">
                        <div>
                            <p className="eyebrow">
                                PROFILE
                            </p>

                            <h2>
                                Personal information
                            </h2>
                        </div>

                        <p>
                            Update the name and
                            email associated with
                            your MovieShelf account.
                        </p>
                    </div>


                    {profileSuccess && (
                        <div className="form-success">
                            {
                                profileSuccess
                            }
                        </div>
                    )}


                    {profileError && (
                        <div className="form-error">
                            {
                                profileError
                            }
                        </div>
                    )}


                    <form
                        className="account-form"
                        onSubmit={
                            handleProfileSubmit
                        }
                    >
                        <label
                            className="form-field"
                            htmlFor="profile-name"
                        >
                            <span>
                                Name
                            </span>

                            <input
                                id="profile-name"
                                name="name"
                                type="text"
                                value={
                                    profileForm.name
                                }
                                onChange={
                                    handleProfileChange
                                }
                                maxLength={100}
                                autoComplete="name"
                                required
                            />
                        </label>


                        <label
                            className="form-field"
                            htmlFor="profile-email"
                        >
                            <span>
                                Email
                            </span>

                            <input
                                id="profile-email"
                                name="email"
                                type="email"
                                value={
                                    profileForm.email
                                }
                                onChange={
                                    handleProfileChange
                                }
                                maxLength={255}
                                autoComplete="email"
                                required
                            />
                        </label>


                        <button
                            type="submit"
                            className="primary-button account-submit-button"
                            disabled={
                                isProfileSubmitting
                            }
                        >
                            {isProfileSubmitting
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </form>
                </article>


                <article className="account-card account-security-card">
                    <div className="account-card-header">
                        <div>
                            <p className="eyebrow">
                                SECURITY
                            </p>

                            <h2>
                                Change password
                            </h2>
                        </div>

                        <p>
                            Changing your password
                            signs out all previously
                            issued sessions.
                        </p>
                    </div>


                    {passwordError && (
                        <div className="form-error">
                            {
                                passwordError
                            }
                        </div>
                    )}


                    <form
                        className="account-form"
                        onSubmit={
                            handlePasswordSubmit
                        }
                    >
                        <label
                            className="form-field"
                            htmlFor="current-password"
                        >
                            <span>
                                Current password
                            </span>

                            <input
                                id="current-password"
                                name="currentPassword"
                                type="password"
                                value={
                                    passwordForm
                                        .currentPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                autoComplete="current-password"
                                required
                            />
                        </label>


                        <label
                            className="form-field"
                            htmlFor="new-password"
                        >
                            <span>
                                New password
                            </span>

                            <input
                                id="new-password"
                                name="newPassword"
                                type="password"
                                value={
                                    passwordForm
                                        .newPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />

                            <small>
                                Minimum 8 characters.
                            </small>
                        </label>


                        <label
                            className="form-field"
                            htmlFor="confirm-password"
                        >
                            <span>
                                Confirm new password
                            </span>

                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                value={
                                    passwordForm
                                        .confirmPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                minLength={8}
                                autoComplete="new-password"
                                required
                            />
                        </label>


                        <button
                            type="submit"
                            className="primary-button account-submit-button"
                            disabled={
                                isPasswordSubmitting
                            }
                        >
                            {isPasswordSubmitting
                                ? "Changing Password..."
                                : "Change Password"}
                        </button>
                    </form>
                </article>
            </div>
        </section>
    );
}


export default ProfilePage;