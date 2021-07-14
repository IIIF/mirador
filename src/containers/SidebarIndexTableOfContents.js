import { compose } from 'redux';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core/styles/colorManipulator';
import { withPlugins } from '../extend/withPlugins';
import { SidebarIndexTableOfContents } from '../components/SidebarIndexTableOfContents';
import {
  getSequenceTreeStructure,
  getVisibleNodeIds,
  getExpandedNodeIds,
  getNodeIdToScrollTo,
} from '../state/selectors';
import * as actions from '../state/actions';

/**
 * mapStateToProps - to hook up connect
 */
const mapStateToProps = (state, { id, windowId }) => ({
  expandedNodeIds: getExpandedNodeIds(state, { companionWindowId: id, windowId }),
  nodeIdToScrollTo: getNodeIdToScrollTo(state, { companionWindowId: id, windowId }),
  treeStructure: getSequenceTreeStructure(state, { windowId }),
  visibleNodeIds: getVisibleNodeIds(state, { companionWindowId: id, windowId }),
});

/**
 * mapStateToProps - used to hook up connect to state
 * @memberof SidebarIndexTableOfContents
 * @private
 */
const mapDispatchToProps = (dispatch, { id, windowId }) => ({
  setCanvas: (...args) => dispatch(actions.setCanvas(...args)),
  toggleNode: nodeId => dispatch(actions.toggleNode(windowId, id, nodeId)),
});

/**
 * Styles for withStyles HOC
 */
const styles = theme => ({
  content: {
    alignItems: 'flex-start',
    borderLeft: '1px solid transparent',
    padding: '8px 16px 8px 0',
    width: 'auto',
  },
  group: {
    borderLeft: `1px solid ${theme.palette.grey[300]}`,
  },
  label: {
    paddingLeft: 0,
  }, // needed for pseudo $label class
  root: {
    flexGrow: 1,
  },
  selected: {}, // needed for pseudo $selected class
  treeItemRoot: {
    '&:focus > $content': {
      backgroundColor: theme.palette.action.selected,
    },
    '&:hover > $content': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:hover >$content $label, &:focus > $content $label, &$selected > $content $label, &$selected > $content $label:hover, &$selected:focus > $content $label': {
      backgroundColor: 'transparent',
    },
  },
  visibleNode: {
    backgroundColor: alpha(theme.palette.highlights.primary, 0.35),
    display: 'inline',
  },
});

const enhance = compose(
  withStyles(styles),
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('SidebarIndexTableOfContents'),
);

export default enhance(SidebarIndexTableOfContents);
