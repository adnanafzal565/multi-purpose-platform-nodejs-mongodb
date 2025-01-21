const express = require("express");
const auth = require("../auth");

module.exports = {
    limit: 15,

    init(app) {
        const self = this;
        const router = express.Router();

        router.post("/set-as-default", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        router.post("/delete", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        router.post("/upload", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        router.post("/fetch-my", auth, async function (request, result) {
            result.json({
                status: "info",
                message: premiumVersionText,
                title: premiumVersionTitle
            });
        });

        app.use("/job-portal/cvs", router);
    }
};