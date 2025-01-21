function SingleJob({ job, onDelete = null }) {

    // const [state, setState] = React.useState(globalState.state);
    const [user, setUser] = React.useState(globalState.state.user);

    function deleteJob(id) {
        const node = event.target;

        Swal.fire({
            title: "Delete Job ?",
            text: "All the applications on this job will be removed as well.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                node.setAttribute("disabled", "disabled");

                const formData = new FormData();
                formData.append("_id", id);

                try {
                    const response = await axios.post(
                        apiUrl + "/job-portal/jobs/delete",
                        formData,
                        {
                            headers: {
                                Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                            }
                        }
                    )

                    if (response.data.status == "success") {
                        if (onDelete != null) {
                            onDelete(id);
                        }
                    } else {
                        swal.fire("Error", response.data.message, "error")
                    }
                } catch (exp) {
                    swal.fire("Error", exp.message, "error")
                } finally {
                    node.removeAttribute("disabled");
                }
            }
        });
    }

    React.useEffect(function () {
        globalState.listen(function (newState, updatedState) {
            // setState(newState);

            if (typeof updatedState.user !== "undefined") {
                setUser(updatedState.user);
            }
        });
    }, []);

    return (
        <div className="row mt-3">
            <div className="col-md-3 text-center">
                <img src={ job.user.profileImage }
                    onError={ function () {
                        event.target.src = baseUrl + "/public/img/user-placeholder.png";
                    } }
                    className="user-img" />

                <p>{ job.user.name }</p>
            </div>

            <div className="col-md-6">
                <p>
                    <a href={ `${ baseUrl }/job-portal/detail.html?id=${ job._id }` }>
                        <b>{ job.title }</b>
                    </a>
                </p>

                <ul className="job-meta-data">
                    { job.type != "remote" && (
                        <li>{ job.location }</li>
                    ) }
                    
                    <li className="text-capitalize">{ camelCaseSplit(job.type) }</li>
                    <li>{ job.currency } { job.amount }</li>

                    { job.nature == "freelance" ? (
                        <>
                            <li>Bids: { job.bids }</li>
                            <li>Deadline: { job.deadline }</li>
                        </>
                    ) : (
                        <li>Applications: { job.applications }</li>
                    ) }
                </ul>

                { (user != null && user._id == job.user._id) && (
                    <>
                        <a className="btn btn-warning"
                            href={ `${ baseUrl }/job-portal/edit.html?id=${ job._id }` }>Edit</a>

                        <button type="button" className="btn btn-danger ms-2"
                            onClick={ function () {
                                deleteJob(job._id);
                            } }>Delete</button>
                    </>
                ) }
            </div>

            <div className="col-md-3">
                <p className="text-capitalize">{ job.nature.replace(/([a-z])([A-Z])/g, "$1 $2") }</p>

                <p>{ job.createdAt.split(", ")[0] }</p>
            </div>
        </div>
    );
}