import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import xor from 'lodash/xor';
import OpenSeadragonCanvasOverlay from '../lib/OpenSeadragonCanvasOverlay';
import CanvasWorld from '../lib/CanvasWorld';
import CanvasAnnotationDisplay from '../lib/CanvasAnnotationDisplay';

/**
 * Represents a OpenSeadragonViewer in the mirador workspace. Responsible for mounting
 * and rendering OSD.
 */
export class AnnotationsOverlay extends Component {
  /**
   * annotationsMatch - compares previous annotations to current to determine
   * whether to add a new updateCanvas method to draw annotations
   * @param  {Array} currentAnnotations
   * @param  {Array} prevAnnotations
   * @return {Boolean}
   */
  static annotationsMatch(currentAnnotations, prevAnnotations) {
    if (!currentAnnotations && !prevAnnotations) return true;
    if (
      (currentAnnotations && !prevAnnotations)
      || (!currentAnnotations && prevAnnotations)
    ) return false;

    if (currentAnnotations.length === 0 && prevAnnotations.length === 0) return true;
    if (currentAnnotations.length !== prevAnnotations.length) return false;
    return currentAnnotations.every((annotation, index) => {
      const newIds = annotation.resources.map(r => r.id);
      const prevIds = prevAnnotations[index].resources.map(r => r.id);
      if (newIds.length === 0 && prevIds.length === 0) return true;
      if (newIds.length !== prevIds.length) return false;

      if ((annotation.id === prevAnnotations[index].id) && (isEqual(newIds, prevIds))) {
        return true;
      }
      return false;
    });
  }

  /**
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.ref = React.createRef();
    this.osdCanvasOverlay = null;
    // An initial value for the updateCanvas method
    this.updateCanvas = () => {};
    this.onUpdateViewport = this.onUpdateViewport.bind(this);
    this.onCanvasClick = this.onCanvasClick.bind(this);
    this.onCanvasMouseMove = debounce(this.onCanvasMouseMove.bind(this), 10);
    this.onCanvasExit = this.onCanvasExit.bind(this);
  }

  /**
   * React lifecycle event
   */
  componentDidMount() {
    this.initializeViewer();
  }

  /**
   * When the tileSources change, make sure to close the OSD viewer.
   * When the annotations change, reset the updateCanvas method to make sure
   * they are added.
   * When the viewport state changes, pan or zoom the OSD viewer as appropriate
   */
  componentDidUpdate(prevProps) {
    const {
      drawAnnotations,
      drawSearchAnnotations,
      annotations, searchAnnotations,
      hoveredAnnotationIds, selectedAnnotationId,
      highlightAllAnnotations,
      viewer,
    } = this.props;

    this.initializeViewer();

    const annotationsUpdated = !AnnotationsOverlay.annotationsMatch(
      annotations, prevProps.annotations,
    );
    const searchAnnotationsUpdated = !AnnotationsOverlay.annotationsMatch(
      searchAnnotations, prevProps.searchAnnotations,
    );

    const hoveredAnnotationsUpdated = (
      xor(hoveredAnnotationIds, prevProps.hoveredAnnotationIds).length > 0
    );

    if (this.osdCanvasOverlay && hoveredAnnotationsUpdated) {
      if (hoveredAnnotationIds.length > 0) {
        this.osdCanvasOverlay.canvasDiv.style.cursor = 'pointer';
      } else {
        this.osdCanvasOverlay.canvasDiv.style.cursor = '';
      }
    }

    const selectedAnnotationsUpdated = selectedAnnotationId !== prevProps.selectedAnnotationId;

    const redrawAnnotations = drawAnnotations !== prevProps.drawAnnotations
      || drawSearchAnnotations !== prevProps.drawSearchAnnotations
      || highlightAllAnnotations !== prevProps.highlightAllAnnotations;

    if (
      searchAnnotationsUpdated
      || annotationsUpdated
      || selectedAnnotationsUpdated
      || hoveredAnnotationsUpdated
      || redrawAnnotations
    ) {
      this.updateCanvas = this.canvasUpdateCallback();
      viewer.forceRedraw();
    }
  }

  /**
   */
  componentWillUnmount() {
    const { viewer } = this.props;

    viewer.removeHandler('canvas-click', this.onCanvasClick);
    viewer.removeHandler('canvas-exit', this.onCanvasExit);
    viewer.removeHandler('update-viewport', this.onUpdateViewport);
    viewer.removeHandler('mouse-move', this.onCanvasMouseMove);
  }

