(function($) {

  $.AnnotationsLayer = function(options) {

    jQuery.extend(true, this, {
      parent:            null,
      annotationsList:   null,
      viewer:            null,
      renderer:          null,
      selected:          null,
      hovered:           null,
      windowId:          null,
      mode:              null,
      annotator:         null,
      element:           null
    }, options);

    this.init();
  };

  $.AnnotationsLayer.prototype = {

    init: function() {
      var _this = this;
      console.log(this.element);
      var el = this.parent.parent.element;
      this.annotator = this.element.annotator().data('annotator');
      //console.log(this.annotator);
      //this.annotator.addPlugin('Tags');
      this.bindEvents();
    },

    bindEvents: function() {
      var _this = this;

      jQuery.subscribe('modeChange.' + _this.windowId, function(event, modeName) {
        console.log('entered ' + modeName + ' mode in annotationsLayer');
        if (modeName === 'displayAnnotations') { _this.enterDisplayAnnotations(); }
        if (modeName === 'makeAnnotations') { _this.enterMakeAnnotations(); }
        if (modeName === 'default') { _this.enterDefault(); }
      });

      jQuery.subscribe('annotationListLoaded.' + _this.windowId, function(event) {
        var modeName = _this.mode;
        _this.annotationsList = _this.parent.parent.annotationsList;
        if (_this.annotationsList && _this.viewer) {
          _this.createRenderer();
        }
      });
      
      jQuery.subscribe('viewerCreated.'+_this.windowId, function(event, viewer) {
        _this.viewer = viewer;
        if (_this.annotationsList && _this.viewer) {
           _this.createRenderer();
        }
      });

    },
    
    createRenderer: function() {
      this.renderer = $.OsdCanvasRenderer({
          osd: $.OpenSeadragon,
          viewer: this.viewer,
          list: this.annotationsList, // must be passed by reference.
          onHover: function(annotations) {
            var annotation = annotations[0];
            console.log(annotation);
            var position = _this.parseRegion(annotation.on);
            
            // this.annotator.viewer.hide();
            this.annotator.showViewer(_this.prepareForAnnotator(annotation));
          },
          onSelect: function(annotation) {

          },
          visible: false
        });
    },
    
    parseRegion: function(url) {
      var regionString;
      if (typeof url === 'object') {
        regionString = url.selector.value;  
      } else {
        regionString = url.split('#')[1];
      }
      var regionArray = regionString.split('=')[1].split(',');
      return regionArray;
    },

    prepareForAnnotator: function(oaAnnotation) {
      var annotatortion = {
        text: oaAnnotation.resource.chars
      };
      console.log(annototortion);

      return [annotatortion];
    },

    enterDisplayAnnotations: function() {
      var _this = this;
      console.log('triggering annotation loading and display');
      this.renderer.render();
    },

    enterEditAnnotations: function() {
      console.log('triggering annotation editing');
      // this.renderer.update().showAll();
    },

    enterDefault: function() {
      console.log('triggering default');
      this.renderer.hideAll();
    },

    setVisible: function() {
      var _this = this;

      if (_this.get('visible') === false) {
        _this.set("visible", true);
      }  else {
        _this.set("visible", false);
      }
    },

    changePage: function() {
    },

    accentHovered: function(id, source) {
      var _this = this;

      if (source === 'listing') {
        _this.regionController.accentHovered(id);
      } else {
        _this.sidePanel.accentHovered(id);
      }
    },

    focusSelected: function(id, source) {
      var _this = this;

      _this.sidePanel.focusSelected(id, source);
      _this.regionController.focusSelected(id);
      _this.bottomPanel.focusSelected(id);
    },

    deselect: function() {
      var _this = this;

      _this.bottomPanel.deselect();
      _this.sidePanel.deselect();
      _this.regionController.deselect();
    },

    filterAnnotations: function(filter, options) {
      _this = this;

      filteredAnnos = jQuery.grep(_this.annotations, function(a) { return a.type !== filter; } ),
      filteredIds = jQuery.map(filteredAnnos, function(a) { return a.id; }),
      filteredRegions = jQuery.map(filteredIds, function(id) { 
        var idString = '#region_' + id;
        return jQuery(idString);
      }),
      filteredListings = jQuery.map(filteredIds, function(id) { 
        var idString = '#listing_' + id;
        return jQuery(idString);
      });

      _this.parent.element.find('.annotation').fadeIn();
      _this.parent.element.find('.annotationListing').slideDown();
      _this.bottomPanel.deselect();

      if (filter === '') { return; }

      jQuery(filteredRegions).map(function() { return this.toArray(); }).fadeOut();
      jQuery(filteredListings).map(function() { return this.toArray(); }).slideUp();
    }

  };

}(Mirador));
