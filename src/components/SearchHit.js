import React, { Component } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import SanitizedHtml from '../containers/SanitizedHtml';
import TruncatedHit from '../lib/TruncatedHit';
import { ScrollTo } from './ScrollTo';

/** */
export class SearchHit extends Component {
  /** */
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  /**
   * Announce the annotation content if the component is mounted selected
   */
  componentDidMount() {
    const { selected } = this.props;

    if (selected) this.announceHit();
  }

  /**
   * Announce hit if the hit has been selected
   */
  componentDidUpdate(prevProps) {
    const { selected } = this.props;

    if (selected && selected !== prevProps.selected) {
      this.announceHit();
    }
  }

  /** */
  handleClick() {
    const {
      annotation, annotationId, selectAnnotation,
    } = this.props;

    if (annotation && annotationId) selectAnnotation(annotationId);
  }

  /**
   * Pass content describing the hit to the announcer prop (intended for screen readers)
   */
  announceHit() {
    const {
      annotation, annotationLabel, announcer, canvasLabel, hit, index, t, total,
    } = this.props;
    if (!hit) return;
    const truncatedHit = new TruncatedHit(hit, annotation);

    announcer([
      t('pagination', { current: index + 1, total }),
      canvasLabel,
      annotationLabel,
      truncatedHit.before,
      truncatedHit.match,
      truncatedHit.after,
    ].join(' '));
  }

  /** */
  render() {
    const {
      adjacent,
      annotation,
      annotationLabel,
      canvasLabel,
      classes,
      companionWindowId,
      containerRef,
      hit,
      focused,
      index,
      showDetails,
      selected,
      t,
      windowSelected,
    } = this.props;

    if (focused && !selected) return null;

    const truncatedHit = focused ? hit : hit && new TruncatedHit(hit, annotation);
    const truncated = hit && truncatedHit.before !== hit.before && truncatedHit.after !== hit.after;
    const canvasLabelHtmlId = `${companionWindowId}-${index}`;

    return (
      <ScrollTo
        containerRef={containerRef}
        offsetTop={96} // offset for the height of the form above
        scrollTo={windowSelected && !focused}
      >
        <ListItem
          className={clsx(
            classes.listItem,
            {
              [classes.adjacent]: adjacent,
              [classes.selected]: selected,
              [classes.focused]: focused,
              [classes.windowSelected]: windowSelected,
            },
          )}
          button={!selected}
          component="li"
          onClick={this.handleClick}
          selected={selected}
        >
          <ListItemText primaryTypographyProps={{ variant: 'body1' }}>
            <Typography className={classes.subtitle} component="div" variant="subtitle2">
              <Chip component="span" label={index + 1} className={classes.hitCounter} />
              <span id={canvasLabelHtmlId}>
                {canvasLabel}
              </span>
            </Typography>
            {annotationLabel && (
              <Typography variant="subtitle2">{annotationLabel}</Typography>
            )}
            {hit && (
              <>
                <SanitizedHtml ruleSet="iiif" htmlString={truncatedHit.before} />
                {' '}
                <strong>
                  <SanitizedHtml ruleSet="iiif" htmlString={truncatedHit.match} />
                </strong>
                {' '}
                <SanitizedHtml ruleSet="iiif" htmlString={truncatedHit.after} />
                {' '}
                { truncated && !focused && (
                  <Button className={classes.inlineButton} onClick={showDetails} color="secondary" size="small" aria-describedby={canvasLabelHtmlId}>
                    {t('more')}
                  </Button>
                )}
              </>
            )}
            {!hit && annotation && <SanitizedHtml ruleSet="iiif" htmlString={annotation.chars} />}
          </ListItemText>
        </ListItem>
      </ScrollTo>
    );
  }
}

SearchHit.propTypes = {
  adjacent: PropTypes.bool,
  annotation: PropTypes.shape({
    chars: PropTypes.string,
    targetId: PropTypes.string,
  }),
  annotationId: PropTypes.string,
  annotationLabel: PropTypes.string,
  announcer: PropTypes.func.isRequired,
  canvasLabel: PropTypes.string,
  classes: PropTypes.objectOf(PropTypes.string),
  companionWindowId: PropTypes.string,
  containerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  focused: PropTypes.bool,
  hit: PropTypes.shape({
    after: PropTypes.string,
    before: PropTypes.string,
    match: PropTypes.string,
  }),
  index: PropTypes.number,
  selectAnnotation: PropTypes.func,
  selected: PropTypes.bool,
  showDetails: PropTypes.func,
  t: PropTypes.func,
  total: PropTypes.number,
  windowId: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
  windowSelected: PropTypes.bool,
};

SearchHit.defaultProps = {
  adjacent: false,
  annotation: undefined,
  annotationId: undefined,
  annotationLabel: undefined,
  canvasLabel: undefined,
  classes: {},
  companionWindowId: undefined,
  containerRef: undefined,
  focused: false,
  hit: undefined,
  index: undefined,
  selectAnnotation: () => {},
  selected: false,
  showDetails: () => {},
  t: k => k,
  total: undefined,
  windowSelected: false,
};
