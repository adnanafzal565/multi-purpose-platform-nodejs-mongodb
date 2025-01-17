async function declinePost(id) {
    const node = event.target;
    node.setAttribute("disabled", "disabled");

    const formData = new FormData();
    formData.append("_id", id);

    try {
        const response = await axios.post(
            apiUrl + "/sn/posts/decline",
            formData,
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                }
            }
        )

        if (response.data.status == "success") {
            swal.fire("Post Declined", response.data.message, "success");
            // node.remove();
            node.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
        } else {
            swal.fire(response.data.title, response.data.message, response.data.status);
            node.removeAttribute("disabled");
        }
    } catch (exp) {
        // swal.fire("Error", exp.message, "error");
        node.removeAttribute("disabled");
    }
}

async function acceptPost(id) {
    const node = event.target;
    node.setAttribute("disabled", "disabled");

    const formData = new FormData();
    formData.append("_id", id);

    try {
        const response = await axios.post(
            apiUrl + "/sn/posts/accept",
            formData,
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                }
            }
        )

        if (response.data.status == "success") {
            swal.fire("Post Accepted", response.data.message, "success");
            // node.remove();
            node.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
        } else {
            swal.fire(response.data.title, response.data.message, response.data.status);
            node.removeAttribute("disabled");
        }
    } catch (exp) {
        // swal.fire("Error", exp.message, "error");
        node.removeAttribute("disabled");
    }
}

async function toggleJoin(id, callBack = null) {
    const node = event.target;
    node.setAttribute("disabled", "disabled");

    const formData = new FormData();
    formData.append("_id", id);

    try {
        const response = await axios.post(
            apiUrl + "/sn/groups/toggle-join",
            formData,
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                }
            }
        )

        if (response.data.status == "success") {
            if (callBack != null) {
                callBack();
            }
        } else {
            swal.fire(response.data.title, response.data.message, response.data.status);
        }
    } catch (exp) {
        // swal.fire("Error", exp.message, "error")
    } finally {
        node.removeAttribute("disabled");
    }
}

function renderSingleFollower(follower) {
    let html = "";
    html += `<li>
        <div class="nearly-pepls">
            <figure>
                <a href="` + baseUrl + `/sn/profile.html?id=` + follower.userId + `">
                    <img src="` + follower.profileImage + `"
                        onerror="this.src = baseUrl + '/public/img/user-placeholder.png'"
                        class="user-img" />
                </a>
            </figure>

            <div class="pepl-info">
                <h4>
                    <a href="` + baseUrl + `/sn/profile.html?id=` + follower.userId + `">
                        ` + follower.name + `
                    </a>
                </h4>
                
                <a href="` + baseUrl + `/sn/profile.html?id=` + follower.userId + `" class="add-butn">view profile</a>
            </div>
        </div>
    </li>`;
    return html;
}

function renderSinglePage(page) {
    let html = "";
    html += `<li>
        <div class="f-page">
            <figure>
                <a href="` + baseUrl + `/sn/pages/detail.html?id=` + page._id + `" title=""><img src="` + page.image + `" alt=""></a>
                <div class="dropdown pgs">`
                    if (page.isFollowed) {
                        html += `<button class="btn dropdown-toggle" type="button" id="dropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="ti-check"></i>liked
                        </button>

                        <div class="dropdown-menu" aria-labelledby="dropdownMenu">
                            <button class="dropdown-item" type="button">Dislike</button>
                        </div>`;
                    }
                html += `</div>
                <em>` + page.followers + ` followers</em>
            </figure>
            <div class="page-infos">
                <h5><a href="` + baseUrl + `/sn/pages/detail.html?id=` + page._id + `">` + page.name + `</a></h5>
                <span>` + page.description.substr(0, 10) + `</span>
            </div>
        </div>
    </li>`;
    return html;
}

