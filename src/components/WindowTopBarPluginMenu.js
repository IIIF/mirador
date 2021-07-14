import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MoreVertIcon from '@material-ui/icons/MoreVertSharp';
import Menu from '@material-ui/core/Menu';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import { PluginHook } from './PluginHook';
import ns from '../config/css-ns';

/**
 *
 */
export class WindowTopBarPluginMenu extends Component {
  /**
   * constructor -
   */
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);
  }

  /**
   * Set the anchorEl state to the click target
   */
  handleMenuClick(event) {
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  /**
   * Set the anchorEl state to null (closing the menu)
   */
  handleMenuClose() {
    this.setState({
      anchorEl: null,
    });
  }

  /**
   * render component
   */
  render() {
    const {
      classes, containerId, PluginComponents, t, windowId, menuIcon,
    } = this.props;
    const { anchorEl } = this.state;

    if (!PluginComponents || PluginComponents.length === 0) return (<></>);

    return (
      <>
        <MiradorMenuButton
          aria-expanded={!!anchorEl}
          aria-haspopup="true"
          aria-label={t('windowPluginMenu')}
          aria-owns={anchorEl ? `window-plugin-menu_${windowId}` : undefined}
          className={anchorEl ? classes.ctrlBtnSelected : null}
          onClick={this.handleMenuClick}
        >
          {menuIcon}
        </MiradorMenuButton>

        <Menu
          id={`window-plugin-menu_${windowId}`}
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
          onClose={() => this.handleMenuClose()}
        >
          <PluginHook handleClose={() => this.handleMenuClose()} {...this.props} />
        </Menu>
      </>
    );
  }
}

WindowTopBarPluginMenu.propTypes = {
  classes: PropTypes.shape({
    ctrlBtnSelected: PropTypes.string,
  }),
  containerId: PropTypes.string.isRequired,
  menuIcon: PropTypes.element,
  PluginComponents: PropTypes.arrayOf(
    PropTypes.node,
  ),
  t: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

WindowTopBarPluginMenu.defaultProps = {
  classes: {},
  menuIcon: <MoreVertIcon />,
  PluginComponents: [],
};
