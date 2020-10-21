---
title: 'Ch 4. Rays, a Simple Camera, and Background'
series:
    title: 'Ray Tracing in One Weekend with Rust'
    part: 3
date: '2020-10-14'
tags:
    - 'rust'
    - 'ray tracing'
---

In the [Rays, a Simple Camera, and Background](https://raytracing.github.io/books/RayTracingInOneWeekend.html#rays,asimplecamera,andbackground) chapter we will finally start casting some rays, and fix some bugs from the last chapters. 

### The ray Class

In this case a `Ray` is a line in 3D space, which can be evaluated at some `t`.
A somewhat flimsy intuition for `t` is "time", if you think of a `Ray` as starting at `origin` and moving in `dir` it will be at some location `self.origin + t * self.dir` after some "time" has passed.

```rust{numberLines: true}
pub struct Ray {
    pub origin: Point3,
    pub dir: Vec3,
}

impl Ray {
    pub fn origin(&self) -> Point3 {
        self.origin
    }

    pub fn direction(&self) -> Vec3 {
        self.dir
    }

    pub fn at(&self, t: f64) -> Point3 {
        self.origin + t * self.dir
    }
}
```

### Sending Rays Into the Scene

Now we can build a simple camera and derive each pixel's color from a linear interpolation of white and blue, giving a nice gradient.

```rust{numberLines: true}
fn ray_color(r: &Ray) -> Color { // highlight-line
    let unit_direction = unit_vector(r.direction()); // highlight-line
    let t = 0.5 * (unit_direction.y() + 1.0); // highlight-line
    (1.0 - t) * Color { e: [1.0, 1.0, 1.0] } + t * Color { e: [0.5, 0.7, 1.0] } // highlight-line
} // highlight-line

fn main() {
    const ASPECT_RATIO: f64 = 16.0 / 9.0; // highlight-line

    const IMAGE_WIDTH: u32 = 400; // highlight-line
    const IMAGE_HEIGHT: u32 = (IMAGE_WIDTH as f64 / ASPECT_RATIO) as u32; // highlight-line

    const VIEWPORT_HEIGHT: f64 = 2.0; // highlight-line
    const VIEWPORT_WIDTH: f64 = ASPECT_RATIO * VIEWPORT_HEIGHT; // highlight-line
    const FOCAL_LENGTH: f64 = 1.0; // highlight-line

    const ORIGIN: Point3 = Point3 { e: [0.0, 0.0, 0.0] }; // highlight-line
    const HORIZONTAL: Vec3 = Vec3 { e: [ VIEWPORT_WIDTH, 0.0, 0.0] }; // highlight-line
    const VERTICAL: Vec3 = Vec3 { e: [ 0.0, VIEWPORT_HEIGHT, 0.0] }; // highlight-line

    let lower_left_corner: Vec3 = ORIGIN - HORIZONTAL / 2.0 - VERTICAL / 2.0 - Vec3 { e: [0.0, 0.0, FOCAL_LENGTH ] }; // highlight-line

    print!("P3\n{} {}\n255\n", IMAGE_WIDTH, IMAGE_HEIGHT);

    for j in (0..IMAGE_HEIGHT).rev() {
        eprint!("\rScanlines remaining: {} ", j);
        for i in 0..IMAGE_WIDTH {
            let u = i as f64 / (IMAGE_WIDTH - 1) as f64; // highlight-line
            let v = j as f64 / (IMAGE_HEIGHT - 1) as f64; // highlight-line

            let r = Ray { origin: ORIGIN, dir: lower_left_corner + u * HORIZONTAL + v * VERTICAL - ORIGIN }; // highlight-line
            let pixel_color = ray_color(&r); // highlight-line
            write_color(io::stdout().borrow_mut(), pixel_color);
        }
    }

    eprint!("\nDone.\n");
}
```

We also have to fix a few issues in `Vec3` from last chapter.

First to allow `Vec3` to be copied we must implement the `Clone` and `Copy` traits:

```rust{numberLines: true}
#[derive(Clone, Copy)] // highlight-line
pub struct Vec3 {
    pub e: [f64; 3],
}
```

A few functions that were mean to be public were private:

```rust{numberLines: true}
impl Vec3 {
    pub fn x(&self) -> f64 { // highlight-line
        self.e[0]
    }

    pub fn y(&self) -> f64 { // highlight-line
        self.e[1]
    }

    pub fn z(&self) -> f64 { // highlight-line
        self.e[2]
    }

    pub fn length(&self) -> f64 { // highlight-line
        f64::sqrt(self.length_squared())
    }

    pub fn length_squared(&self) -> f64 { // highlight-line
        self.e[0] * self.e[0] + self.e[1] * self.e[1] + self.e[2] * self.e[2]
    }
}
```

Finally, I forgot to implement the `unit_vector` function:

```rust{numberLines: true}
pub fn unit_vector(v: Vec3) -> Vec3 {
    v / v.length()
}
```

After all of that we can produce an image:

![A blue-to-white gradient depending on ray Y coordinate ](./image.png "A blue-to-white gradient depending on ray Y coordinate")

The complete code is [available here](https://github.com/austindoupnik/ray-tracing-in-one-weekend-with-rust/tree/v0.0.1-chapter.4).