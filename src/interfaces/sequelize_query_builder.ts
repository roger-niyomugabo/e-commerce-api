import { Op } from 'sequelize';
export type OrderDirection = 'asc' | 'desc';
export type OrderClause = [string, OrderDirection];
export type WhereAutoClause = { [Op.and]?: object[]; [Op.or]?: object[] };

export type QueryParameterType = 'string' | 'number' | 'boolean';
