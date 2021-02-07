const express = require('express');
const router = express.Router();

router.get("/", function(request, response) {
    // Check if logged in
    if (!request.session.user) {
        response.render("splash");
    } else {
        response.redirect("/home");
    }
});

module.exports = router;