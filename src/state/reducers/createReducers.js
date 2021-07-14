import deepmerge from 'deepmerge';

/**
 * Create a table reducer.
 *
 * A table reducer is a reducer that treats its data as a database-like table
 * where each table consists of rows that have fields and each row has an ID.
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
 * @param {Object} actionTypes
 * @return {Function}
 */
export function createTableReducer(actionTypes) {
  return function tableReducer(state = { order: [] }, action) {
    switch (action.type) {
      case actionTypes.create:
        return { ...state, [action.id]: action.payload };

      case actionTypes.update:
        return { ...state, [action.id]: deepmerge(state[action.id], action.payload) };

      case actionTypes.delete:
        return Object.keys(state).reduce((object, key) => {
          if (key !== action.id) {
            object[key] = state[key]; // eslint-disable-line no-param-reassign
          }
          return object;
        }, {});

      case actionTypes.order:
        return { ...state, order: action.payload };

      default:
        return state;
    }
  };
}

/**
 * Create a singleton reducer.
 *
 * In contrast to a table reducer (see above), a singleton reducer is a reducer
 * that treats its data as a plain javascript object with no further constraints
 * on the object structure.
 *
 * The `actionTypes` parameter is an object that maps from provided reducer actions
 * to action type constants. Example:
 *
 *  {
 *    update: 'UPDATE_ITEM',
 *  }
 * @param {Object} actionTypes
 * @return {Function}
 */
export function createSingletonReducer(actionTypes) {
  return function singletonReducer(state = {}, action) {
    switch (action.type) {
      case actionTypes.update:
        return deepmerge(state, action.payload);
      default:
        return state;
    }
  };
}