  /** */
  onCanvasClick(event) {
    const {
      canvasWorld,
    } = this.props;

    const { position: webPosition, eventSource: { viewport } } = event;
    const point = viewport.pointFromPixel(webPosition);

    const canvas = canvasWorld.canvasAtPoint(point);
    if (!canvas) return;
    const [
      _canvasX, _canvasY, canvasWidth, canvasHeight, // eslint-disable-line no-unused-vars
    ] = canvasWorld.canvasToWorldCoordinates(canvas.id);

    // get all the annotations that contain the click
    const annos = this.annotationsAtPoint(canvas, point);

    if (annos.length > 0) {
      event.preventDefaultAction = true; // eslint-disable-line no-param-reassign
    }

    if (annos.length === 1) {
      this.toggleAnnotation(annos[0].id);
    } else if (annos.length > 0) {
      /**
       * Try to find the "right" annotation to select after a click.
       *
       * This is perhaps a naive method, but seems to deal with rectangles and SVG shapes:
       *
       * - figure out how many points around a circle are inside the annotation shape
       * - if there's a shape with the fewest interior points, it's probably the one
       *       with the closest boundary?
       * - if there's a tie, make the circle bigger and try again.
       */
      const annosWithClickScore = (radius) => {
        const degreesToRadians = Math.PI / 180;

        return (anno) => {
          let score = 0;
          for (let degrees = 0; degrees < 360; degrees += 1) {
            const x = Math.cos(degrees * degreesToRadians) * radius + point.x;
            const y = Math.sin(degrees * degreesToRadians) * radius + point.y;

            if (this.isAnnotationAtPoint(anno, canvas, { x, y })) score += 1;
          }

          return { anno, score };
        };
      };

      let annosWithScore = [];
      let radius = 1;
      annosWithScore = sortBy(annos.map(annosWithClickScore(radius)), 'score');

      while (radius < Math.max(canvasWidth, canvasHeight)
        && annosWithScore[0].score === annosWithScore[1].score) {
        radius *= 2;
        annosWithScore = sortBy(annos.map(annosWithClickScore(radius)), 'score');
      }

      this.toggleAnnotation(annosWithScore[0].anno.id);
    }
  }

  /** */
  onCanvasMouseMove(event) {
    const {
      annotations,
      canvasWorld,
      hoverAnnotation,
      hoveredAnnotationIds,
      searchAnnotations,
      viewer,
      windowId,
    } = this.props;

    if (annotations.length === 0 && searchAnnotations.length === 0) return;

    const { position: webPosition } = event;
    const point = viewer.viewport.pointFromPixel(webPosition);

    const canvas = canvasWorld.canvasAtPoint(point);
    if (!canvas) {
      hoverAnnotation(windowId, []);
      return;
    }

    const annos = this.annotationsAtPoint(canvas, point);

    if (xor(hoveredAnnotationIds, annos.map(a => a.id)).length > 0) {
      hoverAnnotation(windowId, annos.map(a => a.id));
    }
  }

  /** If the cursor leaves the canvas, wipe out highlights */
  onCanvasExit(event) {
    const {
      hoverAnnotation,
      windowId,
    } = this.props;

    // a move event may be queued up by the debouncer
    this.onCanvasMouseMove.cancel();
    hoverAnnotation(windowId, []);
  }

  /**
   * onUpdateViewport - fires during OpenSeadragon render method.
   */
  onUpdateViewport(event) {
    this.updateCanvas();
  }

  /** @private */
  initializeViewer() {
    const { viewer } = this.props;

    if (!viewer) return;
    if (this.osdCanvasOverlay) return;

    this.osdCanvasOverlay = new OpenSeadragonCanvasOverlay(viewer, this.ref);

    viewer.addHandler('canvas-click', this.onCanvasClick);
    viewer.addHandler('canvas-exit', this.onCanvasExit);
    viewer.addHandler('update-viewport', this.onUpdateViewport);
    viewer.addHandler('mouse-move', this.onCanvasMouseMove);

    this.updateCanvas = this.canvasUpdateCallback();
  }

  /** */
  canvasUpdateCallback() {
    return () => {
      this.osdCanvasOverlay.clear();
      this.osdCanvasOverlay.resize();
      this.osdCanvasOverlay.canvasUpdate(this.renderAnnotations.bind(this));
    };
  }

