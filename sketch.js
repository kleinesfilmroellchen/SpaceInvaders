//how many frames it takes to move a space invader
let MOVE_INTERVAL = 30;
//how many frames between invader's shots
const SHOT_PAUSE = 600;

const scale = 3;

let invaders = [];
let bullets = [],
	invaderBullets = [];
let player;

let invaderImg, spaceshipImg, bulletImg, barrierImg;

let frameCount = 0;

let invaderSpeed = 1;

function preload() {
	invaderImg = loadImage("invader.png");
	spaceshipImg = loadImage("spaceship.png");
	bulletImg = loadImage("bullet.png");
}

function setup() {
	createCanvas(windowWidth - 100, windowHeight - 100);
	noSmooth();

	//create barrier image
	barrierImg = createImage(1, 1);
	barrierImg.set(0, 0, color(255, 0, 255));

	//create invaders
	let invWidth = scale * invaderImg.width,
		invHeight = scale * invaderImg.height;

	let x = scale,
		y = scale;
	for (let i = 0; i < 20; ++i) {
		x += scale * 2 + invWidth;
		if (x >= width - invWidth * 3) {
			y += scale * 2 + invHeight;
			x = scale;
		}
		invaders.push(new Invader(x, y, invWidth, invHeight, invaderImg));
	}

	//create player
	player = new Player(width / 2, height - spaceshipImg.height * scale, spaceshipImg.width * scale, spaceshipImg.height * scale, spaceshipImg);

}

function draw() {

	frameCount++;

	//logic
	if (keyIsDown(LEFT_ARROW)) {
		player.move(-scale);
	} else if (keyIsDown(RIGHT_ARROW)) {
		player.move(scale);
	}
	player.update();

	for (let bullet of invaderBullets) {
		bullet.update(frameCount);
		if (player.intersects(bullet)) {
			gameOver();
		}
	}

	for (let invader of invaders) {
		invader.update(frameCount);
		bullets.forEach(bullet => {
			if (bullet.intersects(invader)) {
				MOVE_INTERVAL--;
				bullet.deadMarked = true;
				invader.deadMarked = true;
			}
		});
	}
	for (let bullet of bullets) {
		bullet.update(frameCount);
	}
	if (invaders.some(invader => invader.right() >= width || invader.left() <= 0))
		invaders.forEach(invader => {
			invader.pos.add(p5.Vector.mult(invader.vel, -1));
			invader.pos.y += scale;
			invader.vel.x = -invader.vel.x;
		});

	//deletion of bullets and invaders
	bullets = bullets.filter(bullet => !bullet.deadMarked && bullet.lower() >= 0);
	invaderBullets = invaderBullets.filter(bullet => bullet.upper() <= height);
	invaders = invaders.filter(invader => !invader.deadMarked);

	//draw
	background(0);

	for (let invader of invaders) {
		invader.draw();
	}
	for (let bullet of bullets) {
		bullet.draw();
	}
	for (let bullet of invaderBullets) {
		bullet.draw();
	}
	player.draw();
}

function keyPressed() {
	if (keyCode === UP_ARROW) {
		player.shoot();
	}
}

function createBullet(x, y) {
	bulletPrefab = new Sprite(x, y, bulletImg.width * scale, bulletImg.height * scale, bulletImg);
	bulletPrefab.vel = createVector(0, -scale);
	bulletPrefab.deadMarked = false;
	bulletPrefab.update = function updateBullet(frameCount) {
		this.pos.add(this.vel);
	}
	return bulletPrefab;
}

function gameOver() {
	console.log("GAME OVER");
	invaders = [];
	bullets = [];
	invaderBullets = [];
	player.pos.x = width / 2;

	setup();
}

const sign = n => n > 0 ? 1 : n === 0 ? 0 : -1;
