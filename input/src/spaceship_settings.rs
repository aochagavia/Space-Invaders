#[derive(Clone, Copy)]
pub enum SpaceshipSetting {
  Shields,
  Firepower,
  DodgeChance,
  DefenseHeight,
  DefenseWidth
}

pub const SETTING_COUNT: usize = 5;

impl Default for SpaceshipSetting {
  fn default() -> Self { SpaceshipSetting::Shields }
}

impl SpaceshipSetting {
  pub fn from_index(index: usize) -> Self {
    let output = match index {
      0 => SpaceshipSetting::Shields,
      1 => SpaceshipSetting::Firepower,
      2 => SpaceshipSetting::DodgeChance,
      3 => SpaceshipSetting::DefenseHeight,
      _ => SpaceshipSetting::DefenseWidth,
    };
    output
  }

  pub fn to_index(&self) -> usize {
    match self {
      SpaceshipSetting::Shields => 0,
      SpaceshipSetting::Firepower => 1,
      SpaceshipSetting::DodgeChance => 2,
      SpaceshipSetting::DefenseHeight => 3,
      SpaceshipSetting::DefenseWidth => 4,
    }
  }

  pub fn count() -> usize {
    return SETTING_COUNT;
  }

  pub fn name(&self) -> &str {
    match self {
      SpaceshipSetting::Shields => "SHIELDS",
      SpaceshipSetting::Firepower => "FIREPOWER",
      SpaceshipSetting::DodgeChance => "DODGE_CHANCE",
      SpaceshipSetting::DefenseHeight => "DEFENSE_HEIGHT",
      SpaceshipSetting::DefenseWidth => "DEFENSE_WIDTH",
    }
  }
}

#[derive(Clone, Copy, Default)]
pub struct SpaceshipSettingValue {
  pub setting: SpaceshipSetting,
  pub value: u32
}

impl SpaceshipSettingValue {
  pub fn new(setting: SpaceshipSetting) -> Self {
    SpaceshipSettingValue {
      setting,
      value: 0
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_count() {
    assert_eq!(SETTING_COUNT, SpaceshipSetting::count());
  }

  #[test]
  fn assert_from_to_index() {
    for i in 0..SETTING_COUNT {
      let thing = SpaceshipSetting::from_index(i);
      let res = thing.to_index();
      assert_eq!(i, res);
    }
  }
}