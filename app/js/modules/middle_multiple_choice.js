window.ONboard.modules.middle_multiple_choice = {

  initialize: function(scene) {
    window.ONboard.activeModule = this;
    this.data = scene;
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

    $('div#video div.vjs-control').hide();

    var $answers = $(scene).find('answers');
    this.answers = new Array();
    $answers.children().each(function() {
        ONboard.modules.middle_multiple_choice.answers.push({
          text: $(this).text().trim(),
          correct: $(this).attr('correct')
        });
    });

    this.alphabet = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9','0','(',')','~','!','@','#','$','%','^','&','*','-','=','+','_','.',',','`','{','}','[',']','|','\'','\\','\"','/','?',':',';','>','<',' ','\n');

    this.UI(scene);
  },

  UI: function(scene) {
    var $activity = $('div#activity');

    var template = '<div id="content">' +
        '<p>'+$(scene).find('multiple_choice').find('instruction').text()+'</p>' +
        '<h1>'+$(scene).find('multiple_choice').find('question').text()+'</h1>' +
        '<p id="feedback"></p>' +
        '</div>' +
        '<div id="answers">' +
        '</div>' +
        '<div id="hotspot-popup"><a href="#" id="hotspot-close"></a><div id="hotspot-content"></div></div>';

    $activity.attr('class','middle_multiple_choice').html(template);

    for (var i=0; i<this.answers.length; i++) {
      var $answer = $(scene).find('answers').find('answer').eq(i);
      if ($answer.attr('correct') == "true") {
        var template = '<a href="#" data-id="'+i+'" data-correct="true" class="answer">' +
          '<span class="answer-letter">' + ONboard.modules.middle_multiple_choice.alphabet[i] + '</span>' +
          '<span class="answer-text">' + $answer.text().trim() + '</span>' +
          '</a>';
      } else {
        var template = '<a href="#" data-id="'+i+'" class="answer">' +
          '<span class="answer-letter">' + ONboard.modules.middle_multiple_choice.alphabet[i] + '</span>' +
          '<span class="answer-text">' + $answer.text().trim() + '</span>' +
          '</a>';
      }

      $('div#answers').append(template);

    }

    // dynamically adjust negative margin-tops of answer text
    $('span.answer-text').each(function() {
      $(this).css('margin-top',-($(this).height() / 2));
    });

    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());

    this.bindAnswers();

  },

  bindAnswers: function() {
    var $answerLinks = $('div#activity a.answer');
    $answerLinks.on('click', function() {
        ONboard.modules.middle_multiple_choice.checkAnswer(this);
    });
  },

  unbindAnswers: function() {
    var $answerLinks = $('div#activity a.answer');
    $answerLinks.unbind('click');
  },

  checkAnswer: function(el) {
    var correct = $(el).data('correct');

    if (correct == true) {
      $(el)
        .addClass('correct')
        .append('<span class="correct" />');
      ONboard.modules.middle_multiple_choice.unbindAnswers();
      $('a.answer:not(.correct)').addClass('incorrect').append('<span class="incorrect" />');
      if ( $(this.data).find('feedbackAudio').text() !== "" )
      {
        var audioAsset = ONboard.assetRoot+$(this.data).find('feedbackAudio').text()+'.mp4';
        ONboard.video.src({type: 'video/mp4', src: audioAsset}).play();
      }
      $('div#content p#feedback').text('Correct.');
      $('div#controls a#next').addClass('active');
    } else {
      $(el)
        .addClass('incorrect')
        .unbind('click')
        .append('<span class="incorrect" />');
      $('div#content p#feedback').text('Incorrect.');
    }
  },

  closeHotSpot: function() {
    var $popup = $('div#hotspot-popup');
    $popup.fadeOut();
  },

  loadHotSpot: function(el) {
    var id = $(el).data('id');
    var $popup = $('div#hotspot-popup');
    $popup.fadeIn().position({
        my: 'center center',
        at: 'center center',
        of: el
    })
    .find('div#hotspot-content').html(this.hotspots[id]);
  },

  mediaEnded: function() {
    // $('div#video div.vjs-control').hide();
    // var video = ONboard.video;
    // video.currentTime((video.duration() - 0.5)).play().pause();
  }

};