import { set, update, unset } from './utils';
import ActionTypes from '../actions/action-types';

/**
 * windowsReducer
 */
export const windowsReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.ADD_WINDOW:
      return set(state, [action.window.id], action.window);

    case ActionTypes.MAXIMIZE_WINDOW:
      return set(state, [action.windowId, 'maximized'], true);

    case ActionTypes.MINIMIZE_WINDOW:
      return set(state, [action.windowId, 'maximized'], false);

    case ActionTypes.UPDATE_WINDOW:
      return update(state, [action.id], action.payload);

    case ActionTypes.REMOVE_WINDOW:
      return unset(state, [action.windowId]);

    case ActionTypes.TOGGLE_WINDOW_SIDE_BAR:
      return update(state, [action.windowId], props => ({
        ...props,
        sideBarOpen: !props.sideBarOpen,
      }));

    case ActionTypes.SET_WINDOW_VIEW_TYPE:
      return set(state, [action.windowId, 'view'], action.viewType);

    case ActionTypes.SET_WINDOW_SIDE_BAR_PANEL:
      return set(state, [action.windowId, 'sideBarPanel'], action.panelType);

    case ActionTypes.UPDATE_WINDOW_POSITION:
      return update(state, [action.payload.windowId], {
        x: action.payload.position.x,
        y: action.payload.position.y,
      });

    case ActionTypes.SET_WINDOW_SIZE:
      return update(state, [action.payload.windowId], {
        height: action.payload.size.height,
        width: action.payload.size.width,
        x: action.payload.size.x,
        y: action.payload.size.y,
      });

    case ActionTypes.SET_CANVAS:
      return set(state, [action.windowId, 'canvasIndex'], action.canvasIndex);

    case ActionTypes.ADD_COMPANION_WINDOW:
      if (action.payload.position === 'left') {
        const { companionWindowIds } = state[action.windowId];
        const { companionWindows } = action;
        const newCompanionWindowIds = companionWindowIds
          .filter(id => companionWindows[id].position !== action.payload.position);

        return update(state, [action.windowId], {
          companionAreaOpen: true,
          companionWindowIds: newCompanionWindowIds.concat([action.id]),
          sideBarPanel: action.payload.content,
        });
      }
      return update(state, [action.windowId], props => ({
        ...props,
        companionWindowIds: props.companionWindowIds.concat([action.id]),
      }));

    case ActionTypes.REMOVE_COMPANION_WINDOW:
      return update(state, [action.windowId], props => ({
        ...props,
        companionWindowIds: props.companionWindowIds.filter(id => id !== action.id),
      }));

    case ActionTypes.SELECT_ANNOTATION:
      return update(state, [action.windowId, 'selectedAnnotations', action.canvasId],
        arr => [...(arr || []), action.annotationId]);

    case ActionTypes.DESELECT_ANNOTATION: {
      const selectedAnnotations = updatedSelectedAnnotations(state, action);
      return update(state, [action.windowId], { selectedAnnotations });
    }

    case ActionTypes.TOGGLE_ANNOTATION_DISPLAY:
      return update(state, [action.windowId], props => ({
        ...props,
        displayAllAnnotations: !props.displayAllAnnotations,
      }));

    default:
      return state;
  }
};

/**
 * Handle removing IDs from selectedAnnotations
 * where empty canvasIDs are removed from state as well
 */
function updatedSelectedAnnotations(state, action) {
  const filteredIds = state[action.windowId]
    .selectedAnnotations[action.canvasId]
    .filter(id => id !== action.annotationId);

  if (filteredIds.length > 0) {
    return {
      ...state[action.windowId].selectedAnnotations,
      [action.canvasId]: filteredIds,
    };
  }

  return unset(state[action.windowId].selectedAnnotations, [action.canvasId]);
}