async function toggleLike(id, hasLiked) {
    const node = event.currentTarget;
    let counter = parseInt(node.nextElementSibling.innerHTML);

    if (hasLiked) {
        counter--;
    } else {
        counter++;
    }

    node.nextElementSibling.innerHTML = counter;

    const formData = new FormData();
    formData.append("_id", id);

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
            document.querySelector("#post-" + id + " .fa-thumbs-up")
                .setAttribute("onclick", "toggleLike('" + id + "', " + !hasLiked + ")");
        } else {
            swal.fire("Error", response.data.message, "error")
        }
    } catch (exp) {
        // swal.fire("Error", exp.message, "error")
    }
}

let postLikersPage = 0;
let postCommentsPage = 0;
let postSharersPage = 0;
let commentsPostId = "";

async function showPostSharers(id, page = 1) {
    postSharersPage = page;

    $("#post-sharers-modal").modal("show");
    $("#post-sharers-modal .modal-body .loading").show();

    const formData = new FormData();
    formData.append("_id", id);
    formData.append("page", page);

    try {
        const response = await axios.post(
            apiUrl + "/sn/posts/fetch-sharers",
            formData,
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                }
            }
        )

        if (response.data.status == "success") {
            const sharers = response.data.sharers;
            let html = "";
            for (let a = 0; a < sharers.length; a++) {
                html += `<div class="row mt-3">
                    <div class="col-md-2">
                        <img src="` + sharers[a].user.profileImage + `"
                            class="user-img"
                            onerror="this.src = baseUrl + '/public/img/user-placeholder.png'" />
                    </div>

                    <div class="col-md-6">
                        ` + sharers[a].user.name + `<br />
                        <a href="` + baseUrl + `/sn/post.html?id=` + sharers[a].postId + `">View post</a>
                    </div>

                    <div class="col-md-4">
                        ` + sharers[a].createdAt + `
                    </div>
                </div>`;
            }
            $("#post-sharers-modal .modal-body .content").html(html);
        } else {
            swal.fire("Error", response.data.message, "error");
        }
    } catch (exp) {
        // swal.fire("Error", exp.message, "error")
    } finally {
        $("#post-sharers-modal .modal-body .loading").hide();
    }
}

async function showPostLikers(id, page = 1) {
    postLikersPage = page;
    
    $("#post-likers-modal").modal("show");
    $("#post-likers-modal .modal-body").html("Loading...");

    const formData = new FormData();
    formData.append("_id", id);
    formData.append("page", page);

    try {
        const response = await axios.post(
            apiUrl + "/sn/posts/fetch-likers",
            formData,
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                }
            }
        )

        if (response.data.status == "success") {
            const likers = response.data.likers;
            let html = "";
            for (let a = 0; a < likers.length; a++) {
                html += `<div class="row">
                    <div class="col-md-8">
                        <img src="` + likers[a].user.profileImage + `"
                            class="user-img"
                            onerror="this.src = baseUrl + '/public/img/user-placeholder.png'" />

                        &nbsp;` + likers[a].user.name + `
                    </div>

                    <div class="col-md-4">
                        ` + likers[a].createdAt + `
                    </div>
                </div>`;
            }
            $("#post-likers-modal .modal-body").html(html);
        } else {
            swal.fire("Error", response.data.message, "error");
        }
    } catch (exp) {
        // swal.fire("Error", exp.message, "error")
    }
}

async function postComment() {
    const form = event.target;
    const formData = new FormData(form);
    formData.append("_id", commentsPostId);

    form.submit.setAttribute("disabled", "disabled");

    try {
        const response = await axios.post(
            apiUrl + "/sn/posts/comments/send",
            formData,
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                }
            }
        )

        if (response.data.status == "success") {
            const comment = response.data.comment;
            const html = renderSingleComment(comment);
            // document.querySelector("#post-comments-modal .modal-body").innerHTML = html + document.querySelector("#post-comments-modal .modal-body").innerHTML;
            document.querySelector("#post-comments-modal .modal-body").insertAdjacentHTML("afterbegin", html);

            document.getElementById("form-post-comment").comment.value = "";
        } else {
            swal.fire("Error", response.data.message, "error");
        }
    } catch (exp) {
        // swal.fire("Error", exp.message, "error")
    } finally {
        form.submit.removeAttribute("disabled");
    }
}

