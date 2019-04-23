pub mod text_scene_text;
pub mod cost_calculator;
pub mod selected_input;
use crate::text_scene::cost_calculator::calculate_cost;
use self::text_scene_text::{generate_string, TextVariables};
use self::selected_input::*;
use crate::execut_http_client::*;
use crate::frame_buffer::*;
use crate::gl_buffers::*;
use crate::gl_error_handler::*;
use crate::helpers_for_glyph::*;
use crate::nickname_generator::*;
use crate::printer::*;
use crate::scene::*;
use crate::shader_compiler::*;
use crate::spaceship_settings::*;
use crate::RETRO_COLOR_LEFT;
use crate::RETRO_COLOR_RIGHT;
use gl::types::*;
use glutin::dpi::PhysicalSize;
use glyph_brush::{rusttype::*, *};
use std::{ffi::CString, mem, ptr};

pub struct TextScene {
  program: ShaderProgram,
  vbo: GLuint,
  vao: GLuint,
  glyph_texture: GLuint,
  glyph_brush: GlyphBrush<'static>,
  pub font_size: f32,
  vertex_count: usize,
  vertex_max: usize,
  pub dimensions: PhysicalSize,
  frame_buffer: Option<Framebuffer>,
  font_tex_loc: GLint,
  selected_input_array: [SelectedInput; 2],
  points_remaining_array: [u32; 2],
  setting_points_array: [[SpaceshipSettingValue; SETTING_COUNT]; 2],
  player_names: [String; 2],
  nickname_generator: NicknameGenerator,
  pub printer: Option<Printer>,
  appendix: String,
}

