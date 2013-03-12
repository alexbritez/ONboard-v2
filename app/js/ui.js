$.fn.offsetRelative = function(top){
  var $this = $(this);
  var $parent = $this.offsetParent();
  var offset = $this.position();
  if(!top) return offset; // Didn't pass a 'top' element
  else if($parent.get(0).tagName == "BODY") return offset; // Reached top of document
  else if($(top,$parent).length) return offset; // Parent element contains the 'top' element we want the offset to be relative to
  else if($parent[0] == $(top)[0]) return offset; // Reached the 'top' element we want the offset to be relative to
  else { // Get parent's relative offset
      var parent_offset = $parent.offsetRelative(top);
      offset.top += parent_offset.top;
      offset.left += parent_offset.left;
      return offset;
  }
};
$.fn.positionRelative = function(top){
  return $(this).offsetRelative(top);
};
$.fn.isOnScreen = function(){

  var win = $('#container');

  var viewport = {
    top : win.scrollTop(),
  left : win.scrollLeft()
  };
  viewport.right = viewport.left + win.width();
  viewport.bottom = viewport.top + win.height();

  // var bounds = this.offset();
  var bounds = this.offsetRelative('#container');
  bounds.right = bounds.left + this.outerWidth();
  bounds.bottom = bounds.top + this.outerHeight();

  return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

};

window.ONboard.UI = {

  initialize: function() {

    // flag the body for subject-specific UI
    $subject = ONboard.id.split('_')[0];
    $('html').attr('id', $subject);

    // flag the body for any mobile-specific CSS adjustments
    if (ONboard.mobile == true)
    {
      $('html').addClass('mobile ' + ONboard.mobile);
    } else {
      $('html').addClass('desktop');
    }

    // set up scene select menu
    var template = '<div id="scenes">';
    for (var i=0; i<ONboard.scenes.length; i++) {
      sceneID = $(ONboard.scenes[i]).attr('id');
      template += '<a href="#" class="btn-screenSelect" data-scene-id="'+sceneID+'">'+sceneID+'</a>';
    };
    template += '</div>';
    $('div#scene_select').append(template);

    // scroll handler for secene selection
    if (ONboard.mobile == false)
    {
      this.sceneScroller = $('div#scenes').hoverscroll({
        vertical: false,
        width: 645,
        height: 30
      });
    }
    else
    {
      // mobile init
      // dynamically set width for iScroll
      var iScrollWidth = 36 * ONboard.scenes.length;
      $('div#scenes').css('width', iScrollWidth);
      // init iScroll
      this.sceneScroller = new iScroll('scene_select');
      this.sceneScroller.vScroll = false;
      this.sceneScroller.hScroll = true;
      this.sceneScroller.hScrollbar = false;
    }

    $('#header #title').text($(ONboard.data).find('shell').attr('title'));

    // bind controls
    $('div#scene_select a').on('click', function(e) {
      e.preventDefault();
      var sceneID = parseInt($(this).data('scene-id'));
      ONboard.loadScene(sceneID);
    });
    $('div#controls a#prev').on('click', function(e) {
      e.preventDefault();
      if ( ONboard.currentScene !== 0 )
      {
        ONboard.loadScene('prev');
      }
    });
    $('div#controls a#next').on('click', function(e) {
      e.preventDefault();
      if ( (ONboard.currentScene + 1) !== $(ONboard.data).find('scene').size() )
      {
        ONboard.loadScene('next');
      }
    });

    $('a#btn-saveAndExit').on('click', function() { SCOFinish(); });

    // now start the first scene
    ONboard.loadScene();

  }

}