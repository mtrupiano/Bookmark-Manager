const express = require('express');
const router = express.Router();

const db = require('../models');

const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

// Show log-in screen or re-direct to home screen if already logged in
router.get("/", function(request, response) {
    // Check if logged in
    if (!request.session.user) {
        response.render("splash");
    } else {
        response.redirect("/home");
    }
});

// Retrieve details for a single bookmark and render them to a modal form
router.get("/bookmark/:id", function (request, response) {

    db.Bookmark.findOne({
        where: {
            id: request.params.id
        },
        attributes: [['name', 'bookmarkName'], 'color', 'url', 'comment'],
        include: {
            model: db.Tag,
            attributes: [['id', 'tagID'], ['name', 'tagName']],
            through: { attributes: [] }
        }
    }).then((result) => {
        response.json(result);
    }).catch((err) => {
        response.status(500).json(err);
    });

});

// Retrieve all collections and bookmarks from db and render them
router.get("/home", async function (request, response) {

    // Check if logged in
    if (!request.session.user) {
        response.status(401).redirect("/");
        return;
    }

    const returnObj = {};

    const uncategorizedBookmarks = (await db.sequelize.query(
        'SELECT Bookmarks.id, Bookmarks.name, `url`, `color`, GROUP_CONCAT(Tags.name) AS Tags FROM Bookmarks ' +
        'LEFT JOIN bookmark_collections ON bookmark_collections.BookmarkId = Bookmarks.id ' +
        'LEFT JOIN bookmark_tags ON bookmark_tags.BookmarkId = Bookmarks.id ' +
        'LEFT JOIN Tags ON Tags.id = bookmark_tags.TagId ' +
        'WHERE bookmark_collections.BookmarkId IS NULL ' +
        'AND Bookmarks.UserId = ' + request.session.user.id + ' ' +
        'GROUP BY Bookmarks.id', { type: QueryTypes.SELECT }));

    returnObj.bookmarks = uncategorizedBookmarks;

    for (let i = 0; i < uncategorizedBookmarks.length; i++) {
        if (uncategorizedBookmarks[i].Tags) {
            returnObj.bookmarks[i].Tags = returnObj.bookmarks[i].Tags.split(',').map(e => ({ tagName: e }));
        }
    }

    // 2. GET ALL TOP-LVL COLLECTIONS
    const topLevelCollections = (await db.Collection.findAll({
        where: {
            UserId: request.session.user.id,
            ParentCollection: { [Op.is]: null }
        },
        attributes: ['id', 'name', 'color']
    })).map(collection => collection.dataValues);

    // 3. FOR EACH COLLECTION, GET ALL SUB-COLLECTIONS AND BOOKMARKS
    for (let i = 0; i < topLevelCollections.length; i++) {
        topLevelCollections[i].collections
            = await getSubcollections(topLevelCollections[i].id,
                request.session.user.id);

        topLevelCollections[i].bookmarks
            = (await db.Bookmark.findAll({
                where: {
                    UserId: request.session.user.id
                },
                include: {
                    model: db.Collection,
                    where: {
                        id: topLevelCollections[i].id
                    },
                    through: {
                        attributes: []
                    },
                    attributes: []
                },
                attributes: ['id', 'name', 'url', 'color']
            })).map(bookmark => bookmark.dataValues);
    }

    const username = await db.User.findOne({
        where: {
            id: request.session.user.id
        },
        attributes: ['username']
    });

    returnObj.collections = topLevelCollections;
    returnObj.username = username.dataValues.username;
    // response.json(returnObj);
    response.render("home", returnObj);
});

// Recursive function to retrieve all subcollections in every collection
async function getSubcollections(collectionId, userId) {
    const subCollections = (await db.Collection.findAll({
        where: {
            ParentCollection: collectionId
        },
        attributes: ['id', 'name', 'color']
    })).map(collection => collection.dataValues);

    // Recursively get all subcollections and their respective bookmarks
    for (let i = 0; i < subCollections.length; i++) {

        subCollections[i].collections
            = await getSubcollections(subCollections[i].id, userId);

        // Get all bookmarks in each subcollection
        subCollections[i].bookmarks
            = (await db.Bookmark.findAll({
                where: {
                    UserId: userId
                },
                include: {
                    model: db.Collection,
                    where: {
                        id: subCollections[i].id
                    },
                    through: {
                        attributes: []
                    },
                    attributes: []
                },
                attributes: ['id', 'name', 'url', 'color']
            })).map(bookmark => bookmark.dataValues);
    }

    return subCollections;
}

module.exports = router;