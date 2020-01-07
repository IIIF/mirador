import { createSelector, createSelectorCreator } from 'reselect';
import manifesto, { LanguageMap } from 'manifesto.js';
import memoize from 'lodash/memoize';
import ManifestoCanvas from '../../lib/ManifestoCanvas';

/** */
function createManifestoInstance(json, locale) {
  if (!json) return undefined;
  return manifesto.create(json, locale ? { locale } : undefined);
}


/** Get the relevant manifest information */
export function getManifest(state, { manifestId, windowId }) {
  return state.manifests && state.manifests[
    manifestId
    || (windowId && state.windows && state.windows[windowId] && state.windows[windowId].manifestId)
  ];
}

/** Instantiate a manifesto instance */
export const getManifestoInstance = createSelector(
  [
    getManifest,
    getLocale,
  ],
  (manifest, locale) => manifest
    && createManifestoInstance(manifest.json, locale),
);

export const getManifestLocale = createSelector(
  [getManifestoInstance],
  manifest => manifest && manifest.options && manifest.options.locale && manifest.options.locale.replace(/-.*$/, ''),
);

/** */
function getProperty(property) {
  return createSelector(
    [getManifestoInstance],
    manifest => manifest && manifest.getProperty(property),
  );
}

/** */
function getLocale(state, { companionWindowId }) {
  return (companionWindowId
    && state.companionWindows[companionWindowId]
    && state.companionWindows[companionWindowId].locale)
    || (state.config && state.config.language);
}
/**
 * Get the logo for a manifest
 * @param {object} state
 * @param {object} props
 * @param {string} props.manifestId
 * @param {string} props.windowId
 * @return {String|null}
 */
export const getManifestLogo = createSelector(
  [getManifestoInstance],
  manifest => manifest && manifest.getLogo(),
);

/**
* Return the IIIF v3 provider of a manifest or null
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String|null}
*/
export const getManifestProvider = createSelector(
  [
    getProperty('provider'),
    getManifestLocale,
  ],
  (provider, locale) => provider
    && provider[0].label
    && LanguageMap.parse(provider[0].label, locale).map(label => label.value)[0],
);

/**
 */
function asArray(value) {
  if (!Array.isArray(value)) {
    return [value];
  }

  return value;
}

/**
* Return the IIIF v3 homepage of a manifest or null
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String|null}
*/
export const getManifestHomepage = createSelector(
  [
    getProperty('homepage'),
    getManifestLocale,
  ],
  (homepages, locale) => homepages
    && asArray(homepages).map(homepage => (
      {
        label: LanguageMap.parse(homepage.label, locale)
          .map(label => label.value)[0],
        value: homepage.id || homepage['@id'],
      }
    )),
);

/**
* Return the IIIF v3 renderings of a manifest or null
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String|null}
*/
export const getManifestRenderings = createSelector(
  [getManifestoInstance],
  manifest => manifest
    && manifest.getRenderings().map(rendering => (
      {
        label: rendering.getLabel().map(label => label.value)[0],
        value: rendering.id,
      }
    )),
);

/**
* Return the IIIF v2/v3 seeAlso data from a manifest or null
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String|null}
*/
export const getManifestRelatedContent = createSelector(
  [
    getProperty('seeAlso'),
    getManifestLocale,
  ],
  (seeAlso, locale) => seeAlso
    && asArray(seeAlso).map(related => (
      {
        format: related.format,
        label: LanguageMap.parse(related.label, locale)
          .map(label => label.value)[0],
        value: related.id || related['@id'],
      }
    )),
);

/**
* Return the IIIF requiredStatement (v3) or attribution (v2) data from a manifest or null
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String|null}
*/
export const getRequiredStatement = createSelector(
  [getManifestoInstance],
  manifest => manifest
    && asArray(manifest.getRequiredStatement()).filter(l => l.getValue()).map(labelValuePair => ({
      label: labelValuePair.getLabel(),
      value: labelValuePair.getValue(),
    })),
);

/**
* Return the IIIF v2 rights (v3) or license (v2) data from a manifest or null
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String|null}
*/
export const getRights = createSelector(
  [
    getProperty('rights'),
    getProperty('license'),
    getManifestLocale,
  ],
  (rights, license, locale) => {
    const data = rights || license;
    return asArray(LanguageMap.parse(data, locale).map(label => label.value));
  },
);

/**
* Return the supplied thumbnail for a manifest or null
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String|null}
*/
export function getManifestThumbnail(state, props) {
  /** */
  function getTopLevelManifestThumbnail() {
    const manifest = getManifestoInstance(state, props);

    return manifest
      && manifest.getThumbnail()
      && manifest.getThumbnail().id;
  }

  /** */
  function getFirstCanvasThumbnail() {
    const canvases = getManifestCanvases(state, props);

    return canvases.length > 0 && canvases[0].getThumbnail() && canvases[0].getThumbnail().id;
  }

  /** */
  function generateThumbnailFromFirstCanvas() {
    const canvases = getManifestCanvases(state, props);

    if (canvases.length === 0) return null;

    const manifestoCanvas = new ManifestoCanvas(canvases[0]);

    return manifestoCanvas.thumbnail(null, 80);
  }

  return getTopLevelManifestThumbnail()
    || getFirstCanvasThumbnail()
    || generateThumbnailFromFirstCanvas();
}

