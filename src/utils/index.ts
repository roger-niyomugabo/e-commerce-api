import { Op, Sequelize } from 'sequelize';
import { OrderClause, QueryParameterOperation, QueryParameterType, WhereAutoClause } from '../interfaces/sequelize_query_builder';

/**
 * Ensures every env variable passed in 'env_vars' is defined and has a value.
 * @param {array} env_vars Array of strings with the env variables to check
 * @return {array} Array with the errored env vars that do not pass the check. If the array has any content then there are errors.
 */
export const checkEnvVars = (env_vars: string[]): string[] => {
    const errored_vars: string[] = [];
    for (const env of env_vars) {
        if (typeof process.env[env] === 'undefined' || process.env[env] === '') {
            errored_vars.push(env);
        }
    }

    return errored_vars;
};

/**
 * Process pagination in order to return elements in pages and in a determinate count
 * @param {number} page number of page that you want in your request
 * @param {number} count number of items you need every page
 * @return {object} Object with the page, offset (from which element are you going to return) and the page_size (max number)
 */
export const processPagination = (page: number, count: number) => {
    const page_number: number = page ? page : 1;
    const page_size: number = count ? count : 20;

    return { page: page_number, offset: (page_number - 1) * page_size, limit: page_size };
};

/**
 * Process pagination in order to return elements in pages and in a determinate count
 * @param {number} page requesting page
 * @param {number} pageSize all pages number
 * @param {number} count items in every page
 * @param {number} items all items
 * @return {object} Object with actual page, the total pages, the total items and the data (items)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const computePaginationRes = (page: number, pageSize: number, count: number, items: any[]) => {
    const realCount: number = count ? count : 0;
    const totalPages: number = realCount ? Math.ceil(realCount / pageSize) : 1;

    return { page: page, totalPages: totalPages, totalItems: realCount, items: items };
};

/**
* Creates an order object for Sequelize models.
* @param {any} query query object coming in the request from where sorting is computed
* @param {OrderClause[]} defaultSortFields default sorting object to use
* @param {string[]} sortAllowedFields fields allowed to be sorted
* @return {OrderClause[]} Order object to include in a Sequelize model query
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildOrderSequelizeFilters = (query: any, defaultSort: OrderClause[], sortAllowedFields: string[]): OrderClause[] => {
    const order: OrderClause[] = [];

    if (typeof query?.sort !== 'string') {
        return defaultSort;
    }

    const sortingFields: string[] = query.sort.split(',');
    for (const field of sortingFields) {
        const [fieldName, orderBy] = field.split(' ');
        if (sortAllowedFields.includes(fieldName)) {
            orderBy === 'desc'
                ? order.push([fieldName, 'desc'])
                : order.push([fieldName, 'asc']);
        }
    }

    return [...order, ...defaultSort];
};

/**
* Creates an attributes object for Sequelize models (attribute selection).
* @param {any} query query object coming in the request from where attributes to return are computed
* @param {string[]} selectionAllowedFields fields allowed to be returned
* @return {string[]} Attributes list to include in a Sequelize model query
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const buildSelectionSequelizeFilters = (query: any, selectionAllowedFields: string[]): string[] => {
    const include: string[] = (typeof query?.include === 'string')
        ? query.include.split(',').filter(x => selectionAllowedFields.includes(x))
        : [];
    const exclude: string[] = (typeof query?.exclude === 'string')
        ? query.exclude.split(',').filter(x => selectionAllowedFields.includes(x))
        : [];

    let result: string[] = [];
    if (!include.length && !exclude.length) {
        result = selectionAllowedFields;
    } else if (include.length && !exclude.length) {
        result = include;
    } else if (!include.length && exclude.length) {
        result = selectionAllowedFields.filter(x => !exclude.includes(x));
    } else {
        result = include.filter(x => !exclude.includes(x));
    }

    if (!result.length) {
        result = selectionAllowedFields;
    }

    return result;
};
/**
* Parses a string and makes it a boolean
* Only recognize as false "false", "no", "0" and ""
* Anything else is interpreted as true
*/
export const parseStringToBoolean = (str: string): boolean => {
    if (typeof str !== 'string'){
        return false;
    }
    switch (str.toLowerCase()) {
        case 'false':
        case 'no':
        case '0':
        case '':
            return false;
        // break;
        default:
            return true;
    }
};

