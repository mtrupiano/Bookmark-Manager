$(document).ready( () => {

    // Initialize Materialize tabs
    $('.tabs').tabs();

    $("#login-btn").click((event) => {
        event.preventDefault();

        const username = $('#login-username-input').val().trim();
        const password = $('#login-password-input').val();
        console.log(password);
        $.post("/login", {
            username,
            password
        }).then(() => {
            location.replace("/");
        }).fail(err => alert(err.responseText));
    });

    $('#signup-btn').click((event) => {
        event.preventDefault();

        const username = $('#signup-username-input').val().trim();
        const password = $('#signup-password-input').val();
        $.post("/signup", {
            username,
            password
        }).then(() => {
            location.replace("/");
        }).fail(err => alert(err.responseText));
    });

});