import React from 'react';
import { connect } from 'react-redux';
import curry from 'lodash/curry';
import isEmpty from 'lodash/isEmpty';
import { getPlugins } from './pluginStore';

/** */
function _withPlugins(targetName, TargetComponent) { // eslint-disable-line no-underscore-dangle
  let PluginHoc;
  const plugins = getPlugins(targetName);

  if (isEmpty(plugins)) {
    return TargetComponent;
  }
  if (!isEmpty(plugins.wrap)) {
    PluginHoc = createWrapPluginHoc(plugins, TargetComponent);
  }
  if (!isEmpty(plugins.add)) {
    PluginHoc = createAddPluginHoc(plugins, TargetComponent);
  }

  PluginHoc.displayName = `WithPlugins(${targetName})`;
  return PluginHoc;
}

/** */
function createWrapPluginHoc(plugins, TargetComponent) {
  const PluginComponent = connectPluginComponent(plugins[0]);
  return props => <PluginComponent targetProps={props} TargetComponent={TargetComponent} />;
}

/** */
function createAddPluginHoc(plugins, TargetComponent) {
  const PluginComponents = plugins.map(connectPluginComponent);
  return props => <TargetComponent {...props} PluginComponents={PluginComponents} />;
}

/** */
function connectPluginComponent(plugin) {
  return connect(plugin.mapStateToProps, plugin.mapDispatchToProps)(plugin.component);
}

/** withPlugins('MyComponent')(MyComponent) */
export const withPlugins = curry(_withPlugins);
