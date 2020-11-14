---
title: 'Ch 3. Bounding Volume Hierarchies'
series:
    title: 'Ray Tracing: The Next Week'
    part: 2
date: '2020-11-07T16:44:21+00:00'
tags:
    - 'rust'
    - 'ray tracing'
---

As we add more features to our ray tracer, create more complex scenes, and render higher qualities we have been seeing render times increase by quite a bit.

Let's quickly look at the performance of the results of the last chapter.
As a reminder we are rendering a 400x225 image with 100 samples per pixel, and on the order of 100 objects in the scene:

```shell{outputLines: 2-10}
time cargo run --release > /dev/null 
   Compiling ray-tracing-in-one-weekend-with-rust v0.1.0 (/home/austind/Documents/github.com/austindoupnik/ray-tracing-in-one-weekend-with-rust)
    Finished release [optimized] target(s) in 1.02s
     Running `target/release/ray-tracing-in-one-weekend-with-rust`
Scanlines remaining: 0
Done.

real    2m58.615s
user    2m56.539s
sys     0m0.362s
```

We are looking at nearly 3 minutes to render a relatively low quality and simple scene, it's certainly irritating to wait for the render during testing.
Let's see what we can do to improve this.

The first thing to do when optimizing anything is to profile, luckily `perf` is a pretty straightforward tool to use when profiling on Linux.

```shell{outputLines: 2-10, 12-20}
cargo build --release
   Compiling libc v0.2.79
   Compiling getrandom v0.1.15
   Compiling cfg-if v0.1.10
   Compiling ppv-lite86 v0.2.9
   Compiling rand_core v0.5.1
   Compiling rand_chacha v0.2.2
   Compiling rand v0.7.3
   Compiling ray-tracing-in-one-weekend-with-rust v0.1.0 (/home/austind/Documents/github.com/austindoupnik/ray-tracing-in-one-weekend-with-rust)
    Finished release [optimized] target(s) in 4.76s
sudo perf record --call-graph=dwarf ./target/release/ray-tracing-in-one-weekend-with-rust > /dev/null 
Scanlines remaining: 0   
Done.
[ perf record: Woken up 20989 times to write data ]
Warning:
Processed 673927 events and lost 4 chunks!

Check IO/CPU overload!

[ perf record: Captured and wrote 5247.412 MB perf.data (651945 samples) ]
```

Unsurprisingly the report shows that the entire time has been spent in the `hit` functions:

```shell{outputLines: 2-39}
sudo perf report --hierarchy --percent-limit 2 --max-stack 2 --stdio
Warning:
Processed 673927 events and lost 4 chunks!

Check IO/CPU overload!

# To display the perf.data header info, please use --header/--header-only options.
#
#
# Total Lost Samples: 0
#
# Samples: 651K of event 'cycles'
# Event count (approx.): 453611034614
#
#       Overhead  Command / Shared Object / Symbol
# ..............  ..............................................................................................................................................
#
   100.00%        ray-tracing-in-
       99.53%        ray-tracing-in-one-weekend-with-rust
          63.59%        [.] <ray_tracing_in_one_weekend_with_rust::moving_sphere::MovingSphere as ray_tracing_in_one_weekend_with_rust::hittable::Hittable>::hit
            |          
             --55.81%--<ray_tracing_in_one_weekend_with_rust::hittable_list::HittableList as ray_tracing_in_one_weekend_with_rust::hittable::Hittable>::hit
                       <ray_tracing_in_one_weekend_with_rust::moving_sphere::MovingSphere as ray_tracing_in_one_weekend_with_rust::hittable::Hittable>::hit

          18.08%        [.] <ray_tracing_in_one_weekend_with_rust::hittable_list::HittableList as ray_tracing_in_one_weekend_with_rust::hittable::Hittable>::hit
            |          
             --18.04%--ray_tracing_in_one_weekend_with_rust::ray_color
                       <ray_tracing_in_one_weekend_with_rust::hittable_list::HittableList as ray_tracing_in_one_weekend_with_rust::hittable::Hittable>::hit

          16.44%        [.] <ray_tracing_in_one_weekend_with_rust::sphere::Sphere as ray_tracing_in_one_weekend_with_rust::hittable::Hittable>::hit
            |          
             --13.73%--<ray_tracing_in_one_weekend_with_rust::hittable_list::HittableList as ray_tracing_in_one_weekend_with_rust::hittable::Hittable>::hit
                       <ray_tracing_in_one_weekend_with_rust::sphere::Sphere as ray_tracing_in_one_weekend_with_rust::hittable::Hittable>::hit



#
# (Cannot load tips.txt file, please install perf!)
#
```

