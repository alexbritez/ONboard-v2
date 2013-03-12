window.ONboard = {
  modules: new Object(),
  id: null,
  currentScene: 0,
  complete: false,
  mobile: false,

  init: function() {
    var self = this;

    // load cmi.location for SCORM if available
    // console.log('SCO returned value: ' + SCOStart());
    if ( SCOStart() !== "" )
    {
      self.currentScene = parseInt(SCOStart());
    }
    // console.log('scene to load: ' + self.currentScene);
    // console.log(SCOStart());

    //viewport hack for iOS to prevent rotation issues
    if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
      var viewportmeta = document.querySelector('meta[name="viewport"]');
      if (viewportmeta) {
        viewportmeta.content = 'width=device-width, minimum-scale=0.975, maximum-scale=0.975, initial-scale=0.975';
      }
      this.mobile = true;
      this.mobileInitialized = false;
      // iOS 6 seems to autoplay web media now so the 'Tap to Begin' dialog will be disabled
      // if (navigator.userAgent.match(/OS 6(_\d)+ like Mac OS X/i))
      // {
      //   this.mobileInitialized = true;
      // }
    }

    $.ajax({
      type : "GET",
      url : 'data/'+this.id+'.xml',
      dataType : "xml",
      success: function(data) {
        ONboard.data = data;
        ONboard.assetRoot = 'http://atm-onboardv2.s3.amazonaws.com/eng/assets/'+ONboard.id+'/';
        ONboard.processData();
      }
    });
  },

  processData: function() {

    // store whatever needs to be stored for easy reference
    this.scenes = $(this.data).find('scene');

    // handoff to UI object
    ONboard.UI.initialize();

  },

  loadScene: function(modifier) {
    if (modifier == 'next') {
      this.currentScene++;
    } else if (modifier == 'prev') {
      this.currentScene--;
    } else if (_.isNumber(modifier)) {
      this.currentScene = (modifier - 1);
    }

    if(this.mobile == true && this.mobileInitialized == true) {
      $('a#mobileStart').remove();
    }

    $('div#scene_select a.active, div#controls a.active').removeClass('active');
    $('div#scene_select a[data-scene-id='+(this.currentScene+1)+']').addClass('active');

    this.router.load(this.scenes[this.currentScene]);
  }

};

$(function() {
  ONboard.init();
});