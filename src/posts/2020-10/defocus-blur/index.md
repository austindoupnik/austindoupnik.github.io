---
title: 'Ch 12. Defocus Blur'
series:
    title: 'Ray Tracing in One Weekend with Rust'
    part: 11
date: '2020-10-27T15:10:39+00:00'
tags:
    - 'rust'
    - 'ray tracing'
---

The last feature implemented in the source material is defocus blur, or depth of field.
This is an effect seen in cameras due to the way the aperture, lens, and light sensor interact.
The result is that the scene is partially out of focus.

### A Thin Lens Approximation

In our case we will use a simple approximation, simulating only the lens.

### Generating Sample Rays

First we need to generate rays in a disk, the disk being ab approximation of the lens:

```rust{numberLines: true}
    pub fn random_in_unit_disk() -> Vec3 {
        loop {
            let p = Vec3::new(random_in_range(-1.0, 1.0), random_in_range(-1.0, 1.0), 0.0);
            if p.length_squared() < 1.0 {
                return p;
            }
        }
    }
```

Now update our camera to generate arrays at a random location inside of the disk:

```rust{numberLines:true}
pub struct Camera {
    pub origin: Point3,
    pub lower_left_corner: Point3,
    pub horizontal: Vec3,
    pub vertical: Vec3,
    pub lens_radius: f64, // highlight-line
    pub u: Vec3, // highlight-line
    pub v: Vec3, // highlight-line
}

impl Camera {
    pub fn new(lookfrom: Point3, lookat: Point3, vup: Vec3, fov: f64, aspect_ratio: f64, aperture: f64, focus_dist: f64) -> Camera { // highlight-line
        let theta = f64::to_radians(fov);
        let h = f64::tan(theta / 2.0);
        let viewport_height = 2.0 * h;
        let viewport_width = aspect_ratio * viewport_height;

        let w = Vec3::unit_vector(lookfrom - lookat); // highlight-line
        let u = Vec3::unit_vector(Vec3::cross(&vup, &w)); // highlight-line
        let v = Vec3::cross(&w, &u); // highlight-line

        let origin = lookfrom;
        let horizontal = focus_dist * viewport_width * u; // highlight-line
        let vertical = focus_dist * viewport_height * v; // highlight-line
        let lower_left_corner = origin - horizontal / 2.0 - vertical / 2.0 - focus_dist * w; // highlight-line

        Camera {
            origin,
            horizontal,
            vertical,
            lower_left_corner,
            lens_radius: aperture / 2.0, // highlight-line
            u, // highlight-line
            v, // highlight-line
        }
    }

    pub fn get_ray(&self, s: f64, t: f64) -> Ray { // highlight-line
        let rd = self.lens_radius * Vec3::random_in_unit_disk(); // highlight-line
        let offset = self.u * rd.x() + self.v * rd.y(); // highlight-line

        Ray::new(self.origin + offset, self.lower_left_corner + s * self.horizontal + t * self.vertical - self.origin - offset) // highlight-line
    }
}
```

Setup a large aperture:

```rust{numberLines: true}
    let lookfrom = Point3::new(3.0, 3.0, 2.0);
    let lookat = Point3::new(0.0, 0.0, -1.0);
    let dist_to_focus = (lookfrom - lookat).length(); // highlight-line

    let cam = Camera::new(lookfrom, lookat, Vec3::new(0.0, 1.0, 0.0), 20.0, aspect_ratio, 2.0, dist_to_focus); // highlight-line
```

This gives:

![Spheres with depth-of-field](./defocus.png "Spheres with depth-of-field")

The complete code is [available here](https://github.com/austindoupnik/ray-tracing-in-one-weekend-with-rust/tree/v0.0.1-chapter.12).