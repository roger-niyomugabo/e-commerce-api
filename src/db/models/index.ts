import type { Sequelize } from 'sequelize';
import { User } from './user.model';
import { Product } from './product.model';
import { Order } from './order.model';

export {
    User,
    Product,
    Order
};

export function initModels(sequelize: Sequelize) {
    User.initModel(sequelize);
    Product.initModel(sequelize);
    Order.initModel(sequelize);

    Order.hasMany(Product, {
        foreignKey: {
            allowNull: false,
        },
        onDelete: 'CASCADE',
    });
    Product.belongsTo(Order, {
        foreignKey: {
            allowNull: false,
        },
    });

    return {
        User,
        Product,
        Order,
    };
}
