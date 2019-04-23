use crate::spaceship_settings::SpaceshipSetting;

#[derive(Copy, Clone)]
pub enum SelectedInput {
  Setting(SpaceshipSetting),
  Submit,
}

impl Default for SelectedInput {
  fn default() -> Self {
    SelectedInput::Setting(SpaceshipSetting::default())
  }
}

impl SelectedInput {
  pub fn to_index(&self) -> usize {
    match self {
      SelectedInput::Setting(setting) => setting.to_index(),
      SelectedInput::Submit => SpaceshipSetting::count(),
    }
  }

  pub fn from_index(index: usize) -> Self {
    let output = match index {
      0...4 => SelectedInput::Setting(SpaceshipSetting::from_index(index)),
      _ => SelectedInput::Submit
    };
    output
  }

  pub fn next(&self) -> Self {
    let modder = SpaceshipSetting::count() + 1;
    let next_index: usize = (self.to_index() + 1) % modder;
    Self::from_index(next_index)
  }

  pub fn prev(&self) -> Self {
    let index = self.to_index();
    let prev_index: usize = if index == 0 { SpaceshipSetting::count() } else { index - 1 };
    Self::from_index(prev_index)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::spaceship_settings::SETTING_COUNT;

  #[test]
  fn assert_from_to_index() {
    for i in 0..SETTING_COUNT {
      let thing = SelectedInput::from_index(i);
      let res = thing.to_index();
      assert_eq!(i, res);
    }
  }

  #[test]
  fn assert_next() {
    for i in 0..4 {
      let thing = SelectedInput::from_index(i).next();
      let res = thing.to_index();
      assert_eq!(i+1, res);
    }
  }

  #[test]
  fn assert_last_index() {
    let last_index = SpaceshipSetting::count();
    let last_input = SelectedInput::from_index(last_index);
    match last_input {
      SelectedInput::Submit => { assert!(true) },
      _ => assert!(false, "last input was not submit!")
    }
  }

  #[test]
  fn assert_last_next() {
    let last_index = SpaceshipSetting::count();
    let thing = SelectedInput::from_index(last_index).next();
    let res = thing.to_index();
    assert_eq!(0, res);
  }

  #[test]
  fn assert_prev() {
    for i in 1..5 {
      let thing = SelectedInput::from_index(i).prev();
      let res = thing.to_index();
      assert_eq!(i-1, res);
    }
  }


  #[test]
  fn assert_first_prev() {
    let expected = SpaceshipSetting::count();
    let thing = SelectedInput::from_index(0).prev();
    let res = thing.to_index();
    assert_eq!(expected, res);
  }
}