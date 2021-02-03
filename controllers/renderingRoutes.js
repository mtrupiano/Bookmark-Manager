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

// router.get("/home", (req, res) => {
//     // Check if logged in
//     if (!req.session.user) {
//         res.render("splash");
//         return;
//     }

//     res.render("/");
// })

module.exports = router;