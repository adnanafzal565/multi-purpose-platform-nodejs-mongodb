function Sidebar() {
    const [state, setState] = React.useState(globalState.state);

    React.useEffect(function () {
        globalState.listen(function (newState, updatedState) {
            setState(newState)

            // if (typeof updatedState.user !== "undefined") {
            //     onInit()
            // }
        });
    });

    return (
        <>
            <aside className="sidebar static">
                <div className="widget">
                    <h4 className="widget-title">Shortcuts</h4>
                    <ul className="naves">
                        <li>
                            <i className="fa fa-file"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/pages/create.html` }>Create Page</a>
                        </li>

                        <li>
                            <i className="fa fa-file"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/groups/create.html` }>Create Group</a>
                        </li>

                        <li>
                            <i className="fa fa-bell"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/notifications.html` }>Notifications ({ state.user?.unreadNotificationsCount || 0 })</a>
                        </li>

                        <li>
                            <i className="fa fa-users"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/friends.html` }>Friends</a>
                        </li>

                        <li>
                            <i className="fa fa-message"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/chat.html` }>Chats</a>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    );
}

ReactDOM.createRoot(
    document.getElementById("sidebar-app")
).render(<Sidebar />);