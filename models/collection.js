

module.exports = function (sequelize, DataTypes) {
    const Collection = sequelize.define("Collection", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: [2]
            }
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
            ],        }
    });

    Collection.associate = function(models) {
        Collection.belongsTo(models.User);
        Collection.belongsToMany(models.Bookmark, {through: 'bookmark_collections'});
        Collection.hasMany(Collection, {foreignKey: 'ParentCollection'});

    }

    return Collection;
}