function RightSidebar() {

    const [state, setState] = React.useState(globalState.state);

    React.useEffect(function () {
        globalState.listen(function (newState, updatedState) {
            setState(newState);
        });
    }, []);

    return (
        <>
            { state.user != null && (
                <aside className="sidebar static">
                    <div className="widget">
                        <h4 className="widget-title">My Account</h4>
                        <ul className="naves">
                            <li>
                                <i className="fa fa-file"></i>&nbsp;
                                <a href={ `${ baseUrl }/sn/pages/my.html` }>My Pages</a>
                            </li>

                            <li>
                                <i className="fa fa-file"></i>&nbsp;
                                <a href={ `${ baseUrl }/sn/pages/my-followed.html` }>Following Pages</a>
                            </li>
                        </ul>
                    </div>
                </aside>
            ) }
        </>
    );
}

ReactDOM.createRoot(
    document.getElementById("right-sidebar-app")
).render(<RightSidebar />);