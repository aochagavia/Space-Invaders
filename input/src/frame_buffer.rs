use gl::types::*;
use std::ptr;

#[derive(Debug, Copy, Clone)]
pub struct Framebuffer {
  pub handle: GLuint,
  pub tex_handle: GLuint,
  pub texture_number: GLint
}

fn get_texture_unit_number(texture_unit: GLenum) -> GLint
{
  let texture_number: GLint;
  match texture_unit {
    gl::TEXTURE0 => { texture_number = 0 },
    gl::TEXTURE1 => { texture_number = 1 },
    gl::TEXTURE2 => { texture_number = 2 },
    gl::TEXTURE3 => { texture_number = 3 },
    gl::TEXTURE4 => { texture_number = 4 },
    gl::TEXTURE5 => { texture_number = 5 },
    gl::TEXTURE6 => { texture_number = 6 },
    gl::TEXTURE7 => { texture_number = 7 },
    gl::TEXTURE8 => { texture_number = 8 },
    gl::TEXTURE9 => { texture_number = 9 },
    gl::TEXTURE10 => { texture_number = 10 },
    gl::TEXTURE23 => { texture_number = 23 },
    _ => panic!("Invalid texture unit in Framebuffer")
  }
  texture_number
}

impl Framebuffer {
  // texture unit is gl::TEXTURE0 or gl::TEXTURE1 etc.
  pub fn new(texture_unit: GLenum, width: GLsizei, height: GLsizei) -> Self {
    let mut handle: GLuint = 0;
    let mut tex_handle: GLuint = 0;
    let texture_number = get_texture_unit_number(texture_unit);
    unsafe {
      // gen buffer
      gl::GenFramebuffers(1, &mut handle);
      gl::BindFramebuffer(gl::FRAMEBUFFER, handle);
      // create texture
      gl::GenTextures(1, &mut tex_handle);
      gl::ActiveTexture(texture_unit);
      gl::BindTexture(gl::TEXTURE_2D, tex_handle);
      gl::TexImage2D(gl::TEXTURE_2D, 0, gl::RGB as _, width, height, 0, gl::RGB as _, gl::UNSIGNED_BYTE, ptr::null());
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, gl::LINEAR as _); // param min filter
      gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, gl::LINEAR as _); // param mag filter
      // attach texture
      gl::FramebufferTexture2D(gl::FRAMEBUFFER, gl::COLOR_ATTACHMENT0, gl::TEXTURE_2D, tex_handle, 0);
      // set target
      let draw_buffers = vec![gl::COLOR_ATTACHMENT0];
      gl::DrawBuffers(1, draw_buffers.as_ptr() as _);
      // unbind
      gl::BindFramebuffer(gl::FRAMEBUFFER, 0);
    }
    println!("created framebuffer with handle, texture, number: {}, {}, {}", handle, tex_handle, texture_number);
    Framebuffer {
      handle,
      tex_handle,
      texture_number
    }
  }

  pub unsafe fn bind(&self) {
    gl::BindFramebuffer(gl::FRAMEBUFFER, self.handle);
  }

  pub unsafe fn cleanup(&self) {
    gl::DeleteTextures(1, &self.tex_handle);
    gl::DeleteFramebuffers(1, &self.handle);
  }
}