  /** @private */
  isAnnotationAtPoint(resource, canvas, point) {
    const {
      canvasWorld,
    } = this.props;

    const [canvasX, canvasY] = canvasWorld.canvasToWorldCoordinates(canvas.id);
    const relativeX = point.x - canvasX;
    const relativeY = point.y - canvasY;

    if (resource.svgSelector) {
      const context = this.osdCanvasOverlay.context2d;
      const { svgPaths } = new CanvasAnnotationDisplay({ resource });
      return [...svgPaths].some(path => (
        context.isPointInPath(new Path2D(path.attributes.d.nodeValue), relativeX, relativeY)
      ));
    }

    if (resource.fragmentSelector) {
      const [x, y, w, h] = resource.fragmentSelector;
      return x <= relativeX && relativeX <= (x + w)
        && y <= relativeY && relativeY <= (y + h);
    }
    return false;
  }

  /** @private */
  annotationsAtPoint(canvas, point) {
    const {
      annotations, searchAnnotations,
    } = this.props;

    const lists = [...annotations, ...searchAnnotations];
    const annos = flatten(lists.map(l => l.resources)).filter((resource) => {
      if (canvas.id !== resource.targetId) return false;

      return this.isAnnotationAtPoint(resource, canvas, point);
    });

    return annos;
  }

  /** */
  toggleAnnotation(id) {
    const {
      selectedAnnotationId,
      selectAnnotation,
      deselectAnnotation,
      windowId,
    } = this.props;

    if (selectedAnnotationId === id) {
      deselectAnnotation(windowId, id);
    } else {
      selectAnnotation(windowId, id);
    }
  }

  /**
   * annotationsToContext - converts anontations to a canvas context
   */
  annotationsToContext(annotations, palette) {
    const {
      highlightAllAnnotations, hoveredAnnotationIds, selectedAnnotationId, canvasWorld,
      viewer,
    } = this.props;
    const context = this.osdCanvasOverlay.context2d;
    const zoomRatio = viewer.viewport.getZoom(true) / viewer.viewport.getMaxZoom();
    annotations.forEach((annotation) => {
      annotation.resources.forEach((resource) => {
        if (!canvasWorld.canvasIds.includes(resource.targetId)) return;
        const offset = canvasWorld.offsetByCanvas(resource.targetId);
        const scaleFactor = canvasWorld.scaleByCanvas(resource.targetId);
        const canvasAnnotationDisplay = new CanvasAnnotationDisplay({
          hovered: hoveredAnnotationIds.includes(resource.id),
          offset,
          palette: {
            ...palette,
            default: {
              ...palette.default,
              ...(!highlightAllAnnotations && palette.hidden),
            },
          },
          resource,
          scaleFactor,
          selected: selectedAnnotationId === resource.id,
          zoomRatio,
        });
        canvasAnnotationDisplay.toContext(context);
      });
    });
  }

  /** */
  renderAnnotations() {
    const {
      annotations,
      drawAnnotations,
      drawSearchAnnotations,
      searchAnnotations,
      palette,
    } = this.props;

    if (drawSearchAnnotations) {
      this.annotationsToContext(searchAnnotations, palette.search);
    }

    if (drawAnnotations) {
      this.annotationsToContext(annotations, palette.annotations);
    }
  }

  /**
   * Renders things
   */
  render() {
    const { viewer } = this.props;

    if (!viewer) return <></>;

    return ReactDOM.createPortal(
      (
        <div
          ref={this.ref}
          style={{
            height: '100%', left: 0, position: 'absolute', top: 0, width: '100%',
          }}
        >
          <canvas />
        </div>
      ),
      viewer.canvas,
    );
  }
}

AnnotationsOverlay.defaultProps = {
  annotations: [],
  deselectAnnotation: () => {},
  drawAnnotations: true,
  drawSearchAnnotations: true,
  highlightAllAnnotations: false,
  hoverAnnotation: () => {},
  hoveredAnnotationIds: [],
  palette: {},
  searchAnnotations: [],
  selectAnnotation: () => {},
  selectedAnnotationId: undefined,
  viewer: null,
};

AnnotationsOverlay.propTypes = {
  annotations: PropTypes.arrayOf(PropTypes.object),
  canvasWorld: PropTypes.instanceOf(CanvasWorld).isRequired,
  deselectAnnotation: PropTypes.func,
  drawAnnotations: PropTypes.bool,
  drawSearchAnnotations: PropTypes.bool,
  highlightAllAnnotations: PropTypes.bool,
  hoverAnnotation: PropTypes.func,
  hoveredAnnotationIds: PropTypes.arrayOf(PropTypes.string),
  palette: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  searchAnnotations: PropTypes.arrayOf(PropTypes.object),
  selectAnnotation: PropTypes.func,
  selectedAnnotationId: PropTypes.string,
  viewer: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  windowId: PropTypes.string.isRequired,
};
