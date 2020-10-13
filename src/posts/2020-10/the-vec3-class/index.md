---
title: 'Ch 3. The vec3 Class'
series:
    title: 'Ray Tracing in One Weekend with Rust'
    part: 2
date: '2020-10-13'
tags:
    - 'rust'
    - 'ray tracing'
---

In [The vec3 Class](https://raytracing.github.io/books/RayTracingInOneWeekend.html#thevec3class) chapter we add a class to wrap an array representing a 3D vector.
There are some aspects of this design (like using an array, and the type aliases for `point3` and `color`) which are not the choices I would make.
For now, I will keep the same design as the book, but in the future may explore another approach.

### Variables and Methods

This is my first practical attempt to use the Rust type system, and is mostly a direct translation from the original C++ code.
One remaining open question is whether I can somehow add the sample compile time check for constant index values that fixed size arrays have.
In the current code attempting to index a position greater than 3 results in a runtime error, and not compile time error as I would like.

```rust{numberLines: true}
pub struct Vec3 {
    pub e: [f64; 3],
}

impl Vec3 {
    fn x(&self) -> f64 {
        self.e[0]
    }

    fn y(&self) -> f64 {
        self.e[1]
    }

    fn z(&self) -> f64 {
        self.e[2]
    }

    fn length(&self) -> f64 {
        f64::sqrt(self.length_squared())
    }

    fn length_squared(&self) -> f64 {
        self.e[0] * self.e[0] + self.e[1] * self.e[1] + self.e[2] * self.e[2]
    }
}

impl ops::Neg for Vec3 {
    type Output = Vec3;

    fn neg(self) -> Self::Output {
        Vec3 { e: [-self.e[0], -self.e[1], -self.e[2]] }
    }
}

impl ops::Index<usize> for Vec3 {
    type Output = f64;

    fn index(&self, index: usize) -> &Self::Output {
        &self.e[index]
    }
}

impl ops::AddAssign for Vec3 {
    fn add_assign(&mut self, rhs: Vec3) {
        self.e[0] += rhs.e[0];
        self.e[1] += rhs.e[1];
        self.e[2] += rhs.e[2];
    }
}

impl ops::MulAssign<f64> for Vec3 {
    fn mul_assign(&mut self, rhs: f64) {
        self.e[0] *= rhs;
        self.e[1] *= rhs;
        self.e[2] *= rhs;
    }
}

impl ops::DivAssign<f64> for Vec3 {
    fn div_assign(&mut self, rhs: f64) {
        *self *= 1.0 / rhs
    }
}

pub type Point3 = Vec3;
```

### vec3 Utility Functions

There are some additional utility functions for outputting the vectors as well as some basic linear algebra operations:

```rust{numberLines: true}
impl fmt::Display for Vec3 {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{} {} {}",
            self.e[0],
            self.e[1],
            self.e[2],
        )
    }
}

impl ops::Add for Vec3 {
    type Output = Vec3;

    fn add(self, rhs: Vec3) -> Self::Output {
        Vec3 { e: [self.e[0] + rhs.e[0], self.e[1] + rhs.e[1], self.e[2] + rhs.e[2]] }
    }
}

impl ops::Sub for Vec3 {
    type Output = Vec3;

    fn sub(self, rhs: Vec3) -> Self::Output {
        Vec3 { e: [self.e[0] - rhs.e[0], self.e[1] - rhs.e[1], self.e[2] - rhs.e[2]] }
    }
}

impl ops::Mul for Vec3 {
    type Output = Vec3;

    fn mul(self, rhs: Vec3) -> Self::Output {
        Vec3 { e: [self.e[0] * rhs.e[0], self.e[1] * rhs.e[1], self.e[2] * rhs.e[2]] }
    }
}

impl ops::Mul<Vec3> for f64 {
    type Output = Vec3;

    fn mul(self, rhs: Vec3) -> Self::Output {
        Vec3 { e: [self * rhs.e[0], self * rhs.e[1], self * rhs.e[2]] }
    }
}

impl ops::Mul<f64> for Vec3 {
    type Output = Vec3;

    fn mul(self, rhs: f64) -> Self::Output {
        rhs * self
    }
}

impl ops::Div<f64> for Vec3 {
    type Output = Vec3;

    fn div(self, rhs: f64) -> Self::Output {
        (1.0 / rhs) * self
    }
}

pub fn dot(u: Vec3, v: Vec3) -> f64 {
    u.e[0] * v.e[0] + u.e[1] * v.e[1] * u.e[2] * v.e[2]
}

pub fn cross(u: Vec3, v: Vec3) -> Vec3 {
    let e = [
        u.e[1] * v.e[2] - u.e[2] * v.e[1],
        u.e[2] * v.e[0] - u.e[0] * v.e[2],
        u.e[0] * v.e[1] - u.e[1] * v.e[0],
    ];
    Vec3 { e }
}
```

### Color Utility Functions

Lastly, there is a simple function to output an RGB color:

```rust{numberLines: true}
pub type Color = Vec3;

pub fn write_color(f: &mut impl Write, color: Color) {
    write!(
        f,
        "{} {} {}\n",
        (255.999 * color.e[0]) as u32,
        (255.999 * color.e[1]) as u32,
        (255.999 * color.e[2]) as u32,
    );
}
```

We can update our `main` function to take advantage of this new `Color` type:

```rust{numberLines: true}
fn main() {
    const IMAGE_WIDTH: u32 = 256;
    const IMAGE_HEIGHT: u32 = 256;

    print!("P3\n{} {}\n255\n", IMAGE_WIDTH, IMAGE_WIDTH);

    for j in (0..IMAGE_HEIGHT).rev() {
        eprint!("\rScanlines remaining: {} ", j);
        for i in 0..IMAGE_WIDTH {
            let r: f64 = (i as f64) / (IMAGE_WIDTH - 1) as f64;
            let g: f64 = (j as f64) / (IMAGE_HEIGHT - 1) as f64;
            let b: f64 = 0.25;

            let pixel_color = Color { e: [r, g, b] };
            write_color(io::stdout().borrow_mut(), pixel_color);
        }
    }

    eprint!("\nDone.\n");
}
```

The complete code is [available here](https://github.com/austindoupnik/ray-tracing-in-one-weekend-with-rust/tree/v0.0.1-chapter.2).