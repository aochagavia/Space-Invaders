use std::env;
use glutin::{EventsLoop, Api, GlContext, GlProfile, GlRequest, GlWindow, MonitorId};
use super::Res;

pub fn init(title: &str) -> Res<(GlWindow, EventsLoop)> {
  if cfg!(target_os = "linux") {
      // winit wayland is currently still wip
      if env::var("WINIT_UNIX_BACKEND").is_err() {
          env::set_var("WINIT_UNIX_BACKEND", "x11");
      }
      // disables vsync sometimes on x11
      if env::var("vblank_mode").is_err() {
          env::set_var("vblank_mode", "0");
      }
  }
  let events = glutin::EventsLoop::new();
  // for fullscreen example, check out: https://github.com/tomaka/glutin/blob/master/examples/fullscreen.rs
  let monitor_id: MonitorId = events.get_available_monitors().nth(0).expect("Please enter a valid ID");
  let window = glutin::GlWindow::new(
      glutin::WindowBuilder::new()
          // .with_dimensions((1600, 900).into())
          .with_dimensions((1920, 1080).into())
          .with_fullscreen(Some(monitor_id))
          .with_title(title),
      glutin::ContextBuilder::new()
          .with_gl_profile(GlProfile::Core)
          .with_gl(GlRequest::Specific(Api::OpenGl, (4, 0))) // was 3.2
          .with_srgb(true),
      &events,
  )?;
  unsafe { window.make_current()? };
  // Load the OpenGL function pointers
  // unsafe { gl::Enable(gl::MULTISAMPLE); }
  gl::load_with(|symbol| window.get_proc_address(symbol) as _);
  Ok((window, events))
}