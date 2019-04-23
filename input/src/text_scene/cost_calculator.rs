use crate::spaceship_settings::{SpaceshipSetting, SpaceshipSettingValue};
use std::cmp;

pub fn calculate_cost(setting_value: &SpaceshipSettingValue, delta: i32) -> i32 {
  let mut cost = delta;
  match setting_value.setting {
    SpaceshipSetting::Shields => {
      if delta == 1 {
        cost = setting_value.value as i32 + 1;
      } else {
        cost = -cmp::max(1, setting_value.value as i32)
      }
    }
    _ => {}
  }
  return cost;
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_calculate_cost() {
    for i in 0..4 {
      let setval = SpaceshipSettingValue::new(SpaceshipSetting::from_index(i));
      let result = calculate_cost(&setval, 1);
      assert_eq!(1, result, "test_calculate_cost: cost @{} was not 1", i);

      let mresult = calculate_cost(&setval, -1);
      assert_eq!(-1, mresult, "test_calculate_cost: cost @{} was not -1", i);
    }
  }

  #[test]
  fn test_calculate_cost_expensiveness() {
    let mut setval = SpaceshipSettingValue::new(SpaceshipSetting::Shields);
    setval.value = 3;
    let result = calculate_cost(&setval, 1);
    assert_eq!(4, result);
    let mresult = calculate_cost(&setval, -1);
    assert_eq!(-3, mresult);
  }
}