### The Key Idea

As we saw the entire time has been spent testing for if our ray has hit an object.
This is unsurprising because we are currently doing a linear search through our objects for each ray to see if the ray intersects with any object.
To improve this we can subdivide the objects, sorting them by position, to perform a sublinear search.

### Hierarchies of Bounding Volumes

We will build a binary search tree of volumes containing our objects, allowing us to perform cheaper and less `hit` checks to find our object.

### Axis-Aligned Bounding Boxes (AABBs)

Please refer to [the source material](https://raytracing.github.io/books/RayTracingTheNextWeek.html#boundingvolumehierarchies/axis-alignedboundingboxes(aabbs)).

### Ray Intersection with an AABB

Let's start by defining our AABB:

```rust{numberLines: true}
pub struct Aabb {
    pub minimum: Point3,
    pub maximum: Point3,
}

impl Aabb {
    pub fn new(minimum: Point3, maximum: Point3) -> Aabb {
        Aabb {
            minimum,
            maximum,
        }
    }

    pub fn min(&self) -> Point3 {
        self.minimum
    }

    pub fn max(&self) -> Point3 {
        self.maximum
    }

    pub fn hit(&self, r: &Ray, t_min: f64, t_max: f64) -> bool {
        for a in 0..3 {
            let t0 = f64::min(
                (self.minimum[a] - r.origin()[a]) / r.direction()[a],
                (self.maximum[a] - r.origin()[a]) / r.direction()[a],
            );

            let t1 = f64::max(
                (self.minimum[a] - r.origin()[a]) / r.direction()[a],
                (self.maximum[a] - r.origin()[a]) / r.direction()[a],
            );

            if f64::min(t1, t_max) <= f64::max(t0, t_min) {
                return false;
            }
        }

        true
    }

    pub fn surrounding_box(box0: &Aabb, box1: &Aabb) -> Aabb {
        let small = Point3::new(
            f64::min(box0.min().x(), box1.min().x()),
            f64::min(box0.min().y(), box1.min().y()),
            f64::min(box0.min().z(), box1.min().z()),
        );

        let big = Point3::new(
            f64::max(box0.max().x(), box1.max().x()),
            f64::max(box0.max().y(), box1.max().y()),
            f64::max(box0.max().z(), box1.max().z()),
        );

        Aabb::new(small, big)
    }
}
```

### An Optimized AABB Hit Method

Next we are presented with an optimized hit function, we should revisit this in the future as the code generated by rust might not be ideal:

```rust{numberLines: true}
    pub fn hit(&self, r: &Ray, t_min: f64, t_max: f64) -> bool {
        for a in 0..3 {
            let inv_d = 1.0 / r.direction()[a];
            let mut t0 = (self.min()[a] - r.origin()[a]) * inv_d;
            let mut t1 = (self.max()[a] - r.origin()[a]) * inv_d;
            if inv_d < 0.0 {
                std::mem::swap(&mut t0, &mut t1);
            }

            let t_min = if t0 > t_min {
                t0
            } else {
                t_min
            };

            let t_max = if t1 < t_max {
                t1
            } else {
                t_max
            };

            if t_max <= t_min {
                return false;
            }
        }

        true
    }
```

### Construction Bounding Boxes for Hittables

Next we must add the ability to calculate the AABB around any of our given `Hittable` types:

```rust{numberLines: true}
pub trait Hittable {
    fn hit(&self, r: &Ray, t_min: f64, t_max: f64, rec: &mut HitRecord) -> bool;

    fn bounding_box(&self, time0: f64, time1: f64, output_box: &mut Aabb) -> bool; // highlight-line
}
```

First the `Sphere`:

```rust{numberLines: true}
    fn bounding_box(&self, _time0: f64, _time1: f64, output_box: &mut Aabb) -> bool {
        *output_box = Aabb::new(
          self.center - Vec3::new(self.radius, self.radius, self.radius),
          self.center + Vec3::new(self.radius, self.radius, self.radius),
        );

        true
    }
```

Then `MovingSphere`:

```rust{numberLines: true}
    fn bounding_box(&self, time0: f64, time1: f64, output_box: &mut Aabb) -> bool {
        let box0 = Aabb::new(
            self.center(time0) - Vec3::new(self.radius, self.radius, self.radius),
            self.center(time0) + Vec3::new(self.radius, self.radius, self.radius),
        );

        let box1 = Aabb::new(
            self.center(time1) - Vec3::new(self.radius, self.radius, self.radius),
            self.center(time1) + Vec3::new(self.radius, self.radius, self.radius),
        );

        *output_box = Aabb::surrounding_box(&box0, &box1);

        true
    }
```

### Creating Bounding Boxes of Lists of Objects

We handle `HittableList` by merging sub-AABBs:

```rust{numberLines: true}
    fn bounding_box(&self, time0: f64, time1: f64, output_box: &mut Aabb) -> bool {
        if self.objects.is_empty() {
            return false
        }

        let mut first_box = true;
        for object in self.objects.as_slice() {
            let mut temp_box = Aabb::new(Point3::new(0.0, 0.0, 0.0), Point3::new(0.0, 0.0, 0.0));
            if !object.bounding_box(time0, time1, &mut temp_box) {
                return false
            }

            *output_box = if first_box {
                temp_box
            } else {
                Aabb::surrounding_box(output_box, &temp_box)
            };
            first_box = false;
        }

        true
    }
```

### The BVH Node Class

Finally, we get to the focus of the chapter, defining our `BvhNode`.
We start with a `Hittable` implementation for our `BvhNode`:

```rust{numberLines: true}
pub struct BvhNode {
    pub left: Rc<dyn Hittable>,
    pub right: Rc<dyn Hittable>,
    pub bounding_box: Aabb,
}

impl Hittable for BvhNode {
    fn hit(&self, r: &Ray, t_min: f64, t_max: f64, rec: &mut HitRecord) -> bool {
        if !self.bounding_box.hit(r, t_min, t_max) {
            return false;
        }

        let hit_left = self.left.hit(r, t_min, t_max, rec);
        let t_max = if hit_left {
            rec.t
        } else {
            t_max
        };

        let hit_right = self.right.hit(r, t_min, t_max, rec);

        hit_left || hit_right
    }

    fn bounding_box(&self, _time0: f64, _time1: f64, output_box: &mut Aabb) -> bool {
        *output_box = Aabb::new(self.bounding_box.min(), self.bounding_box.max());
        true
    }
}
```

### Splitting BVH Volumes

This is where the majority of the logic lives, we will be writing a constructor that takes a list of objects and splits them into a tree of `BvhNode`:

```rust{numberLines: true}
impl BvhNode {
    pub fn new(
        objects: &mut Vec<Rc<dyn Hittable>>,
        start: usize,
        end: usize,
        time0: f64,
        time1: f64,
    ) -> BvhNode {
        let axis = random_usize_in_range(0, 3);

        let comparator = match axis {
            0 => box_x_compare,
            1 => box_y_compare,
            2 => box_z_compare,
            _ => panic!("Undefined axis: {}", axis)
        };

        let object_span = end - start;
        let (left, right) = if object_span == 1 {
            (objects[start].clone(), objects[start].clone())
        } else if object_span == 2 {
            if comparator(&objects[start], &objects[start + 1]) == Ordering::Less {
                (objects[start].clone(), objects[start + 1].clone())
            } else {
                (objects[start + 1].clone(), objects[start].clone())
            }
        } else {
            objects[start..end].sort_by(comparator);

            let mid = start + object_span / 2.0 as usize;
            let left: Rc<dyn Hittable> = Rc::new(BvhNode::new(objects, start, mid, time0, time1));
            let right: Rc<dyn Hittable> = Rc::new(BvhNode::new(objects, mid, end, time0, time1));
            (left, right)
        };

        let mut box_left = Aabb::new(Point3::new(0.0, 0.0, 0.0), Point3::new(0.0, 0.0, 0.0));
        let mut box_right = Aabb::new(Point3::new(0.0, 0.0, 0.0), Point3::new(0.0, 0.0, 0.0));

        if !left.bounding_box(time0, time1, &mut box_left) || !right.bounding_box(time0, time1, &mut box_right) {
            eprintln!("No bounding box in bvh_node constructor.")
        }

        BvhNode {
            left,
            right,
            bounding_box: Aabb::surrounding_box(&box_left, &box_right)
        }
    }
}
```

### The Box Comparison Functions

In the future I should revisit this section, as I believe there is a simpler implementation, but for now I will mirror the original implementation:

```rust{numberLines: true}
fn box_compare(a: &Rc<dyn Hittable>, b: &Rc<dyn Hittable>, axis: usize) -> std::cmp::Ordering {
    let mut box_a = Aabb::new(Point3::new(0.0, 0.0, 0.0), Point3::new(0.0, 0.0, 0.0));
    let mut box_b = Aabb::new(Point3::new(0.0, 0.0, 0.0), Point3::new(0.0, 0.0, 0.0));

    if !a.bounding_box(0.0, 0.0, &mut box_a) || !b.bounding_box(0.0, 0.0, &mut box_b) {
        eprintln!("No bounding box in bvh_node constructor.")
    }

    box_a.min()[axis].partial_cmp(&box_b.min()[axis]).unwrap()
}

fn box_x_compare(a: &Rc<dyn Hittable>, b: &Rc<dyn Hittable>) -> std::cmp::Ordering {
    box_compare(a, b, 0)
}

fn box_y_compare(a: &Rc<dyn Hittable>, b: &Rc<dyn Hittable>) -> std::cmp::Ordering {
    box_compare(a, b, 1)
}

fn box_z_compare(a: &Rc<dyn Hittable>, b: &Rc<dyn Hittable>) -> std::cmp::Ordering {
    box_compare(a, b, 2)
}
```

### Using our BvhNode

Let's use our `BvhNode` with our current scene.
To do this we first build a list of our objects, pass this list to our `BvhNode` constructor, then create a `HittableList` containing our single `BvhNode`:

```rust{numberLines: true}
fn random_scene() -> HittableList {
    let mut objects: Vec<Rc<dyn Hittable>> = Vec::new(); // highligh-line

    let ground_material = Lambertian::new(Color::new(0.5, 0.5, 0.5));
    objects.push(Rc::new(Sphere::new(Point3::new(0.0, -1000.0, 0.0), 1000.0, Rc::new(ground_material)))); // highligh-line

    for a in -11..11 {
        for b in -11..11 {
            let choose_mat = random();
            let center = Point3::new(a as f64 + 0.9 * random(), 0.2, b as f64 + 0.9 * random());

            if (center - Point3::new(4.0, 0.2, 0.0)).length() > 0.9 {
                if choose_mat < 0.8 {
                    let albedo = Color::random() * Color::random();
                    let sphere_material = Rc::new(Lambertian::new(albedo));
                    let center1 = center + Vec3::new(0.0, random_in_range(0.0, 0.5), 0.0);
                    objects.push(Rc::new(MovingSphere::new(center, center1, 0.0, 1.0, 0.2, sphere_material.clone()))); // highligh-line
                } else if choose_mat < 0.95 {
                    let albedo = Color::random_in_range(0.5, 1.0);
                    let fuzz = random_in_range(0.0, 0.5);
                    let sphere_material = Rc::new(Metal::new(albedo, fuzz));
                    objects.push(Rc::new(Sphere::new(center, 0.2, sphere_material.clone()))); // highligh-line
                } else {
                    let sphere_material = Rc::new(Dielectric::new(1.5));
                    objects.push(Rc::new(Sphere::new(center, 0.2, sphere_material.clone()))); // highligh-line
                }
            }
        }
    }

    let material1 = Dielectric::new(1.5);
    objects.push(Rc::new(Sphere::new(Point3::new(0.0, 1.0, 0.0), 1.0, Rc::new(material1)))); // highligh-line

    let material2 = Lambertian::new(Color::new(0.4, 0.2, 0.1));
    objects.push(Rc::new(Sphere::new(Point3::new(-4.0, 1.0, 0.0), 1.0, Rc::new(material2)))); // highligh-line

    let material3 = Metal::new(Color::new(0.7, 0.6, 0.5), 0.0);
    objects.push(Rc::new(Sphere::new(Point3::new(4.0, 1.0, 0.0), 1.0, Rc::new(material3)))); // highligh-line

    let end = objects.len(); // highligh-line
    let bvh_node = BvhNode::new( // highligh-line
        &mut objects, // highligh-line
        0, // highligh-line
        end, // highligh-line
        0.0, // highligh-line
        1.0 // highligh-line
    ); // highligh-line

    let mut world = HittableList::new(); // highligh-line
    world.add(Rc::new(bvh_node)); // highligh-line

    world
}
```

Let's see how performance looks now:

```shell{outputLines: 2-8}
time cargo run --release > /dev/null 
    Finished release [optimized] target(s) in 0.02s
     Running `target/release/ray-tracing-in-one-weekend-with-rust`
Scanlines remaining: 0   
Done.

real    1m30.482s
user    1m30.404s
sys     0m0.070s
```

An improvement of about 2x, not bad!

The complete code is [available here](https://github.com/austindoupnik/ray-tracing-in-one-weekend-with-rust/tree/v0.0.1-the-next-week-chapter.3).

