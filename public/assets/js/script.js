document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, { "accordion": false });
});

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

    $('.sidenav').sidenav();
    $('.dropdown-trigger').dropdown({    });

    $('#sign-out-btn').click((event) => {
        event.preventDefault();
        $.ajax({
            url: "/logout",
            type: "GET"
        }).then(() => {
            location.replace('/splash')
        }).fail((err) => {
            console.log(err);
        });
    });

    $('.bookmark-li').click((event) => {
        event.preventDefault();
        const target = $(event.target);
        let id;
        if (target.prop("tagName") === "I") {
            id = target.parent().attr("value");
        } else {
            id = target.attr("value");
        }
        console.log(id);
    });

    $('.dropdown-content').click( (event) => {
        event.stopPropagation();
    })

    $('.dropdown-trigger').click((event) => {
        event.stopPropagation();
    });

    $('.new-collection').click((event) => {
        event.stopPropagation();
        const targetCollectionID = $(event.target).attr('data-id');
        console.log("New sub-collection in collection " + targetCollectionID);
    });

    $('.new-bookmark').click((event) => {
        event.stopPropagation();
        const targetCollectionID = $(event.target).attr('data-id');
        console.log("New bookmark in collection " + targetCollectionID);
    });

    // Hide color picker if user clicks anywhere else in the window
    $(window).click((event) => {
        $('.dropdown-trigger').dropdown('close');
    });

    $('.color-dropdown-select').click((event) => {
        event.stopPropagation();

        const target = $(event.target);
        let newColor, targetEntityID, targetDropdownList, apiURL, targetEntity;

        if (target.prop("tagName") === "A") {

            targetDropdownList = target.parent().parent();
            targetEntityID = targetDropdownList.attr("data-id");

            newColor = $(target.children()[0]).css("color");
            if (newColor === "rgb(56, 56, 56)") {
                newColor = "rgb(255, 255, 255)";
            }

        } else if (target.prop("tagName") === "I") {

            targetDropdownList = target.parent().parent().parent();
            targetEntityID = targetDropdownList.attr("data-id");

            newColor = target.css("color");
            if (newColor === "rgb(56, 56, 56)") {
                newColor = "rgb(255, 255, 255)";
            }
        }
        
        if (targetDropdownList.hasClass("color-dropdown-collection")) {
            apiURL = "/api/collections/color";
            targetEntity = $(`.color-dropdown-trigger-collection[data-id=${targetEntityID}]`)
        } else {
            apiURL = "/api/bookmarks/color";
            targetEntity = $(`.color-dropdown-trigger-bookmark[data-id=${targetEntityID}]`)
        }

        $.ajax({
            url: apiURL,
            type: "PUT",
            data: {
                "ids": [targetEntityID],
                "newColor": newColor
            },
            processData: true
        }).then(() => {

            if (newColor === "rgb(255, 255, 255)") {
                $(targetEntity.children()[0]).text("panorama_fish_eye");
                $(targetEntity.children()[0]).css("color", "rgb(56, 56, 56)");
            } else {
                $(targetEntity.children()[0]).text("circle");
                $(targetEntity.children()[0]).css("color", newColor);
            }
        }).fail((err) => {
            alert(err.responseText)
        });
    });


});