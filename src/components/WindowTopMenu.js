import React, { Component } from 'react';
import Menu from '@material-ui/core//Menu';
import ListSubheader from '@material-ui/core/ListSubheader';
import PropTypes from 'prop-types';
import WindowThumbnailSettings from '../containers/WindowThumbnailSettings';
import WindowViewSettings from '../containers/WindowViewSettings';
import { PluginHook } from './PluginHook';
import ns from '../config/css-ns';

/** Renders plugins */
function PluginHookWithHeader(props) {
  const { PluginComponents, t } = props; // eslint-disable-line react/prop-types
  return PluginComponents ? (
    <>
      <ListSubheader role="presentation" disableSticky tabIndex="-1">{t('windowPluginButtons')}</ListSubheader>
      <PluginHook {...props} />
    </>
  ) : null;
}

/**
 */
export class WindowTopMenu extends Component {
  /**
   * render
   * @return
   */
  render() {
    const {
      containerId, handleClose, anchorEl, showThumbnailNavigationSettings,
      toggleDraggingEnabled, windowId,
    } = this.props;

    return (
      <Menu
        id={`window-menu_${windowId}`}
        container={document.querySelector(`#${containerId} .${ns('viewer')}`)}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        TransitionProps={{
          onEntering: toggleDraggingEnabled,
          onExit: toggleDraggingEnabled,
        }}
        orientation="horizontal"
      >
        <WindowViewSettings windowId={windowId} handleClose={handleClose} />
        {showThumbnailNavigationSettings
          && <WindowThumbnailSettings windowId={windowId} handleClose={handleClose} />}
        <PluginHookWithHeader {...this.props} />
      </Menu>
    );
  }
}

WindowTopMenu.propTypes = {
  anchorEl: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  containerId: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  showThumbnailNavigationSettings: PropTypes.bool,
  toggleDraggingEnabled: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

WindowTopMenu.defaultProps = {
  anchorEl: null,
  showThumbnailNavigationSettings: true,
};
