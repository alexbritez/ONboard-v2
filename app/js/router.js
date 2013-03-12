window.ONboard.router = {

  modules: ONboard.modules,

  load: function(scene) {
    switch($(scene).attr('type')) {
      case '1_Module_Intro':
        this.modules.intro.initialize(scene);
        break;
      case '2_Txt_Img_Animation':
        this.modules.text_img_animation.initialize(scene);
        break;
      case '3_txt_img_reading':
        this.modules.txt_img_reading.initialize(scene);
        break;
      case '6_Activity_Interactivity':
        this.modules.activity_interactivity.initialize(scene);
        break;
      case '7_Activity_Drag_Drop':
        this.modules.activity_drag_drop.initialize(scene);
        break;
      case '9_Activity_Image_Rollclick':
        this.modules.activity_image_rollclick.initialize(scene);
        break;
      case '11_Activity_Drag_List':
        this.modules.activity_drag_list.initialize(scene);
        break;
      case 'Activity_Multiple_Choice':
        this.modules.activity_multiple_choice.initialize(scene);
        break;
      case 'Middle_Multiple_Choice':
        this.modules.middle_multiple_choice.initialize(scene);
        break;
      case 'End_Multiple_Choice':
        this.modules.end_multiple_choice.initialize(scene);
        break;
    }
  }
};