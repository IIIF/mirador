/**
 * CanvasAnnotationDisplay - class used to display a SVG and fragment based
 * annotations.
 */
export default class CanvasAnnotationDisplay {
  /** */
  constructor({
    resource, palette, zoomRatio, offset, selected, hovered, scaleFactor,
  }) {
    this.resource = resource;
    this.palette = palette;
    this.zoomRatio = zoomRatio;
    this.offset = offset;
    this.selected = selected;
    this.hovered = hovered;
    this.scaleFactor = scaleFactor;
  }

  /** */
  toContext(context) {
    this.context = context;
    if (this.resource.svgSelector) {
      this.svgContext();
    } else if (this.resource.fragmentSelector) {
      this.fragmentContext();
    }
  }

  /** */
  get svgString() {
    return this.resource.svgSelector.value;
  }

  /** */
  svgContext() {
    let currentPalette;
    if (this.hovered) {
      currentPalette = this.palette.hovered;
    } else if (this.selected) {
      currentPalette = this.palette.selected;
    } else {
      currentPalette = this.palette.default;
    }

    if (currentPalette.globalAlpha === 0) return;

    [...this.svgPaths].forEach((element) => {
      /**
       *  Note: Path2D is not supported in IE11.
       *  TODO: Support multi canvas offset
       *  One example: https://developer.mozilla.org/en-US/docs/Web/API/Path2D/addPath
       */
      this.context.save();
      this.context.translate(this.offset.x, this.offset.y);
      const p = new Path2D(element.attributes.d.nodeValue);

      // Setup styling from SVG -> Canvas
      this.context.strokeStyle = this.color;
      if (element.attributes['stroke-dasharray']) {
        this.context.setLineDash(element.attributes['stroke-dasharray'].nodeValue.split(','));
      }
      const svgToCanvasMap = {
        fill: 'fillStyle',
        stroke: 'strokeStyle',
        'stroke-dashoffset': 'lineDashOffset',
        'stroke-linecap': 'lineCap',
        'stroke-linejoin': 'lineJoin',
        'stroke-miterlimit': 'miterlimit',
        'stroke-width': 'lineWidth',
      };
      Object.keys(svgToCanvasMap).forEach((key) => {
        if (element.attributes[key]) {
          this.context[svgToCanvasMap[key]] = element.attributes[key].nodeValue;
        }
      });

      // Resize the stroke based off of the zoomRatio (currentZoom / maxZoom)
      this.context.lineWidth /= this.zoomRatio;

      // Reset the color if it is selected or hovered on
      if (this.selected || this.hovered) {
        this.context.strokeStyle = currentPalette.strokeStyle || currentPalette.fillStyle;
      }

      if (element.attributes['stroke-opacity']) {
        this.context.globalAlpha = currentPalette.globalAlpha * element.attributes['stroke-opacity'].nodeValue;
      } else {
        this.context.globalAlpha = currentPalette.globalAlpha;
      }

      this.context.stroke(p);

      // Wait to set the fill, so we can adjust the globalAlpha value if we need to
      if (element.attributes.fill && element.attributes.fill.nodeValue !== 'none') {
        if (element.attributes['fill-opacity']) {
          this.context.globalAlpha = currentPalette.globalAlpha * element.attributes['fill-opacity'].nodeValue;
        } else {
          this.context.globalAlpha = currentPalette.globalAlpha;
        }
        this.context.fill(p);
      }
      this.context.restore();
    });
  }

  /** */
  fragmentContext() {
    let fragment = this.resource.fragmentSelector;
    fragment[0] += this.offset.x;
    fragment[1] += this.offset.y;
    if (this.scaleFactor && this.scaleFactor !== 1) {
      fragment = fragment.map(x => x * this.scaleFactor);
    }

    let currentPalette;
    if (this.selected) {
      currentPalette = this.palette.selected;
    } else if (this.hovered) {
      currentPalette = this.palette.hovered;
    } else {
      currentPalette = this.palette.default;
    }

    this.context.save();
    Object.keys(currentPalette).forEach((key) => {
      this.context[key] = currentPalette[key];
    });

    if (currentPalette.globalAlpha === 0) return;

    if (currentPalette.fillStyle) {
      this.context.fillRect(...fragment);
    } else {
      this.context.lineWidth = 1 / this.zoomRatio;
      this.context.strokeRect(...fragment);
    }

    this.context.restore();
  }

  /** */
  get svgPaths() {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(this.svgString, 'text/xml');
    return xmlDoc.getElementsByTagName('path');
  }
}
