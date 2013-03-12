<?php

class SimpleXMLExtended extends SimpleXMLElement
  {
  public function addCData($cdata_text)
    {
    $node = dom_import_simplexml($this); 
    $no   = $node->ownerDocument; 
    $node->appendChild($no->createCDATASection($cdata_text)); 
    } 
  }

// The file test.xml contains an XML document with a root element
// and at least an element /[root]/title.
$xCord_offset = 466;
$yCord_offset = 80;

if (file_exists('directory.xml')) {
    $xml = simplexml_load_file('directory.xml');
	

    $new_xml = new SimpleXMLExtended('<xml/>');
	
	$sectionIndex=0;
   	foreach($xml->Course->children() as $section)
	  {
	  	
	  	$sectionIndex++;
	  	$sceneIndex=0;
	  	$tocTitle = $section["title"];
		
		//remove the config stuff on bottom
	  	if($tocTitle != "VariableSets"){

	  		$toc = $new_xml->addChild('toc');
	  		$toc->addAttribute('title', $tocTitle);

	  	  	foreach($section->children() as $subSection){
	  	  		$sceneIndex++;
		  		$shell = $toc->addChild('shell');
		  		$shellTitle = $subSection["title"];
		  		
		  		$shell->addAttribute('title', $shellTitle);

		  		$sceneCount = 1;
		  		foreach($subSection->children() as $page){
		  			$externalXMLinfo = $page["info"];
		  			$data = $page["data"];
		  			$file = basename($data, ".swf");
		  			$xml_filename = basename($externalXMLinfo);
		  			$xml_filename_base = basename($externalXMLinfo, 
		  				".xml");

		  			$scene = $shell->addChild('scene');
		  			$scene->addAttribute('id', $sceneCount++);

		  			
		  			
		  			if($externalXMLinfo){
		  				

		  				$interactiveXML =  simplexml_load_file($xml_filename);
						$interactiveType = $interactiveXML->getName();

		  				switch($interactiveType){
		  					
		  					
		  					/************
		  					*	Transform End_Multiple_Choice
		  					************/
		  					case "MultipleChoice":

		  					$mcSettings = $interactiveXML->slideInfo->children();
		  					$mcSettings_endQuiz = $mcSettings->endQuiz;


		  					$mcSettings_audio = $mcSettings["audio"];
		  					$mcSettings_endFeedback = $mcSettings["endFeedback"];
		  					$mcSettings_oneQuestion = $mcSettings["oneQuestion"];

		  					//End_Multiple_Choice, Middle_Multiple_Choice, Activity_Multiple_Choice
		  					if($mcSettings_endQuiz == "true"){
		  						$scene->addAttribute('type', 'End_Multiple_Choice');
		  					}else{
		  						$scene->addAttribute('type', 'Activity_Multiple_Choice');
		  					}

		  					$mcInstructions_str = "instructions go here";
		  					$mcInstructions = $scene->addChild('instruction', $mcInstructions_str);
		  					
		  					//assuming there are mulitple
		  					$mcChoices = $scene->addChild('multiple_choice');
		  					
		  					//loop through flashes choices and add to new XML
		  					//$mc_questions = $interactiveXML->children("question");
		  					
		  					
		  					//collect all of the source values for use in question building bellow
		  					$sourceArray = array();
		  					foreach($mcSettings as $source){
		  						$nodeName = $source->getName();
		  						if($nodeName == "Source"){
		  							$sourceObj = new stdClass;

		  							$sourceObj->text 	= $source->Text;
		  							$sourceObj->word 	= $source->word;
		  							$sourceObj->image 	= $source->image;

		  							array_push($sourceArray, $sourceObj);
		  						}
		  					}

		  					$questionCount = 0;
		  					foreach($interactiveXML->children() as $question){
		  						$nodeName = $question->getName();
		  						if($nodeName == "question"){

		  							//hasTextFigure, hasFigure
		  							$mc_questionItem = $mcChoices->addChild("multiple");

		  							$question_config = $question->children();
		  							$question_txt = $question_config->qText->textContent;

		  							$mc_question = $mc_questionItem->addChild("question");
			  						$mc_question->addCData( $question_config->qText );

			  						$mc_answers = $mc_questionItem->addChild("answers");

			  						$question_ansBtns = $question_config->answerButtons->children();
			  						foreach($question_ansBtns as $answer){
			  							
			  							$mc_answer = $mc_answers->addChild("answer", $answer->aText);

			  							$correct = $answer->correct;
			  							$mc_answer_txt = $answer->aText;
			  							if($correct == "true"){
			  								$mc_answer->addAttribute("correct", $correct);
			  							}
			  							
			  						}

			  						$textFigure = $sourceArray[$questionCount]->text;
			  						$textWord 	= $sourceArray[$questionCount]->word;
		  							$imgFigure 	= $sourceArray[$questionCount]->image;

		  							$figure = $mc_questionItem->addChild("figure");

		  							if($textFigure != ""){
		  								$mc_questionItem->addAttribute("hasTextFigure", "true");
		  								$figure->addChild("header", $textWord);

		  								$texFig = $figure->addChild("text");
		  								$texFig->addCData($textFigure);
		  								$figure->addChild("header", $textWord);
		  							}

		  							if($imgFigure != ""){
		  								$mc_questionItem->addAttribute("hasFigure", "true");
		  								$figure = $mc_answers->addChild("figure", $imgFigure);
		  								$figure->addAttribute("verticalAlign", "center");

		  								//$figure = $mc_answers->addChild("figureAudio");
		  							}

			  						$mc_feedbackAudio = $mc_questionItem->addChild("feedbackAudio");
			  						$questionCount++;
		  						}
								

		  					}

		  					//Source

		  					$audio = $scene->addChild('audio', $xml_filename_base);

		  					break;




		  					/************
		  					*	Transform 7_Activity_Drag_Drop
		  					************/
		  					case "DragDrop":
		  					$scene->addAttribute('type', '7_Activity_Drag_Drop');

		  					//matching instructions
		  					$matchingInstructions_str = "Match the items on the left to the correct areas on the right.";
		  					$matchingInstructions = $scene->addChild('matchingInstructions', $matchingInstructions_str);
		  					
		  					//matching elements
		  					$matching = $scene->addChild("matching");

		  					//static till i find something otherwise
		  					$matching->addAttribute("type", "dynamic");
		  					$matching->addAttribute("deductionFactor", "2");
		  					$matching->addAttribute("maxAttempts", "3");
		  					$matching->addAttribute("hasPoints", "true");
		  					$matching->addAttribute("points", "6");


		  					$matches = $matching->addChild("matches");

		  					foreach($interactiveXML->dragItems->children() as $dItem){
		  						$dItem_str = $dItem->boxText;
		  						$rightSpot_str = $dItem->rightSpot;

		  						$match = $matches->addChild("match");
		  						$match->addCData($dItem_str);
		  						$match->addAttribute("id", $rightSpot_str);
		  					}

		  					
							$drops = $matching->addChild("drops");
							$drops->addAttribute("title", "");
							$drops->addAttribute("children-styles", "margin-bottom: 0.1em;");

							//$dropCount = 1;
							foreach($interactiveXML->dropSpots->children() as $dSpots){
		  						$drop = $drops->addChild("drop");
		  						//$drop->addAttribute("correct", $dropCount++);

		  						//need to figure out how coordinates work
		  						//80 is an estamite of the offset between Flash and HTML5 versions
		  						$xCord = $dSpots["xCord"] - $xCord_offset;
		  						$yCord = $dSpots["yCord"] - $yCord_offset;
		  						$spotNum = $dSpots["spotNum"];

		  						$drop->addAttribute("correct", $spotNum);
		  						$drop->addAttribute("x", $xCord);
		  						$drop->addAttribute("y", $yCord);
		  					}


							$image = $matching->addChild("image", $xml_filename_base . ".jpg");

							$instructions_str = "When you are done, check your results by clicking 'Check Answers.'";
							$instructions = $scene->addChild('instructions', $instructions_str);

							$audio = $scene->addChild('audio', $xml_filename_base);


		  					break;


							/************
		  					*	Transform 9_Activity_Image_Rollclick
		  					************/
		  					case "PopUp":
		  					$scene->addAttribute('type', '9_Activity_Image_Rollclick');

		  					//content element
		  					$content = $scene->addChild("content");
		  					//foreach($interactiveXML->dropSpots->children() as $dSpots){

		  					$popup_settings = $interactiveXML->slideInfo->children();
		  					$popup_settings_title = $popup_settings->title;
		  					$content->addChild("header", $popup_settings_title);
		  					$popup_instruction = $content->addChild("instruction");
		  					
		  					$popup_instruction_str = $popup_settings->info;
		  					$popup_instruction->addCData($popup_instruction_str);

		  					//not sure what this is for
		  					$popup_type_str =  $popup_settings->popType;

		  					
		  					//activity element
		  					$activity = $scene->addChild("activity");
		  					
		  					//not sure how to differentiate between 
		  					//image, text, textWithImage, table
		  					$activity->addAttribute('type', 'image');
		  					
		  					/*
		  					switch($popup_type_str){
		  						case "1":
		  						//$activity->addAttribute('type', 'image');
		  						break;
		  						case "2":
		  						//$activity->addAttribute('type', 'image');
		  						break;
		  						case "3":
		  						//$activity->addAttribute('type', 'image');
		  						break;
		  						case "4":
		  						//$activity->addAttribute('type', 'image');
		  						break;
		  					}
							*/

		  					//activity image
		  					$activity->addChild("image", $xml_filename_base . ".jpg");
							//we could add a <text> element here in some instances...

		  					//hotspots
		  					$hotspots = $activity->addChild("hotspots");
							
							$popup_buttons = $interactiveXML->popButtons->children();	  					
							foreach($popup_buttons as $pButton){
								$hotspot = $hotspots->addChild("hotspot");
						
			  					$hotspot->addAttribute('title', $pButton->Name);
			  					$hotspot->addAttribute('dynamic', 'true');
			  					$hotspot->addAttribute('x', $pButton->xCord);
			  					$hotspot->addAttribute('y', $pButton->yCord);

			  					if($pButton->Name){
			  						$popInfo = '<h1>'.$pButton->Name.'</h1>' . $pButton->popInfo;
			  					}else{
			  						$popInfo = $pButton->popInfo;
			  					}
			  					
			  					$hotspot->addCData("$popInfo");
							}

		  					$audio = $scene->addChild('audio', $xml_filename_base);
		  					break;


		  					/************
		  					*	Transform 3_txt_img_reading

							FLASH:
							<TextReading>
								<slideInfo>
									<hText>Lincoln’s Second Inaugural Address, March 1865</hText>
									<audio>audio/eng_m1-1_s13.mp3</audio>
									<image hasImage="false" url="images/textfpo.jpg" />
									<mainText><![CDATA[<p>Fellow-Countrymen:<br />At this second appearing ....gives us to sourselves and with all nations.</p>]]></mainText>
								</slideInfo>	
							</TextReading>


		  					************/


		  					case "TextReading":
		  					$scene->addAttribute('type', '3_txt_img_reading');

		  					$content = $scene->addChild("content");

		  					$popup_settings = $interactiveXML->slideInfo->children();
		  					
		  					$header = $content->addChild("header");
		  					$header->addCData($popup_settings->hText);
		  					$text = $content->addChild("text");
		  					$text->addCData($popup_settings->mainText);

		  					$audio = $scene->addChild('audio', $xml_filename_base);
		  					
		  					break;


		  					/************
		  					*	Transform 3_txt_img_reading

								FLASH:
								<FillIn>
									<slideInfo>
										<hText><![CDATA[Paragraph Two]]></hText>
										<qText><![CDATA[<font size='14'>Directions: Read the paragraph and note which words are positive and which are negative.<br/><br/>On the occasion corresponding to this four years ago all thoughts were anxiously directed to an impending civil war. All dreaded it, all sought to avert it. While the inaugural address was being delivered from this place, devoted altogether to saving the Union without war, insurgent agents were in the city seeking to destroy it without war—seeking to dissolve the Union and divide effects by negotiation. Both parties deprecated war, but one of them would make war rather than let the nation survive, and the other would accept war rather than let it perish, and the war came.</font>]]></qText>
										<correctText><![CDATA[<font size='18'><font face='c-Bold'>Negative terms:</font> anxiously, impending, war, dreaded, avert, insurgent, destroy, dissolve, divide, deprecated, perish<br /><br /><font face='c-Bold'>Positive terms:</font> devoted, saving, survive</font>]]></correctText>
										<haveSource enable="false" word="View" image="images/sourcefpo.jpg" />
										<audio>audio/eng_m1-1_s17.mp3</audio>
										<feedback></feedback>
									</slideInfo>	
								</FillIn>

								HTML5
							 	<content>
							      <header>Checks and Balances</header>
							    </content>
							    <url>http://media.ccr.mcgraw-hill.com/AP_OnBoard/USGOV_M01_02_07A.swf</url>
							    <image>USGov_m1-2_s10.jpg</image>
							    <audio>USGov_m1-2_s10</audio>
							    <credits>(tr)Cornstock/Getty Images, (bkgd)Martin Ruegner/Digital Vision/Getty Images.</credits>

		  					************/

		  					case "FillIn":
		  					$scene->addAttribute('type', 'Fill_In_Blank');
		  					$popup_settings = $interactiveXML->slideInfo->children();

		  					$content = $scene->addChild("content");
		  					$figures = $scene->addChild("figures");
		  					
		  					$header = $content->addChild("header");
		  					$header->addCData($popup_settings->hText);
		  					$text = $content->addChild("text");
		  					$text->addCData($popup_settings->mainText);

		  					$correctText = $content->addChild("correctText");
		  					$correctText->addCData($popup_settings->correctText);


		  					$souces = $popup_settings->haveSource;
		  					$figures->addChild("image", $souces["image"]);
		  					$figures->addChild("header", $souces["word"]);

		  					$audio = $scene->addChild('audio', $xml_filename_base);

		  					break;


		  					/************
		  					*	Transform 6_Activity_Interactivity



								HTML5
								<scene id="9" type="6_Activity_Interactivity">
								    <content>
								      <header>Separation of Powers</header>
								    </content>
								    <url>http://media.ccr.mcgraw-hill.com/AP_OnBoard/USGOV_M01_02_06A.jpg</url>
								    <image>USGov_m1-2_s9.jpg</image>
								    <audio>USGov_m1-2_s9</audio>
								    <credits>(tr)Cornstock/Getty Images, (bkgd)Martin Ruegner/Digital Vision/Getty Images.</credits>
								  </scene>


		  					************/

		  					case "LaunchOut":
		  					$scene->addAttribute('type', '6_Activity_Interactivity');
		  					$settings = $interactiveXML->slideInfo->children();

		  					$content = $scene->addChild("content");
		  					$content->addChild("header", $settings->titleText );
		  					$content->addChild("instruction");

		  					$scene->addChild("url", $settings->btnLink );
		  					$scene->addChild("text", $settings->bodyText );
		  					$scene->addChild("image", $xml_filename_base . ".jpg" );
		  					$scene->addChild('audio', $xml_filename_base);

		  					break;



		  					defualt:
		  					$scene->addAttribute('type', 'Unknown');
		  				}

		  				//$scene->addChild($interactiveType);

		  			}else{
		  				$scene->addAttribute('type', '2_Txt_Img_Animation');

		  				//add video elements
		  				
		  				$video = $scene->addChild('video', $file);
		  			}

		  			//add credits
		  			$photoCredit = $page["photo"];
		  			$credits = $scene->addChild('credits');
		  			$credits->addCData($photoCredit);

		  		}
		  		

		  		//create file names to write
		  		$filename = $_GET["prefix"] . "_";

		  		if($tocTitle == "Introduction"){
		  			$filename = $filename . "s1-";
		  		}else{
		  			$filename = $filename ."m".($sectionIndex-1)."-";
		  		}
				
				$fileName = $filename . $sceneIndex;
		  		
		  		$createFile = $_GET["createFile"];

		  		if($createFile){
		  			$file = fopen($fileName.".xml","w");
					echo fwrite($file,$shell->asXML());
					fclose($file);
		  		}
		  	}

	  	
	  	}
	  	
	}

	Header('Content-type: text/xml');
	print($new_xml->asXML());

	//$file = fopen("complete.xml","w");
	//echo fwrite($file,$new_xml->asXML());
	//fclose($file);
   
} else {
    exit('Failed to open test.xml.');
}
?>