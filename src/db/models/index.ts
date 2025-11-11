import type { Sequelize } from 'sequelize';
import { User } from './user.model';
import { Product } from './product.model';
import { Order } from './order.model';
import { Category } from './category.model';
import { OrderItem } from './orderItem.model';

export {
    User,
    Product,
    Order,
    Category,
    OrderItem
};

export function initModels(sequelize: Sequelize) {
    User.initModel(sequelize);
    Product.initModel(sequelize);
    Order.initModel(sequelize);
    Category.initModel(sequelize);
    OrderItem.initModel(sequelize);

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
    User.hasMany(Order, {
        foreignKey: {
            allowNull: false,
        },
    });
    Order.belongsTo(User, {
        foreignKey: {
            allowNull: false,
        },
    });
    OrderItem.belongsTo(Product, {
        foreignKey: {
            allowNull: false,
        },
    });
    Product.hasMany(OrderItem, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });
    Order.hasMany(OrderItem, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });
    OrderItem.belongsTo(Order, {
        foreignKey: {
            allowNull: false,
        },
    });

    return {
        User,
        Product,
        Order,
        OrderItem,
        Category,
    };
}
