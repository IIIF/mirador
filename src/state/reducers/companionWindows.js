import { set, update, unset } from './utils';
import ActionTypes from '../actions/action-types';

/** */
export function companionWindowsReducer(state = {}, action) {
  switch (action.type) {
    case ActionTypes.ADD_COMPANION_WINDOW:
      return set(state, [action.id], action.payload);

    case ActionTypes.ADD_WINDOW:
      return action.companionWindows.reduce((acc, cw) => set(acc, [cw.id], cw), state);

    case ActionTypes.REMOVE_WINDOW:
      return action.companionWindowIds.reduce((acc, id) => unset(acc, [id]), state);

    case ActionTypes.UPDATE_COMPANION_WINDOW:
      return update(state, [action.id], action.payload);

    case ActionTypes.REMOVE_COMPANION_WINDOW:
      return unset(state, [action.id]);

    default:
      return state;
  }
}