/**
* Creates a where object for Sequelize models (attribute selection).
* @param {any} query query object coming in the request from where attributes to return are computed
* @param {string[]} queryAllowedFields definitions of fields allowed to be queried with its query parameter type
* @return {string[]} Attributes list to include in a Sequelize model query
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any, sonarjs/cognitive-complexity
export const buildWhereSequelizeFilters = (query: any, queryAllowedFields: { [field: string]: { type: QueryParameterType } }): WhereAutoClause => {
    const allowedFields = Object.keys(queryAllowedFields);

    const orArrayClauses = [];
    const andArrayClauses = [];
    const result = {};

    // Get fields that will be in the or clause
    const fieldsForOr: string[] = (typeof query?.or === 'string') ? query?.or.split(',') : [];

    // For each field in the query
    for (const field in query) {
        // Check that field value is string
        if (!(typeof query[field] === 'string')) {
            continue;
        }
        // Get field name and operation
        const periodPos = field.lastIndexOf('.');
        const fieldName = (periodPos > 0) ? field.substring(0, periodPos) : field;
        const fieldOperation = (periodPos > 0) ? field.substring(periodPos + 1) : 'eq';
        // Check that the field can be used to query
        if (!allowedFields.includes(fieldName)) {
            continue;
        }
        // Build clause
        const clause = buildWhereClauseSequelize(fieldName, query[field], queryAllowedFields[fieldName].type, fieldOperation as QueryParameterOperation);
        // Check clause is valid
        if (!clause) {
            continue;
        }
        // Include clause in or or and group
        if (fieldsForOr.includes(field)) {
            orArrayClauses.push(clause);
        } else {
            andArrayClauses.push(clause);
        }
    }

    if (andArrayClauses.length) {
        result[Op.and] = andArrayClauses;
    }
    if (orArrayClauses.length) {
        result[Op.or] = orArrayClauses;
    }
    return result;
};

/**
* Creates a where clause for Sequelize models from a query parameter operation and type
* @param {string} value Value of the query parameter
* @param {QueryParameterType} type query parameter type
* @param {QueryParameterOperation} operation query parameter operation to apply
* @return {any} where clause with the query for the parameter or false if the clause could bot be built
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any, sonarjs/cognitive-complexity
export const buildWhereClauseSequelize = (field: string, value: string, type: QueryParameterType, operation: QueryParameterOperation): any => {
    const operationMapper = { eq: Op.eq, ne: Op.ne, like: Op.iLike, gt: Op.gt, gte: Op.gte, lt: Op.lt, lte: Op.lte, null: Op.is, notnull: Op.not, in: Op.in, notin: Op.notIn };

    const stringOperations: QueryParameterOperation[] = ['eq', 'ne', 'like', 'gt', 'gte', 'lt', 'lte', 'null', 'notnull', 'in', 'notin'];
    const numberOperations: QueryParameterOperation[] = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'null', 'notnull', 'in', 'notin'];
    const booleanOperations: QueryParameterOperation[] = ['eq', 'null', 'notnull'];
    const geometryOperations: QueryParameterOperation[] = ['eq', 'ne', 'null', 'notnull', 'within', 'notwithin', 'contains', 'notcontains', 'disjoint', 'intersects'];

    const op = operation || 'eq';
    let finalValue: string | number | boolean = value;

    if (type === 'string') {
        if (!stringOperations.includes(op)) {
            return false;
        }
    } else if (type === 'number') {
        if (!numberOperations.includes(op)) {
            return false;
        }
        finalValue = Number(value);
        if (isNaN(finalValue)) {
            return false;
        }
    } else if (type === 'boolean') {
        if (!booleanOperations.includes(op)) {
            return false;
        }
        finalValue = parseStringToBoolean(value);
    } else if (type === 'geometry') {
        if (!geometryOperations.includes(op)) {
            return false;
        }

        // Special ops for geometry
        if (op === 'eq') {
            return Sequelize.fn('ST_Equals', Sequelize.col(field), Sequelize.fn('ST_GeomFromGeoJSON', value));
        } else if (op === 'ne') {
            return { [Op.not]: Sequelize.fn('ST_Equals', Sequelize.col(field), Sequelize.fn('ST_GeomFromGeoJSON', value)) };
        } else if (op === 'within') {
            return Sequelize.fn('ST_Within', Sequelize.col(field), Sequelize.fn('ST_GeomFromGeoJSON', value));
        } else if (op === 'notwithin') {
            return { [Op.not]: Sequelize.fn('ST_Within', Sequelize.col(field), Sequelize.fn('ST_GeomFromGeoJSON', value)) };
        } else if (op === 'contains') {
            return Sequelize.fn('ST_Contains', Sequelize.col(field), Sequelize.fn('ST_GeomFromGeoJSON', value));
        } else if (op === 'notcontains') {
            return { [Op.not]:Sequelize.fn('ST_Contains', Sequelize.col(field), Sequelize.fn('ST_GeomFromGeoJSON', value)) };
        } else if (op === 'disjoint') {
            return Sequelize.fn('ST_Disjoint', Sequelize.col(field), Sequelize.fn('ST_GeomFromGeoJSON', value));
        } else if (op === 'intersects') {
            return Sequelize.fn('ST_Intersects', Sequelize.col(field), Sequelize.fn('ST_GeomFromGeoJSON', value));
        }
    } else {
        return false;
    }

    if (op === 'like') {
        return { [field]: { [Op.iLike]: '%' + value + '%' } };
    }
    if (op === 'in') {
        return { [field]: { [Op.in]: value.split(',') } };
    }
    if (op === 'notin') {
        return { [field]: { [Op.notIn]: value.split(',') } };
    }
    if (op === 'null') {
        return { [field]: { [Op.is]: null } };
    }
    if (op === 'notnull') {
        return { [field]: { [Op.ne]: null } };
    }

    return { [field]: { [operationMapper[op]]: finalValue } };
};
