const accessTokenKey = "NodeJSMongoDBAccessToken";
const privateKeyKey = "NodeJSMongoDBPrivateKey";
const publicKeyKey = "NodeJSMongoDBPublicKey";
const baseUrl = "http://localhost:8888/nodejs-mongodb/web";
const apiUrl = "http://localhost:3000";
const appName = "Node JS and Mongo DB";

const globalState = {
    state: {
        user: null,
        posts: [],
        newMessage: null
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

globalState.listen(function (newState, updatedState) {
    if (typeof updatedState.user !== "undefined") {
        if (socketIO != null) {
            socketIO.emit("connected", updatedState.user._id);
        }
    }
});

// Dynamically load a CSS file
function loadCSS(filename) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = filename;
    document.head.appendChild(link);
}

// Dynamically load a JS file
function loadJS(filename) {
    const script = document.createElement("script");
    script.src = filename;
    script.async = true; // Load asynchronously
    document.head.appendChild(script);
}

loadCSS(baseUrl + "/public/alertifyjs/css/alertify.min.css");
loadJS(baseUrl + "/public/alertifyjs/alertify.min.js");
loadJS(baseUrl + "/public/js/socket.io.js");
loadJS(baseUrl + "/public/js/premium.js");

let socketIO = null;

window.addEventListener("load", function () {
    const currentYear = document.getElementById("current-year");
    if (currentYear) {
        currentYear.innerHTML = (new Date()).getFullYear();
    }

    // const href = document.querySelectorAll("[data-href]");
    // for (let a = 0; a < href.length; a++) {
    //     href[a].setAttribute("href", href[a].getAttribute("data-href"));
    // }

    if (typeof io !== "undefined") {
        socketIO = io(apiUrl);
    
        socketIO.on("newMessage", function (data) {
            // console.log(data);
    
            // alertify.set('notifier', 'delay', 0); // Disable auto-close
            alertify.success("New message from: " + data.sender.name);

            globalState.setState({
                newMessage: data
            });
        });
    }
});

function addOrUpdateURLParam(key, value) {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set(key, value)
    const newRelativePathQuery = window.location.pathname + "?" + searchParams.toString()
    history.pushState(null, "", newRelativePathQuery)
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