impl TextScene {
  pub fn new(
    vs_glsl: &str,
    fs_glsl: &str,
    window: &glutin::GlWindow,
    frame_buffer: Option<Framebuffer>,
    mut nickname_generator: NicknameGenerator,
  ) -> Self {
    let font_bytes: &[u8] = include_bytes!("../assets/fonts/space_invaders.ttf");
    let glyph_brush: GlyphBrush = GlyphBrushBuilder::using_font_bytes(font_bytes).build();
    let dimensions = window
      .get_inner_size()
      .ok_or("get_inner_size = None")
      .unwrap()
      .to_physical(window.get_hidpi_factor());
    let program = build_shader_program(vs_glsl, fs_glsl).unwrap();
    let font_tex_loc: GLint;
    unsafe {
      font_tex_loc =
        gl::GetUniformLocation(program.handle, CString::new("baseRand").unwrap().as_ptr());
    }
    let settings: [SpaceshipSettingValue; SETTING_COUNT] = [
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(0)),
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(1)),
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(2)),
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(3)),
      SpaceshipSettingValue::new(SpaceshipSetting::from_index(4))
    ];
    let settings_right = settings.clone();

    let left_player_name = nickname_generator.generate_nickname();
    let right_player_name = nickname_generator.generate_nickname();

    TextScene {
      program,
      vbo: 0,
      vao: 0,
      glyph_texture: 0,
      glyph_brush,
      font_size: 38.0, // was 18.0 in initial example
      vertex_count: 0,
      vertex_max: 0,
      dimensions,
      frame_buffer,
      font_tex_loc,
      selected_input_array: [
        SelectedInput::from_index(0),
        SelectedInput::from_index(0),
      ],
      points_remaining_array: [10, 10],
      setting_points_array: [settings, settings_right],
      nickname_generator,
      player_names: [left_player_name, right_player_name],
      printer: None,
      appendix: String::new(),
    }
  }

  pub fn resize(&mut self, dimensions: PhysicalSize) {
    self.dimensions = dimensions;
    // todo: set glyph positions
  }

  pub fn up(&mut self, player_index: usize) {
    let selected = self.selected_input_array[player_index];
    self.selected_input_array[player_index] = selected.prev();
  }

  pub fn down(&mut self, player_index: usize) {
    let selected = self.selected_input_array[player_index];
    self.selected_input_array[player_index] = selected.next();
  }

  fn change_setting(&mut self, setting_index: usize, delta: i32, player_index: usize) {
    let current_setting_val = self.setting_points_array[player_index][setting_index];
    // if delta = 1, calculate cost for next thing
    let new_val: i32 = current_setting_val.value as i32 + delta;
    let cost = calculate_cost(&current_setting_val, delta);
    let new_remaining = self.points_remaining_array[player_index] as i32 - cost;
    if new_remaining >= 0 && new_remaining <= 10 && new_val >= 0 {
      self.setting_points_array[player_index][setting_index].value = new_val as u32;
      self.points_remaining_array[player_index] = new_remaining as u32;
    }
  }

  fn change(&mut self, delta: i32, player_index: usize) {
    match self.selected_input_array[player_index] {
      SelectedInput::Setting(setting) => {
        let selected_index = setting.to_index();
        self.change_setting(selected_index, delta, player_index);
      },
      SelectedInput::Submit => {
        self.submit(player_index);
      }
    }
  }

  fn submit(&mut self, player_index: usize) {
    if self.points_remaining_array[player_index] > 0 {
      // maybe show a message that all points must be distributed?
      return;
    }
    self.selected_input_array[player_index] = SelectedInput::Setting(SpaceshipSetting::Shields);
    let cloned_settings = self.setting_points_array[player_index].clone();
    let setting_points: &mut [SpaceshipSettingValue; SETTING_COUNT] = &mut self.setting_points_array[player_index];
    let name_copy = self.player_names[player_index].clone();
    // 1. send to endpoint
    // todo: send settings
    let result: Result<(), _> = post_new_player(name_copy.clone(), setting_points.clone());
    if let Err(_) = result {
      self.appendix = String::from("API error: Try again later");
      return;
    }
    if let Some(printer) = &self.printer {
      // 2. send to printer
      printer.print(PlayerSettings {
        nickname: name_copy.clone(),
        setting_values: cloned_settings,
      });
    } else {
      // FIXME: Nice try... But the points are going to be reset below anyway
      self.appendix = format!(
        "Could not find printer\nPlease take a picture this screen.\nYour nickname: {}",
        name_copy.clone()
      );
    }

    // 3. create new nickname
    self.player_names[player_index] = self.nickname_generator.generate_nickname();

    // 4. reset points
    self.points_remaining_array[player_index] = 10;
    let mut i = setting_points.len();
    while i > 0 {
      i = i - 1;
      setting_points[i].value = 0;
    }
  }

  pub fn increase(&mut self, player_index: usize) {
    self.change(1, player_index);
  }

  pub fn decrease(&mut self, player_index: usize) {
    self.change(-1, player_index);
  }

  fn generate_string(&mut self, player_index: usize) -> String {
    let player_name: String = self.player_names[player_index].clone();
    let ship_settings = self.setting_points_array[player_index].clone();
    let player_remaining_points = self.points_remaining_array[player_index];
    let selected_input = self.selected_input_array[player_index].clone();
    let appendix = self.appendix.clone();
    let variables = TextVariables {
      player_name,
      ship_settings,
      player_remaining_points,
      selected_input,
      appendix,
    };
    generate_string(variables)
  }

  pub fn update(&mut self, window: &glutin::GlWindow) {
    // vvvv glyph brush queue vvvv
    let width = self.dimensions.width as f32; // use this if you render to viewport
    let height = self.dimensions.height as _;
    let scale = Scale::uniform((self.font_size * window.get_hidpi_factor() as f32).round());
    // let scale = rusttype::Scale::uniform(10.0);
    let input_string = self.generate_string(0);
    // example @ https://github.com/alexheretic/glyph-brush/blob/master/glyph-brush/examples/opengl.rs
    self.glyph_brush.queue(Section {
      text: &input_string,
      scale,
      screen_position: (width / 20.0, height / 10.0),
      bounds: (width / 2.1, height),
      color: RETRO_COLOR_LEFT,
      ..Section::default()
    });

    let input_string_right = self.generate_string(1);
    self.glyph_brush.queue(Section {
      text: &input_string_right,
      scale,
      screen_position: (width - width / 20.0, height / 10.0),
      bounds: (width / 2.1, height),
      color: RETRO_COLOR_RIGHT,
      layout: Layout::default().h_align(HorizontalAlign::Right),
      ..Section::default()
    });

    // vvvv handle glyph brush action vvvv
    let mut brush_action;
    loop {
      unsafe {
        gl::BindTexture(gl::TEXTURE_2D, self.glyph_texture);
      }
      brush_action = self.glyph_brush.process_queued(
        (width as _, height as _),
        |rect, tex_data| unsafe {
          // Update part of gpu texture with new glyph alpha values
          gl::TexSubImage2D(
            gl::TEXTURE_2D,
            0,
            rect.min.x as _,
            rect.min.y as _,
            rect.width() as _,
            rect.height() as _,
            gl::RED,
            gl::UNSIGNED_BYTE,
            tex_data.as_ptr() as _,
          );
          gl_assert_ok!();
        },
        to_vertex,
      );

      // println!("Time to match brush actions for resize"); // DEBUG
      match brush_action {
        Ok(_) => break,
        Err(BrushError::TextureTooSmall { suggested, .. }) => unsafe {
          let (new_width, new_height) = suggested;
          eprint!("\r                            \r");
          eprintln!("Resizing glyph texture -> {}x{}", new_width, new_height);
          // Recreate texture as a larger size to fit more
          gl::TexImage2D(
            gl::TEXTURE_2D,
            0,
            gl::RED as _,
            new_width as _,
            new_height as _,
            0,
            gl::RED,
            gl::UNSIGNED_BYTE,
            ptr::null(),
          );
          gl_assert_ok!();
          self.glyph_brush.resize_texture(new_width, new_height);
        },
      }
    }
    // println!("Time to match brush actions for draw"); // DEBUG
    match brush_action.unwrap() {
      BrushAction::Draw(vertices) => {
        // Draw new vertices
        self.vertex_count = vertices.len();
        unsafe {
          if self.vertex_max < self.vertex_count {
            gl::BufferData(
              gl::ARRAY_BUFFER,
              (self.vertex_count * mem::size_of::<VertexForGlyph>()) as GLsizeiptr,
              vertices.as_ptr() as _,
              gl::DYNAMIC_DRAW,
            );
          } else {
            gl::BufferSubData(
              gl::ARRAY_BUFFER,
              0,
              (self.vertex_count * mem::size_of::<VertexForGlyph>()) as GLsizeiptr,
              vertices.as_ptr() as _,
            );
          }
        }
        self.vertex_max = self.vertex_max.max(self.vertex_count);
      }
      BrushAction::ReDraw => {}
    }
    // ^^^^ handle glyph brush action ^^^^
  }
}

