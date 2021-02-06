

module.exports = function (sequelize, DataTypes) {
    const Bookmark = sequelize.define("Bookmark", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1]
            }
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true 
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        color: {
            type: DataTypes.ENUM,
            values: [
                'rgb(0, 0, 0)', // white
                'rgb(255, 255, 255)', // black 
                'rgb(255, 0, 0)', 
                'rgb(0, 0, 255)', 
                'rgb(255, 255, 0)', 
                'rgb(0, 128, 0)', 
                'rgb(255, 165, 0)', 
                'rgb(128, 0, 128)', 
                'rgb(255, 192, 203)'
            ],
            //Alt. Colors lightgray, black, crimson, royalblue, gold, mediumseagreen, orange, purple, palevioletred
            allowNull: true
        }
    });

    Bookmark.associate = function(models) {
        Bookmark.belongsTo(models.User);
        Bookmark.belongsToMany(models.Tag, { through: 'bookmark_tags' });
        Bookmark.belongsToMany(models.Collection, { through: 'bookmark_collections' });
    }

    return Bookmark;
}