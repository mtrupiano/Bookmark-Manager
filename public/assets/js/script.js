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

    $('select').formSelect();

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
    });

    $('.color-dropdown-trigger-collection').dropdown({
        coverTrigger: false
    });

    $('#color-dropdown-trigger-modal').dropdown({
        coverTrigger: false,
        container: document.getElementById('list-container')
    });

    // Configure modal form for creating/viewing a bookmark
    $('#newBookmarkModal').modal({
        // When the modal is first opened, load content
        onOpenStart: function(modal, trigger) {
            const id = $($(trigger).children()[0]).attr("data-id");
            if (id) {
                $('#modal-go-btn').show();
                $('#add-bookmark-btn').hide();
                $('#save-bookmark-btn').show();
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
                $('#save-bookmark-btn').hide();
                $('#bookmark-modal-header').text("New Bookmark");
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
     ******************************************************/
    // Configure the modal form
    $('#edit-collection-modal').modal({
        onOpenStart: (modal, trigger) => {
            const currentName = $(modal).attr('data-current-name');
            const id = $(modal).attr('data-id');
            console.log(id);
            $.ajax({
                url: '/api/collections/color?id=' + id,
                method: 'GET'
            }).then( (result) => {
                if (result.color === 'rgb(255, 255, 255)') {
                    $('#modal-color-display').text('panorama_fish_eye');
                    $('#modal-color-display').css('color', 'rgb(56, 56, 56)');
                } else if (result.color === null) {
                    $('#modal-color-display').text('remove');
                    $('#modal-color-display').css('color', 'rgb(56, 56, 56)');
                } else {
                    $('#modal-color-display').text('circle');
                    $('#modal-color-display').css('color', result.color);
                }
            }).fail( (err) => {
                alert(err.responseText);
            });

            $('#modal-color-select-dropdown').attr('data-id', id);
            $('#edit-collection-name').val(currentName);
            $.ajax({
                url: '/api/collections/path?id=' + id,
                method: 'GET'
            }).then( (result) => {
                $('#parent-collection-path').text(result);
                $('#path-current-name').text(currentName);
                M.updateTextFields();
            }).fail((err) => {
                alert(err.responseText);
            });
        }
    });

    // Handle clicking 'EDIT' button on a collection
    $('.collection-edit-btn').on('click', (event) => {
        event.stopPropagation();
        const target = $(event.target);
        $('#edit-collection-modal').attr('data-current-name', target.attr('data-current-name'));
        $('#edit-collection-modal').attr('data-id', target.attr('data-id'));
        $('#edit-collection-save-btn').attr('data-id', target.attr('data-id'));
        $('#edit-collection-modal').modal('open');
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
        event.preventDefault();
        const id = $('#edit-collection-save-btn').attr('data-id');
        const newName = $('#edit-collection-name').val().trim();
        $.ajax({
            url: '/api/collections/name',
            method: 'PUT',
            data: { 
                id, newName
            }
        }).then((result) => {
            console.log(result);
            $(`#collection-li-name-${id}`).text(newName);
            $(`#collection-edit-btn-${id}`).attr('data-current-name', newName);
            $('#edit-collection-modal').modal('close');
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

    // Trigger the new bookmark modal when the 'new collection' dropdown button is clicked
    $('.new-collection').on('click', (event) => {
        event.stopPropagation();
        const targetCollectionID = $(event.target).attr('data-id');

        $('#newCollectionModal').attr('data-parent', targetCollectionID);
        $('#newCollectionModal').modal('open');
    });

    // Trigger the new bookmark modal when the 'new bookmark' dropdown button is clicked
    $('.new-bookmark').on('click',(event) => {
        event.stopPropagation();
        const targetCollectionID = $(event.target).attr('data-id');

        $('#newBookmarkModal').attr('data-parent', targetCollectionID);
        $('#newBookmarkModal').modal('open');
    });

    $('.new-color').on('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const id = $(event.target).attr('data-id');
        console.log(id);
    });

    $('.bookmark-btn').on('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.open($(event.target).attr('data-url'));
    });

    $('.bookmark-delete-btn').on('click', (event) => {
        event.stopPropagation();
        const id = $(event.target).attr('data-id');
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
        const id = $(event.target).attr('data-id');
        $.ajax({
            url: '/api/collections/' + id,
            method: 'DELETE'
        }).then( (res) => {
            location.reload();
        }).fail((err) => {
            alert(err.responseText);
        });
    });

    $('.bookmark-move-btn').on('click', (event) => {
        event.stopPropagation();
        const id = $(event.target).attr('data-id');
    });

    $('.collection-move-btn').on('click', (event) => {
        event.stopPropagation();
        const id = $(event.target).attr('data-id');
    });

    // Handle changing an entity's color
    $('.color-dropdown-select').on('click', (event) => {
        event.stopPropagation();

        const target = $(event.target);
        let newColor, targetEntityID, targetDropdownList, apiURL, targetEntity;

        if (target.prop('tagName') === 'LI') {

            targetDropdownList = target.parent();
            targetEntityID = targetDropdownList.attr('data-id');

            newColor = ($($(target.children()[0]).children()[0])).css('color');
            if (newColor === 'rgb(56, 56, 56)') {
                newColor = 'rgb(255, 255, 255)';
            }

        } else if (target.prop('tagName') === 'I') {

            targetDropdownList = target.parent().parent().parent();
            targetEntityID = targetDropdownList.attr('data-id');

            newColor = target.css("color");
            if (newColor === 'rgb(56, 56, 56)') {
                newColor = 'rgb(255, 255, 255)';
            }
        }

        console.log(targetEntityID);
        
        if (targetDropdownList.hasClass('color-dropdown-collection')) {
            apiURL = '/api/collections/color';
            targetEntity = $(`.color-dropdown-trigger-collection[data-id=${targetEntityID}]`);
        } else {
            apiURL = '/api/bookmarks/color';
            targetEntity = $(`.color-dropdown-trigger-bookmark[data-id=${targetEntityID}]`)
        } 

        if (targetDropdownList.attr('id') === 'modal-color-select-dropdown') {
            if (newColor === 'rgb(255, 255, 255)') {
                $('#modal-color-display').text('panorama_fish_eye');
                $('#modal-color-display').css('color', 'rgb(56, 56, 56)');
            } else {
                $('#modal-color-display').text('circle');
                $('#modal-color-display').css('color', newColor);
            }
        }

        $.ajax({
            url: apiURL,
            type: 'PUT',
            data: {
                "ids": [targetEntityID],
                "newColor": newColor
            },
            processData: true
        }).then( (res) => {
            console.log(targetEntity.children()[0])
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

    // Handle adding new collection (from modal form)
    $('#add-collection-btn').on('click', (event) => {
        event.stopPropagation();
        const params = {};
        params.name = $('#new-collection-name').val().trim();

        if ($('#newCollectionModal').attr('data-parent')) {
            params.ParentCollection = $('#newCollectionModal').attr('data-parent');
        }

        $.ajax({
            url: '/api/collections/',
            type: "POST",
            data: params
        }).then( (res) => {
            $('.modal').modal('close');
            location.reload();
        }).fail( (err) => {
            alert(err.responseText);
        });
    });

    // Handle adding a new bookmark (from modal form)
    $('#add-bookmark-btn').on('click', (event) => {
        event.stopPropagation();
        const queryParams = {
            name: $('#bookmark-name').val().trim(),
            url: $('#bookmark-url').val(),
            comment: $('#bookmark-comment').val().trim(),
            tags: tags
        }

        if ($('#newBookmarkModal').attr('data-parent')) {
            queryParams.collections = [$('#newBookmarkModal').attr('data-parent')];
        }

        console.log(queryParams);
        $.ajax( {
            url: '/api/bookmarks/',
            type: "POST",
            data: queryParams
        }).then( (results) => {
            $('.modal').modal('close');
            tags.length = 0;
            location.reload();
        }).fail( (err) => {
            alert(err.responseText);
        });
    });

    // Handle saving edits to an existing bookmark
    $('#save-bookmark-btn').on('click', (event) => {
        event.preventDefault();
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
    
    $('.cancel-btn').on('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        $('.modal').modal('close');
    });
});