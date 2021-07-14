import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fullscreen from 'react-full-screen';
import { I18nextProvider } from 'react-i18next';
import { LiveAnnouncer } from 'react-aria-live';
import {
  ThemeProvider, StylesProvider, createTheme, jssPreset, createGenerateClassName,
} from '@material-ui/core/styles';
import { DndContext, DndProvider } from 'react-dnd';
import MultiBackend from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/cjs/HTML5toTouch';
import { create } from 'jss';
import rtl from 'jss-rtl';
import createI18nInstance from '../i18n';

/**
 * Allow applications to opt-out of (or provide their own) drag and drop context
 */
const MaybeDndProvider = (props) => {
  const { dndManager, children } = props;
  if (dndManager === false) {
    return children;
  }

  if (dndManager === undefined) {
    return (
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        {children}
      </DndProvider>
    );
  }

  return (
    <DndContext.Provider value={dndManager}>
      {children}
    </DndContext.Provider>
  );
};

MaybeDndProvider.propTypes = {
  children: PropTypes.node.isRequired,
  dndManager: PropTypes.oneOf([
    undefined,
    false,
    PropTypes.object, // eslint-disable-line react/forbid-prop-types
  ]).isRequired,
};

/**
 * This component adds viewer-specific providers.
 * @prop {Object} manifests
 */
export class AppProviders extends Component {
  /** */
  constructor(props) {
    super(props);

    this.i18n = createI18nInstance();
  }

  /**
   * Set i18n language on component mount
   */
  componentDidMount() {
    const { language } = this.props;

    this.i18n.changeLanguage(language);
  }

  /**
   * Update the i18n language if it is changed
   */
  componentDidUpdate(prevProps) {
    const { language } = this.props;

    if (prevProps.language !== language) {
      this.i18n.changeLanguage(language);
    }
  }

  /** */
  render() {
    const {
      children, createGenerateClassNameOptions, isFullscreenEnabled,
      setWorkspaceFullscreen, theme, translations,
      dndManager,
    } = this.props;

    const generateClassName = createGenerateClassName(createGenerateClassNameOptions);

    Object.keys(translations).forEach((lng) => {
      this.i18n.addResourceBundle(lng, 'translation', translations[lng], true, true);
    });

    return (
      <Fullscreen
        enabled={isFullscreenEnabled}
        onChange={setWorkspaceFullscreen}
      >
        <I18nextProvider i18n={this.i18n}>
          <LiveAnnouncer>
            <ThemeProvider
              theme={createTheme(theme)}
            >
              <StylesProvider
                jss={create({ plugins: [...jssPreset().plugins, rtl()] })}
                generateClassName={generateClassName}
              >
                <MaybeDndProvider dndManager={dndManager}>
                  {children}
                </MaybeDndProvider>
              </StylesProvider>
            </ThemeProvider>
          </LiveAnnouncer>
        </I18nextProvider>
      </Fullscreen>
    );
  }
}

AppProviders.propTypes = {
  children: PropTypes.node,
  createGenerateClassNameOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  dndManager: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  isFullscreenEnabled: PropTypes.bool,
  language: PropTypes.string.isRequired,
  setWorkspaceFullscreen: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

AppProviders.defaultProps = {
  children: null,
  createGenerateClassNameOptions: {},
  dndManager: undefined,
  isFullscreenEnabled: false,
};
