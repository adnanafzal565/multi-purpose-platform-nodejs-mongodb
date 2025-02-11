function SingleBlog({ blog }) {

    const styles = {
        featuredImage: {
            height: "100px",
            objectFit: "cover"
        },
        anchor: {
            color: "black",
            textDecoration: "none"
        }
    };

    return (
        <>
            <div className="card mb-4">
                { blog.featuredImage && (
                    <img className="card-img-top" src={ blog.featuredImage.path }
                        alt={ blog.title }
                        onError={ function (event) {
                            event.target.src = baseUrl + "/public/img/user-placeholder.png";
                        } }
                        style={ styles.featuredImage } />
                ) }

                <div className="card-body">
                    <div className="small text-muted">{ blog.createdAt }</div>
                    
                    <h2 className="card-title h4">
                        <a style={ styles.anchor } href={ `${ baseUrl }/blogs/${ blog.slug }` }>
                            { blog.title }
                        </a>
                    </h2>
                    
                    <p className="card-text">{ blog.excerpt }</p>
                </div>
            </div>
        </>
    );
}