import uuid from 'uuid/v4';

/**
 * Create and return action creators for a table reducer.
 *
 * The `actionTypes` parameter is an object that maps from provided reducer actions
 * to action type constants. Example:
 *
 *  {
 *    create: 'CREATE_ITEM',
 *    update: 'UPDATE_ITEM',
 *    delete: 'DELETE_ITEM',
 *    order: 'SET_ITEM_ORDER'
 *  }
 *
 * The function names of the returned action creators are the camel-cased type constants.
 * Given the above example, the function name for the delete action will be `deleteItem`.
 *
 * @param {Object} actionTypes
 * @param {String} idPrefix - prefix for the item id in state
 * @param {Object} defaultProps - default properties for an item. Used in the create action.
 * @return {Object} - Object of actions creator functions.
 */
export function createTableReducerActions(actionTypes, idPrefix, defaultProps) {
  /**
  * Returns a create action for a table reducer.
  *
  * @param {Object} payload - Data that will be set to the item by the table reducer.
  *   It gets shallow merged with the default properties and therefore may overrides the defaults.
  * @param {String} id - Optional. Sets the item ID explicitly.
  *   Otherwise the ID will be created automatically.
  * @return {Object}
  */
  function createItem(payload, customId) {
    const id = customId || `${idPrefix}-${uuid()}`;
    return {
      type: actionTypes.create,
      id,
      payload: { ...defaultProps, ...payload },
    };
  }

  /**
  * Returns an update action for a table reducer.
  *
  * @param {String} id - ID of item to be updated.
  * @param {Object} payload - Update data.
  *   It gets deep merged with the existing item data by the table reducer.
  * @return {Object}
  */
  function updateItem(id, payload) {
    return { type: actionTypes.update, id, payload };
  }

  /**
  * Returns an delete action for a table reducer.
  *
  * @param {String} id - ID of item to be deleted.
  * @return {Object}
  */
  function deleteItem(id) {
    return { type: actionTypes.delete, id };
  }

  /**
  * Returns an order action for a table reducer.
  *
  * The `order` property exists in the state of the reducer.
  * It can be used to indicate the item order.
  *
  * @param {Array} payload - An array of IDs that will be set to the `order` property.
  * @return {Object}
  */
  function setItemOrder(payload) {
    return { type: actionTypes.order, payload };
  }

  return {
    [toCamelCase(actionTypes.create)]: createItem,
    [toCamelCase(actionTypes.update)]: updateItem,
    [toCamelCase(actionTypes.delete)]: deleteItem,
    [toCamelCase(actionTypes.order)]: setItemOrder,
  };
}

/**
 * Create and return action creators for a singleton reducer.
 *
 * The `actionTypes` parameter is an object that maps from provided reducer actions
 * to action type constants. Example:
 *
 *  {
 *    update: 'UPDATE_ITEM',
 *  }
 *
 * The function names of the returned action creators are the camel-cased type constants.
 * Given the above example, the function name for the update action will be `updateItem`.
 *
 * @param {Object} actionTypes
 * @return {Object} - Object of actions creator functions.
 */
export function createSingletonReducerActions(actionTypes) {
  /**
  * Returns an update action for a singleton reducer.
  *
  * @param {payload}- Update data.
  *   It gets deep merged with the existing item data by the singleton reducer.
  */
  function updateItem(payload) {
    return { type: actionTypes.update, payload };
  }

  return {
    [toCamelCase(actionTypes.update)]: updateItem,
  };
}

/**
* Translates an action type constant to a function name.
*
* E.g.: UPDATE_ITEM --> updateItem
*
* @param {String} constant
* @return {String}
*/
function toCamelCase(constant) {
  return constant
    .split('_')
    .map(word => word.toLowerCase())
    .map((word, index) => (index === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join('');
}
