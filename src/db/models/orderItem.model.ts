/* eslint-disable @typescript-eslint/member-ordering */
import {
    Association,
    CreationOptional,
    DataTypes,
    ForeignKey,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize } from 'sequelize';
import { OrderClause, QueryParameterType, WhereAutoClause } from 'interfaces/sequelize_query_builder';
import { buildOrderSequelizeFilters, buildSelectionSequelizeFilters, buildWhereSequelizeFilters } from '../../utils';
import { Product } from './product.model';
import { Order } from './order.model';

export class OrderItem extends Model<
InferAttributes<OrderItem>,
InferCreationAttributes<OrderItem>
> {
    declare id: CreationOptional<string>;
    declare orderId: ForeignKey<Order['id']>;
    declare productId: ForeignKey<Product['id']>;
    declare quantity: number;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // OrderItem belongs to product
    declare product?: NonAttribute<Product>;
    declare getProduct: HasManyGetAssociationsMixin<Product>;
    declare setProduct: HasManySetAssociationsMixin<Product, number>;
    declare createProduct: HasManyCreateAssociationMixin<Product>;

    // OrderItem belongs to order
    declare order?: NonAttribute<Order>;
    declare getOrder: HasManyGetAssociationsMixin<Order>;
    declare setOrder: HasManySetAssociationsMixin<Order, number>;
    declare createOrder: HasManyCreateAssociationMixin<Order>;

    declare static associations: {
        Product: Association<OrderItem, Product>;
        Order: Association<OrderItem, Order>;
    };

    static initModel(sequelize: Sequelize): typeof OrderItem {
        OrderItem.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                unique: true,
                autoIncrement: false,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            quantity: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
        }, {
            modelName: 'orderItem',
            sequelize,
        });

        return OrderItem;
    }

    static selectionAllowedFields: string[] =
        ['id', 'quantity', 'createdAt', 'updatedAt'];
    static defaultSortFields: OrderClause[] = [
        ['createdAt', 'desc'],
    ];
    static sortAllowedFields: string[] = ['quantity', 'createdAt', 'updatedAt'];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } = {
        id: { type: 'string' },
        quantity: { type: 'number' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getOrderQuery(query: any): OrderClause[] {
        return buildOrderSequelizeFilters(query, this.defaultSortFields, this.sortAllowedFields);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getSelectionQuery(query: any): string[] {
        return buildSelectionSequelizeFilters(query, this.selectionAllowedFields);
    }

    /**
     * Be careful when using this function. It may return one Op.and and one Op.or
     * You have to make sure the combination of your normal where query and the result
     * that could come here can be coupled correctly
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getWhereQuery(query: any): WhereAutoClause {
        return buildWhereSequelizeFilters(query, this.queryAllowedFields);
    }
}
