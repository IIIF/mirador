import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ListSharpIcon from '@material-ui/icons/ListSharp';

/**
 *
 */
export class SelectCollection extends Component {
  /** */
  constructor(props) {
    super(props);

    this.openCollectionDialog = this.openCollectionDialog.bind(this);
  }

  /** */
  openCollectionDialog() {
    const {
      collectionPath, manifestId, showCollectionDialog, windowId,
    } = this.props;
    showCollectionDialog(manifestId, collectionPath.slice(0, -1), windowId);
  }

  /** */
  render() {
    const {
      t,
    } = this.props;
    return (
      <Grid container justifyContent="center" alignItems="center">
        <Grid container direction="column" alignItems="center">
          <Typography variant="h4" paragraph>
            <em>
              {t('noItemSelected')}
            </em>
          </Typography>
          <Button
            color="primary"
            variant="contained"
            onClick={this.openCollectionDialog}
            startIcon={<ListSharpIcon />}
          >
            {t('showCollection')}
          </Button>
        </Grid>
      </Grid>
    );
  }
}

SelectCollection.propTypes = {
  collectionPath: PropTypes.arrayOf(PropTypes.string),
  manifestId: PropTypes.string,
  showCollectionDialog: PropTypes.func.isRequired,
  t: PropTypes.func,
  windowId: PropTypes.string,
};

SelectCollection.defaultProps = {
  collectionPath: [],
  manifestId: null,
  t: () => {},
  windowId: null,
};
