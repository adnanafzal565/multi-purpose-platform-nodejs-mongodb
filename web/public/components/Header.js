function Header() {

    const [state, setState] = React.useState(globalState.state)

    async function onInit() {
        // if (newMessages > 0) {
        //     document.getElementById("message-notification-badge").innerHTML = newMessages
        // }

        // globalState.setState({
        //     user: window.userObject
        // })

	const accessToken = localStorage.getItem(accessTokenKey)
	if (accessToken || isDemo) {
	    try {
            const response = await axios.post(
                isDemo ? (baseUrl + "/demo-data/user.json") : (apiUrl + "/me"),
                null,
                {
                    headers: {
                        Authorization: "Bearer " + accessToken
                    }
                }
            )

            if (response.data.status == "success") {
                const user = response.data.user
                const newMessages = response.data.new_messages

                globalState.setState({
                    user: user
                })

                // if (newMessages > 0) {
                //     document.getElementById("message-notification-badge").innerHTML = newMessages
                // }
            } else {
                // swal.fire("Error", response.data.message, "error")
            }
	    } catch (exp) {
		// swal.fire("Error", exp.message, "error")
	    }
	}

        if (typeof initApp !== "undefined") {
            initApp();
        }
    }

    React.useEffect(function () {
        globalState.listen(function (newState, updatedState) {
            setState(newState)

            // if (typeof updatedState.user !== "undefined") {
            //     onInit()
            // }
        })

        onInit()
    }, [])

    async function logout() {
        try {
            const response = await axios.post(
                apiUrl + "/logout",
                null,
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                    }
                }
            )

            if (response.data.status == "success") {
                // globalState.setState({
                //     user: null
                // })
                localStorage.removeItem(accessTokenKey)
                window.location.reload()
            } else {
                swal.fire("Error", response.data.message, "error")
            }
        } catch (exp) {
            swal.fire("Error", exp.message, "error")
        }
    }

    return (
        <>
            <div className="container">
                <a className="navbar-brand" href={ baseUrl }>{ appName }</a>
                
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href={ baseUrl }>Home</a>
                        </li>

                        { state.user == null ? (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link" href={ `${ baseUrl }/login.html` }>Login</a>
                                </li>

                                <li className="nav-item">
                                    <a className="nav-link" href={ `${ baseUrl }/register.html` }>Register</a>
                                </li>
                            </>
                        ) : (
                            <>
                                <ul className="navbar-nav">
                                    <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            { state.user.name }
                                        </a>

                                        <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                            <li><a className="dropdown-item" href={ `${ baseUrl }/profile.html` }>Profile</a></li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li><a className="dropdown-item" onClick={ function () {
                                                event.preventDefault()
                                                logout()
                                            } } href="#">Logout</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </>
                        ) }

                        <li className="nav-item">
                            <a className="nav-link" href={ `${ baseUrl }/media/index.html` }>Media</a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href={ `${ baseUrl }/sn/index.html` }>Social Network</a>
                        </li>

                        <li className="nav-item">
                            <ul className="navbar-nav">
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        Job Portal
                                    </a>

                                    <ul className="dropdown-menu">
                                        <li><a className="dropdown-item" href={ `${ baseUrl }/job-portal/index.html` }>Home</a></li>
                                        <li><a className="dropdown-item" href={ `${ baseUrl }/job-portal/create.html` }>Create Job</a></li>
                                        <li><a className="dropdown-item" href={ `${ baseUrl }/job-portal/my.html` }>My Jobs</a></li>
                                        <li><a className="dropdown-item" href={ `${ baseUrl }/job-portal/applied.html` }>My Applied</a></li>
                                        <li><a className="dropdown-item" href={ `${ baseUrl }/job-portal/cv-manager.html` }>CV Manager</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href={ `${ baseUrl }/blogs` }>Blogs</a>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

ReactDOM.createRoot(
    document.getElementById("header-app")
).render(<Header />)