async function postComments(_id, page = 1) {
    commentsPostId = _id;
    postCommentsPage = page;

    $("#post-comments-modal").modal("show");
    $("#post-comments-modal .modal-body .loading").show();

    const formData = new FormData();
    formData.append("_id", _id);
    formData.append("page", page);

    try {
        const response = await axios.post(
            apiUrl + "/sn/posts/comments/fetch",
            formData,
            {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                }
            }
        )

        if (response.data.status == "success") {
            const comments = response.data.comments;
            let html = "";
            for (let a = 0; a < comments.length; a++) {
                html += renderSingleComment(comments[a]);
            }
            // document.querySelector("#post-comments-modal .modal-body").innerHTML = html;
            document.querySelector("#post-comments-modal .modal-body .content").insertAdjacentHTML("beforeend", html);

            for (let a = 0; a < comments.length; a++) {
                let repliesHtml = "";
                for (let b = 0; b < comments[a].repliesArr.length; b++) {
                    const reply = comments[a].repliesArr[b];
                    repliesHtml += renderSingleReply(reply);
                }

                // document.querySelector("#comment-replies-" + comments[a]._id).innerHTML = repliesHtml;
                document.querySelector("#comment-replies-" + comments[a]._id).insertAdjacentHTML("beforeend", repliesHtml);
            }

            if (comments.length == 0) {
                $("#btn-load-more-comments").hide();
            } else {
                $("#btn-load-more-comments").show();
            }
        } else {
            swal.fire("Error", response.data.message, "error");
        }
    } catch (exp) {
        // swal.fire("Error", exp.message, "error")
    } finally {
        $("#post-comments-modal .modal-body .loading").hide();
    }
}

function deleteReply(id) {
    swal.fire({
        title: "Delete Reply",
        text: "Are you sure you want to delete this reply ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
    }).then(async function (result) {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append("_id", id);

            try {
                const response = await axios.post(
                    apiUrl + "/sn/posts/replies/delete",
                    formData,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                        }
                    }
                )

                if (response.data.status == "success") {
                    document.getElementById("reply-" + id).remove()
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            } catch (exp) {
                // swal.fire("Error", exp.message, "error")
            }
        }
    });
}

function deleteComment(id) {
    swal.fire({
        title: "Delete Comment",
        text: "Are you sure you want to delete this comment ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
    }).then(async function (result) {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append("_id", id);

            try {
                const response = await axios.post(
                    apiUrl + "/sn/posts/comments/delete",
                    formData,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                        }
                    }
                )

                if (response.data.status == "success") {
                    document.getElementById("comment-" + id).remove()
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            } catch (exp) {
                // swal.fire("Error", exp.message, "error")
            }
        }
    });
}

function renderSingleReply(reply) {
    let html = "";
    html += `<div class="row mt-3" id="reply-` + reply._id + `">`

        if (reply.comment) {
            html += `<div class="col-md-12 mb-3">
                <h2>` + reply.comment + `</h2>
            </div>`;
        }

    html += `<div class="col-md-2">
            <img src="` + reply.user.profileImage + `"
                class="user-img"
                onerror="this.src = baseUrl + '/public/img/user-placeholder.png'" />
        </div>

        <div class="col-md-8">
            <p class="mb-0"><b>` + reply.user.name + `</b></p>
            <p class="mb-0" style="font-size: 12px;">` + reply.createdAt + `</p>
            <p class="mb-0">` + reply.reply + `</p>
        </div>`

        if (globalState.state.user != null && reply.user._id == globalState.state.user._id) {
            html += `<div class="col-md-2">
                <a class="btn btn-warning mt-1" href="` + baseUrl + `/sn/edit-reply.html?id=` + reply._id + `">Edit</a>
                <button type="button" class="btn btn-danger mt-1" onclick="deleteReply('` + reply._id + `')">Delete</button>
            </div>`
        }
        
    html += `</div>`;
    return html;
}

