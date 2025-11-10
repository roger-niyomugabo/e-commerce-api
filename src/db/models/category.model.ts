/* eslint-disable @typescript-eslint/member-ordering */
import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize } from 'sequelize';
import { OrderClause, QueryParameterType, WhereAutoClause } from 'interfaces/sequelize_query_builder';
import { buildOrderSequelizeFilters, buildSelectionSequelizeFilters, buildWhereSequelizeFilters } from '../../utils';

export class Category extends Model<
InferAttributes<Category>,
InferCreationAttributes<Category>
> {
    declare id: CreationOptional<string>;
    declare name: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static initModel(sequelize: Sequelize): typeof Category {
        Category.init({
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                unique: true,
                autoIncrement: false,
                allowNull: false,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            createdAt: {
                type: DataTypes.DATE,
            },
            updatedAt: {
                type: DataTypes.DATE,
            },
        }, {
            modelName: 'category',
            sequelize,
        });

        return Category;
    }

    static selectionAllowedFields: string[] = ['id', 'name', 'createdAt', 'updatedAt'];
    static defaultSortFields: OrderClause[] = [
        ['name', 'asc'], ['createdAt', 'desc'],
    ];
    static sortAllowedFields: string[] = ['name', 'createdAt', 'updatedAt'];
    static queryAllowedFields: { [field: string]: { type: QueryParameterType } } = {
        id: { type: 'string' },
        name: { type: 'string' },
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
