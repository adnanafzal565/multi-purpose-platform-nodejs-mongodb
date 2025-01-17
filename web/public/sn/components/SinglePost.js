function SinglePost({ post }) {

    const [image, setImage] = React.useState(post.user.profileImage);
    const [name, setName] = React.useState(post.user.name);
    const [href, setHref] = React.useState(baseUrl + "/sn/profile.html?id=" + post.user._id);
    const [state, setState] = React.useState(globalState.state);

    React.useEffect(function () {
        if (typeof post.page !== "undefined") {
            setImage(post.page.image);
            setName(post.page.name);
            setHref(baseUrl + "/sn/pages/detail.html?id=" + post.page._id);
        }

        globalState.listen(function (newState, updatedState) {
            setState(newState);
        });
    }, []);

    async function toggleLike(post) {
        const formData = new FormData();
        formData.append("_id", post._id);

        try {
            const response = await axios.post(
                apiUrl + "/sn/posts/toggle-like",
                formData,
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                    }
                }
            )

            if (response.data.status == "success") {
                const tempPosts = globalState.state.posts;
                for (let a = 0; a < tempPosts.length; a++) {
                    if (tempPosts[a]._id == post._id) {
                        tempPosts[a].hasLiked = !tempPosts[a].hasLiked;

                        if (tempPosts[a].hasLiked) {
                            tempPosts[a].likes++;
                        } else {
                            tempPosts[a].likes--;
                        }
                        break;
                    }
                }
                globalState.setState({
                    posts: tempPosts
                });
            } else {
                swal.fire("Error", response.data.message, "error")
            }
        } catch (exp) {
            // swal.fire("Error", exp.message, "error")
        }
    }

    function isMyPost() {
        let flag = false;
        if (state.user != null && state.user._id == post.user._id) {
            flag = true;
        }
        return flag;
    }

    function isMeGroupAdmin() {
        let flag = false;
        if (state.user != null && typeof post.group !== "undefined" && state.user._id == post.group.userId) {
            flag = true;
        }
        return flag;
    }

    return (
        <div data-post-id={ post._id } className="central-meta item">
            <div className="user-post">
                <div className="friend-info">
                    <div className="row">
                        <div className="col-md-2">
                            <figure>
                                <img src={ image }
                                    onError={ function () {
                                        event.target.src = baseUrl + "/public/img/user-placeholder.png";
                                    } }
                                    className="user-img"
                                    alt={ name } />
                            </figure>
                        </div>

                        <div className="col-md-6">
                            <div className="friend-name">
                                <ins><a href={ href }>{ name }</a></ins>
                                <span>published: { post.createdAt }</span>
                            </div>
                        </div>

                        <div className="col-md-4">

                            { (isMyPost() || isMeGroupAdmin()) && (
                                <>
                                    { isMyPost() && (
                                        <a href={ `${ baseUrl }/sn/edit-post.html?id=${ post._id }` }>Edit</a>
                                    ) }

                                    &nbsp;<button type="button" className="btn btn-danger btn-sm" onClick={ function () {
                                        deletePost(post._id);
                                    } }>Delete</button>
                                </>
                            ) }

                            { (isMeGroupAdmin() && post.status == "pending") && (
                                <>
                                    <button type="button" className="btn btn-success btn-sm" onClick={ function () {
                                        acceptPost(post._id);
                                    } }>Accept</button>

                                    &nbsp;

                                    <button type="button" className="btn btn-danger btn-sm" onClick={ function () {
                                        declinePost(post._id);
                                    } }>Decline</button>
                                </>
                            ) }

                        </div>

                    </div>

                    <div className="post-meta">
                        <div className="description">
                            <p>{ (post.caption || "") }</p>
                        </div>

                        { (post.files || []).map(function (file, index) {
                            return (
                                <React.Fragment key={ `${ post._id }-file-${ index }` }>
                                    { file.type.includes("image") ? (
                                        <img src={ file.path }
                                            alt={ file.name }
                                            className="post-image" />
                                    ) : file.type.includes("video") && (
                                        <video src={ file.path }
                                            alt={ file.name }
                                            className="post-image"
                                            controls></video>
                                    ) }

                                    { isMyPost() && (
                                        <i className="fa fa-trash cursor-pointer"
                                            onClick={ function () {
                                                deletePostFile(post._id, file.path);
                                            } }></i>
                                    ) }
                                </React.Fragment>
                            );
                        }) }

                        { (post.type == "shared" && post.sharedPost) && (
                            <SinglePost post={ post.sharedPost } />
                        ) }
                        
                        <div className="we-video-info">
                            <p>{ post.views } views</p>
                            <ul>
                                <li>
                                    <span className="likes cursor-pointer" data-toggle="tooltip" title="likes">
                                        <span onClick={ function () {
                                            toggleLike(post);
                                        } }>
                                            <i className={ post.hasLiked ? 'fa fa-thumbs-up cursor-pointer' : 'fa-regular fa-thumbs-up cursor-pointer' }></i>
                                        </span>

                                        <ins className="cursor-pointer" onClick={ function () {
                                            showPostLikers(post._id);
                                        } }>{ post.likes }</ins>
                                    </span>
                                </li>
                                <li>
                                    <span className="comment cursor-pointer" data-toggle="tooltip" title="Comments"
                                        onClick={ function () {
                                            document.querySelector('#post-comments-modal .modal-body .content').innerHTML = '';
                                            postComments(post._id);
                                        } }>
                                        <i className="fa-regular fa-comment"></i>
                                        <ins>{ post.comments }</ins>
                                    </span>
                                </li>
                                <li>
                                    <span data-toggle="tooltip" title="share"
                                        className="cursor-pointer">
                                        <i className="fa fa-share" onClick={ function () {
                                            sharePost(post._id);
                                        } }></i>
                                        <ins className="cursor-pointer" onClick={ function () {
                                            showPostSharers(post._id);
                                        } }>{ post.shares }</ins>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}