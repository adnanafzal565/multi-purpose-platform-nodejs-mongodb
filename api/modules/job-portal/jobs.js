const express = require("express");
const fs = require("fs");
const ObjectId = require("mongodb").ObjectId;
const auth = require("../auth");
const authOptional = require("../auth-optional");
const cvs = require("./cvs");

module.exports = {
    limit: 15,

    async fetch(filter, page) {
        const skip = (page - 1) * this.limit;

        const jobs = await db.collection("jobs")
            .aggregate([{
                $match: filter
            }, {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }, {
                $unwind: "$user"
            }, {
                $sort: {
                    _id: -1
                }
            }, {
                $skip: skip
            }, {
                $limit: this.limit
            }]).toArray();

        const jobsArr = [];
        for (let a = 0; a < jobs.length; a++) {
            const obj = {
                _id: jobs[a]._id || "",
                title: jobs[a].title || "",
                type: jobs[a].type || "",
                location: jobs[a].location || "",
                nature: jobs[a].nature || "",
                deadline: jobs[a].deadline || 1,
                currency: jobs[a].currency || "",
                amount: jobs[a].amount || 0,
                description: jobs[a].description || "",
                vacancies: jobs[a].vacancies || 1,
                applications: jobs[a].applications || 0,
                bids: jobs[a].bids || 0,
                user: {
                    _id: jobs[a].user._id || "",
                    name: jobs[a].user.name || "",
                    profileImage: jobs[a].user.profileImage?.path || ""
                },
                createdAt: new Date(jobs[a].createdAt).toLocaleString()
            };

            if (obj.user.profileImage && fs.existsSync(obj.user.profileImage)) {
                obj.user.profileImage = baseUrl + "/" + obj.user.profileImage;
            }

            jobsArr.push(obj);
        }

        return jobsArr;
    },

    init(app) {
        const self = this;
        const router = express.Router();

        router.post("/my-applied", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        router.post("/reject-application", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        router.post("/change-application-status", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        router.post("/apply", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        router.post("/fetch-applications", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        router.post("/fetch-single", authOptional, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const page = request.fields.page || 1;
            const skip = (page - 1) * self.limit;

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required fields missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            let job = await self.fetch({
                $and: [{
                    _id: ObjectId.createFromHexString(_id)
                }, {
                    status: "active"
                }]
            }, 1);

            if (job.length <= 0) {
                result.json({
                    status: "error",
                    message: "Job not found."
                });
                return;
            }

            job = job[0];

            result.json({
                status: "success",
                message: "Data has been fetched.",
                job: job,
                cvs: [],
                applications: []
            });
        });

        router.post("/fetch-filters", async function (request, result) {
            const locations = await db.collection("jobs").distinct("location");

            result.json({
                status: "success",
                message: "Data has been fetched.",
                locations: locations
            });
        });

        router.post("/fetch", authOptional, async function (request, result) {
            const user = request.user;
            const page = request.fields.page || 1;
            const title = request.fields.title || "";
            const location = request.fields.location || "";
            const type = request.fields.type || "";
            const nature = request.fields.nature || "";
            const salaryFrom = parseFloat(request.fields.salaryFrom || 0);
            const salaryTo = parseFloat(request.fields.salaryTo || 0);

            const filterArr = [];

            if (title) {
                filterArr.push({
                    title: {
                        $regex: title,
                        $options: "i"
                    }
                });
            }

            if (location) {
                filterArr.push({
                    location: {
                        $regex: location,
                        $options: "i"
                    }
                });
            }

            if (type) {
                filterArr.push({
                    type: type
                });
            }

            if (nature) {
                filterArr.push({
                    nature: nature
                });
            }

            filterArr.push({
                amount: {
                    $gte: salaryFrom
                }
            });

            filterArr.push({
                amount: {
                    $lte: salaryTo
                }
            });

            let filterObj = {};
            if (filterArr.length > 0) {
                filterObj = {
                    $and: filterArr
                };
            }
            
            const jobs = await self.fetch(filterObj, page);

            result.json({
                status: "success",
                message: "Data has been fetched.",
                jobs: jobs
            });
        });

        router.post("/fetch-my", auth, async function (request, result) {
            const user = request.user;
            const page = request.fields.page || 1;

            const jobs = await self.fetch({
                userId: user._id
            }, page);

            result.json({
                status: "success",
                message: "Data has been fetched.",
                jobs: jobs
            });
        });

        router.post("/delete", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";

            if (!_id) {
                result.json({
                    status: "error",
                    message: "Required fields missing."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            let job = await self.fetch({
                $and: [{
                    _id: ObjectId.createFromHexString(_id)
                }, {
                    userId: user._id
                }]
            }, 1);

            if (job.length <= 0) {
                result.json({
                    status: "error",
                    message: "Job not found."
                });
                return;
            }

            job = job[0];

            await db.collection("jobs")
                .findOneAndDelete({
                    _id: job._id
                });

            result.json({
                status: "success",
                message: "Job has been deleted."
            });
        });

        router.post("/update", auth, async function (request, result) {
            const user = request.user;
            const _id = request.fields._id || "";
            const title = request.fields.title || "";
            const type = request.fields.type || "remote";
            const location = request.fields.location || "";
            const nature = request.fields.nature || "freelance";
            const deadline = request.fields.deadline || 1;
            const currency = request.fields.currency || "";
            const amount = parseFloat(request.fields.amount || 0);
            const description = request.fields.description || "";
            const vacancies = parseInt(request.fields.vacancies || 1);
            const status = request.fields.status || "active";

            if (!_id || !title) {
                result.json({
                    status: "error",
                    message: "Required fields missing."
                });
                return;
            }

            if (!["remote", "onSite", "hybrid"].includes(type)) {
                result.json({
                    status: "error",
                    message: "In-valid 'type'."
                });
                return;
            }

            if (!["freelance", "fullTime", "partTime"].includes(nature)) {
                result.json({
                    status: "error",
                    message: "In-valid 'nature'."
                });
                return;
            }

            if (!["active", "inActive"].includes(status)) {
                result.json({
                    status: "error",
                    message: "In-valid 'status'."
                });
                return;
            }

            if (!ObjectId.isValid(_id)) {
                result.json({
                    status: "error",
                    message: "In-valid ID."
                });
                return;
            }

            let job = await self.fetch({
                $and: [{
                    _id: ObjectId.createFromHexString(_id)
                }, {
                    userId: user._id
                }]
            }, 1);

            if (job.length <= 0) {
                result.json({
                    status: "error",
                    message: "Job not found."
                });
                return;
            }

            job = job[0];

            const obj = {
                title: title,
                type: type,
                location: location,
                nature: nature,
                deadline: deadline,
                currency: currency,
                amount: amount,
                description: description,
                vacancies: vacancies,
                status: status,
                updatedAt: new Date().toUTCString()
            };

            await db.collection("jobs").findOneAndUpdate({
                _id: job._id
            }, {
                $set: obj
            });

            result.json({
                status: "success",
                message: "Job has been updated."
            });
        });

        router.post("/create", auth, async function (request, result) {
            const user = request.user;
            const title = request.fields.title || "";
            const type = request.fields.type || "remote";
            const location = request.fields.location || "";
            const nature = request.fields.nature || "freelance";
            const deadline = request.fields.deadline || 1;
            const currency = request.fields.currency || "";
            const amount = parseFloat(request.fields.amount || 0);
            const description = request.fields.description || "";
            const vacancies = parseInt(request.fields.vacancies || 1);
            const status = request.fields.status || "active";

            if (!title) {
                result.json({
                    status: "error",
                    message: "Required fields missing."
                });
                return;
            }

            if (!["remote", "onSite", "hybrid"].includes(type)) {
                result.json({
                    status: "error",
                    message: "In-valid 'type'."
                });
                return;
            }

            if (!["freelance", "fullTime", "partTime"].includes(nature)) {
                result.json({
                    status: "error",
                    message: "In-valid 'nature'."
                });
                return;
            }

            if (!["active", "inActive"].includes(status)) {
                result.json({
                    status: "error",
                    message: "In-valid 'status'."
                });
                return;
            }

            const obj = {
                userId: user._id,
                title: title,
                type: type,
                location: location,
                nature: nature,
                deadline: deadline,
                currency: currency,
                amount: amount,
                description: description,
                vacancies: vacancies,
                status: status,
                applications: 0,
                bids: 0,
                createdAt: new Date().toUTCString(),
                updatedAt: new Date().toUTCString()
            };

            await db.collection("jobs").insertOne(obj);

            let job = await self.fetch({
                _id: obj._id
            }, 1);

            if (job.length > 0) {
                job = job[0];
            }

            result.json({
                status: "success",
                message: "Job has been created.",
                job: job
            });
        });

        app.use("/job-portal/jobs", router);
    }
};