/**
* Return the logo of a manifest or null
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String|null}
*/
export const getManifestCanvases = createSelector(
  [getManifestoInstance],
  (manifest) => {
    if (!manifest) {
      return [];
    }

    if (!manifest.getSequences || !manifest.getSequences()[0]) {
      return [];
    }

    return manifest.getSequences()[0].getCanvases();
  },
);

/**
* Return manifest title
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String}
*/
export const getManifestTitle = createSelector(
  [getManifestoInstance],
  manifest => manifest
    && manifest.getLabel().map(label => label.value)[0],
);

/**
* Return manifest description
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String}
*/
export const getManifestDescription = createSelector(
  [getManifestoInstance],
  manifest => manifest
    && manifest.getDescription().map(label => label.value)[0],
);

/**
* Return manifest title
* @param {object} state
* @param {object} props
* @param {string} props.manifestId
* @param {string} props.windowId
* @return {String}
*/
export const getManifestUrl = createSelector(
  [getManifestoInstance],
  manifest => manifest && manifest.id,
);

/**
* Return metadata in a label / value structure
* This is a potential seam for pulling the i18n locale from
* state and plucking out the appropriate language.
* For now we're just getting the first.
* @param {object} Manifesto IIIF Resource (e.g. canvas, manifest)
* @return {Array[Object]}
*/
export function getDestructuredMetadata(iiifResource) {
  return (iiifResource
    && iiifResource.getMetadata().map(labelValuePair => ({
      label: labelValuePair.getLabel(),
      value: labelValuePair.getValue(),
    }))
  );
}

/**
 * Return manifest metadata in a label / value structure
 * @param {object} state
 * @param {object} props
 * @param {string} props.manifestId
 * @param {string} props.windowId
 * @return {Array[Object]}
 */
export const getManifestMetadata = createSelector(
  [getManifestoInstance],
  manifest => manifest && getDestructuredMetadata(manifest),
);

/** */
function getLocalesForStructure(item) {
  const languages = [];
  if (Array.isArray(item)) {
    languages.push(...item.filter(i => (typeof i === 'object' && i['@language'])).map(i => i['@language']));
  } else if (typeof item === 'object') {
    if (item['@language']) languages.push(item['@language']);
  }
  return languages;
}

/** */
function getLocales(resource) {
  if (!resource) return [];

  const metadata = resource.getProperty('metadata') || [];
  const languages = {};

  for (let i = 0; i < metadata.length; i += 1) {
    const item = metadata[i];
    getLocalesForStructure(item.label).forEach((l) => { languages[l] = true; });
    getLocalesForStructure(item.value).forEach((l) => { languages[l] = true; });
  }
  return Object.keys(languages);
}

/** */
const manifestHashFn = manifest => manifest && manifest.id;
// this has the potential to be an annoying memory leak, because the memoize store will grow
// unbounded.
const manifestMemoizingSelectorCreator = createSelectorCreator(memoize, manifestHashFn);

// this is specially memoized because getLocales is creating new array instances
// every time it is called.
export const getMetadataLocales = manifestMemoizingSelectorCreator(
  [getManifestoInstance],
  manifest => getLocales(manifest),
);

/**
 * Returns the starting canvas specified in the manifest
 * @param {object} manifest manifesto instance
 * @param {number} canvasIndexFromState
 * @return {Canvas}
 */
export function getManifestStartCanvas(json, canvasIndexFromState) {
  if (!json) return {};

  const manifest = createManifestoInstance(json);

  if (!manifest) return {};

  if (canvasIndexFromState !== undefined) {
    return manifest.getSequences()[0].getCanvasByIndex(canvasIndexFromState);
  }

  let canvasId;

  // IIIF v2
  canvasId = manifest.getSequences()[0].getProperty('startCanvas');

  if (!canvasId) {
    // IIIF v3
    const start = manifest.getProperty('start')
    || manifest.getSequences()[0].getProperty('start');

    canvasId = start && (start.id || start.source);
  }

  return ((canvasId && manifest.getSequences()[0].getCanvasById(canvasId)) || {});
}

/**
 * Returns the viewing hint for the first sequence in the manifest or the manifest
 * @param {object} state
 * @param {object} props
 * @param {string} props.manifestId
 * @param {string} props.windowId
 * @return {Number}
 */
export const getManifestViewingHint = createSelector(
  [getManifestoInstance],
  (manifest) => {
    if (!manifest) return null;
    const viewingHint = manifest.getSequences()[0].getViewingHint() || manifest.getViewingHint();
    if (viewingHint) return viewingHint.value;
    return null;
  },
);

export const getManifestViewingDirection = createSelector(
  [getManifestoInstance],
  (manifest) => {
    if (!manifest) return null;
    const viewingDirection = manifest.getSequences()[0].getViewingDirection()
      || manifest.getViewingDirection();
    if (viewingDirection) return viewingDirection.value;
    return null;
  },
);

/** */
export const getManifestSearchService = createSelector(
  [getManifestoInstance],
  (manifest) => {
    if (!manifest) return null;
    const searchService = manifest.getService('http://iiif.io/api/search/0/search')
     || manifest.getService('http://iiif.io/api/search/1/search');
    if (searchService) return searchService;
    return null;
  },
);

/** */
export const getManifestAutocompleteService = createSelector(
  [getManifestSearchService],
  (searchService) => {
    const autocompleteService = searchService && (
      searchService.getService('http://iiif.io/api/search/0/autocomplete')
      || searchService.getService('http://iiif.io/api/search/1/autocomplete')
    );

    return autocompleteService && autocompleteService;
  },
);
