import {
  createTableReducer,
  createSingletonReducer,
} from '../../../src/state/reducers/createReducers';

describe('table reducer', () => {
  const actionTypes = {
    create: 'CREATE_ITEM',
    update: 'UPDATE_ITEM',
    delete: 'DELETE_ITEM',
    order: 'SET_ITEM_ORDER',
  };

  const state = {
    'item-1': {
      a: 1,
      b: 2,
    },
    'item-2': {
      c: 3,
      d: 4,
    },
    order: ['item-1', 'item-2'],
  };

  describe('createTableReducer', () => {
    it('should return a function', () => {
      const reducer = createTableReducer(actionTypes);
      expect(reducer).toBeInstanceOf(Function);
    });
  });

  describe('created table reducer', () => {
    it('initial state is object with empty "order" array', () => {
      const reducer = createTableReducer(actionTypes);
      const newState = reducer(undefined, {});
      const expected = { order: [] };
      expect(newState).toStrictEqual(expected);
    });

    it('returns unchanged state when action type is not supported', () => {
      const reducer = createTableReducer(actionTypes);
      const newState = reducer(state, { type: 'UNSUPPORTED_ACTION_TYPE_3E4F' });
      expect(newState).toStrictEqual(state);
    });

    describe('handling of create action', () => {
      it('should add action.payload to state. key should be taken from action.id.', () => {
        const reducer = createTableReducer(actionTypes);
        const payload = { bar: 77 };
        const action = { type: actionTypes.create, id: 'item-3', payload };
        const newState = reducer(state, action);
        expect(newState['item-3']).toStrictEqual(payload);
        // no changes in other items
        expect(newState['item-1']).toStrictEqual(state['item-1']);
        expect(newState['item-2']).toStrictEqual(state['item-2']);
      });
    });

    describe('handling of update action', () => {
      it('should update item by id. id is taken from action.id', () => {
        const reducer = createTableReducer(actionTypes);
        const payload = { a: 42, x: 66 };
        const action = { type: actionTypes.update, id: 'item-1', payload };
        const newState = reducer(state, action);
        expect(newState['item-1']).toStrictEqual({ a: 42, b: 2, x: 66 });
        // no changes in other items
        expect(newState['item-2']).toStrictEqual(state['item-2']);
      });

      it('should not alter the state when payload is empy object', () => {
        const reducer = createTableReducer(actionTypes);
        const payload = {};
        const action = { type: actionTypes.update, id: 'item-1', payload };
        const newState = reducer(state, action);
        expect(newState['item-1']).toStrictEqual(state['item-1']);
        // no changes in other items
        expect(newState['item-2']).toStrictEqual(state['item-2']);
      });
    });

    describe('handling of delete action', () => {
      it('should delete item from state. id is taken from action.id', () => {
        const reducer = createTableReducer(actionTypes);
        const action = { type: actionTypes.delete, id: 'item-1' };
        const newState = reducer(state, action);
        expect(newState['item-1']).toBeUndefined();
        // no changes in other items
        expect(newState['item-2']).toStrictEqual(state['item-2']);
      });
    });

    describe('handling of order action', () => {
      it('should set payload to "order" property', () => {
        const reducer = createTableReducer(actionTypes);
        const payload = [7, 6, 5, 4];
        const action = { type: actionTypes.order, payload };
        const newState = reducer(state, action);
        expect(newState.order).toStrictEqual(payload);
      });
    });
  });
});

describe('singelton reducer', () => {
  const actionTypes = {
    update: 'UPDATE_ITEM',
  };

  const state = {
    a: 1,
    b: [2, 3],
    c: {
      d: 4,
      e: { f: 5 },
    },
  };

  describe('createSingletonReducer', () => {
    it('should return a function', () => {
      const reducer = createSingletonReducer(actionTypes);
      expect(reducer).toBeInstanceOf(Function);
    });
  });

  describe('created singelton reducer', () => {
    it('initial state is empty object', () => {
      const reducer = createSingletonReducer(actionTypes);
      const newState = reducer(undefined, {});
      expect(newState).toStrictEqual({});
    });

    it('returns unchanged state when action type is not supported', () => {
      const reducer = createSingletonReducer(actionTypes);
      const newState = reducer(state, { type: 'UNSUPPORTED_ACTION_TYPE_3E4F' });
      expect(newState).toStrictEqual(state);
    });

    describe('handling of update action', () => {
      it('should update the state by deep merging payload object', () => {
        const reducer = createSingletonReducer(actionTypes);
        const payload = { a: 11, c: { e: { f: 55 } } };
        const newState = reducer(state, { type: actionTypes.update, payload });
        expect(newState).toStrictEqual({
          a: 11,
          b: [2, 3],
          c: {
            d: 4,
            e: { f: 55 },
          },
        });
      });
    });
  });
});
