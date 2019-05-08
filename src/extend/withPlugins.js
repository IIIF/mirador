import React, { useContext, memo } from 'react';
import curry from 'lodash/curry';
import isEmpty from 'lodash/isEmpty';
import PluginContext from './PluginContext';


/** withPlugins should be the innermost HOC */
function _withPlugins(targetName, TargetComponent) { // eslint-disable-line no-underscore-dangle
  /** */
  function PluginHoc(props) {
    const pluginMap = useContext(PluginContext);
    const plugins = pluginMap[targetName];

    if (isEmpty(plugins)) {
      return <TargetComponent {...props} />;
    }

    if (!isEmpty(plugins.wrap)) {
      const PluginComponent = plugins.wrap[0].component;
      return <PluginComponent targetProps={props} TargetComponent={TargetComponent} />;
    }

    if (!isEmpty(plugins.add)) {
      const PluginComponents = plugins.add.map(plugin => plugin.component);
      return <TargetComponent {...props} PluginComponents={PluginComponents} />;
    }
  }

  PluginHoc.displayName = `WithPlugins(${targetName})`;
  return memo(PluginHoc);
}

/** withPlugins('MyComponent')(MyComponent) */
export const withPlugins = curry(_withPlugins);
