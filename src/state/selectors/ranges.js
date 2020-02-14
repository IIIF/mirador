import { createSelector } from 'reselect';
import union from 'lodash/union';
import { Utils } from 'manifesto.js';
import { getManifestTreeStructure } from './manifests';
import { getVisibleCanvases } from './canvases';
import { getCompanionWindow } from './companionWindows';

/** */
function rangeContainsCanvasId(range, canvasId) {
  const canvasIds = range.getCanvasIds();
  for (let i = 0; i < canvasIds.length; i += 1) {
    if (Utils.normalisedUrlsMatch(canvasIds[i], canvasId)) {
      return true;
    }
  }
  return false;
}

/** */
function getVisibleRangeIdsInSubTree(nodes, canvasIds) {
  return nodes.reduce((rangeIdAcc, node) => {
    const currentBranchRangeIds = [];
    const currentLeafRangeIds = [];
    const currentCanvasRangeIds = [];
    const nodeContainsVisibleCanvas = canvasIds.reduce(
      (acc, canvasId) => acc || rangeContainsCanvasId(node.data, canvasId),
      false,
    );
    if (node.nodes.length > 0) {
      const subTreeVisibleRangeIds = node.nodes.length > 0
        ? getVisibleRangeIdsInSubTree(node.nodes, canvasIds) : {
          branchRangeIds: [],
          canvasRangeIds: [],
          leafRangeIds: [],
        };
      currentBranchRangeIds.push(...subTreeVisibleRangeIds.branchRangeIds);
      currentLeafRangeIds.push(...subTreeVisibleRangeIds.leafRangeIds);
      currentCanvasRangeIds.push(...subTreeVisibleRangeIds.canvasRangeIds);
    }
    if (currentBranchRangeIds.length > 0
      || currentLeafRangeIds.length > 0
      || nodeContainsVisibleCanvas) {
      if (node.nodes.length > 0) {
        currentBranchRangeIds.push(node.data.id);
      } else {
        currentLeafRangeIds.push(node.data.id);
      }
      if (nodeContainsVisibleCanvas) {
        currentCanvasRangeIds.push(node.data.id);
      }
    }
    rangeIdAcc.branchRangeIds.push(...currentBranchRangeIds);
    rangeIdAcc.canvasRangeIds.push(...currentCanvasRangeIds);
    rangeIdAcc.leafRangeIds.push(...currentLeafRangeIds);
    return rangeIdAcc;
  }, {
    branchRangeIds: [],
    canvasRangeIds: [],
    leafRangeIds: [],
  });
}

/** */
const getVisibleLeafAndBranchRangeIds = createSelector(
  [
    getManifestTreeStructure,
    getVisibleCanvases,
  ],
  (tree, canvases) => {
    if (!canvases) {
      return {
        branchRangeIds: [],
        canvasRangeIds: [],
        leafRangeIds: [],
      };
    }
    const canvasIds = canvases.map(canvas => canvas.id);
    return getVisibleRangeIdsInSubTree(tree.nodes, canvasIds);
  },
);

/** */
export const getVisibleRangeIds = createSelector(
  [
    getVisibleLeafAndBranchRangeIds,
  ],
  visibleLeafAndBranchRangeIds => union(visibleLeafAndBranchRangeIds.leafRangeIds, visibleLeafAndBranchRangeIds.branchRangeIds),
);

const getVisibleBranchRangeIds = createSelector(
  [
    getVisibleLeafAndBranchRangeIds,
  ],
  visibleLeafAndBranchRangeIds => visibleLeafAndBranchRangeIds.branchRangeIds,
);

const getCanvasContainingRangeIds = createSelector(
  [
    getVisibleLeafAndBranchRangeIds,
  ],
  visibleLeafAndBranchRangeIds => visibleLeafAndBranchRangeIds.canvasRangeIds,
);

/** */
export function getManuallyExpandedRangeIds(state, { companionWindowId }) {
  const companionWindow = getCompanionWindow(state, { companionWindowId });
  return companionWindow.expandedRangeIds || [];
}

/** */
export function getExpandedRangeIds(state, { ...args }) {
  const visibleBranchRangeIds = getVisibleBranchRangeIds(state, { ...args });
  const manuallyExpandedRangeIds = getManuallyExpandedRangeIds(state, { ...args });
  return union(manuallyExpandedRangeIds, visibleBranchRangeIds);
}

/** */
export function getRangeIdToScrollTo(state, { ...args }) {
  const canvasContainingRangeIds = getCanvasContainingRangeIds(state, { ...args });
  if (canvasContainingRangeIds) {
    return canvasContainingRangeIds[0];
  }
  return null;
}
