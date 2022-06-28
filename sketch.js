let width = 400;
let height = 400;

let qtree;
let particles = [];

let r = 2;

function draw_quadtree(qtree){
    let x = qtree.boundary.x - qtree.boundary.w;
    let y = qtree.boundary.y - qtree.boundary.h;
    let w = qtree.boundary.w * 2;
    let h = qtree.boundary.h * 2;

    rect(x, y, w, h);

    if (qtree.subdivided) {
        for (const sub_tree of qtree.sub_trees) {
            draw_quadtree(sub_tree);
        }
    }
}

function update_particles() {
    let boundary = new Boundary(width/2, height/2, width/2, height/2);
    qtree = new Quadtree(boundary);

    // Shuffle particles by size
    // Help collision detection
    particles = particles.sort((a, b) => {return random(-1, 1) * (a.r - b.r);});

    for (const particle of particles) {
        particle.update(qtree, deltaTime, 0, 0, width, height);
    }
}

function draw_particles() {
    for (const particle of particles) {
        let x = particle.pos.x;
        let y = particle.pos.y;
        let r = particle.r;
        circle(x, y, r * 2);
    }
}

function setup() {
    createCanvas(width, height);
}

function draw() {
    noFill();
    background(220);
    let momentum = 0;
    for (const particle of particles) {
        momentum += particle.mass * particle.vel.mag();
    }
    stroke(0, 0, 128);
    text('Particles: ' + particles.length + ' Momentum: ' + round(momentum), 10, 20);
    if (mouseIsPressed && deltaTime > 15) {
        let x = mouseX;
        let y = mouseY;
        let rr = r + random(-2, 2);
        let pos = createVector(x, y);
        let vel = createVector(random(-1, 1), random(-1, 1));
        let particle = new Particle(pos, rr, rr, vel);
        particles.push(particle);
    }

    for (const particle of particles) {
        let r1 = createVector(mouseX, mouseY).sub(particle.pos);
        let f1 = r1.normalize().mult(r1.magSq() * 0.4);

        particle.apply(deltaTime, f1);
    }

    update_particles();

    stroke(128);
    draw_quadtree(qtree);

    stroke(0);
    draw_particles();

    let x = mouseX;
    let y = mouseY;
    let querry = new Boundary(x, y, r, r);
    let result = qtree.querry(querry);
    result = result.filter((point) => {
        return createVector(x - point.x, y - point.y).mag() <= (r + point.data.r)
    });

    if (result.length > 0) {
        stroke(128, 0, 0);
    }
    else {
        stroke(0, 128, 0);
    }
    circle(x, y, r * 2);
    for (const point of result) {
        circle(point.x, point.y, point.data.r * 2);
    }
}

function mouseWheel(event) {
    r -= event.delta * 0.05;
    r = min(max(2, r), 40);
}
