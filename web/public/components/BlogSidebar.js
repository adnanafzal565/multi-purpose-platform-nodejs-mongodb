function BlogSidebar() {

    const [categories, setCategories] = React.useState([]);
    const [q, setQ] = React.useState("");

    async function getData() {
        try {
            const response = await axios.post(
                apiUrl + "/categories/fetch"
            );

            if (response.data.status == "success") {
                setCategories(response.data.categories);
            } else {
                // swal.fire("Error", response.data.message, "error");
            }
        } catch (exp) {
            console.log(exp.message);
            // swal.fire("Error", exp.message, "error");
        }
    }

    React.useEffect(function () {
        const urlSearchParams = new URLSearchParams(window.location.search);
        setQ(urlSearchParams.get("q") || "");

        getData();
    }, []);

    const styles = {
        singleCategory: {
            display: "inline-block",
            marginRight: "10px"
        }
    };

    return (
        <>
            <div className="card mb-4">
                <div className="card-header">Search</div>
                <div className="card-body">
                    <div className="input-group">
                        <input className="form-control" type="text"
                            value={ q }
                            onChange={ function (event) {
                                setQ(event.target.value || "")
                            } }
                            placeholder="Search blog posts..." />
                        <button className="btn btn-primary" type="button" onClick={ function () {
                            window.location.href = baseUrl + "/blogs?q=" + q;
                        } }>Go!</button>
                    </div>
                </div>
            </div>
            
            <div className="card mb-4">
                <div className="card-header">Categories</div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-sm-12">
                            <ul className="list-unstyled mb-0">
                                { categories.map(function (category) {
                                    return (
                                        <li key={ `category-${ category._id }` } style={ styles.singleCategory }>
                                            <a href={ `${ baseUrl }/blogs?c=${ category.name }` }>{ category.name }</a>
                                        </li>
                                    )
                                }) }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}