window.ONboard.modules.activity_multiple_choice = {

  initialize: function(scene) {

    window.ONboard.activeModule = this;
    this.data = scene;
    this.currentQuestion = 0;
    this.correct = 0;
    $('div#activity').empty().removeAttr('class');
    if ($(scene).find('audio').text() == "") {
      ONboard.video.pause();
      $('div#video div.vjs-control').hide();
    } else {
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
    }

    if ($('div#video').hasClass('video')) {
      $('div#video').removeClass('video').addClass('audio');
    } else {
      $('div#video').addClass('audio');
    }

    $('div#video div.vjs-control').hide();

    var $multiple_choice = $(scene).find('multiple_choice');
    this.multiple = new Array();
    $multiple_choice.children().each(function() {
      var question = $(this).find('question').text().trim();
      var answers = new Array();
      $(this).find('answers').children().each(function() {
        answers.push({
          text: $(this).text().trim(),
          correct: $(this).attr('correct')
        })
      });
      ONboard.modules.activity_multiple_choice.multiple.push({
        question: question,
        answers: answers
      });
    });

    this.alphabet = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9','0','(',')','~','!','@','#','$','%','^','&','*','-','=','+','_','.',',','`','{','}','[',']','|','\'','\\','\"','/','?',':',';','>','<',' ','\n');

    this.UI(scene);
  },

  UI: function(scene) {
    var self = this;
    var $activity = $('div#activity');

    if(this.currentQuestion < this.multiple.length) {
      var template = '<div id="content">' +
        '<p id="instruction">Click on the correct answer.</p>' +
        '<h1>'+this.multiple[this.currentQuestion].question+'</h1>' +
        '<p id="feedback"></p>' +
        '</div>' +
        '<div id="answers">' +
        '</div>' +
        '<a href="#" id="multiple-continue"></a>';

      $activity.attr('class','activity_multiple_choice').html(template);
      $('a#multiple-continue').hide();

      if ($(this.data).find('multiple').eq(this.currentQuestion).attr('hasFigure') == "true") {
        var template = '<a href="#" id="multiple-view"></a>';
        $('div#content').append(template);
        $('p#instruction').text("Click 'View' if you need a reference to answer the question.");
      }

      if ($(this.data).find('multiple').eq(this.currentQuestion).attr('hasTextFigure') == "true") {
        var template = '<a href="#" id="multiple-view"></a>';
        $('div#content').append(template);
        $('p#instruction').text("Click 'View' if you need a reference to answer the question.");
      }

      for (var i=0; i<this.multiple[this.currentQuestion].answers.length; i++) {
        var $answer = this.multiple[this.currentQuestion].answers[i];
        if ($answer.correct == "true") {
          var template = '<a href="#" data-id="'+i+'" data-correct="true" class="answer">' +
            '<span class="answer-letter">' + ONboard.modules.activity_multiple_choice.alphabet[i] + '</span>' +
            '<span class="answer-text">' + $answer.text + '</span>' +
            '</a>';
        } else {
          var template = '<a href="#" data-id="'+i+'" class="answer">' +
            '<span class="answer-letter">' + ONboard.modules.activity_multiple_choice.alphabet[i] + '</span>' +
            '<span class="answer-text">' + $answer.text + '</span>' +
            '</a>';
        }
        $('div#answers').append(template);
      }
    } else {
      $('div#activity').html('<h1 id="results">You have completed this quiz. Your final score is '+Math.round((this.correct / this.multiple.length) * 100)+'%.</h1>');
    }

    // set dynamic line-height (if any)
    $('span.answer-text').each(function() {
      if ( typeof $(self.data).find('answers').attr('line-height') !== "undefined" )
      {
        $(this).css('line-height', $(self.data).find('answers').attr('line-height'));
      }
    });

    //dynamically adjust negative margin-tops of answer text
    $('span.answer-text').each(function() {
      $(this).css('margin-top',-($(this).height() / 2));
    });

    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());

    this.bindAnswers();

  },

  loadQuestion: function() {

  },

  loadFigure: function() {

    if ($(this.data).find('multiple').eq(this.currentQuestion).attr('hasFigure') == "true") {
      var template = '<div id="figure"><a href="#" id="figure-close"></a></div>';
      $('div#activity').append(template);
      // vertical centering for smaller figures
      var $figureAlignment = $(this.data).find('multiple').eq(this.currentQuestion).find('figure').attr('verticalAlign');
      if ($figureAlignment == "center" || $figureAlignment == "middle")
      {
        $valign = "center";
      }
      else
      {
        $valign = "top";
      }
      $('div#figure').css('background','rgba(0, 0, 0, 0.75) url('+ONboard.assetRoot+$(this.data).find('multiple').eq(this.currentQuestion).find('figure').text()+') '+$valign+' center no-repeat').fadeIn();
    }

    if ($(this.data).find('multiple').eq(this.currentQuestion).attr('hasTextFigure') == "true") {
      var template = '<div id="figure">';
      template += '<div class="txt_img_reading">' +
        '<div class="content">' +
        '<h1>'+$(this.data).find('multiple').eq(this.currentQuestion).find('figure').find('header').text()+'</h1>' +
        '<p>'+$(this.data).find('multiple').eq(this.currentQuestion).find('figure').find('text').text()+'</p>' +
        '</div></div>';
      template += '<a href="#" id="figure-close"></a></div>';
      $('div#activity').append(template);

      $('div#figure').fadeIn(function() {
        $('div.txt_img_reading div.content').jScrollPane({
          showArrows: true,
          verticalDragMinHeight: 93,
          verticalDragMaxHeight: 93
        });
      });
      if ($(this.data).find('multiple').eq(this.currentQuestion).find('figure').find('header').attr('italic') == "false")
      {
        $('div#figure div.txt_img_reading h1').addClass('normal');
      }

      if ($(this.data).find('multiple').eq(this.currentQuestion).find('figure').find('header').attr('bold') == "true")
      {
        $('div#content h1').addClass('bold');
      }
    }

    $('a#figure-close').on('click', function() {
      $('div#figure').fadeOut(function() {
        $(this).remove();
      });
    });
  },

  bindAnswers: function() {
    var $answerLinks = $('div#activity a.answer');
    $answerLinks.on('click', function() {
        ONboard.modules.activity_multiple_choice.checkAnswer(this);
    });
    $('a#multiple-view').on('click', function() {
        ONboard.modules.activity_multiple_choice.loadFigure();
    });
    $('a#multiple-continue').on('click', function() {
        ONboard.modules.activity_multiple_choice.UI();
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
      ONboard.modules.activity_multiple_choice.unbindAnswers();
      $('a.answer:not(.correct)').addClass('incorrect').append('<span class="incorrect" />');
      // play feedback audio if correct
      // REMOVED, MHE wants feedback audio for either choice
      // if ( $(this.data).find('feedbackAudio').text() !== "" )
      // {
      //   var audioAsset = ONboard.assetRoot+$(this.data).find('feedbackAudio').eq(this.currentQuestion).text()+'.mp4';
      //   ONboard.video.src({type: 'video/mp4', src: audioAsset}).play();
      // }
      // this.currentQuestion++;
      this.correct++;
      $('div#content p#feedback').text('Correct.');
      $('div#controls a#next').addClass('active');
    } else {
      $(el)
        .addClass('incorrect')
        .append('<span class="incorrect" />');
      // $('a[data-correct=true]').addClass('correct').append('<span class="correct" />');
      // $('a.answer:not(.correct)').addClass('incorrect').append('<span class="incorrect" />');
      // ONboard.modules.activity_multiple_choice.unbindAnswers();
      // this.currentQuestion++;
      $('div#content p#feedback').text('Incorrect.');
      $('div#controls a#next').addClass('active');
    }

    if ( $('a.answer').size() == 2 )
    {
      if ( $(this.data).find('feedbackAudio').text() !== "" )
      {
        var audioAsset = ONboard.assetRoot+$(this.data).find('feedbackAudio').eq(this.currentQuestion).text()+'.mp4';
        ONboard.video.src({type: 'video/mp4', src: audioAsset}).play();
      }

      // if ( correct == true )
      // {
        $('a[data-correct=true]').addClass('correct').append('<span class="correct" />');
      // }
    }
    else
    {
      if ( correct == true )
      {
        if ( $(this.data).find('feedbackAudio').text() !== "" )
        {
          var audioAsset = ONboard.assetRoot+$(this.data).find('feedbackAudio').eq(this.currentQuestion).text()+'.mp4';
          ONboard.video.src({type: 'video/mp4', src: audioAsset}).play();
        }
      }
    }

    // $('a#multiple-continue').fadeIn();
  },

  mediaEnded: function() {
    // $('div#video div.vjs-control').hide();
    // $('div#controls a#next').addClass('active');
    // var video = ONboard.video;
    // video.currentTime((video.duration() - 0.5)).play().pause();
  }

};