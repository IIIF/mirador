import update from 'lodash/update';
import { validatePlugin } from './pluginValidation';


let pluginMap = {};

/** */
export function getPlugins(targetName) {
  return pluginMap[targetName];
}

/** */
export function storePlugins(plugins = []) {
  const validPlugins = filterValidPlugins(plugins);
  pluginMap = createTargetToPluginMapping(validPlugins);
}

/** */
function filterValidPlugins(plugins) {
  const { validPlugins, invalidPlugins } = splitPluginsByValidation(plugins);
  logInvalidPlugins(invalidPlugins);
  return validPlugins;
}

/** */
function splitPluginsByValidation(plugins) {
  const splittedPlugins = { invalidPlugins: [], validPlugins: [] };
  plugins.forEach(plugin => (
    validatePlugin(plugin)
      ? splittedPlugins.validPlugins.push(plugin)
      : splittedPlugins.invalidPlugins.push(plugin)
  ));
  return splittedPlugins;
}

/** */
function logInvalidPlugins(plugins) {
  plugins.forEach(plugin => (
    console.log(`Mirador: Plugin ${plugin.name} is not valid and was rejected.`)
  ));
}

/**
 * Returns a mapping from targets to plugins and modes
 *
 * @param {Array} plugins
 * @return {Object} - looks like:
 *
 *  {
 *    'WorkspacePanel': {
 *      wrap:     [plugin3, ...],
 *      add:      [plugin4, ...],
 *    },
 *    ...
 *  }
 */
export function createTargetToPluginMapping(plugins) {
  return plugins.reduce((map, plugin) => (
    update(map, [plugin.target, plugin.mode], x => [...x || [], plugin])
  ), {});
}
