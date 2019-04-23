//! Rendering to a texture https://learnopengl.com/Advanced-OpenGL/Framebuffers
//! bloom https://learnopengl.com/Advanced-Lighting/Bloom

use gl::types::GLsizei;
use glutin::GlWindow;
use hostname::get_hostname;
use spin_sleep::LoopHelper;

mod gl_buffers;
mod shader_compiler;
#[macro_use]
mod gl_error_handler;
mod helpers_for_glyph;
mod render_pass;

mod frame_buffer;
use frame_buffer::*;
mod scene;
use scene::*;
mod retrofy_scene;
use retrofy_scene::*;
mod text_scene;
use text_scene::*;
mod event_handler;
use event_handler::*;
mod context;
mod printer;
use printer::*;
mod nickname_generator;
use nickname_generator::*;
mod execut_http_client;
mod spaceship_settings;
use execut_http_client::*;
mod sound_player;
use sound_player::SoundPlayer;

// SOME COLORS
// [164.0/255.0, 252.0/255.0, 212.0/255.0, 255.0]; // very light teal
// [144.0/255.0, 228.0/255.0, 192.0/255.0, 255.0];  // pretty light teal, and bland
// [200.0/255.0, 22.0/255.0, 2.0/255.0, 255.0]; // reddish
// [47.0/255.0, 218.0/255.0, 176.0/255.0, 255.0]; // a bit more colorful greenish

pub const OS_COLOR: [f32; 4] = [200.0 / 255.0, 200.0 / 255.0, 200.0 / 255.0, 255.0]; // a bit more colorful greenish
pub const RETRO_COLOR_LEFT: [f32; 4] = [47.0 / 255.0, 218.0 / 255.0, 176.0 / 255.0, 255.0]; // a bit more colorful greenish
pub const RETRO_COLOR_RIGHT: [f32; 4] = [200.0 / 255.0, 22.0 / 255.0, 2.0 / 255.0, 255.0]; // reddish

pub type Res<T> = Result<T, Box<std::error::Error>>;

fn main() -> Res<()> {
  let title = "Infi Execut";
  let (window, mut events) = context::init(title)?;
  // INIT
  let f_width: GLsizei = 1920; // 1920;
  let f_height: GLsizei = 1080; // 1080;
  let text_frame_buffer = Framebuffer::new(gl::TEXTURE0, f_width, f_height);
  let text_texture = text_frame_buffer.tex_handle;
  let text_fbo_texture_number = text_frame_buffer.texture_number;
  let taken_nicknames = fetch_taken_nicknames().unwrap_or_else(|error| {
    eprintln!("Error while fetching nicknames: {}", error);
    Vec::new()
  });
  let nickname_generator = NicknameGenerator::new(
    include_str!("../assets/adjectives.txt"),
    include_str!("../assets/nouns.txt"),
    taken_nicknames,
  );

  // generating other framebuffers in noisescene somehow interferes with text_scene; it renders semi-transparant quads instead of glyphs
  let mut retrofy_scene = RetrofyScene::new(
    include_str!("shader/retrofy.vert.glsl"),
    include_str!("shader/retrofy.frag.glsl"),
    text_texture,
    text_fbo_texture_number,
  );
  retrofy_scene.init();

  let mut text_scene = TextScene::new(
    include_str!("shader/text.vert.glsl"),
    include_str!("shader/text.frag.glsl"),
    &window,
    Some(text_frame_buffer),
    nickname_generator,
  );

  let host_name = get_hostname().expect("Could not get host name");
  println!("host name: {}", host_name);
  let printer_address = format!("\\\\{}\\EPSON", host_name);
  let printer = Printer::new(&printer_address);
  text_scene.printer = Some(printer);
  text_scene.init();

  let mut sound_player = SoundPlayer::new();
  let mut loop_helper = spin_sleep::LoopHelper::builder().build_with_target_rate(250.0);
  let mut running = true;
  // RUN
  while running {
    loop_helper.loop_start();
    {
      // active input state
      handle_events(&mut events, &mut running, &window, &mut sound_player, &mut text_scene)?;
      retrofy_scene.update();
      text_scene.update(&window);
      draw(&retrofy_scene, &text_scene, &window)?;
    }
    update_loop_helper(&mut loop_helper, &window, title);
  }
  // CLEANUP
  text_scene.cleanup();
  retrofy_scene.cleanup();
  Ok(())
}

fn draw(noise_scene: &RetrofyScene, text_scene: &TextScene, window: &GlWindow) -> Res<()> {
  unsafe {
    text_scene.draw();
    noise_scene.draw();
  }
  window.swap_buffers()?;
  Ok(())
}

fn update_loop_helper(loop_helper: &mut LoopHelper, window: &GlWindow, title: &str) {
  if let Some(rate) = loop_helper.report_rate() {
    window.set_title(&format!("{} {:.0} FPS", title, rate));
  }
  loop_helper.loop_sleep();
}
