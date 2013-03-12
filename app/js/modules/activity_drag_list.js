window.ONboard.modules.activity_drag_list = {

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
    this.hasPoints = Boolean(matchingObject.attr('hasPoints'));
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
      ONboard.modules.activity_drag_list.content.matches = {
        title : $(this).attr('title'),
        choices : $(this).children(),
      };
    });
    $(scene).find('drops').each(function() {
      ONboard.modules.activity_drag_list.content.drops.push({
        title : $(this).attr('title'),
        choices : $(this).text().split(','),
      });
    });
    // clean up choices array (string -> int)
    // also gather amount of choices for answer checking
    this.amountOfAnswers = 0;
    for (var i=0; i<ONboard.modules.activity_drag_list.content.drops.length; i++) {
      for (var j=0; j<ONboard.modules.activity_drag_list.content.drops[i].choices.length; j++) {
        ONboard.modules.activity_drag_list.content.drops[i].choices[j] = parseInt(ONboard.modules.activity_drag_list.content.drops[i].choices[j]);
        this.amountOfAnswers++;
      }
    }
    // display photo credits
    $('div#footer div#copyright div#credits').html($(scene).find('credits').text().trim());

    this.content.alphabet = new Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','1','2','3','4','5','6','7','8','9','0','(',')','~','!','@','#','$','%','^','&','*','-','=','+','_','.',',','`','{','}','[',']','|','\'','\\','\"','/','?',':',';','>','<',' ','\n');

    this.UI(scene);
  },

  UI: function(scene) {
    var $activity = $('div#activity');
    var content = this.content;
    var matching = this;
    var $format = $(this.data).find('matching').attr('format');
    var $type = $(this.data).find('matching').attr('type');

    //begin matching template and draggable items
    var template = '<div id="matchingContainer" class="gradient"><div id="matching" class="clearfix"></div><div id="controls"><p id="instructions">'+content.instructions+'</p><a id="submit" class="button" href="javascript:void(0);">Check Answers</a></div></div>';

    $activity.attr('class','activity_drag_list').html(template);

    //matching column loading
    if ( $format == 'number' )
    {
      $activity.addClass('number');
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient" style="'+$(this.data).find('matching').attr('matchContainerStyle')+'"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(this.data).find('matching').attr('matchStyle')+'"><span>'+(j+1)+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(this.data).find('matching').attr('matchStyle')+'"><span>'+(j+1)+'</span></div>'+$(content.matches.choices[j]).text()+'</div>';
          }
        }
        colTemplate += '</div>';
      }
    }
    else if ( $format == 'letter' || $format == 'letter-small' )
    {
      if ( $format == 'letter' )
      {
        $activity.addClass('letter');
      }
      if ( $format == 'letter-small' )
      {
        $activity.addClass('letter-small');
      }
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient" style="'+$(this.data).find('matching').attr('matchContainerStyle')+'"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(this.data).find('matching').attr('matchStyle')+'"><span>'+this.content.alphabet[j]+'</span></div><p class="matching-letter-description">'+$(content.matches.choices[j]).text()+'</p></div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(this.data).find('matching').attr('matchStyle')+'"><span>'+this.content.alphabet[j]+'</span></div><p class="matching-letter-description">'+$(content.matches.choices[j]).text()+'</p></div>';
          }
        }
        colTemplate += '</div>';
      }
    }

    else
    {
      for (var i=0; i<$(content.matches).size(); i++) {
        var colTemplate = '<div id="matching-'+i+'" class="matching-column"><p id="matchingInstructions">'+content.matchingInstructions+'</p>';
        for (var j=0; j<$(content.matches.choices).size(); j++) {
          if (Boolean($(content.matches.choices[j]).attr('id')) == true) {
            colTemplate += '<div class="draggable-container gradient" style="'+$(this.data).find('matching').attr('matchContainerStyle')+'"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(this.data).find('matching').attr('matchStyle')+'"><span>'+$(content.matches.choices[j]).text()+'</span></div></div>';
          } else {
            colTemplate += '<div class="draggable-container gradient"><div data-id="'+$(content.matches.choices[j]).attr('id')+'" data-col="'+i+'" id="matching-'+i+'-draggable-'+j+'" class="matching-draggable gradient" style="'+$(this.data).find('matching').attr('matchStyle')+'"><span>'+$(content.matches.choices[j]).text()+'</span></div></div>';
          }
        }
        colTemplate += '</div>';
      }
    }
    //end draggable items
    //start drop zones
    if ( $type == "dynamic" )
    {
      var currentDropCount = 0;
      colTemplate += '<div id="drops"><div id="drop_container">';
      for (var i=0; i<$(content.drops).size(); i++) {
        // colTemplate += '<div id="drop-'+i+'" class="drop-column"><h1>'+content.drops[i].title+'</h1>';
        for (var j=0; j<$(content.drops[i].choices).size(); j++) {
          var $coords = {
            x: $(this.data).find('matching').find('coord').eq(currentDropCount).attr('x'),
            y: $(this.data).find('matching').find('coord').eq(currentDropCount).attr('y')
          };
          if (Boolean($(content.drops[i].choices[j]).attr('id')) == true) {
            colTemplate += '<div class="droppable-container gradient" style="position:absolute;top:'+$coords.y+'px;left:'+$coords.x+'px;"><div data-correct="'+$(content.drops[i].choices[j]).attr('correct')+'" data-col="'+i+'" id="matching-'+i+'-droppable-'+j+'" class="matching-droppable gradient"><div class="dropSpacer" style="'+$(this.data).find('matching').attr('dropStyle')+'"></div></div></div>';
          } else {
            colTemplate += '<div class="droppable-container gradient" style="position:absolute;top:'+$coords.y+'px;left:'+$coords.x+'px;"><div data-correct="'+$(content.drops[i].choices[j]).attr('correct')+'" data-col="'+i+'" id="matching-'+i+'-droppable-'+j+'" class="matching-droppable gradient"><div class="dropSpacer" style="'+$(this.data).find('matching').attr('dropStyle')+'"></div></div></div>';
          }
          currentDropCount++;
        }
        // colTemplate += '</div>';
      }
      colTemplate += '</div></div>';
    }
    else
    {
      colTemplate += '<div id="drops"><div id="drop_container">';
      for (var i=0; i<$(content.drops).size(); i++) {
        colTemplate += '<div id="drop-'+i+'" class="drop-column"><h1>'+content.drops[i].title+'</h1>';
        for (var j=0; j<$(content.drops[i].choices).size(); j++) {
          if (Boolean($(content.drops[i].choices[j]).attr('id')) == true) {
            colTemplate += '<div class="droppable-container gradient"><div data-correct="'+$(content.drops[i].choices[j]).attr('correct')+'" data-col="'+i+'" id="matching-'+i+'-droppable-'+j+'" class="matching-droppable gradient"><div class="dropSpacer" style="'+$(this.data).find('matching').attr('dropStyle')+'"></div></div></div>';
          } else {
            colTemplate += '<div class="droppable-container gradient"><div data-correct="'+$(content.drops[i].choices[j]).attr('correct')+'" data-col="'+i+'" id="matching-'+i+'-droppable-'+j+'" class="matching-droppable gradient"><div class="dropSpacer" style="'+$(this.data).find('matching').attr('dropStyle')+'"></div></div></div>';
          }
        }
        colTemplate += '</div>';
      }
      colTemplate += '</div></div>';
    }
    //end drop zones and matching template and render
    $('div#matching').append(colTemplate);

    if ( $type == "dynamic" )
    {
      $('#drop_container').css('background','#FFF url('+ONboard.assetRoot+$(this.data).find('matching').find('image').text()+') top center no-repeat');
      $('#drop_container').css('background-size','contain');
      $('#activity').addClass('dynamic');

      var instructionsStyle = $(this.data).find('matching').attr('instructionsStyle');
      if ( instructionsStyle !== "" )
      {
        $('#matchingInstructions').attr('style', instructionsStyle);
      }
    }
    //center the drop container by counting the width of every drop column
    var $dropColumnCount = $('.drop-column').size();
    var disableMinWidth = false;
    if ( $dropColumnCount >= 4 )
    {
      disableMinWidth = true;
      $('.drop-column').each(function() {
        $(this).css('width', (100 / $dropColumnCount) + '%');

        if ( disableMinWidth )
        {
          $(this).css('min-width', (100 / $dropColumnCount) + '%');
        }
      });
    }
    else
    {
      var dropContainer_width = 0;
      $('.drop-column').each(function() {
        dropContainer_width = dropContainer_width + $(this).width();
      });
      $('#drop_container').css('width', dropContainer_width);
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
        // var droppedPosition = $(this).parent().index();
        // matching.dropped[draggedObjectID] = jui.draggable[0].id;
        var droppableColumn = parseInt($(this).data('col'));
        var droppableAnswers = ONboard.modules.activity_drag_list.content.drops[droppableColumn].choices;
        // console.log('answers: ' + droppableAnswers);
        // console.log('chosen answer: ' + draggedObjectID);
        if (jQuery.inArray(draggedObjectID, droppableAnswers) > -1 ) {
          // console.log(true);
          matching.answers[draggedObjectID] = true;
        } else {
          // console.log(false);
          matching.answers[draggedObjectID] = false;
        }
        $('#'+jui.draggable[0].id).position({
          of: $('#'+event.target.id+' .dropSpacer'),
          my: 'left top',
          at: 'left top'
        });
        /// disable the droppable
        // $(this).droppable('disable').data('dragged',draggedObjectID);
        // save dragged object to swap if need be
        if ( typeof $(this).data('dragged') == "undefined" )
        {
          // if dragging from another dropzone, wipe old drop data
          $('.matching-droppable').each(function()
          {
            if ( $(this).data('dragged') == draggedObjectID )
            {
              $(this).removeData('dragged');
              // delete matching.dropped[$(this).parent().index()];
            }
          });
          $(this).data('dragged',draggedObjectID);
          // save dropped object
          matching.dropped[draggedObjectID] = jui.draggable[0].id;
          // console.log('data dragged is undefined');
        } else {
          // send old drag back to list
          $('#'+matching.dropped[$(this).data('dragged')]).animate({top: 0, left: 0});
          // console.log([$(this).data('dragged')]);
          delete matching.dropped[$(this).data('dragged')];
          delete matching.answers[$(this).data('dragged')];
          // console.log([$(this).data('dragged')]);
          // save dropped object
          // if dragging from another dropzone, wipe old drop data
          $('.matching-droppable').each(function()
          {
            if ( $(this).data('dragged') == draggedObjectID )
            {
              $(this).removeData('dragged');
              delete matching.dropped[$(this).parent().index()];
            }
          });
          $(this).data('dragged',draggedObjectID);
          matching.dropped[draggedObjectID] = jui.draggable[0].id;
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

    // remove check answers button if it's not applicable
    // console.log($(this.data).find('matching').attr('checkAnswers'));
    if ( typeof $(this.data).find('matching').attr('checkAnswers') !== "undefined" )
    {
      if ( $(this.data).find('matching').attr('checkAnswers') == 'false' )
      {
        $('div#activity a#submit').remove();
      }
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

        // console.log($('#'+matching.dropped[i]));
        var $id = $('#'+matching.dropped[i]).data('id');
        // console.log($id);
        $('.matching-droppable').each(function()
        {
          var $dragged = $(this).data('dragged');

          if ($dragged == $id)
          {
            $(this).droppable('enable').removeData('dragged');
          }
        });

        delete matching.dropped[i];
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
      if (amountCorrect == this.amountOfAnswers) {
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
      if (amountCorrect == this.amountOfAnswers) {
        //log attempts made
        // settings.attempts.push(matching.currentAttempt);
        //award points and load next screen
        // settings.points.push(matching.points);
        // $('#instruction').text('Click Next to continue.');
        // $('#nextButton, #instruction').show();
        // alert('Complete');
        $('a#submit').addClass('correct');
        if ( $(this.data).find('feedbackAudio').text() !== "" )
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
        ONboard.modules.activity_drag_list.loadHotSpot(this);
    });
    $('a#hotspot-close').on('click', function() {ONboard.modules.activity_drag_list.closeHotSpot()});
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