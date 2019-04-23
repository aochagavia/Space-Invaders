use rand::seq::SliceRandom;
use std::collections::HashMap;

pub struct NicknameGenerator {
  adjectives: Vec<String>,
  nouns: Vec<String>,
  taken_names: HashMap<String, u32>
}

fn take_random_elem(vec: &[String]) -> &str {
  let mut rng = rand::thread_rng();
  vec.choose(&mut rng).unwrap()
}

fn capitalize(thing: &str) -> String {
  let mut v: Vec<char> = thing.chars().collect();
  v[0] = v[0].to_uppercase().nth(0).unwrap();
  v.into_iter().collect()
}

impl NicknameGenerator {
  pub fn new(adjectives_string: &str, nouns_string: &str, taken_nicknames: Vec<String>) -> Self {
    let mut output = NicknameGenerator {
      adjectives: adjectives_string.lines().map(capitalize).collect(),
      nouns: nouns_string.lines().map(capitalize).collect(),
      taken_names: HashMap::new()
    };
    output.set_taken_nicknames(&taken_nicknames);
    output
  }

  fn set_taken_nicknames(&mut self, taken_nicknames: &[String]) {
    for name in taken_nicknames {
      let last = name.split(" ").last().unwrap();
      if last.parse::<u32>().is_ok() {
        let actual_name = &name[0..name.len() - last.len()];
        self.register_nickname(actual_name.to_string());
      } else {
        self.register_nickname(name.to_string());
      }
    }
  }

  fn register_nickname(&mut self, nickname: String) -> String {
    let count = self.taken_names.entry(nickname.clone()).or_insert(0);
    *count += 1;
    let final_nickname = if *count > 1 {
      let nickname_with_counter = format!("{} {}", nickname, count);
      self.register_nickname(nickname_with_counter)
    } else { nickname };
    final_nickname
  }

  pub fn generate_nickname(&mut self) -> String {
    let adj: &str = take_random_elem(&self.adjectives);
    let noun: &str = take_random_elem(&self.nouns);
    let nickname = format!("{} {}", adj, noun);
    let final_nickname = self.register_nickname(nickname);
    final_nickname
  }
}

#[cfg(test)]
mod tests {
  use super::NicknameGenerator;

  #[test]
  fn test_generate_nickname() {
    let mut gen = NicknameGenerator::new("bad", "Man", vec![]);
    let result = gen.generate_nickname();
    let expected = "Bad Man";
    assert_eq!(expected, result);
  }

  #[test]
  fn test_taken_nickname() {
    let mut gen = NicknameGenerator::new("bad", "man", vec![]);
    gen.generate_nickname();
    let result = gen.generate_nickname();
    let expected = "Bad Man 2";
    assert_eq!(expected, result);
  }

  #[test]
  fn test_two_taken_nicknames() {
    let mut gen = NicknameGenerator::new("bad", "man", vec![]);
    gen.generate_nickname();
    gen.generate_nickname();
    let result = gen.generate_nickname();
    let expected = "Bad Man 3";
    assert_eq!(expected, result);
  }

  #[test]
  fn test_taken_nicknames_constructor() {
    let mut gen = NicknameGenerator::new("bad", "man", vec![String::from("Bad Man")]);
    let result = gen.generate_nickname();
    let expected = "Bad Man 2";
    assert_eq!(expected, result);
  }

  #[test]
  fn test_taken_nicknames_constructor_two() {
    let mut gen = NicknameGenerator::new("bad", "man", vec![String::from("Bad Man"), String::from("Bad Man 2")]);
    let result = gen.generate_nickname();
    let expected = "Bad Man 3";
    assert_eq!(expected, result);
  }
}