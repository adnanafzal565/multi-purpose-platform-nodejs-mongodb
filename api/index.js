const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");

const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const MongoClient = mongodb.MongoClient;

// Add headers before the routes are defined
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Authorization");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);
    // Pass to next layer of middleware
    next();
});

const expressFormidable = require("express-formidable");
app.use(expressFormidable({
    multiples: true
}));

app.use("/uploads/public", express.static(path.join(__dirname, "uploads/public")));

const nodemailer = require("nodemailer")
global.nodemailerFrom = ""
global.transport = nodemailer.createTransport({
    host: "",
    port: 465,
    secure: true,
    auth: {
        user: nodemailerFrom,
        pass: ""
    }
})

const fs = require("fs");
const bcryptjs = require("bcryptjs");

const jwt = require("jsonwebtoken");
const auth = require("./modules/auth");
const media = require("./modules/media");
const notifications = require("./modules/notifications");
const posts = require("./modules/sn/posts");

const port = process.env.PORT || 3000;
const databaseName = "nodejs_mongodb"

global.db = null;
global.jwtSecret = "NodeJS_MongoDB_1234567890";
global.baseUrl = "http://localhost:" + port;

http.listen(port, async function () {
    console.log("Server started: " + baseUrl);
    
    const client = new MongoClient("mongodb://localhost:27017");
    try {
        await client.connect();
        global.db = client.db(databaseName);
        console.log("Database connected.");

        posts.init(app);
        media.init(app);
        notifications.init(app);

        app.post("/change-password", auth, async function (request, result) {
            const user = request.user;
            const password = request.fields.password || "";
            const newPassword = request.fields.newPassword || "";
            const confirmPassword = request.fields.confirmPassword || "";

            if (!password || !newPassword || !confirmPassword) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }

            if (newPassword != confirmPassword) {
                result.json({
                    status: "error",
                    message: "Password mis-match."
                })

                return
            }

            // check if password is correct
            const isVerify = await bcryptjs.compareSync(password, user.password)

            if (!isVerify) {
                result.json({
                    status: "error",
                    message: "In-correct password."
                })

                return
            }

            const salt = bcryptjs.genSaltSync(10)
            const hash = await bcryptjs.hashSync(newPassword, salt)
 
            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    password: hash
                }
            })

            result.json({
                status: "success",
                message: "Password has been changed."
            })
        })

        app.post("/save-profile", auth, async function (request, result) {
            const user = request.user
            const name = request.fields.name || ""

            if (!name) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }

            if (Array.isArray(request.files.profileImage)) {
                result.json({
                    status: "error",
                    message: "Only 1 file is allowed."
                })

                return
            }

            const profileImage = request.files.profileImage
            let profileImageObj = user.profileImage || {}

            // const files = []
            // if (Array.isArray(request.files.profileImage)) {
            //     for (let a = 0; a < request.files.profileImage.length; a++) {
            //         if (request.files.profileImage[a].size > 0) {
            //             files.push(request.files.profileImage[a])
            //         }
            //     }
            // } else if (request.files.profileImage.size > 0) {
            //     files.push(request.files.profileImage)
            // }

            if (profileImage?.size > 0) {

                const tempType = profileImage.type.toLowerCase()
                if (!tempType.includes("jpeg") && !tempType.includes("jpg") && !tempType.includes("png")) {
                    result.json({
                        status: "error",
                        message: "Only JPEG, JPG or PNG is allowed."
                    })
                    return
                }

                if (fs.existsSync(profileImageObj.path))
                    fs.unlinkSync(profileImageObj.path)
				
				if (!fs.existsSync("uploads/public/profiles"))
					fs.mkdirSync("uploads/public/profiles");

                const fileData = fs.readFileSync(profileImage.path)
                const fileLocation = "uploads/public/profiles/" + crypto.randomUUID() + "-" + profileImage.name
                fs.writeFileSync(fileLocation, fileData)
                fs.unlinkSync(profileImage.path)

                profileImageObj = {
                    size: profileImage.size,
                    path: fileLocation,
                    name: profileImage.name,
                    type: profileImage.type
                }
            }

            await db.collection("users")
                .findOneAndUpdate({
                    _id: user._id
                }, {
                    $set: {
                        name: name,
                        profileImage: profileImageObj,
						updatedAt: new Date().toUTCString()
                    }
                })

            if (profileImageObj?.path && fs.existsSync(profileImageObj.path))
                profileImageObj.path = baseUrl + "/" + profileImageObj.path;

            result.json({
                status: "success",
                message: "Profile has been updated.",
                profileImage: profileImageObj
            })
        })

        app.post("/verify-account", async function (request, result) {
            const email = request.fields.email
            const code = request.fields.code

            if (!email || !code) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }
         
            // update JWT of user in database
            const user = await db.collection("users").findOne({
                $and: [{
                    email: email
                }, {
                    verificationToken: parseInt(code)
                }]
            })

            if (user == null) {
                result.json({
                    status: "error",
                    message: "Invalid email code."
                })

                return
            }

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    isVerified: true
                },

                // $unset: {
                //     verificationToken: ""
                // }
            })

            result.json({
                status: "success",
                message: "Account has been account. Kindly login again."
            })
        })

        app.post("/reset-password", async function (request, result) {
            const email = request.fields.email
            const code = request.fields.code
            const password = request.fields.password

            if (!email || !code || !password) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }
         
            // update JWT of user in database
            const user = await db.collection("users").findOne({
                $and: [{
                    email: email
                }, {
                    code: parseInt(code)
                }]
            })

            if (user == null) {
                result.json({
                    status: "error",
                    message: "Invalid email code."
                })

                return
            }

            const salt = bcryptjs.genSaltSync(10)
            const hash = await bcryptjs.hashSync(password, salt)

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    password: hash
                },

                $unset: {
                    code: ""
                }
            })

            result.json({
                status: "success",
                message: "Password has been changed."
            })
        })

        app.post("/send-password-recovery-email", async function (request, result) {
            const email = request.fields.email

            if (!email) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }
         
            // update JWT of user in database
            const user = await db.collection("users").findOne({
                email: email
            })

            if (user == null) {
                result.json({
                    status: "error",
                    message: "Email does not exists."
                })

                return
            }

            const minimum = 0
            const maximum = 999999
            const randomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    code: randomNumber
                }
            })

            const emailHtml = "Your password reset code is: <b style='font-size: 30px;'>" + randomNumber + "</b>."
            const emailPlain = "Your password reset code is: " + randomNumber + "."

            transport.sendMail({
                from: nodemailerFrom,
                to: email,
                subject: "Password reset code",
                text: emailPlain,
                html: emailHtml
            }, function (error, info) {
                console.log("Mail sent: ", info)
            })
         
            result.json({
                status: "success",
                message: "A verification code has been sent on your email address."
            })
        })

        // route for logout request
        app.post("/logout", auth, async function (request, result) {
            const user = request.user
         
            // update JWT of user in database
            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    accessToken: ""
                }
            })
         
            result.json({
                status: "success",
                message: "Logout successfully."
            })
        })

        app.post("/fetch-user", async function (request, result) {
            const _id = request.fields._id || "";
            const page = request.fields.page || 1;

            if (!_id || !ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            const user = await db.collection("users")
                .findOne({
                    _id: ObjectId.createFromHexString(_id)
                });

            if (user == null) {
                result.json({
                    status: "error",
                    message: "User not found."
                });
                return;
            }

            const postsArr = await posts.fetchPosts({
                userId: user._id
            }, page, user);

            const userObj = {
                _id: user._id || "",
                name: user.name || "",
                email: user.email || "",
                profileImage: user.profileImage?.path || "",
            };

            if (userObj.profileImage && fs.existsSync(userObj.profileImage)) {
                userObj.profileImage = baseUrl + "/" + userObj.profileImage;
            }

            result.json({
                status: "success",
                message: "Data has been fetched.",
                user: userObj,
                posts: postsArr
            });
        });

        app.post("/me", auth, async function (request, result) {
            const user = request.user

            if (user.profileImage?.path && fs.existsSync(user.profileImage.path))
                user.profileImage = baseUrl + "/" + user.profileImage.path;
            else
                user.profileImage = "";

            const unreadNotifications = await notifications.fetchUnreadCount(user);
         
            result.json({
                status: "success",
                message: "Data has been fetched.",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage
                },
                unreadNotifications: unreadNotifications
            })
        })

        // route for login requests
        app.post("/login", async function (request, result) {
         
            // get values from login form
            const email = request.fields.email
            const password = request.fields.password

            if (!email || !password) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }
         
            // check if email exists
            const user = await db.collection("users").findOne({
                email: email
            })
         
            if (user == null) {
                result.json({
                    status: "error",
                    message: "Email does not exists."
                })

                return
            }

            // check if password is correct
            const isVerify = await bcryptjs.compareSync(password, user.password)

            if (isVerify) {
         
                // generate JWT of user
                const accessToken = jwt.sign({
                    userId: user._id.toString(),
                    time: new Date().getTime()
                }, jwtSecret, {
                    expiresIn: (60 * 60 * 24 * 30) // 30 days
                })
     
                // update JWT of user in database
                await db.collection("users").findOneAndUpdate({
                    email: email
                }, {
                    $set: {
                        accessToken: accessToken
                    }
                })
     
                result.json({
                    status: "success",
                    message: "Login successfully.",
                    accessToken: accessToken,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email
                    }
                })
     
                return
            }
     
            result.json({
                status: "error",
                message: "Password is not correct."
            });
            return;
        })

        app.post("/register", async function (request, result) {
            const name = request.fields.name || "";
            const email = request.fields.email || "";
            const password = request.fields.password || "";
            const createdAt = new Date().toUTCString()
     
            if (!name || !email || !password) {
                result.json({
                    status: "error",
                    message: "Please enter all values."
                })

                return
            }
     
            // check if email already exists
            const user = await db.collection("users").findOne({
                email: email
            })
     
            if (user != null) {
                result.json({
                    status: "error",
                    message: "Email already exists."
                })

                return
            }

            const salt = bcryptjs.genSaltSync(10)
            const hash = await bcryptjs.hashSync(password, salt)
            
            // insert in database
            await db.collection("users").insertOne({
                name: name,
                email: email,
                password: hash,
                profileImage: null,
                coverImage: null,
                accessToken: "", // saved in database to logout a user manually from admin panel
                createdAt: createdAt,
				updatedAt: createdAt
            })
 
            result.json({
                status: "success",
                message: "Account has been registered. You can login now."
            });
            return;
        })
    } catch (error) {
        console.error(error);
    }
});