use std::fs::File;
use escposify::img::Image;
use crate::spaceship_settings::*;

pub struct PlayerSettings {
  pub nickname: String,
  pub setting_values: [SpaceshipSettingValue; SETTING_COUNT]
}

pub struct Printer {
  logo: Image,
  space_invader: Image,
  printer_address: String
  // printer: escposify::printer::Printer<escposify::device::File::<File>>,
}

impl Printer {
  pub fn new(printer_address: &str) -> Printer { // "\\\\<pc-name>\\EPSON"
    Printer {
      logo: Image::new("assets/infi.bmp"),
      space_invader: Image::new("assets/space-invader.bmp"),
      printer_address: printer_address.to_string()
      // printer: escposify::printer::Printer::new(printer_file, None, None),
    }
  }

  pub fn print(&self, player_settings: PlayerSettings) {
    let printer_file = escposify::device::File::<File>::new(&self.printer_address);
    let mut printer = escposify::printer::Printer::new(printer_file, None, None);
    printer
    .font("C")
    .align("lt") // LT, CT, RT
    .style("bu")
    .size(0, 0)
    .bit_image(&self.logo, None)
    .line_space(-1)
    .text("----------------------------------")
    .text("|          SPACE INVADERS        |")
    .text("----------------------------------")
    .text("")
    .text(&format!("Nickname: {}", player_settings.nickname))
    .text("")
    .text("Stats:")
    .text(&format!("* Shields: {}", player_settings.setting_values[0].value))
    .text(&format!("* Firepower: {}", player_settings.setting_values[1].value))
    .text(&format!("* Dodge chance: {}", player_settings.setting_values[2].value))
    .text(&format!("* Defense height: {}", player_settings.setting_values[3].value))
    .text(&format!("* Defense width: {}", player_settings.setting_values[4].value))
    .text("")
    .text("See you at the awards ceremony at 17:15!")
    .bit_image(&self.space_invader, None)
    .line_space(-1)
    .feed(2)
    .cut(false)
    .flush()
    .unwrap();
  }
}
