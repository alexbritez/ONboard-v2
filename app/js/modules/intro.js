window.ONboard.modules.intro = {

  initialize: function(scene) {
    window.ONboard.activeModule = this;

    $('div#video div.vjs-control').show();
    $('div#activity').empty().removeAttr('class');

    var videoAsset = ONboard.assetRoot+$(scene).find('video').text()+'.mp4';
    // check if video object exists (as intro it usually doesn't
    // but will need to do this when being loaded from the previous
    // button or scene select), create the videoJS element, otherwise
    // change the source of the existing videoJS element and play
    if (_.isUndefined(ONboard.video)) {
      ONboard.video = _V_("video", {"controls":true, "autoplay":true, "preload": "auto"}, function(){
        this.src({type: 'video/mp4', src: videoAsset}).play();
      });
    } else {
      ONboard.video.src({type: 'video/mp4', src: videoAsset}).play();
    }

    ONboard.video.addEvent('ended', function() {
      ONboard.activeModule.mediaEnded();
    });

    if ($('div#video').hasClass('audio')) {
      $('div#video').removeClass('audio').addClass('video');
    } else {
      $('div#video').addClass('video');
    }

    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());

    if (ONboard.mobileInitialized == false) {
      var template = '<a id="mobileStart" href="javascript:void(0);">Tap to Begin</a>';
      $('div#activity').append(template);
      ONboard.mobileInitialized = true;
    }

    $('a#mobileStart').one('click', function() {
      ONboard.loadScene(1);
    });

  },

  mediaEnded: function() {
    // $('div#video div.vjs-control').hide();
    $('div#controls a#next').addClass('active');
    // var video = ONboard.video;
    // video.currentTime((video.duration() - 0.5)).play().pause();
  }

};