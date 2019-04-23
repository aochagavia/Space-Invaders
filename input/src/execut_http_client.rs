use std::fs;
use crate::spaceship_settings::*;
use std::collections::HashMap;

fn get_address() -> String {
  fs::read_to_string("backend_address.txt").unwrap()
}

fn get_endpoint(endpoint: &str) -> String {
  format!("{}{}", get_address(), endpoint)
}

pub fn fetch_taken_nicknames() -> Result<Vec<String>, Box<std::error::Error>> {
  let endpoint = get_endpoint("taken-nicknames");
  let mut response = reqwest::get(&endpoint)?;
  let response_text: String = response.text()?;
  let deserialized: Vec<String> = serde_json::from_str(&response_text)?;
  Ok(deserialized)
}

fn setting_to_key(setting: SpaceshipSetting) -> String {
  format!("settings_{}", setting.name())
}

// TODO: get rid of this function and use a serializable struct instead
fn to_map(nickname: String, settings: [SpaceshipSettingValue; SETTING_COUNT]) -> HashMap<String, String> {
  let mut map: HashMap<_, _> = settings.iter()
    .map(|setting_value| (setting_to_key(setting_value.setting), setting_value.value.to_string()))
    .collect();
  map.insert("nickname".to_string(), nickname);
  map
}

pub fn post_new_player(nickname: String, settings: [SpaceshipSettingValue; SETTING_COUNT]) -> Result<(), Box<std::error::Error>> {
  let map = to_map(nickname, settings);
  let endpoint = get_endpoint("new-player");
  let client = reqwest::Client::new();
  client.post(&endpoint).json(&map).send()?;
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_string_deserialization() {
    let deserialized: Vec<String> = serde_json::from_str("[\"piet\", \"klaas\"]").unwrap();
    let expected: Vec<String> = vec![String::from("piet"), String::from("klaas")];
    assert_eq!(expected, deserialized);
  }

  fn get_dummy_spaceship_setting_values() -> [SpaceshipSettingValue; SETTING_COUNT] {
    let thing = [
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(0)),
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(1)),
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(2)),
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(3)),
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(4)),
    ];
    return thing
  }

  #[test]
  fn test_setting_to_key() {
    for i in 0..SETTING_COUNT {
      let setting = SpaceshipSetting::from_index(i);
      let expected = format!("settings_{}", setting.name());
      // act
      let key = setting_to_key(setting);
      // assert
      assert_eq!(expected, key);
    }
  }

  #[test]
  fn test_to_map() {
    let nickname: String = "pietje".to_string();
    let settings: [SpaceshipSettingValue; SETTING_COUNT] = get_dummy_spaceship_setting_values();
    // act
    let map = to_map(nickname, settings);
    // assert
    assert!(map.contains_key("nickname"));
    match map.get("nickname") {
      Some(nickname) => assert_eq!("pietje", nickname),
      None => assert!(false, "could not get nickname from map")
    }
    for i in 0..SETTING_COUNT {
      let key = setting_to_key(SpaceshipSetting::from_index(i));
      assert!(map.contains_key(&key), "map did not contain key {}", key);
      match map.get(&key) {
        Some(value) => assert_eq!("0", value),
        None => assert!(false, "could not get value from map")
      }
    }
  }
}
