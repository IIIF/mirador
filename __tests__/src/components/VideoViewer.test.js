import React from 'react';
import { shallow } from 'enzyme';
import { VideoViewer } from '../../../src/components/VideoViewer';

/** create wrapper */
function createWrapper(props, suspenseFallback) {
  return shallow(
    <VideoViewer
      classes={{}}
      videoOptions={{ crossOrigin: 'anonymous' }}
      {...props}
    />,
  );
}

describe('VideoViewer', () => {
  let wrapper;
  describe('render', () => {
    it('videoResources', () => {
      wrapper = createWrapper({
        videoResources: [
          { getFormat: () => 'video/mp4', id: 1 },
          { getFormat: () => 'video/mp4', id: 2 },
        ],
      }, true);
      expect(wrapper.contains(<source src="1" type="video/mp4" />));
      expect(wrapper.contains(<source src="2" type="video/mp4" />));
    });
    it('passes through configurable options', () => {
      wrapper = createWrapper({
        videoResources: [
          { getFormat: () => 'video/mp4', id: 1 },
        ],
      }, true);
      expect(wrapper.exists('video[crossOrigin="anonymous"]')).toBe(true); // eslint-disable-line jsx-a11y/media-has-caption
    });
    it('captions', () => {
      wrapper = createWrapper({
        captions: [
          { getLabel: () => 'English', getProperty: () => 'en', id: 1 },
          { getLabel: () => 'French', getProperty: () => 'fr', id: 2 },
        ],
        videoResources: [
          { getFormat: () => 'video/mp4', id: 1 },
        ],
      }, true);
      expect(wrapper.contains(<track src="1" label="English" srcLang="en" />));
      expect(wrapper.contains(<track src="2" label="French" srcLang="fr" />));
    });
  });
});
