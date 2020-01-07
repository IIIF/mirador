import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import classNames from 'classnames';
import ManifestoCanvas from '../lib/ManifestoCanvas';
import { CanvasThumbnail } from './CanvasThumbnail';
import ns from '../config/css-ns';

/** */
export class CaptionedCanvasThumbnail extends Component {
  /** */
  render() {
    const { canvas, classes, height } = this.props;
    const manifestoCanvas = new ManifestoCanvas(canvas);
    return (
      <div
        key={canvas.id}
        className={classes.container}
      >
        <CanvasThumbnail
          imageUrl={
            manifestoCanvas.thumbnail(null, 200)
            // TODO: When we make these areas resizable, we should probably not hard code this
          }
          isValid={manifestoCanvas.hasValidDimensions}
          maxHeight={height}
        />
        <div
          className={classNames(ns('canvas-thumb-label'), classes.canvasThumbLabel)}
        >
          <div
            style={{
              margin: '4px',
            }}
          >
            <Typography
              classes={{ root: classes.title }}
              variant="caption"
            >
              {manifestoCanvas.getLabel()}
            </Typography>
          </div>
        </div>
      </div>
    );
  }
}

CaptionedCanvasThumbnail.propTypes = {
  canvas: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  height: PropTypes.number.isRequired,
};
