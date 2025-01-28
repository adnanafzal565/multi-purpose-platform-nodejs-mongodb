function RightSidebar() {

    const [state, setState] = React.useState(globalState.state);

    React.useEffect(function () {
        globalState.listen(function (newState, updatedState) {
            setState(newState);
        });
    }, []);

    return (
        <>
            <aside className="sidebar static">
                <div className="widget">
                    <h4 className="widget-title">Pages</h4>
                    <ul className="naves">
                        <li>
                            <i className="fa fa-file"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/pages/my.html` }>My created</a>
                        </li>

                        <li>
                            <i className="fa fa-file"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/pages/my-followed.html` }>My followed</a>
                        </li>
                    </ul>
                </div>
            </aside>

            <aside className="sidebar static">
                <div className="widget">
                    <h4 className="widget-title">Groups</h4>
                    <ul className="naves">
                        <li>
                            <i className="fa fa-file"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/groups/my.html` }>My created</a>
                        </li>

                        <li>
                            <i className="fa fa-file"></i>&nbsp;
                            <a href={ `${ baseUrl }/sn/groups/my-joined.html` }>My joined</a>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    );
}

ReactDOM.createRoot(
    document.getElementById("right-sidebar-app")
).render(<RightSidebar />);