import {
  createTableReducerActions,
  createSingletonReducerActions,
} from '../../../src/state/reducers/createActions';

describe('table reducer actions', () => {
  const actionTypes = {
    create: 'CREATE_ITEM',
    update: 'UPDATE_ITEM',
    delete: 'DELETE_ITEM',
    order: 'SET_ITEM_ORDER',
  };

  const idPrefix = 'item';

  const defaultProps = {
    foo: 'bar',
  };

  describe('createTableReducerActions', () => {
    it('should return object with correct function names', () => {
      const actionCreators = createTableReducerActions(actionTypes);
      expect(actionCreators.createItem).toBeInstanceOf(Function);
      expect(actionCreators.updateItem).toBeInstanceOf(Function);
      expect(actionCreators.deleteItem).toBeInstanceOf(Function);
      expect(actionCreators.setItemOrder).toBeInstanceOf(Function);
    });
  });

  describe('create action creator', () => {
    it('should return correct action type', () => {
      const { createItem } = createTableReducerActions(actionTypes);
      const action = createItem();
      expect(action.type).toBe('CREATE_ITEM');
    });

    it('should set the passed id to the action', () => {
      const { createItem } = createTableReducerActions(actionTypes, idPrefix, defaultProps);
      const action = createItem({}, 'item-xyz');
      expect(action.id).toBe('item-xyz');
    });

    it('should create an id if no id is given.', () => {
      const { createItem } = createTableReducerActions(actionTypes, idPrefix, defaultProps);
      const action = createItem();
      expect(typeof action.id).toBe('string');
    });

    it('should merge default properties to payload', () => {
      const { createItem } = createTableReducerActions(actionTypes, idPrefix, defaultProps);
      const action = createItem();
      expect(action.payload).toMatchObject(defaultProps);
    });


    it('should merge passed data object to payload', () => {
      const { createItem } = createTableReducerActions(actionTypes, idPrefix, defaultProps);
      const action = createItem({ bubu: 'kiki' });
      expect(action.payload).toMatchObject({ foo: 'bar', bubu: 'kiki' });
    });

    it('passed data object can overwrite default props and id', () => {
      const { createItem } = createTableReducerActions(actionTypes, idPrefix, defaultProps);
      const action = createItem({ foo: 'kiki', id: 42 });
      expect(action.payload).toEqual({ foo: 'kiki', id: 42 });
    });
  });

  describe('update action creator', () => {
    it('should return correct action type', () => {
      const { updateItem } = createTableReducerActions(actionTypes);
      const action = updateItem();
      expect(action.type).toBe('UPDATE_ITEM');
    });

    it('should set the passed id to the action', () => {
      const { updateItem } = createTableReducerActions(actionTypes);
      const action = updateItem(33, {});
      expect(action.id).toBe(33);
    });

    it('should set the data object to the action', () => {
      const { updateItem } = createTableReducerActions(actionTypes);
      const action = updateItem(33, { bubu: 'kiki' });
      expect(action.payload).toEqual({ bubu: 'kiki' });
    });
  });

  describe('delete action creator', () => {
    it('should return correct action type', () => {
      const { deleteItem } = createTableReducerActions(actionTypes);
      const action = deleteItem();
      expect(action.type).toBe('DELETE_ITEM');
    });

    it('should set the passed id to the action', () => {
      const { deleteItem } = createTableReducerActions(actionTypes);
      const action = deleteItem(33);
      expect(action.id).toBe(33);
    });
  });

  describe('order action creator', () => {
    it('should return correct action type', () => {
      const { setItemOrder } = createTableReducerActions(actionTypes);
      const action = setItemOrder();
      expect(action.type).toBe('SET_ITEM_ORDER');
    });

    it('should set the passed data object to payload', () => {
      const { setItemOrder } = createTableReducerActions(actionTypes);
      const action = setItemOrder([1, 2, 3]);
      expect(action.payload).toEqual([1, 2, 3]);
    });
  });
});

describe('Singleton reducer actions', () => {
  const actionTypes = {
    update: 'UPDATE_ITEM',
  };

  describe('createSingletonReducerActions', () => {
    it('should return object with correct function names', () => {
      const actionCreators = createSingletonReducerActions(actionTypes);
      expect(actionCreators.updateItem).toBeInstanceOf(Function);
    });
  });

  describe('update action creator', () => {
    it('should return correct action type', () => {
      const { updateItem } = createSingletonReducerActions(actionTypes);
      const action = updateItem();
      expect(action.type).toBe('UPDATE_ITEM');
    });

    it('should set passe data object to payload', () => {
      const { updateItem } = createSingletonReducerActions(actionTypes);
      const action = updateItem({ bubu: 'kiki' });
      expect(action.payload).toEqual({ bubu: 'kiki' });
    });
  });
});
