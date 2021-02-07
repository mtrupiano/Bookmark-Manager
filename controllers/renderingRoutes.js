const express = require('express');
const router = express.Router();

router.get("/splash", function(request, response) {
    // Check if logged in
    if (!request.session.user) {
        response.render("splash");
    } else {
        response.redirect("/");
    }
});

module.exports = router;