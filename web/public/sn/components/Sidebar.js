function Sidebar() {
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
                    </ul>
                </div>
            </aside>
        </>
    );
}

ReactDOM.createRoot(
    document.getElementById("sidebar-app")
).render(<Sidebar />);