function renderSingleComment(comment) {
    let html = "";
    html += `<div class="row mt-3" id="comment-` + comment._id + `">
        <div class="col-md-2">
            <img src="` + comment.user.profileImage + `"
                class="user-img"
                onerror="this.src = baseUrl + '/public/img/user-placeholder.png'" />
        </div>

        <div class="col-md-8">
            <p class="mb-0"><b>` + comment.user.name + `</b></p>
            <p class="mb-0" style="font-size: 12px;">` + comment.createdAt + `</p>
            <p class="mb-0">` + comment.comment + `</p>
        </div>

        <div class="col-md-2">
            <a class="btn btn-info" href="` + baseUrl + `/sn/send-reply.html?id=` + comment._id + `">Reply</a>`

        if (globalState.state.user != null && comment.user._id == globalState.state.user._id) {
            html += `<a class="btn btn-warning mt-1" href="` + baseUrl + `/sn/edit-comment.html?id=` + comment._id + `">Edit</a>
                <button type="button" class="btn btn-danger mt-1" onclick="deleteComment('` + comment._id + `')">Delete</button>`
        }
        
    html += `</div>
    </div>
        <div class="row mt-3">
            <div class="offset-md-2 col-md-10" id="comment-replies-` + comment._id + `">

            </div>
        </div>`;
    return html;
}

function deletePost(id) {
    const node = event.currentTarget;

    swal.fire({
        title: "Delete Post",
        text: "Are you sure you want to delete this post ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
    }).then(async function (result) {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            node.setAttribute("disabled", "disabled");

            const formData = new FormData();
            formData.append("_id", id);

            try {
                const response = await axios.post(
                    apiUrl + "/sn/posts/delete",
                    formData,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                        }
                    }
                )

                if (response.data.status == "success") {
                    const nodes = document.querySelectorAll("[data-post-id='" + id + "']");
                    for (let a = 0; a < nodes.length; a++) {
                        nodes[a].remove();
                    }
                } else {
                    swal.fire("Error", response.data.message, "error")
                    node.removeAttribute("disabled");
                }
            } catch (exp) {
                // swal.fire("Error", exp.message, "error")
                node.removeAttribute("disabled");
            }
        }
    });
}

function deletePostFile(id, path) {
    const node = event.currentTarget;

    swal.fire({
        title: "Delete File",
        text: "Are you sure you want to delete this file from this post ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
    }).then(async function (result) {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            node.setAttribute("disabled", "disabled");

            const formData = new FormData();
            formData.append("_id", id);
            formData.append("path", path);

            try {
                const response = await axios.post(
                    apiUrl + "/sn/posts/remove-file",
                    formData,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                        }
                    }
                )

                if (response.data.status == "success") {
                    node.previousElementSibling.remove();
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            } catch (exp) {
                // swal.fire("Error", exp.message, "error")
            } finally {
                node.removeAttribute("disabled");
            }
        }
    });
}

function sharePost(id) {
    swal.fire({
        title: "Enter post caption (optional)",
        input: "text",
        inputAttributes: {
            autocapitalize: "off"
        },
        showCancelButton: true,
        confirmButtonText: "Share",
        showLoaderOnConfirm: true,
        allowOutsideClick: function () { return !Swal.isLoading(); }
    }).then(async function (result) {
        if (result.isConfirmed) {
            Swal.showLoading();

            const formData = new FormData();
            formData.append("_id", id);
            formData.append("caption", result.value);

            try {
                const response = await axios.post(
                    apiUrl + "/sn/posts/share",
                    formData,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                        }
                    }
                )

                if (response.data.status == "success") {
                    swal.fire("Share Post", response.data.message, "success")
                } else {
                    swal.fire("Error", response.data.message, "error")
                }
            } catch (exp) {
                // swal.fire("Error", exp.message, "error")
            } finally {
                Swal.hideLoading();
            }
        }
    });
}

