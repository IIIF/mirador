import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ns from '../config/css-ns';

/**
 *
 */
export class ViewerInfo extends Component {
  /** */
  render() {
    const {
      canvasCount,
      canvasIndex,
      canvasLabel,
      classes,
      t,
    } = this.props;

    return (
      <div className={classNames(ns('osd-info'), classes.osdInfo)}>
        <Typography display="inline" role="status" variant="caption" className={ns('canvas-count')}>
          { t('pagination', { current: canvasIndex + 1, total: canvasCount }) }
        </Typography>
        <Typography display="inline" role="status" variant="caption" className={ns('canvas-label')}>
          {canvasLabel && ` • ${canvasLabel}`}
        </Typography>
      </div>
    );
  }
}

ViewerInfo.defaultProps = {
  canvasLabel: undefined,
  t: () => {},
};

ViewerInfo.propTypes = {
  canvasCount: PropTypes.number.isRequired,
  canvasIndex: PropTypes.number.isRequired,
  canvasLabel: PropTypes.string,
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  t: PropTypes.func,
};