// ==== impl Scene ===

impl Scene for TextScene {
  fn init(&mut self) {
    unsafe {
      let mut vao = 0;
      let mut vbo = 0;
      let mut glyph_texture = 0;
      // Create Vertex Array Object
      gl::GenVertexArrays(1, &mut vao);
      gl::BindVertexArray(vao);

      // Create a Vertex Buffer Object
      gl::GenBuffers(1, &mut vbo);
      gl::BindBuffer(gl::ARRAY_BUFFER, vbo);

      {
        // Create a texture for the glyphs
        // The texture holds 1 byte per pixel as alpha data
        gl::PixelStorei(gl::UNPACK_ALIGNMENT, 1);
        gl::GenTextures(1, &mut glyph_texture);
        gl::BindTexture(gl::TEXTURE_2D, glyph_texture);
        gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_S, gl::CLAMP_TO_EDGE as _);
        gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_T, gl::CLAMP_TO_EDGE as _);
        gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as _);
        gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as _);
        let (glyph_width, glyph_height) = self.glyph_brush.texture_dimensions();
        println!("glyph_brush w, h: {}, {}", glyph_width, glyph_height);
        gl::TexImage2D(
          gl::TEXTURE_2D,
          0,
          gl::RED as _,
          glyph_width as _,
          glyph_height as _,
          0,
          gl::RED,
          gl::UNSIGNED_BYTE,
          ptr::null(),
        );
        self.vao = vao;
        self.vbo = vbo;
        self.glyph_texture = glyph_texture;
        gl_assert_ok!();
      }

      // Use shader program
      let program_handle = self.program.handle;
      gl::UseProgram(program_handle);
      gl::BindFragDataLocation(
        program_handle,
        0,
        CString::new("out_color").unwrap().as_ptr(),
      );

      // Specify the layout of the vertex data
      setup_attribs(
        program_handle,
        mem::size_of::<VertexForGlyph>() as _,
        true,
        &[
          ("left_top", 3),
          ("right_bottom", 2),
          ("tex_left_top", 2),
          ("tex_right_bottom", 2),
          ("color", 4),
        ],
      )
      .unwrap();

      // Enabled alpha blending
      gl::Enable(gl::BLEND);
      gl::BlendFunc(gl::SRC_ALPHA, gl::ONE_MINUS_SRC_ALPHA);
      // Use srgb for consistency with other examples
      gl::Enable(gl::FRAMEBUFFER_SRGB);
      gl::ClearColor(0.02, 0.02, 0.02, 1.0);
      // vao is used after this somewhere...
    }
  }

  unsafe fn draw(&self) {
    let program_handle = self.program.handle;
    if let Some(frame_buffer) = self.frame_buffer {
      frame_buffer.bind();
    } else {
      gl::BindFramebuffer(gl::FRAMEBUFFER, 0);
    }
    gl::ClearColor(0.02, 0.02, 0.02, 1.0);
    gl::Clear(gl::COLOR_BUFFER_BIT);
    gl::UseProgram(program_handle);
    gl::BindTexture(gl::TEXTURE_2D, self.glyph_texture);
    gl::Uniform1i(self.font_tex_loc, 0);
    gl::BindVertexArray(self.vao);
    gl::DrawArraysInstanced(gl::TRIANGLE_STRIP, 0, 4, self.vertex_count as _);
  }

  fn cleanup(&self) {
    unsafe {
      self.program.cleanup();
      gl::DeleteBuffers(1, &self.vbo);
      gl::DeleteVertexArrays(1, &self.vao);
      gl::DeleteTextures(1, &self.glyph_texture);
      if let Some(frame_buffer) = self.frame_buffer {
        frame_buffer.cleanup();
      }
    }
  }
}
