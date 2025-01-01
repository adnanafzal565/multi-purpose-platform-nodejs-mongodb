function ProfileLeftMenu() {
    return (
        <ul className="list-group profile-left-menu">
            <li className="list-group-item">
                <a href={ `${ baseUrl }/profile.html` }>Profile</a>
            </li>

            <li className="list-group-item">
                <a href={ `${ baseUrl }/change-password.html` }>Change password</a>
            </li>
        </ul>
    );
}

ReactDOM.createRoot(
    document.getElementById("profile-left-menu")
).render(<ProfileLeftMenu />);