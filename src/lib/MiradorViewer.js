import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import deepmerge from 'deepmerge';
import { storePlugins } from '../extend/pluginStore';
import createStore from '../state/createStore';
import * as actions from '../state/actions';
import settings from '../config/settings';
import App from '../containers/App';

/**
 * Default Mirador instantiation
 */
class MiradorViewer {
  /**
   */
  constructor(config, plugins) {
    storePlugins(plugins);
    const pluginReducers = getReducersFromPlugins(plugins);
    this.store = createStore(pluginReducers);
    this.config = config;
    this.processConfig();
    const viewer = {
      actions,
      store: this.store,
    };

    ReactDOM.render(
      <Provider store={this.store}>
        <App />
      </Provider>,
      document.getElementById(config.id),
    );

    return viewer;
  }

  /**
   * Process config into actions
   */
  processConfig() {
    const mergedConfig = deepmerge(settings, this.config);
    const action = actions.setConfig(mergedConfig);
    this.store.dispatch(action);

    mergedConfig.windows.forEach((miradorWindow) => {
      let thumbnailNavigationPosition;
      let view;
      if (miradorWindow.thumbnailNavigationPosition !== undefined) {
        ({ thumbnailNavigationPosition } = miradorWindow);
      } else {
        thumbnailNavigationPosition = mergedConfig.thumbnailNavigation.defaultPosition;
      }
      if (miradorWindow.view !== undefined) {
        ({ view } = miradorWindow);
      } else {
        view = mergedConfig.window.defaultView;
      }
      this.store.dispatch(actions.fetchManifest(miradorWindow.loadedManifest));
      this.store.dispatch(actions.addWindow({
        canvasIndex: (miradorWindow.canvasIndex || 0),
        manifestId: miradorWindow.loadedManifest,
        thumbnailNavigationPosition,
        view,
      }));
    });

    Object.keys(mergedConfig.manifests || {}).forEach((manifestId) => {
      this.store.dispatch(
        actions.requestManifest(manifestId, mergedConfig.manifests[manifestId]),
      );
    });
  }
}

/** Return reducers from plugins */
function getReducersFromPlugins(plugins) {
  return plugins && plugins.reduce((acc, plugin) => ({ ...acc, ...plugin.reducers }), {});
}

export default MiradorViewer;
