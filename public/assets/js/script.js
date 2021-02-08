document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, { "accordion": false });
});

$(document).ready( () => {

    // Initialize Materialize tabs
    $('.tabs').tabs();

    $('.tooltipped').tooltip({
        inDuration: 200,
        outDuration: 150,
        margin: 3
    });

    $('.modal').modal();
    $('select').formSelect();
    $('#modal-color-select').dropdown({
        coverTrigger: false
    });

    // Handle clicking log-in button
    $("#login-btn").on('click', (event) => {
        event.preventDefault();

        const username = $('#login-username-input').val().trim();
        const password = $('#login-password-input').val();

        $.post("/login", {
            username,
            password
        }).then( () => {
            location.replace("/home");
        }).fail( (err) => {
            alert(err.responseText)
        });
    });

    // Handle clicking sign-up button
    $('#signup-btn').on('click', (event) => {
        event.preventDefault();

        const username = $('#signup-username-input').val().trim();
        const password = $('#signup-password-input').val();
        $.post("/signup", {
            username,
            password
        }).then( () => {
            location.replace("/");
        }).fail( (err) => {
            alert(err.responseText)
        });
    });

    // Handle clicking sign out button
    $('#sign-out-btn').on('click', (event) => {
        event.preventDefault();
        $.ajax({
            url: "/logout",
            type: "GET"
        }).then( () => {
            location.replace('/')
        }).fail( (err) => {
            console.log(err);
        });
    });

    $('.bookmark-li').on('click', (event) => {
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

    $('.dropdown-content').on('click', (event) => {
        event.stopPropagation();
    })

    $('.dropdown-trigger').on('click', (event) => {
        event.stopPropagation();
    });

    $('.new-collection').on('click', (event) => {
        event.stopPropagation();
        const targetCollectionID = $(event.target).attr('data-id');
        console.log("New sub-collection in collection " + targetCollectionID);
    });

    $('.new-bookmark').on('click',(event) => {
        event.stopPropagation();
        const targetCollectionID = $(event.target).attr('data-id');
        console.log("New bookmark in collection " + targetCollectionID);
    });

    // Close dropdowns if user clicks anywhere else in the window
    $(window).on('click', (event) => {
        $('.dropdown-trigger').dropdown('close');
        $('.show-all-tags').dropdown('close');
    });

    $('.bookmark-btn').on('click', (event) => {
        event.preventDefault();
        window.open($(event.target).attr("data-url"));
    });

    $('.bookmark-delete-btn').on('click', (event) => {
        event.stopPropagation();
        const id = $(event.target).attr("data-id");
        $.ajax({
            url: "/api/bookmarks/" + id,
            method: "DELETE"
        }).then( () => {

        }).fail( (err) => {

        });
    });

    // Configure materialize dropdown for color picker
    $('.color-dropdown-trigger-bookmark').dropdown({
        coverTrigger: false,
        onOpenEnd: () => { // slightly reposition dropdown after it's done opening
            const left = $('.color-dropdown').css("left");
            const pix = parseFloat(left.substring(0, left.length - 2)) - 5;
         
            $('.color-dropdown').css("left", pix + 'px');
        }
    });

    // Configure materialize dropdown for showing remaining tags
    $('.show-all-tags').dropdown({
        coverTrigger: false,
        constrainWidth: false,
    });

    // Block remaining tag dropdown from triggering entity expand
    $('.show-all-tags').on('click', (event) => {
        event.stopPropagation();
    })

    $('.collection-delete-btn').on('click', (event) => {
        event.stopPropagation();
        const id = $(event.target).attr("data-id");
        $.ajax({
            url: "/api/collections/" + id,
            method: "DELETE"
        }).then(() => {
            location.reload();
        }).fail((err) => {
            alert(err.responseText);
        });
    });

    $('.bookmark-move-btn').on('click', (event) => {
        event.stopPropagation();
        const id = $(event.target).attr("data-id");
    });

    $('.collection-move-btn').on('click', (event) => {
        event.stopPropagation();
        const id = $(event.target).attr("data-id");
    });

    // Handle changing an entity's color
    $('.color-dropdown-select').on('click', (event) => {
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

    $('#add-collection-btn').on('click', (event) => {
        event.stopPropagation();
        const newName = $('#new-collection-name').val().trim();
        $.ajax({
            url: '/api/collections',
            type: "POST",
            data: {
                "name": newName,
            }
        }).then( () => {
            $('.modal').modal('close');
            location.reload();
        }).fail( (err) => {
            alert(err.responseText);
        })
    });

    $('#add-bookmark-btn').on('click', (event) => {
        event.stopPropagation();
        const newName = $('#new-bookmark-name').val().trim();
        const URL = $('#new-bookmark-url').val();
        const comment = $('#new-bookmark-comment').val().trim();

        $.ajax( {
            url: '/api/bookmarks',
            type: "POST",
            data: {
                'name': newName,
                'url': URL,
                'comment': comment
            }
        }).then( () => {
            $('.modal').modal('close');
            location.reload();
        }).fail( (err) => {
            alert(err.responseText);
        })
    });

});