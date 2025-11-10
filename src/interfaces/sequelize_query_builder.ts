import { Op } from 'sequelize';
export type OrderDirection = 'asc' | 'desc';
export type OrderClause = [string, OrderDirection];
export type WhereAutoClause = { [Op.and]?: object[]; [Op.or]?: object[] };

export type QueryParameterType = 'string' | 'number' | 'boolean';
export type QueryParameterOperation = 'eq' | 'ne' | 'like' | 'gt' | 'gte' | 'lt' | 'lte' | 'null' | 'notnull' | 'in' | 'notin' | 'within' | 'notwithin' | 'contains' | 'notcontains' | 'disjoint' | 'intersects';
