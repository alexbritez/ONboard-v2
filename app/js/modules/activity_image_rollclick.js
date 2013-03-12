window.ONboard.modules.activity_image_rollclick = {

  hotspotPlaying: false,

  initialize: function(scene) {
    window.ONboard.activeModule = this;
    this.data = scene;
    $('div#activity').empty().removeAttr('class');
    var audioAsset = ONboard.assetRoot+$(scene).find('audio').text()+'.mp4';

    var $hotspots = $(scene).find('hotspots');
    this.hotspots = new Array();
    $hotspots.children().each(function() {
        ONboard.modules.activity_image_rollclick.hotspots.push($(this).text().trim());
    });

    this.UI(scene);

    if ( $(scene).find('audio').text() != "" )
    {
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

      $('div#video div.vjs-control').show();
    }
    else
    {
      ONboard.video.pause();
      this.bindHotSpots();
      $('div#video div.vjs-control, .vjs-loading-spinner').hide();
    }

    if ($('div#video').hasClass('video')) {
      $('div#video').removeClass('video').addClass('audio');
    } else {
      $('div#video').addClass('audio');
    }


  },

  UI: function(scene) {
    var $activity = $('div#activity');
    var activityType = $(scene).find('activity').attr('type');

    if (activityType == "text") {
      var template = '<div id="content" class="text" style="'+$(scene).find('content').attr('style')+'">' +
        '<h1>'+$(scene).find('content').find('header').text()+'</h1>' +
        '<p>'+$(scene).find('content').find('instruction').text()+'</p>' +
        '</div>' +
        '<div id="image" class="'+$(scene).find('activity').attr('type')+'">' +
        $(scene).find('activity').find('text').text().trim()+
        '</div>' +
        '<div id="hotspot-popup"><a href="#" id="hotspot-close"></a><div id="hotspot-content"></div></div>';
    } else if (activityType == "textWithImage") {
      var template = '<div id="content" class="textWithImage" style="'+$(scene).find('content').attr('style')+'">' +
        '<h1>'+$(scene).find('content').find('header').text()+'</h1>' +
        '<p>'+$(scene).find('content').find('instruction').text()+'</p>' +
        '</div>' +
        '<div id="image" class="'+$(scene).find('activity').attr('type')+'">' +
        $(scene).find('activity').find('text').text().trim()+
        '<img src="'+ONboard.assetRoot+$(scene).find('activity').find('image').text()+'" />' +
        '</div>' +
        '<div id="hotspot-popup"><a href="#" id="hotspot-close"></a><div id="hotspot-content"></div></div>';
    } else if (activityType == "table") {
      var template = '<div id="content" style="'+$(scene).find('content').attr('style')+'">' +
        '<h1>'+$(scene).find('content').find('header').text()+'</h1>' +
        '<p>'+$(scene).find('content').find('instruction').text()+'</p>' +
        '</div>' +
        '<div id="image" class="'+$(scene).find('activity').attr('type')+'">' +
        $(scene).find('activity').find('text').text().trim()+
        '</div>' +
        '<div id="hotspot-popup"><a href="#" id="hotspot-close"></a><div id="hotspot-content"></div></div>';
    } else if (activityType == "image") {
      var template = '<div id="content" class="image" style="'+$(scene).find('content').attr('style')+'">' +
        '<h1>'+$(scene).find('content').find('header').text()+'</h1>' +
        '<p>'+$(scene).find('content').find('instruction').text()+'</p>' +
        '<h1>Click to Explore</h1>' +
        '<p>Click on the \'hot spots\' to view additional information.</p>' +
        '</div>' +
        '<div id="image" class="'+$(scene).find('activity').attr('type')+'">' +
        $(scene).find('activity').find('text').text().trim()+
        '<img src="'+ONboard.assetRoot+$(scene).find('activity').find('image').text()+'" />' +
        '</div>' +
        '<div id="hotspot-popup"><a href="#" id="hotspot-close"></a><div id="hotspot-content"></div></div>';
    }

    $activity.attr('class','activity_image_rollclick').html(template);

    for (var i=0; i<this.hotspots.length; i++) {
      var $hotspot = $(scene).find('hotspots').find('hotspot').eq(i);
      if ($hotspot.attr('dynamic') !== undefined) {
        if (activityType == "image") {
          if ($hotspot.attr('title') !== undefined) {
            if ($hotspot.attr('numbered') == "true") {
              var template = '<a href="#" data-id="'+i+'" class="image-hotspot-dynamic numbered" style="top:'+$hotspot.attr('y')+'px;left:'+$hotspot.attr('x')+'px;'+$hotspot.attr('style')+'">'+$hotspot.attr('title')+'</a>';
            } else {
              var template = '<a href="#" data-id="'+i+'" class="image-hotspot-dynamic has_text" style="top:'+$hotspot.attr('y')+'px;left:'+$hotspot.attr('x')+'px;'+$hotspot.attr('style')+'">'+$hotspot.attr('title')+'</a>';
            }
          } else {
            if ($hotspot.attr('hidden') == 'true') {
              var template = '<a href="#" data-id="'+i+'" class="image-hotspot-dynamic" style="opacity:0;top:'+$hotspot.attr('y')+'px;left:'+$hotspot.attr('x')+'px;'+$hotspot.attr('style')+'"></a>';
            } else {
              var template = '<a href="#" data-id="'+i+'" class="image-hotspot-dynamic" style="top:'+$hotspot.attr('y')+'px;left:'+$hotspot.attr('x')+'px;'+$hotspot.attr('style')+'"></a>';
            }
          }
        } else {
          var template = '<a href="#" data-id="'+i+'" class="hotspot-dynamic" style="top:'+$hotspot.attr('y')+'px;left:'+$hotspot.attr('x')+'px;'+$hotspot.attr('style')+'"></a>';
        }
        $('div#image').append(template);
      }
    }

    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());

    // moved to mediaEnded – hotspots to only be used
    // after main VO has finished
    // this.bindHotSpots();

  },

  bindHotSpots: function() {
    var $hotspotLinks = $('div#activity a.hotspot, div#activity a.hotspot-dynamic, div#activity a.image-hotspot-dynamic');
    $hotspotLinks.on('click', function() {
        ONboard.modules.activity_image_rollclick.loadHotSpot(this);
    });
    $('a#hotspot-close').on('click', function() {ONboard.modules.activity_image_rollclick.closeHotSpot()});
  },

  closeHotSpot: function() {
    var $popup = $('div#hotspot-popup');
    $popup.fadeOut(function()
    {
      if (ONboard.activeModule.hotspotPlaying == true)
      {
        ONboard.video.pause();
        ONboard.activeModule.hotspotPlaying = false;
        $('div#video div.vjs-control').hide();
      }
    });
  },

  loadHotSpot: function(el) {
    var id = $(el).data('id');
    var $popup = $('div#hotspot-popup');
    $popup.fadeIn().position({
        my: 'right',
        at: 'right top',
        of: el,
        collision: 'fit',
        within: $('#activity')
    })
    .find('div#hotspot-content').html(this.hotspots[id]);
    // load audio if it accompanies the hotspot
    if ( typeof $(this.data).find('hotspot').eq(id).attr('audio') != "undefined" && $(this.data).find('hotspot').eq(id).attr('audio') != "" )
    {
      var audioAsset = ONboard.assetRoot+$(this.data).find('hotspot').eq(id).attr('audio')+'.mp4';
      ONboard.video.src({type: 'video/mp4', src: audioAsset}).play();
      ONboard.activeModule.hotspotPlaying = true;
      // 02/01/13 - MHE doesn't want scrubber bars for popup VO
      // $('div#video div.vjs-control').show();
    }
  },

  mediaEnded: function() {
    $('div#video div.vjs-control').hide();
    $('div#controls a#next').addClass('active');
    // var video = ONboard.video;
    // video.currentTime((video.duration() - 0.5)).play().pause();
    this.bindHotSpots();
  }

};