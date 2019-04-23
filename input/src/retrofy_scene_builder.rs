
#[derive(Default)]
struct RetrofySceneBuilder {
  program: ShaderProgram,
  line_pos_uniform: String,
  retro_col_uniform: String,
  line_pos: f32,
  color: [f32; 4]
}

impl RetrofySceneBuilder {
  fn new() -> Self {
    RetrofySceneBuilder { ..Default::default() }
  }

  fn with_line_pos_uniform(&mut self, uniform: String) {
    self.line_pos_uniform = uniform;
  }

  fn with_retro_col_uniform(&mut self, uniform: String) {
    self.retro_col_uniform = uniform;
  }

  fn with_init_line_pos(&mut self, pos: f32) {
    self.line_pos = uniform;
  }

  fn with_color(&mut self, color: [f32; 4]) {
    self.color = color;
  }

  fn build(self, vs_glsl: &str, fs_glsl: &str, text_texture_handle: GLuint, text_texture_number: GLint) -> RetrofyScene {
    let scene = RetrofyScene.new(vs_glsl, fs_glsl, text_texture_handle, text_texture_number);
    scene.init("retroColorLeft", "linePosLeft", RETRO_COLOR_LEFT);
    scene
  }
}