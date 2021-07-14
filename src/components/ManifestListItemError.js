import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import ErrorIcon from '@material-ui/icons/ErrorOutlineSharp';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

/**
 * ManifestListItemError renders a component displaying a
 * message to the user about a problem loading a manifest
*/
export class ManifestListItemError extends Component {
  /**
   * Returns the rendered component
  */
  render() {
    const {
      classes, manifestId, onDismissClick, onTryAgainClick, t,
    } = this.props;

    return (
      <Grid container>
        <Grid container>
          <Grid container item xs={12} sm={6}>
            <Grid item xs={4} sm={3}>
              <Grid container justifyContent="center">
                <ErrorIcon className={classes.errorIcon} />
              </Grid>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography>{t('manifestError')}</Typography>
              <Typography className={classes.manifestIdText}>{manifestId}</Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid container>
          <Grid container item xs={12} sm={6} justifyContent="flex-end">
            <Grid item>
              <Button onClick={() => { onDismissClick(manifestId); }}>
                {t('dismiss')}
              </Button>
              <Button onClick={() => { onTryAgainClick(manifestId); }}>
                {t('tryAgain')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

ManifestListItemError.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  manifestId: PropTypes.string.isRequired,
  onDismissClick: PropTypes.func.isRequired,
  onTryAgainClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};
