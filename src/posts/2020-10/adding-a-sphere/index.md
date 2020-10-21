---
title: 'Ch 5. Adding a Sphere'
series:
    title: 'Ray Tracing in One Weekend with Rust'
    part: 4
date: '2020-10-20'
tags:
    - 'rust'
    - 'ray tracing'
---

Last time around we added rays and a simple camera, this time we will be [adding a sphere](https://raytracing.github.io/books/RayTracingInOneWeekend.html#addingasphere) to our scene for the rays to interact with.

### Ray-Sphere Intersection

We start off with a bit of algebra to determine at which $$t$$ our ray with defined by $$P(t) = A + tb$$ will intersect the sphere.
If you don't like algebra much or just don't care, you can safely skip to [the next section](#creating-our-first-raytraced-image) and be just fine.
Beginning with the [analytic geometry equation](https://en.wikipedia.org/wiki/Sphere#Equations_in_three-dimensional_space) defining a sphere at a given center $$C=(x_0, y_0, z_0)$$ and radius $$r$$ we have:

$$
\begin{aligned}
(x - x_0)^2 + (y - y_0)^2 + (z - z_0)^2 &= r^2 \\
(P_x - C_x)^2 + (P_y - C_y)^2 + (P_z - C_z)^2 &= r^2 \\
(P - C) \cdot (P - C) &= r^2 \\
(P(t) - C) \cdot (P(t) - C) &= r^2 \\
(A + tb - C) \cdot (A + tb - C) &= r^2 \\
\end{aligned}
$$

We can then rearrange the equation into something a bit more familiar through some manipulation:

$$
\begin{aligned}
(A + tb - C) \cdot (A + tb - C) &= r^2 \\
(A + tb - C) \cdot A + (A + tb - C) \cdot tb - (A + tb - C) \cdot C &= r^2 \\
A \cdot A + tb \cdot A - C \cdot A + A \cdot tb + tb \cdot tb - C \cdot tb - A \cdot C - tb \cdot C + C \cdot C &= r^2 \\
[A \cdot A - C \cdot A - A \cdot C + C \cdot C] + [tb \cdot A + A \cdot tb - C \cdot tb - tb \cdot C] + [tb \cdot tb] &= r^2 \\
(A - C) \cdot (A - C) + 2tb \cdot (A - C) + t^2b \cdot b &= r^2 \\
t^2b \cdot b + 2tb \cdot (A - C) + (A - C) \cdot (A - C) &= r^2 \\
t^2b \cdot b + 2tb \cdot (A - C) + (A - C) \cdot (A - C) - r^2 &= 0 \\
[b \cdot b]t^2 + [2b \cdot (A - C)]t + (A - C) \cdot (A - C) - r^2 &= 0 \\
\end{aligned}
$$

In this form it is easier to see that we have a quadratic equation, where we can apply some rules from the [quadratic formula](https://en.wikipedia.org/wiki/Quadratic_formula).
_Note_: We use $$b'$$ to avoid conflict with $$b$$ used in the ray equation.

$$
\begin{aligned}
a &= b \cdot b \\
b' &= 2b \cdot (A - C) \\
c &= (A - C) \cdot (A - C) - r^2 \\
\end{aligned}
$$

From here we can use the [discriminant](https://en.wikipedia.org/wiki/Discriminant) to determine the number of solutions to our equation.

> Algebraically, this means that $$\sqrt{b^2 - 4ac} = 0$$, or simply $$b^2 - 4ac = 0$$ (where the left-hand side is referred to as the discriminant).
> This is one of three cases, where the discriminant indicates how many zeros the parabola will have.
> If the discriminant is positive, the distance would be non-zero, and there will be two solutions.

[_Wikipedia_](https://en.wikipedia.org/wiki/Quadratic_formula#Geometric_significance)

There are three cases to consider:

- The discriminant is negative: There are no solutions, meaning the ray does not intersect the sphere.
- The discriminant is zero: There is one solution, meaning the ray intersects the sphere at one point (is tangential).
- The discriminant is positive: There are two solutions, meaning the ray intersects the sphere at two points (passes through).

Based on this we know that if the discriminant is non-negative it intersects the sphere.

### Creating Our First Raytraced Image

After all that math we are left with some relatively straightforward code:

```rust{numberLines: true}
fn hit_sphere(center: &Point3, radius: f64, r: &Ray) -> bool { // highlight-line
    let oc = r.origin() - *center; // highlight-line
    let a = dot(r.direction(), r.direction()); // highlight-line
    let b = 2.0 * dot(oc, r.direction()); // highlight-line
    let c = dot(oc, oc) - radius * radius; // highlight-line
    let discriminant = b * b - 4.0 * a * c; // highlight-line
    return discriminant > 0.0; // highlight-line
} // highlight-line

fn ray_color(r: &Ray) -> Color {
    if hit_sphere(&Point3 { e: [0.0, 0.0, -1.0] }, 0.5, r) { // highlight-line
        return Color { e: [1.0, 0.0, 0.0] }; // highlight-line
    } // highlight-line

    let unit_direction = unit_vector(r.direction());
    let t = 0.5 * (unit_direction.y() + 1.0);
    (1.0 - t) * Color { e: [1.0, 1.0, 1.0] } + t * Color { e: [0.5, 0.7, 1.0] }
}
```

This results in:

![A simple red sphere](./image.png "A simple red sphere")

The complete code is [available here](https://github.com/austindoupnik/ray-tracing-in-one-weekend-with-rust/tree/v0.0.1-chapter.5).