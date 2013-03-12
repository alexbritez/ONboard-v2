window.ONboard.modules.txt_img_reading = {

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

    var template = '<div id="content">' +
        '<h1>'+$(scene).find('content').find('header').text()+'</h1>' +
        $(scene).find('content').find('text').text() +
        '</div>';

    $activity.attr('class','txt_img_reading').html(template);

    if ($(scene).find('content').find('header').attr('italic') == "false")
    {
      $('div#content h1').addClass('normal');
    }

    if ($(scene).find('content').find('header').attr('bold') == "true")
    {
      $('div#content h1').addClass('bold');
    }

    $('div#content').jScrollPane({
      showArrows: true,
      verticalDragMinHeight: 93,
      verticalDragMaxHeight: 93
    });

    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());

  },

  mediaEnded: function() {
    // $('div#video div.vjs-control').hide();
    $('div#controls a#next').addClass('active');
    // var video = ONboard.video;
    // video.currentTime(0).play().pause();
  }

};