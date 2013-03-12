window.ONboard.modules.text_img_animation = {

  initialize: function(scene) {
    window.ONboard.activeModule = this;
    $('div#activity').empty().removeAttr('class');
    var videoAsset = ONboard.assetRoot+$(scene).find('video').text()+'.mp4';

    if (_.isUndefined(ONboard.video)) {
      ONboard.video = _V_("video", {"controls":true, "autoplay":true, "preload": "auto"}, function(){
        this.src({type: 'video/mp4', src: videoAsset}).play();
      });
      ONboard.video.addEvent('ended', function() {
        ONboard.activeModule.mediaEnded();
      });
    } else {
      ONboard.video.src({type: 'video/mp4', src: videoAsset}).play();
    }

    if ($('div#video').hasClass('audio')) {
      $('div#video').removeClass('audio').addClass('video');
    } else {
      $('div#video').addClass('video');
    }
    $('div#video div.vjs-control').show();
    // $('video').html('<source src="'+videoAsset+'" type="video/mp4" />');
    // this.video = _V_("video", {"controls":true, "autoplay":true, "preload": "auto"}, function(){
    //   this.src({type: 'video/mp4', src: videoAsset}).play();
    // });

    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());
  },

  mediaEnded: function() {
    // $('div#video div.vjs-control').hide();
    $('div#controls a#next').addClass('active');
    // var video = ONboard.video;
    // video.currentTime((video.duration() - 0.5)).play().pause();
  }

};