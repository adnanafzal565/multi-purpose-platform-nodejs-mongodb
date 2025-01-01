const accessTokenKey = "NodeJSMongoDBAccessToken";
const baseUrl = "http://localhost:8888/nodejs-mongodb/web";
const apiUrl = "http://localhost:3000";
const appName = "Node JS and Mongo DB";

/*const media = {
    data: [],
    page: 1,

    async showDialog() {
        $("#media-modal .modal-body .loading").show();
        $("#media-modal").modal("show");

        if (this.data.length == 0) {
            const formData = new FormData();
            formData.append("page", this.page);

            try {
                const response = await axios.post(
                    apiUrl + "/media/fetch",
                    formData,
                    {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem(accessTokenKey)
                        }
                    }
                )

                if (response.data.status == "success") {
                    this.data = response.data.media

                    let html = "";
                    for (let a = 0; a < media.length; a++) {
                        //
                    }
                } else {
                    // swal.fire("Error", response.data.message, "error")
                }
            } catch (exp) {
                // swal.fire("Error", exp.message, "error")
            }
        }
    }
};*/

window.addEventListener("load", function () {
    const currentYear = document.getElementById("current-year");
    if (currentYear)
        currentYear.innerHTML = (new Date()).getFullYear();

    // const href = document.querySelectorAll("[data-href]");
    // for (let a = 0; a < href.length; a++) {
    //     href[a].setAttribute("href", href[a].getAttribute("data-href"));
    // }
});

const globalState = {
    state: {
        user: null,
        posts: []
    },

    listeners: [],

    listen (callBack) {
        this.listeners.push(callBack)
    },

    setState (newState) {
        this.state = {
            ...this.state,
            ...newState
        }

        for (let a = 0; a < this.listeners.length; a++) {
            this.listeners[a](this.state, newState)
        }
    }
}

function openBase64File(base64String, fileType) {
    // Decode base64 to binary data
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });

    // Create a link pointing to the Blob
    const blobURL = URL.createObjectURL(blob);
    window.open(blobURL, '_blank');
}