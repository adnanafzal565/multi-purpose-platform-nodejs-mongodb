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
        if (accessToken) {
            try {
                const response = await axios.post(
                    apiUrl + "/me",
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

                    const userImgs = document.querySelectorAll(".user-img");
                    for (let a = 0; a < userImgs.length; a++) {
                        userImgs[a].setAttribute("src", user.profileImage);
                    }

                    if (newMessages > 0) {
                        document.getElementById("message-notification-badge").innerHTML = newMessages
                    }
                } else {
                    // swal.fire("Error", response.data.message, "error")
                }
            } catch (exp) {
                // swal.fire("Error", exp.message, "error")
            }
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
                globalState.setState({
                    user: null
                })
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
            <div className="responsive-header">
                <div className="mh-head first Sticky">
                    <span className="mh-text">
                        <a href={ `${ baseUrl }/sn` } title=""><img src={ `${ baseUrl }/public/sn/images/logo2.png` } alt="" /></a>
                    </span>
                </div>
                <div className="mh-head second">
                    <form className="mh-form">
                        <input placeholder="search" />
                        <a href="#/" className="fa fa-search"></a>
                    </form>
                </div>
                <nav id="menu" className="res-menu">
                    <ul>
                        <li><a href={ `${ baseUrl }` } title="">Home</a></li>
                    </ul>
                </nav>
            </div>
            
            <div className="topbar stick">
                <div className="logo">
                    <a title="" href={ `${ baseUrl }/sn` }>
                        <img src={ `${ baseUrl }/public/sn/images/logo.png` }
                            onError={ function () {
                                event.target.src = baseUrl + '/public/img/user-placeholder.png';
                            } } />
                    </a>
                </div>
                
                <div className="top-area">
                    <ul className="main-menu">
                        <li><a href={ `${ baseUrl }` } title="">Home</a></li>

                        { state.user != null && (
                            <>
                                <li><a href={ `${ baseUrl }/sn/pages/index.html` }>Pages</a></li>
                            </>
                        ) }
                    </ul>
                    <ul className="setting-area">
                        
                    </ul>
                    <div className="user-img">
                        { state.user != null && (
                            <a href={ `${ baseUrl }/sn/profile.html?id=${ state.user._id }` }>
                                <img src={ state.user.profileImage }
                                    alt={ state.user.name }
                                    onError={ function () {
                                        event.target.src = baseUrl + '/public/img/user-placeholder.png';
                                    } }
                                    className="user-profile-header" />
                            </a>
                        ) }
                    </div>
                </div>
            </div>

            {/*<div className="modal fade" id="media-modal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Media</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body">
                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="uploaded-tab" data-bs-toggle="tab" data-bs-target="#uploaded-media" type="button" role="tab" aria-controls="home" aria-selected="true">Uploaded</button>
                                </li>

                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="upload-tab" data-bs-toggle="tab" data-bs-target="#upload-media" type="button" role="tab" aria-controls="upload" aria-selected="false">Upload</button>
                                </li>
                            </ul>

                            <div class="tab-content" id="media-tab-content">
                                <div class="tab-pane fade show active" id="uploaded-media" role="tabpanel" aria-labelledby="uploaded-tab">
                                    <p className="loading">Loading...</p>
                                </div>

                                <div class="tab-pane fade" id="upload-media" role="tabpanel" aria-labelledby="upload-tab">
                                    <form style="margin-top: 30px;">
                                        <div class="form-group">   
                                            <input type="text" name="title" required />
                                            <label class="control-label">Title</label>
                                            <i class="mtrl-select"></i>
                                        </div>

                                        <div class="form-group">   
                                            <input type="text" name="alt" required />
                                            <label class="control-label">Alt</label>
                                            <i class="mtrl-select"></i>
                                        </div>

                                        <div class="form-group">   
                                            <input type="text" name="caption" required />
                                            <label class="control-label">Caption</label>
                                            <i class="mtrl-select"></i>
                                        </div>

                                        <div class="form-group">   
                                            <select name="type" class="form-control" required>
                                                <option value="private">Private</option>
                                                <option value="public">Public</option>
                                            </select>
                                            <label class="control-label">Type</label>
                                            <i class="mtrl-select"></i>
                                        </div>

                                        <div class="form-group">   
                                            <input type="file" name="file" required />
                                            <label class="control-label">File</label>
                                            <i class="mtrl-select"></i>
                                        </div>

                                        <div class="form-group">
                                            <label>File</label>
                                            <input text="file" name="file" class="form-control" required />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Select</button>
                        </div>
                    </div>
                </div>
            </div>*/}

            <div className="modal fade" id="post-sharers-modal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Shared by</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body">
                            <p className="loading">Loading...</p>
                            <div className="content"></div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            {/*<button type="button" className="btn btn-primary">Save changes</button>*/}
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="post-likers-modal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Post Likers</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body">
                            
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            {/*<button type="button" className="btn btn-primary">Save changes</button>*/}
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="post-comments-modal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Post Comments</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body">
                            <p className="loading">Loading...</p>
                            <div className="content"></div>
                            <button type="button" className="btn-view btn-load-more"
                                onClick={ function () {
                                    postCommentsPage++;
                                    postComments(commentsPostId, postCommentsPage);
                                } }
                                id="btn-load-more-comments">Load More</button>
                        </div>

                        <div className="modal-footer justify-content-left">
                            <form className="display-contents" onSubmit={ function () {
                                event.preventDefault();
                                postComment();
                            } } id="form-post-comment">
                                <div className="row width-100">
                                    <div className="col-md-10">
                                        <input type="text" name="comment" placeholder="Enter comment here..." className="form-control" required />
                                    </div>

                                    <div className="col-md-2">
                                        <input type="submit" name="submit" className="btn btn-primary" value="Comment" />
                                    </div>
                                </div>
                            </form>
                            {/*<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary">Save changes</button>*/}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ReactDOM.createRoot(
    document.getElementById("header-app")
).render(<Header />)