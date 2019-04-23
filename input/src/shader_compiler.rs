use std::{
    ffi::CString,
    ptr, str,
};
use gl::types::*;
use super::Res;

#[derive(Default)]
pub struct ShaderProgram {
  pub vertex_shader: GLuint,
  pub fragment_shader: GLuint,
  pub handle: GLuint
}

impl ShaderProgram {
  pub fn cleanup(&self) {
    unsafe {
      gl::DeleteProgram(self.handle);
      gl::DeleteShader(self.fragment_shader);
      gl::DeleteShader(self.vertex_shader);
    }
  }
}

pub fn build_shader_program(vs_glsl: &str, fs_glsl: &str) -> Res<ShaderProgram> {
  let vs = compile_shader(vs_glsl, gl::VERTEX_SHADER)?;
  let fs = compile_shader(fs_glsl, gl::FRAGMENT_SHADER)?;
  let program = link_program(vs, fs)?;
  Ok(ShaderProgram {
    vertex_shader: vs,
    fragment_shader: fs,
    handle: program
  })
}

pub fn compile_shader(src: &str, ty: GLenum) -> Res<GLuint> {
  let shader;
  unsafe {
    shader = gl::CreateShader(ty);
    // Attempt to compile the shader
    let c_str = CString::new(src.as_bytes())?;
    gl::ShaderSource(shader, 1, &c_str.as_ptr(), ptr::null());
    gl::CompileShader(shader);

    // Get the compile status
    let mut status = GLint::from(gl::FALSE);
    gl::GetShaderiv(shader, gl::COMPILE_STATUS, &mut status);

    // Fail on error
    if status != GLint::from(gl::TRUE) {
      let mut len = 0;
      gl::GetShaderiv(shader, gl::INFO_LOG_LENGTH, &mut len);
      let mut buf = Vec::with_capacity(len as usize);
      buf.set_len((len as usize) - 1); // subtract 1 to skip the trailing null character
      gl::GetShaderInfoLog(
          shader,
          len,
          ptr::null_mut(),
          buf.as_mut_ptr() as *mut GLchar,
      );
      return Err(str::from_utf8(&buf)?.into());
    }
  }
  Ok(shader)
}

pub fn link_program(vs: GLuint, fs: GLuint) -> Res<GLuint> {
  unsafe {
    let program = gl::CreateProgram();
    gl::AttachShader(program, vs);
    gl::AttachShader(program, fs);
    gl::LinkProgram(program);
    // Get the link status
    let mut status = GLint::from(gl::FALSE);
    gl::GetProgramiv(program, gl::LINK_STATUS, &mut status);

    // Fail on error
    if status != GLint::from(gl::TRUE) {
      let mut len: GLint = 0;
      gl::GetProgramiv(program, gl::INFO_LOG_LENGTH, &mut len);
      let mut buf = Vec::with_capacity(len as usize);
      buf.set_len((len as usize) - 1); // subtract 1 to skip the trailing null character
      gl::GetProgramInfoLog(
        program,
        len,
        ptr::null_mut(),
        buf.as_mut_ptr() as *mut GLchar,
      );
      return Err(str::from_utf8(&buf)?.into());
    }
    Ok(program)
  }
}