function renderSinglePost(post) {
    let html = "";
    let isMyPost = false;
    let isMeGroupAdmin = false;

    if (globalState.state.user != null) {
        if (post.user._id == globalState.state.user._id) {
            isMyPost = true;
        }

        if (typeof post.group !== "undefined" && post.group.userId == globalState.state.user._id) {
            isMeGroupAdmin = true;
        }
    }

    let image = post.user.profileImage;
    let name = post.user.name;
    let href = baseUrl + "/sn/profile.html?id=" + post.user._id;

    if (typeof post.page !== "undefined") {
        image = post.page.image;
        name = post.page.name;
        href = baseUrl + "/sn/pages/detail.html?id=" + post.page._id;
    }

    html += `<div data-post-id="` + post._id + `" class="central-meta item">
        <div class="user-post">
            <div class="friend-info">
                <div class="row">
                    <div class="col-md-2">
                        <figure>
                            <img src="` + image + `"
                                onerror="this.src = baseUrl + '/public/img/user-placeholder.png'"
                                class="user-img"
                                alt="` + name + `" />
                        </figure>
                    </div>

                    <div class="col-md-6">
                        <div class="friend-name">
                            <ins><a href="` + href + `" title="">` + name + `</a></ins>
                            <span>published: ` + post.createdAt + `</span>
                        </div>
                    </div>
                    
                    <div class="col-md-4">`

                if (isMyPost || isMeGroupAdmin) {
                    if (isMyPost) {
                        html += `<a href="` + baseUrl + `/sn/edit-post.html?id=` + post._id + `">Edit</a>`;
                    }
                    html += `&nbsp;<button type="button" class="btn btn-danger btn-sm" onclick="deletePost('` + post._id + `');">Delete</button>`;
                }

                if (isMeGroupAdmin && post.status == "pending") {
                    html += `<button type="button" class="btn btn-success btn-sm" onclick="acceptPost('` + post._id +`');">Accept</button>
                    <button type="button" class="btn btn-danger btn-sm" onclick="declinePost('` + post._id + `');">Decline</button>`;
                }

            html += `</div>
                </div>
                
                <div class="post-meta">
                    <div class="description">
                        <p>` + (post.caption || "") + `</p>
                    </div>`

                    for (let a = 0; a < post.files.length; a++) {
                        if (post.files[a].type.includes("image")) {
                            html += `<img src="` + post.files[a].path + `"
                                alt="` + post.files[a].name + `"
                                style="width: 100%; height: 400px; object-fit: contain;" />`;
                        } else if (post.files[a].type.includes("video")) {
                            html += `<video src="` + post.files[a].path + `"
                                alt="` + post.files[a].name + `"
                                style="width: 100%; height: 400px; object-fit: contain;"
                                controls></video>`;
                        }

                        if (isMyPost) {
                            html += `<i class="fa fa-trash" style="cursor: pointer;"
                                onclick="deletePostFile('` + post._id + `', '` + post.files[a].path + `');"></i>`;
                        }
                    }

                    if (post.type == "shared" && post.sharedPost) {
                        html += renderSinglePost(post.sharedPost);
                    }
                    
                html += `<div class="we-video-info">
                        <p>` + post.views + ` views</p>
                        <ul>
                            <li>
                                <span class="likes" data-toggle="tooltip" title="likes"
                                    style="cursor: pointer;">
                                    <i class="` + (post.hasLiked ? 'fa fa-thumbs-up' : 'fa-regular fa-thumbs-up') + `"
                                        onclick="toggleLike('` + post._id + `', ` + post.hasLiked + `)"></i>
                                    <ins style="cursor: pointer;" onclick="showPostLikers('` + post._id + `');">` + post.likes + `</ins>
                                </span>
                            </li>
                            <li>
                                <span class="comment" data-toggle="tooltip" title="Comments"
                                    style="cursor: pointer;"
                                    onclick="document.querySelector('#post-comments-modal .modal-body .content').innerHTML = ''; postComments('` + post._id + `');">
                                    <i class="fa-regular fa-comment"></i>
                                    <ins>` + post.comments + `</ins>
                                </span>
                            </li>
                            <li>
                                <span data-toggle="tooltip" title="share"
                                    style="cursor: pointer;">
                                    <i class="fa fa-share" onclick="sharePost('` + post._id + `');"></i>
                                    <ins style="cursor: pointer;" onclick="showPostSharers('` + post._id + `');">` + post.shares + `</ins>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    return html;
}