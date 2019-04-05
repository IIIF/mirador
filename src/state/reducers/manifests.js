import { update, unset } from './utils';
import ActionTypes from '../actions/action-types';

/**
 * manifestsReducer
 */
export const manifestsReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.REQUEST_MANIFEST:
      return update(state, [action.manifestId], {
        ...action.properties,
        id: action.manifestId,
      });

    case ActionTypes.RECEIVE_MANIFEST:
      return update(state, [action.manifestId], {
        error: null, // Explicitly set the error to null in case this is a re-fetch
        id: action.manifestId,
        isFetching: false,
        json: action.manifestJson,
      });

    case ActionTypes.RECEIVE_MANIFEST_FAILURE:
      return update(state, [action.manifestId], {
        error: action.error,
        id: action.manifestId,
        isFetching: false,
      });

    case ActionTypes.REMOVE_MANIFEST:
      return unset(state, [action.manifestId]);

    default: return state;
  }
};
