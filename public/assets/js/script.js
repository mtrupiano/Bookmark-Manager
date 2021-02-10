document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, { "accordion": false });
});

$(document).ready( () => {

    const tags = [];

    // Initialize Materialize tabs
    $('.tabs').tabs();

    $('.tooltipped').tooltip({
        inDuration: 200,
        outDuration: 150,
        margin: 3
    });

    // $('.modal').modal();
    $('select').formSelect();
    $('#modal-color-select').dropdown({
        coverTrigger: false,
        constrainWidth: false
    });

    // Close dropdowns if user clicks anywhere else in the window
    $(window).on('click', (event) => {
        $('.color-dropdown-trigger-bookmark').dropdown('close');
        $('.collection-add-dropdown-trigger').dropdown('close');
        $('.show-all-tags').dropdown('close');
    });

    // Configure materialize dropdown for adding to a collection
    $('.collection-add-dropdown-trigger').dropdown({
        coverTrigger: false,
        constrainWidth: false
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

    // Configure modal form for creating/viewing a bookmark
    $('#newBookmarkModal').modal({
        // When the modal is first opened, load content
        onOpenStart: function(modal, trigger) {
            const id = $($(trigger).children()[0]).attr("value");
            if (id) {
                $('#modal-go-btn').show();
                $('#add-bookmark-btn').hide();
                $('#bookmark-modal-header').text("View/edit Bookmark");
                $.ajax({
                    url: '/api/bookmarks?id=' + id,
                    method: 'GET'
                }).then( (res) => {
                    $('#bookmark-name').val(res.name);
                    $('#bookmark-url').val(res.url);
                    $('.bookmark-btn').attr('data-url', res.url);
                    $('#bookmark-comment').val(res.comment);
                    $('#save-bookmark-btn').attr("data-id", id);
                    $('#save-bookmark-btn').show();
                    const tagNames = res.Tags.map(t => ( {tag: t.tagName} ));
                    console.log(tagNames);

                    $('.modal-chips').chips({
                        secondaryPlaceholder: '+Tag',
                        data: tagNames,
                        onChipAdd: (event, chip) => { addTagFromModal(id, chip); },
                        onChipSelect: () => { },
                        onChipDelete: (event, chip) => { deleteTagFromModal(id, chip); }
                    });
                    M.updateTextFields();

                }).fail( (err) => {
                    alert(err.responseText);
                });
            } else {
                $('#modal-go-btn').hide();
                $('#add-bookmark-btn').show();
                $('.modal-chips').chips({
                    secondaryPlaceholder: '+Tag',
                    onChipAdd: (event, chip) => {
                        tags.push(chip.firstChild.textContent);
                    },
                    onChipDelete: (event, chip) => {
                        const toDeleteIdx = 
                            tags.findIndex( e => e === chip.firstChild.textContent);
                        tags.splice(toDeleteIdx, 1);
                    }
                });

            }
            M.updateTextFields();
        }
    });

    /******************************************************
     * Editing a collection
     *      modal form
     *      edit button
     *      name edit input field
     *      save button
    *******************************************************/
    // Configure the modal form
    $('#edit-collection-modal').modal({
        onOpenStart: (modal, trigger) => {
            const currentName = $(modal).attr('data-current-name');
            $('#edit-collection-name').val(currentName);
            M.updateTextFields();
        }
    });

    // Handle clicking 'EDIT' button on a collection
    $('.collection-edit-btn').on('click', (event) => {
        event.stopPropagation();
        const target = $(event.target);
        $('#edit-collection-modal').attr('data-current-name', target.attr('data-current-name'));
        $('#edit-collection-save-btn').attr('data-id', target.attr('data-id'));
        $('#edit-collection-modal').modal('open');
        const id = target.attr('data-id');
        
    });

    // Disable save button if name field empty
    $('#edit-collection-name').on('input', (event) => {
        if ($('#edit-collection-name').val() === '') {
            $('#edit-collection-save-btn').addClass('disabled');
        } else {
            $('#edit-collection-save-btn').removeClass('disabled');
        }
    });

    // Submit the api request to change the collection name when the 'Save' button is clicked
    $('#edit-collection-save-btn').on('click', (event) => {
        $.ajax({
            url: '/api/collections/name',
            method: 'PUT',
            data: { 
                id: $('#edit-collection-save-btn').attr('data-id'),
                newName: $('#edit-collection-name').val().trim()
            }
        }).then((result) => {
            location.reload()
        }).fail((err) => {
            alert(err.responseText);
        });
    });
    /** *************************************************** */


    $('#newCollectionModal').modal();

    // Helper function to add a new tag to an existing bookmark
    function addTagFromModal(bookmark, chip) {
        $.ajax({
            url:'/api/tags/',
            method: 'POST',
            data: {
                name: chip.firstChild.textContent,
                bookmark: bookmark
            }
        }).then( (res) => {

        }).fail( (err) => {
            alert(err.responseText);
        });
    }

    // Helper function to remove a tag from an existing bookmark
    function deleteTagFromModal(bookmark, chip) {

        $.ajax({
            url: '/api/tags/?name=' + chip.firstChild.textContent,
            method: 'GET'
        }).then( (res) => {
            if (res.name) {
                $.ajax({
                    url: '/api/tags/' + res.id + '/' + bookmark,
                    method: 'DELETE'
                }).then( (res) => {

                }).fail( (err) => {
                    alert(err.responseText);
                });
            }
        }).fail( (err) => {
            alert(err.responseText);
        });
    }

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
            location.replace('/');
        }).fail( (err) => {
            console.log(err);
        });
    });

    $('.bookmark-li').on('click', (event) => {
        event.preventDefault();
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

    $('.bookmark-btn').on('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.open($(event.target).attr("data-url"));
    });

    $('.bookmark-delete-btn').on('click', (event) => {
        event.stopPropagation();
        const id = $(event.target).attr("data-id");
        $.ajax({
            url: "/api/bookmarks/" + id,
            method: "DELETE"
        }).then( (res) => {
            location.reload();
        }).fail( (err) => {
            alert(err.responseText);
        });
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
        }).then( (res) => {
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
        }).then( (res) => {

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
        }).then( (res) => {
            $('.modal').modal('close');
            location.reload();
        }).fail( (err) => {
            alert(err.responseText);
        })
    });

    $('#add-bookmark-btn').on('click', (event) => {
        event.stopPropagation();
        const newName = $('#bookmark-name').val().trim();
        const URL = $('#bookmark-url').val();
        const comment = $('#bookmark-comment').val().trim();

        $.ajax( {
            url: '/api/bookmarks/',
            type: "POST",
            data: {
                'name': newName,
                'url': URL,
                'comment': comment,
                'tags': tags
            }
        }).then( (e) => {
            $('.modal').modal('close');
            location.reload();
        }).fail( (err) => {
            alert(err.responseText);
        })
    });

    // Handle saving edits to an existing bookmark
    $('#save-bookmark-btn').on('click', (event) => {
        const id = $('#save-bookmark-btn').attr("data-id");
        $.ajax({
            url: "/api/bookmarks/name",
            method: "PUT",
            data: {
                id: id,
                newName: $('#bookmark-name').val()
            }
        }).then( (res) => {
            $.ajax({
                url: "/api/bookmarks/url",
                method: "PUT",
                data: {
                    id: id,
                    newURL: $('#bookmark-url').val()
                }
            }).then( (res) => {
                $.ajax({
                    url: "/api/bookmarks/comment",
                    method: "PUT",
                    data: {
                        id: id,
                        newComment: $('#bookmark-comment').val()
                    }
                }).then( (res) => {

                }).fail( (err) => {
                    alert(err.responseText);
                });
            }).fail((err) => {
                alert(err.responseText);
            });

            location.reload();
        }).fail( (err) => {
            alert(err.responseText);
        });
    });
    
});