import type { Sequelize } from 'sequelize';
import { User } from './user.model';
import { Product } from './product.model';
import { Order } from './order.model';
import { Category } from './category.model';

export {
    User,
    Product,
    Order,
    Category
};

export function initModels(sequelize: Sequelize) {
    User.initModel(sequelize);
    Product.initModel(sequelize);
    Order.initModel(sequelize);
    Category.initModel(sequelize);

    // product associations
    Category.hasMany(Product, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });
    Product.belongsTo(Category, {
        foreignKey: {
            allowNull: false,
        },
    });

    User.hasMany(Product, {
        foreignKey: {
            allowNull: false,
        },
    });
    Product.belongsTo(User, {
        foreignKey: {
            allowNull: false,
        },
    });

    // order associations
    // Order.hasMany(Product, {
    //     foreignKey: {
    //         allowNull: false,
    //     },
    //     onDelete: 'CASCADE',
    // });
    // Product.belongsTo(Order, {
    //     foreignKey: {
    //         allowNull: false,
    //     },
    // });

    return {
        User,
        Product,
        Order,
        Category,
    };
}
