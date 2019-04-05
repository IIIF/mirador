import { set, unset } from './utils';
import ActionTypes from '../actions/action-types';

/**
 * infoResponsesReducer
 */
export const infoResponsesReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.REQUEST_INFO_RESPONSE:
      return set(state, [action.infoId], {
        id: action.infoId,
        isFetching: true,
      });

    case ActionTypes.RECEIVE_INFO_RESPONSE:
      return set(state, [action.infoId], {
        id: action.infoId,
        isFetching: false,
        json: action.infoJson,
      });

    case ActionTypes.RECEIVE_INFO_RESPONSE_FAILURE:
      return set(state, [action.infoId], {
        error: action.error,
        id: action.infoId,
        isFetching: false,
      });

    case ActionTypes.REMOVE_INFO_RESPONSE:
      return unset(state, [action.infoId]);

    default: return state;
  }
};
