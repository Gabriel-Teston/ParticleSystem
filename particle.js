class Particle {
    constructor(pos, r=2, mass=1, vel=createVector(0, 0), data=null) {
        this.pos = pos;
        this.r = r;
        this.mass = mass;
        this.vel = vel;
        this.data = data;
    }

    apply(dt, f) {
        let acc = f.div(this.mass);
        this.vel.add(acc.mult(dt/10));
    }

    update(qtree, dt, min_x, min_y, max_x, max_y) {
        let dir = this.vel.normalize()
        let pos = p5.Vector.add(this.pos, dir.mult(this.vel.mag() * dt/10));

        pos = this.check_collision(qtree, pos, dir);

        if (pos.x - this.r <= min_x) {
            pos.x = min_x + this.r;
            this.vel.x = -this.vel.x;
        }
        if (pos.y - this.r <= min_y) {
            pos.y = min_y + this.r;
            this.vel.y = -this.vel.y;
        }
        if (pos.x + this.r >= max_x) {
            pos.x = max_x - this.r;
            this.vel.x = -this.vel.x;
        }
        if (pos.y + this.r >= max_y) {
            pos.y = max_y - this.r;
            this.vel.y = -this.vel.y;
        }
        this.pos.set(pos);

        qtree.push(new Boundary(this.pos.x, this.pos.y, this.r, this.r, this));
    }

    check_collision(qtree, pos, dir) {
        let querry = new Boundary(pos.x, pos.y, this.r, this.r);
        let result = qtree.querry(querry);
        
        let checked = [];
        let closest = null;
        let closest_dist = null;

        for (const point of result) {
            let other = point.data;
            let other_dist = p5.Vector.sub(this.pos, other.pos).mag();
            if (checked.includes(other)) continue;
            checked.push(other);

            if (other != this && other_dist <= this.r + other.r) {
                if(!closest || other_dist < closest_dist) {
                    closest = other;
                    closest_dist = other_dist;
                }
            }
        }

        if (closest){
            pos = p5.Vector.add(closest.pos, 
                p5.Vector.sub(this.pos, closest.pos).normalize().mult(this.r + closest.r + 1));

            // https://en.wikipedia.org/wiki/Elastic_collision
            let r1 = p5.Vector.sub(pos, closest.pos);
            let r2 = p5.Vector.sub(closest.pos, pos);
            let m = (2 * closest.mass)/(this.mass + closest.mass);
            let u1 = r1.normalize();
            let u2 = r2.normalize();
            let d1 = p5.Vector.sub(this.vel, closest.vel).dot(r1);
            let d2 = p5.Vector.sub(closest.vel, this.vel).dot(r2);

            this.vel.sub(u1.mult(m*d1));

            closest.vel.sub(u2.mult(m*d2));
        }
        return pos
    }
}
