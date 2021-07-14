import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { withStyles } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core/styles/colorManipulator';
import { withPlugins } from '../extend/withPlugins';
import { WindowAuthenticationBar } from '../components/WindowAuthenticationBar';

/**
 * @param theme
 * @returns {{typographyBody: {flexGrow: number, fontSize: number|string},
 * windowTopBarStyle: {minHeight: number, paddingLeft: number, backgroundColor: string}}}
 */
const styles = theme => ({
  buttonInvert: {
    '&:hover': {
      backgroundColor: alpha(
        theme.palette.secondary.contrastText, 1 - theme.palette.action.hoverOpacity,
      ),
    },
    backgroundColor: theme.palette.secondary.contrastText,
    marginLeft: theme.spacing(5),
    paddingBottom: 0,
    paddingTop: 0,
  },
  expanded: {
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
  },
  failure: {
    backgroundColor: theme.palette.error.dark,
  },
  fauxButton: {
    marginLeft: theme.spacing(2.5),
  },
  icon: {
    marginRight: theme.spacing(1.5),
    verticalAlign: 'text-bottom',
  },
  label: {
    lineHeight: 2.25,
  },
  paper: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    cursor: 'pointer',
  },
  topBar: {
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
    },
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'inherit',
    padding: theme.spacing(1),
    textTransform: 'none',
  },
});

const enhance = compose(
  withTranslation(),
  withStyles(styles),
  withPlugins('WindowAuthenticationBar'),
);

export default enhance(WindowAuthenticationBar);
