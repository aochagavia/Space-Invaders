use std::ffi::CString;
use gl::types::*;

pub struct RenderPass {
  shader_type: GLenum,
  handle: GLuint
}

impl RenderPass {
  pub unsafe fn new(program_handle: GLuint, shader_type: GLenum, name: &str) -> Self {
    let handle = gl::GetSubroutineIndex(program_handle, gl::FRAGMENT_SHADER, CString::new(name).unwrap().as_ptr());
    RenderPass {
      shader_type,
      handle
    }
  }

  pub unsafe fn set(&self) {
    gl::UniformSubroutinesuiv(self.shader_type, 1, &self.handle);
  }
}