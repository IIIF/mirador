/**
 *
 */
export default class CanvasGroupings {
  /**
   */
  constructor(canvases, viewType = 'single') {
    this.canvases = canvases;
    this.viewType = viewType;
    this._groupings = null;
    this._canvasGroupingMap = null;
  }

  /**
   */
  getCanvases(index) {
    switch (this.viewType) {
      case 'scroll':
        return this.groupings()[0];
      case 'book':
        return this.groupings()[this._canvasGroupingMap[index]];
      default:
        return this.groupings()[index];
    }
  }

  /**
   * Groups a set of canvases based on the view type. Single, is just an array
   * of canvases, while book view creates pairs.
   */
  groupings() {
    if (this._groupings) {
      return this._groupings;
    }
    if (this.viewType === 'scroll') {
      return [this.canvases];
    }
    if (this.viewType !== 'book') {
      return this.canvases.map(canvas => [canvas]);
    }
    const groupings = [];
    const canvasGroupingMap = [];
    let groupIndex = 0;
    this.canvases.forEach((canvas, i) => {
      if (!groupings[groupIndex]) {
        groupings[groupIndex] = [];
      }

      canvasGroupingMap[i] = groupIndex;

      if (i === 0) {
        canvasGroupingMap[i] = groupIndex;
        groupings[groupIndex].push(canvas);
        groupIndex += 1;
        return;
      }

      const hint = canvas && (
        (canvas.getBehavior && canvas.getBehavior())
        || (canvas.getViewingHint && canvas.getViewingHint())
      );

      if (hint === 'facing-pages' || hint === 'non-paged') {
        if (groupings[groupIndex].length > 0) {
          groupIndex += 1;
          canvasGroupingMap[i] = groupIndex;
        }

        groupings[groupIndex] = [canvas];
        groupIndex += 1;
        return;
      }

      if (groupings[groupIndex].length < 2) {
        groupings[groupIndex].push(canvas);
      }

      if (groupings[groupIndex].length === 2) {
        groupIndex += 1;
      }
    });
    this._groupings = groupings;
    this._canvasGroupingMap = canvasGroupingMap;
    return groupings;
  }
}
