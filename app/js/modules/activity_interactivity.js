window.ONboard.modules.activity_interactivity = {

  initialize: function(scene) {
    window.ONboard.activeModule = this;
    $('div#activity').empty().removeAttr('class');
    var audioAsset = ONboard.assetRoot+$(scene).find('audio').text()+'.mp4';

    if (_.isUndefined(ONboard.video)) {
      ONboard.video = _V_("video", {"controls":true, "autoplay":true, "preload": "auto"}, function(){
        this.src({type: 'video/mp4', src: audioAsset}).play();
      });
      ONboard.video.addEvent('ended', function() {
        ONboard.activeModule.mediaEnded();
      });
    } else {
      ONboard.video.src({type: 'video/mp4', src: audioAsset}).play();
    }

    if ($('div#video').hasClass('video')) {
      $('div#video').removeClass('video').addClass('audio');
    } else {
      $('div#video').addClass('audio');
    }

    $('div#video div.vjs-control').show();

    this.UI(scene);
  },

  UI: function(scene) {
    var $activity = $('div#activity');

    var $action = $(scene).find('content').attr('action');

    if ( $action !== 'play' )
      $action = 'launch';

    var instructionMessage;
    if ( $action == 'play' )
    {
      instructionMessage = "Click 'Play' to begin.";
    }
    else if ( $action == 'launch' )
    {
      instructionMessage = "Click 'Launch' to begin.";
    }

    var template = '<div id="content" class="image">' +
      '<h1>'+$(scene).find('content').find('header').text()+'</h1>' +
      '<p>'+$(scene).find('content').find('instruction').text()+'</p>' +
      '<div id="controls"><p id="instructions">'+instructionMessage+'</p><a id="btn-'+$action+'" href="'+$(scene).find('url').text()+'" target="_blank">Explore</a></div>' +
      '</div>' +
      '<div id="image" class="'+$(scene).find('activity').attr('type')+'">' +
      '<img src="'+ONboard.assetRoot+$(scene).find('image').text()+'" />' +
      '</div>';

    $activity.attr('class','activity_interactivity').html(template);

    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());

    this.bindHotSpots();

  },

  bindHotSpots: function() {
    var $hotspotLinks = $('div#activity a.hotspot, div#activity a.hotspot-dynamic, div#activity a.image-hotspot-dynamic');
    $hotspotLinks.on('click', function() {
        ONboard.modules.activity_interactivity.loadHotSpot(this);
    });
    $('a#hotspot-close').on('click', function() {ONboard.modules.activity_interactivity.closeHotSpot()});
  },

  closeHotSpot: function() {
    var $popup = $('div#hotspot-popup');
    $popup.fadeOut();
  },

  loadHotSpot: function(el) {
    var id = $(el).data('id');
    var $popup = $('div#hotspot-popup');
    $popup.fadeIn().position({
        my: 'right',
        at: 'right top',
        of: el,
        collision: 'fit fit'
    })
    .find('div#hotspot-content').html(this.hotspots[id]);
  },

  mediaEnded: function() {
    // $('div#video div.vjs-control').hide();
    $('div#controls a#next').addClass('active');
    // var video = ONboard.video;
    // video.currentTime((video.duration() - 0.5)).play().pause();
  }

};