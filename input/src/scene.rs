pub trait Scene {
  fn init(&mut self);
  unsafe fn draw(&self);
  fn cleanup(&self);
}