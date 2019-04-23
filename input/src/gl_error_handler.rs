pub fn gl_err_to_str(err: u32) -> &'static str {
  match err {
    gl::INVALID_ENUM => "INVALID_ENUM",
    gl::INVALID_VALUE => "INVALID_VALUE",
    gl::INVALID_OPERATION => "INVALID_OPERATION",
    gl::INVALID_FRAMEBUFFER_OPERATION => "INVALID_FRAMEBUFFER_OPERATION",
    gl::OUT_OF_MEMORY => "OUT_OF_MEMORY",
    gl::STACK_UNDERFLOW => "STACK_UNDERFLOW",
    gl::STACK_OVERFLOW => "STACK_OVERFLOW",
    _ => "Unknown error",
  }
}

#[macro_export]
macro_rules! gl_assert_ok {
  () => {{
    let err = gl::GetError();
    assert_eq!(err, gl::NO_ERROR, "gl error: {}", gl_err_to_str(err));
  }};
}