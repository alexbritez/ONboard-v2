window.ONboard.modules.activity_drag_drop = {

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

    $('div#video div.vjs-control').show();

    var matchingObject = $(scene).find('matching');
    this.hasPoints = matchingObject.attr('hasPoints');
    this.points = parseFloat(matchingObject.attr('points'));
    this.deductionFactor = parseFloat(matchingObject.attr('deductionFactor'));
    this.maxAttempts = parseFloat(matchingObject.attr('maxAttempts'));
    this.currentAttempt = 0;
    this.answers = new Array();
    this.dropped = new Array();
    //set up content object
    this.content = {
      matchingInstructions : $(scene).find('matchingInstructions').text(),
      instructions : $(scene).find('instructions').text(),
      matches : new Array(),
      drops : new Array()
    }
    //map column to columns array
    $(scene).find('matches').each(function() {
      ONboard.modules.activity_drag_drop.content.matches = {
        title : $(this).attr('title'),
        choices : $(this).children(),
      };
    });
    $(scene).find('drops').each(function() {
      ONboard.modules.activity_drag_drop.content.drops = {
        title : $(this).attr('title'),
        choices : $(this).children(),
      };
    });

    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());

    this.content.alphabet = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9','0','(',')','~','!','@','#','$','%','^','&','*','-','=','+','_','.',',','`','{','}','[',']','|','\'','\\','\"','/','?',':',';','>','<',' ','\n');

    this.UI(scene);
  },

  UI: function(scene) {
    var $activity = $('div#activity');
    var content = this.content;
    var matching = this;

    var $skipLetter = parseInt($(scene).find('matching').attr('skipLetter'));
    if ( !$skipLetter > 0 )
    {
      $skipLetter = 0;
    }


    //begin matching template and draggable items
    var template = '<div id="matchingContainer" class="gradient"><div id="matching"></div><div id="controls">';
    if (this.hasPoints == "true") {
      template += '<p id="instructions">'+content.instructions+'</p><a id="submit" class="button" href="javascript:void(0);">Check Answers</a>';
    }
    template += '</div></div>';

    if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "inside") {
      $activity.attr('class','activity_drag_drop dynamic inside').html(template);
    } else if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "inside-small") {
      $activity.attr('class','activity_drag_drop dynamic inside-small').html(template);
    } else if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "letter") {
      $activity.attr('class','activity_drag_drop dynamic letter').html(template);
    } else if ($(scene).find('matching').attr('type') == "dynamic"  && $(scene).find('matching').attr('format') == "letter-small") {
      $activity.attr('class','activity_drag_drop dynamic letter small').html(template);
    } else if ($(scene).find('matching').attr('format') == "letter-small") {
      $activity.attr('class','activity_drag_drop letter-small').html(template);
    } else if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "number") {
      $activity.attr('class','activity_drag_drop dynamic number').html(template);
    } else if ($(scene).find('matching').attr('type') == "dynamic"  && $(scene).find('matching').attr('format') == "number-small") {
      $activity.attr('class','activity_drag_drop dynamic number small').html(template);
    } else if ($(scene).find('matching').attr('format') == "number-small") {
      $activity.attr('class','activity_drag_drop number-small').html(template);
    } else if ($(scene).find('matching').attr('type') == "small") {
      $activity.attr('class','activity_drag_drop small').html(template);
    } else {
      $activity.attr('class','activity_drag_drop dynamic').html(template);
    }

    //matching column loading
    if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "inside-small") {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(scene).find('matches').attr('children-styles')+'"><span>'+$(content.matches.choices[j]).text()+'</span></div></div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(scene).find('matches').attr('children-styles')+'"><span>'+$(content.matches.choices[j]).text()+'</span></div></div>';
          }
        }
        colTemplate += '</div>';
      }
    } else if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "letter") {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+content.alphabet[j+$skipLetter]+'</span></div><div class="matching-text">'+$(content.matches.choices[j]).text()+'</div></div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+content.alphabet[j+$skipLetter]+'</span></div><div class="matching-text">'+$(content.matches.choices[j]).text()+'</div></div>';
          }
        }
        colTemplate += '</div>';
      }
    } else if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "letter-small") {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+content.alphabet[j+$skipLetter]+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+content.alphabet[j+$skipLetter]+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          }
        }
        colTemplate += '</div>';
      }
    } else if ($(scene).find('matching').attr('format') == "letter-small") {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+content.alphabet[j+$skipLetter]+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+content.alphabet[j+$skipLetter]+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          }
        }
        colTemplate += '</div>';
      }
    } else if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "number") {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient" style="'+$(scene).find('matching').attr('matchContainerStyle')+'"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(scene).find('matches').attr('children-styles')+'"><span>'+(j+1)+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          } else {
            colTemplate += '<div class="draggable-container gradient" style="'+$(scene).find('matching').attr('matchContainerStyle')+'"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(scene).find('matches').attr('children-styles')+'"><span>'+(j+1)+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          }
        }
        colTemplate += '</div>';
      }
    } else if ($(scene).find('matching').attr('type') == "dynamic" && $(scene).find('matching').attr('format') == "number-small") {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+(j+1)+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+(j+1)+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          }
        }
        colTemplate += '</div>';
      }
    } else if ($(scene).find('matching').attr('format') == "number-small") {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+(j+1)+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient"><span>'+(j+1)+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          }
        }
        colTemplate += '</div>';
      }
    } else {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        if (typeof $(scene).find('matches').attr('title') !== "undefined")
        {
          colTemplate += '<h1>'+$(scene).find('matches').attr('title')+'</h1>';
        }
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(scene).find('matches').attr('children-styles')+'"><span>'+$(content.matches.choices[j]).text()+'</span></div></div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(scene).find('matches').attr('children-styles')+'"><span>'+$(content.matches.choices[j]).text()+'</span></div></div>';
          }
        }
        colTemplate += '</div>';
      }
    }
    //end draggable items
    //start drop zones
    if ($(scene).find('matching').attr('type') == "dynamic") {
      colTemplate += '<div id="drop-'+i+'" class="drop-column dynamic" style="'+$(scene).find('drops').attr('style')+'">';
      for (var j=0; j<$(content.drops.choices).size(); j++) {
        var $drop = $(scene).find('drops').find('drop').eq(j);
        if (Boolean($(content.drops.choices[j]).attr('id')) == true) {
          colTemplate += '<div class="droppable-container gradient" style="top:'+$drop.attr('y')+'px;left:'+$drop.attr('x')+'px;'+$(scene).find('drops').attr('children-styles')+'"><div data-correct="'+$(content.drops.choices[j]).attr('correct')+'" data-col="'+i+'" id="matching-'+i+'-droppable-'+j+'" class="matching-droppable gradient"><div class="dropSpacer" style="'+$(scene).find('drops').attr('dropzone-styles')+'"></div>'+$(content.drops.choices[j]).text()+'</div></div>';
        } else {
          colTemplate += '<div class="droppable-container gradient" style="top:'+$drop.attr('y')+'px;left:'+$drop.attr('x')+'px;'+$(scene).find('drops').attr('children-styles')+'"><div data-correct="'+$(content.drops.choices[j]).attr('correct')+'" data-col="'+i+'" id="matching-'+i+'-droppable-'+j+'" class="matching-droppable gradient"><div class="dropSpacer" style="'+$(scene).find('drops').attr('dropzone-styles')+'"></div>'+$(content.drops.choices[j]).text()+'</div></div>';
        }
      }
      colTemplate += '</div>';
    } else {
      colTemplate += '<div id="drop-'+i+'" class="drop-column" style="'+$(scene).find('drops').attr('style')+'">';
      if (typeof $(scene).find('drops').attr('title') !== "undefined")
      {
        colTemplate += '<h1>'+$(scene).find('drops').attr('title')+'</h1>';
      }
      for (var j=0; j<$(content.drops.choices).size(); j++) {
        if (Boolean($(content.drops.choices[j]).attr('id')) == true) {
          colTemplate += '<div class="droppable-container gradient" style="'+$(scene).find('drops').attr('children-styles')+'"><div data-correct="'+$(content.drops.choices[j]).attr('correct')+'" data-col="'+i+'" id="matching-'+i+'-droppable-'+j+'" class="matching-droppable gradient"><div class="dropSpacer"></div><div class="dropContent">'+$(content.drops.choices[j]).text()+'</div></div></div>';
        } else {
          colTemplate += '<div class="droppable-container gradient" style="'+$(scene).find('drops').attr('children-styles')+'"><div data-correct="'+$(content.drops.choices[j]).attr('correct')+'" data-col="'+i+'" id="matching-'+i+'-droppable-'+j+'" class="matching-droppable gradient"><div class="dropSpacer"></div><div class="dropContent">'+$(content.drops.choices[j]).text()+'</div></div></div>';
        }
      }
      colTemplate += '</div>';
    }
    //end drop zones and matching template and render
    $('div#matching').append(colTemplate);
    // add the background for the dynamic drag drop if the matching interaction is dynamic
    if ($(scene).find('matching').attr('type') == "dynamic") {
      $('.drop-column').css('background','#FFF url('+ONboard.assetRoot+$(scene).find('matching').find('image').text()+') top center no-repeat');
    }
    //dynamically adjust negative margin-tops of draggable choices
    $('div.matching-draggable span').each(function() {
      $(this).css('margin-top',-($(this).height() / 2));
    });

    // get count of drop zones, use to check when to enable "Check Answers" button
    var $droppableCount = $('.matching-droppable').size();

    // disable submit button until all drops have been placed
    $('div#activity a#submit').unbind('click').css('opacity','0.5');

    //initialize drag-drop functionality
    $('.matching-draggable').draggable({
      containment: '#main',
      revert: 'invalid'
    });
    $('.matching-droppable').droppable({
      drop: function(event, jui) {
        //console.log(event,ui);
        var draggedObject = $('#'+jui.draggable[0].id);
        var draggedObjectID = draggedObject.data('id');
        //get position of dropzone to add answer to correct position
        var droppedPosition = $(this).parent().index();
        if (draggedObjectID == $(this).data('correct')) {
          matching.answers[droppedPosition] = true;
        } else {
          matching.answers[droppedPosition] = false;
        }
        $('#'+jui.draggable[0].id).position({
          of: $('#'+event.target.id),
          my: 'left top',
          at: 'left top'
        });
        // disable the droppable
        // $(this).droppable('disable').data('dragged',draggedObjectID);
        // save dragged object to swap if need be
        if ( typeof $(this).data('dragged') == "undefined" )
        {
          // if dragging from another dropzone, wipe old drop data
          $('.matching-droppable').each(function()
          {
            if ( $(this).data('dragged') == draggedObjectID )
            {
              $(this).data('dragged', null);
              delete matching.dropped[$(this).parent().index()];
              delete matching.answers[$(this).parent().index()];
            }
          });
          $(this).data('dragged',draggedObjectID);
          // save dropped object
          matching.dropped[droppedPosition] = jui.draggable[0].id;
        } else {
          // send old drag back to list
          $('#'+matching.dropped[droppedPosition]).animate({top: 0, left: 0});
          // save dropped object
          // if dragging from another dropzone, wipe old drop data
          $('.matching-droppable').each(function()
          {
            if ( $(this).data('dragged') == draggedObjectID )
            {
              $(this).data('dragged', null);
              delete matching.dropped[$(this).parent().index()];
              delete matching.answers[$(this).parent().index()];
            }
          });
          $(this).data('dragged',draggedObjectID);
          matching.dropped[droppedPosition] = jui.draggable[0].id;
        }
        // enable check answers if amount of answers chosen matches amount of drops
        var $answerCount = 0;
        for ( var i = 0; i < matching.answers.length; i++ )
        {
          if ( matching.answers[i] == true || matching.answers[i] == false )
          {
            $answerCount++;
          }
        }
        // console.log('answers length: ' + $answerCount);
        // console.log('droppable count: ' + $droppableCount);
        if ( $answerCount == $droppableCount )
        {
          $('div#activity a#submit').one('click', function() { matching.checkAnswers(); }).css('opacity','1');
        }
        // console.log('answer count: ' + $answerCount);
        // console.log('droppable count: ' + $droppableCount);
        // console.log('dropped: ' + matching.dropped);
        // console.log('answers: ' + matching.answers);
        // console.log('------------------------------');
      }
    });

    if ( $(scene).find('matching').attr('format') == "inside-small" )
    {
      $('.matching-droppable').droppable( "option", "tolerance", "touch" );
    }

  },

  checkAnswers: function() {
    var matching = this;
    var content = this.content;
    //set correct to be true but loop through answers and mark false if any wrong answers found
    var correct = true;
    //check if they answered at all
    if (matching.answers == "") {
      correct = false;
    }
    var amountCorrect = 0;
    for (var i=0; i<matching.answers.length; i++) {
      if (matching.answers[i] == false) {
        correct = false;
        //clear answer out of answers object
        matching.answers[i] = undefined;
        //move incorrect answer back to original position
        $('#'+matching.dropped[i]).animate({top: 0, left: 0});
        // disable submit button until all drops have been placed
        $('div#activity a#submit').unbind('click').css('opacity','0.5');

        var $id = $('#'+matching.dropped[i]).data('id');
        $('.matching-droppable').each(function()
        {
          var $dragged = $(this).data('dragged');

          if ($dragged == $id)
          {
            $(this).droppable('enable').data('dragged', null);
            delete matching.dropped[$(this).parent().index()];
          }
        });

      } else if (matching.answers[i] == true) {
        amountCorrect++;
      }
    }
    /*******************************
              ANSWER LOGIC
    *******************************/
    //if answer is wrong, increment currentAttempt and deduct possible points earned by deduction factor
    if (matching.currentAttempt == matching.maxAttempts && correct == false) {
      //if user uses max attempts, proceed to next screen and do not award points
      //log attempts made
      settings.attempts.push(matching.currentAttempt);
      //award points and load next screen
      settings.points.push(0);
      cj.loadScreen();
    } else if (matching.currentAttempt == matching.maxAttempts && correct == true) {
      //answer is correct, award points, log amount of attempts, and allow user to proceed
      if (amountCorrect == $(content.drops.choices).size()) {
        // alert('Complete');
        $('a#submit').addClass('correct');
        if ( $(this.data).find('feedbackAudio').text() !== "" )
        {
          var audioAsset = ONboard.assetRoot+$(this.data).find('feedbackAudio').text()+'.mp4';
          ONboard.video.src({type: 'video/mp4', src: audioAsset}).play();
        }
      }
    } else if (correct == false) {
      // matching.points = matching.points - matching.deductionFactor;
    } else if (correct == true) {
      //answer is correct, award points, log amount of attempts, and allow user to proceed
      if (amountCorrect == $(content.drops.choices).size()) {
        //log attempts made
        // settings.attempts.push(matching.currentAttempt);
        //award points and load next screen
        // settings.points.push(matching.points);
        // $('#instruction').text('Click Next to continue.');
        // $('#nextButton, #instruction').show();
        // alert('Complete');
        $('a#submit').addClass('correct');
        if ($(this.data).find('feedbackAudio').text() !== "")
        {
          var audioAsset = ONboard.assetRoot+$(this.data).find('feedbackAudio').text()+'.mp4';
          ONboard.video.src({type: 'video/mp4', src: audioAsset}).play();
        }
      }
    }
  },

  bindHotSpots: function() {
    var $hotspotLinks = $('div#activity a.hotspot, div#activity a.hotspot-dynamic');
    $hotspotLinks.on('click', function() {
        ONboard.modules.activity_drag_drop.loadHotSpot(this);
    });
    $('a#hotspot-close').on('click', function() {ONboard.modules.activity_drag_drop.closeHotSpot()});
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
    $('div#video div.vjs-control').hide();
    $('div#controls a#next').addClass('active');
    // var video = ONboard.video;
    // video.currentTime((video.duration() - 0.5)).play().pause();
  }

};