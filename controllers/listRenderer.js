const express   = require('express');
const router    = express.Router();
const db        = require('../models');

const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

router.get("/home", async function(request, response) {

    // Check if logged in
    if (!request.session.user) {
        response.status(401).redirect("/");
        return;
    }
    
    const returnObj = {};

    const uncategorizedBookmarks = (await db.sequelize.query(
        'SELECT `id`, `name`, `url`, `color`, `Tags.name` FROM Bookmarks ' +
        'LEFT JOIN bookmark_collections ON bookmark_collections.BookmarkId = Bookmarks.id ' +
        'LEFT JOIN bookmark_tags ON bookmark_tags.BookmarkId = Bookmarks.id ' +
        'WHERE bookmark_collections.BookmarkId IS NULL ' +
        'AND Bookmarks.UserId = ' + request.session.user.id, { type: QueryTypes.SELECT }));

    returnObj.bookmarks = uncategorizedBookmarks;

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