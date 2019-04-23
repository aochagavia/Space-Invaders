use gl::types::*;
use glyph_brush::{rusttype::*};

/// `[left_top * 3, right_bottom * 2, tex_left_top * 2, tex_right_bottom * 2, color * 4]`
pub type VertexForGlyph = [GLfloat; 13];

#[inline]
pub fn to_vertex(
  glyph_brush::GlyphVertex {
    mut tex_coords,
    pixel_coords,
    bounds,
    screen_dimensions: (screen_w, screen_h),
    color,
    z,
  }: glyph_brush::GlyphVertex,
) -> VertexForGlyph {
  let gl_bounds = Rect {
      min: point(
          2.0 * (bounds.min.x / screen_w - 0.5),
          2.0 * (0.5 - bounds.min.y / screen_h),
      ),
      max: point(
          2.0 * (bounds.max.x / screen_w - 0.5),
          2.0 * (0.5 - bounds.max.y / screen_h),
      ),
  };

  let mut gl_rect = Rect {
    min: point(
      2.0 * (pixel_coords.min.x as f32 / screen_w - 0.5),
      2.0 * (0.5 - pixel_coords.min.y as f32 / screen_h),
    ),
    max: point(
      2.0 * (pixel_coords.max.x as f32 / screen_w - 0.5),
      2.0 * (0.5 - pixel_coords.max.y as f32 / screen_h),
    ),
  };

  // handle overlapping bounds, modify uv_rect to preserve texture aspect
  if gl_rect.max.x > gl_bounds.max.x {
    let old_width = gl_rect.width();
    gl_rect.max.x = gl_bounds.max.x;
    tex_coords.max.x = tex_coords.min.x + tex_coords.width() * gl_rect.width() / old_width;
  }
  if gl_rect.min.x < gl_bounds.min.x {
    let old_width = gl_rect.width();
    gl_rect.min.x = gl_bounds.min.x;
    tex_coords.min.x = tex_coords.max.x - tex_coords.width() * gl_rect.width() / old_width;
  }
  // note: y access is flipped gl compared with screen,
  // texture is not flipped (ie is a headache)
  if gl_rect.max.y < gl_bounds.max.y {
    let old_height = gl_rect.height();
    gl_rect.max.y = gl_bounds.max.y;
    tex_coords.max.y = tex_coords.min.y + tex_coords.height() * gl_rect.height() / old_height;
  }
  if gl_rect.min.y > gl_bounds.min.y {
    let old_height = gl_rect.height();
    gl_rect.min.y = gl_bounds.min.y;
    tex_coords.min.y = tex_coords.max.y - tex_coords.height() * gl_rect.height() / old_height;
  }

  [
    gl_rect.min.x,
    gl_rect.max.y,
    z,
    gl_rect.max.x,
    gl_rect.min.y,
    tex_coords.min.x,
    tex_coords.max.y,
    tex_coords.max.x,
    tex_coords.min.y,
    color[0],
    color[1],
    color[2],
    color[3],
  ]
}
