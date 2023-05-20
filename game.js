class Intro extends Phaser.Scene {
	constructor() {
		super("introScene");
	}
	create() {
		this.title = this.add.text(960, 540, "Just push the button", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5).setAlpha(0);

		// Display the text Click to Play and upon clicking fade the above title into view
		this.clickToPlay = this.add.text(960, 840, "Click to Play", {
			font: "76px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5).setAlpha(1);

		this.input.on('pointerdown', () => {
			if (this.started) return;
			this.started = true;
			this.tweens.add({
				targets: this.title,
				alpha: 1,
				duration: 1500,
				ease: 'Linear',
				yoyo: true,
				onStart: () => {
					this.clickToPlay.destroy();
				},
				onComplete: () => {
					this.scene.start("level1Scene");
				}
			});
		});
	}
}

function loadImages(scene) {
	scene.load.image('player', './circle.png');
	scene.load.image('platform', './platform.png');
	scene.load.image('platformS', './smallPlatform.png');
	scene.load.image('button', './button.png');
	scene.load.image('doorL', './doorLocked.png');
	scene.load.image('doorU', './doorUnlocked.png');
	scene.load.image('buttonU', './ButtonU.png');
}

function run(scene, time, delta) {
	let vel = 0;
	scene.totalTime += delta;
	if (scene.timer == undefined) {
		scene.timerText = scene.add.text(50, 50, (scene.totalTime / 1000).toFixed(2), {
			font: "32px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);

		scene.timer = scene.time.addEvent({
			delay: 10,
			callback: () => {
				scene.timerText.setText((scene.totalTime / 1000).toFixed(1));
			},
			loop: true
		});
	}

	if (scene.aKey.isDown) {
		vel -= 600;
	}
	if (scene.dKey.isDown) {
		vel += 600;
	}
	if (scene.jumpNum == 0 && scene.player.body.velocity.y > 1000) {
		scene.jumpNum = 1;
	}

	scene.player.body.setVelocityX(vel);
}

function resetJumpIfOnTopOfObject(scene, player, object) {
	if (Math.abs(player.body.bottom - object.body.top) < 10) {
		scene.jumpNum = 0;
	}
}

function initPlatforms(scene) {
	scene.platforms = [];
	scene.platforms[0] = scene.physics.add.image(-150, 300, 'platform').setMaxVelocity(0, 0).setImmovable(true);
	scene.platforms[1] = scene.physics.add.image(960, 740, 'platform').setMaxVelocity(0, 0).setImmovable(true);
	scene.platforms[2] = scene.physics.add.image(-400, 1020, 'platform').setMaxVelocity(0, 0).setImmovable(true);
	scene.platforms[3] = scene.physics.add.image(760, 400, 'platformS').setMaxVelocity(0, 0).setImmovable(true);
	for (let i = 0; i < scene.platforms.length; i++) {
		scene.physics.add.collider(scene.player, scene.platforms[i], () => {
			resetJumpIfOnTopOfObject(scene, scene.player, scene.platforms[i]);
		});
	}
}

function initDoor(scene, x, y, image = 'doorL') {
	scene.doorPhantom = scene.add.image(x, y, image).setScale(1.5);
}

function initControls(scene) {
	scene.wKey = scene.input.keyboard.addKey('W');
	scene.aKey = scene.input.keyboard.addKey('A');
	scene.dKey = scene.input.keyboard.addKey('D');
	scene.wKey.addListener('down', () => {
		if (scene.doorUnlocked) {
			// Check if the player is intersecting with the door
			if (scene.wKey.isDown && Phaser.Geom.Intersects.RectangleToRectangle(scene.player.getBounds(), scene.doorPhantom.getBounds()) && scene.jumpNum == 0) {
				scene.scene.start(scene.nextScene, {
					time: scene.totalTime
				});
			}
		}
		if (scene.jumpNum < 2) {
			scene.player.body.setVelocityY(-3000);
			scene.player.setAccelerationY(4000);
			scene.jumpNum++;
		}
	}, scene);
	scene.wKey.addListener('up', () => {
		scene.player.setAccelerationY(8000);
	});
	// If the player will move left or right into the platform, set the horizontal velocity to 0
	// If the player will jump into the platform, set the vertical velocity to 0
	scene.jumpNum = 0;
	// When a onWorldBounds event is triggered, set the boolean on this canJump to true
	scene.physics.world.on('worldbounds', () => {
		if (scene.jumpNum > 0 && 1080 - scene.player.body.position.y < 100) scene.jumpNum = 0;
	});
}

function initButton(scene, x, y, image = 'button') {
	let t = scene.add.image(x, y, image).setScale(1.5);
	scene.button = scene.physics.add.existing(t, true);
	scene.physics.add.collider(scene.player, scene.button, () => {
		scene.buttonIndex++;
		if (scene.buttons == undefined || scene.buttons[scene.buttonIndex] == undefined) {
			scene.button.destroy();
			scene.doorUnlocked = true;
			initDoor(scene, scene.doorPhantom.x, scene.doorPhantom.y, 'doorU');
		} else {
			scene.button.destroy();
			initButton(scene, scene.buttons[scene.buttonIndex].x, scene.buttons[scene.buttonIndex].y);
			// also set rotation here for the button at some point
		}
	});
}

function initPlayer(scene) {
	scene.player = scene.physics.add.image(100, 100, 'player').setScale(2).setGravityY(0).setMaxVelocity(1250, 1250).setVelocityY(1250).setAccelerationY(4000);
	scene.player.setCollideWorldBounds(true, 0, 0, true);
}

class Level1 extends Phaser.Scene {
	constructor() {
		super("level1Scene");
	}
	preload() {
		loadImages(this);
	}

	create() {
		this.doorUnlocked = false;
		this.nextScene = "level2Scene";
		this.add.text(960, 540, "Level 1", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		this.totalTime = 0;
		initPlayer(this);
		initPlatforms(this);
		initDoor(this, 1850, 1015);
		initButton(this, 900, 1047);
		initControls(this);
	}

	update(time, delta) {
		run(this, time, delta);
	}
}

// Create level 2 the same way as level 1 except instead of stepping on the button, you need to step on the door and exit through the button

class Level2 extends Phaser.Scene {
	constructor() {
		super("level2Scene");
	}
	preload() {
		loadImages(this);
	}

	create(data) {
		this.doorUnlocked = false;
		this.nextScene = "level3Scene";
		this.add.text(960, 540, "Level 2", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		initPlayer(this);
		initPlatforms(this);
		initControls(this);
		this.button = this.physics.add.staticImage(1850, 1015, 'doorL').setScale(1.5);
		this.totalTime = data.time;
		this.physics.add.collider(this.player, this.button, () => {
			this.button.destroy();
			this.doorUnlocked = true;
			this.doorPhantom.destroy();
			this.doorPhantom = this.add.image(900, 1047, 'buttonU').setScale(1.5);
		});
		this.doorPhantom = this.add.image(900, 1047, 'button').setScale(1.5);
	}

	update(time, delta) {
		run(this, time, delta);
	}
}

class Level3 extends Phaser.Scene {
	constructor() {
		super("level3Scene");
	}
	preload() {
		loadImages(this);
	}

	create(data) {
		this.doorUnlocked = false;
		this.nextScene = "endScene";
		this.buttonIndex = 0;
		this.buttons = [
			{
				x: 900,
				y: 1047
			},
			{
				x: 1350,
				y: 640
			},
			{
				x: 100,
				y: 200
			},
		]
		this.add.text(960, 540, "Level 3", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		this.totalTime = data.time;
		initPlayer(this);
		initPlatforms(this);
		initDoor(this, 1850, 1015);
		initButton(this, this.buttons[0].x, this.buttons[0].y);
		initControls(this);
	}

	update(time, delta) {
		run(this, time, delta);
	}
}

class End extends Phaser.Scene {
	constructor() {
		super("endScene");
	}
	preload() {
		loadImages(this);
	}

	create(data) {
		this.add.text(960, 540, "You win!", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		this.add.text(960, 640, "Thanks for playing!\n    Your time:" + (data.time / 1000).toFixed(1), {
			font: "48px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		this.add.text(960, 740, "Made by: David Markowitz", {
			font: "48px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		this.input.keyboard.on('keydown', () => {
			this.scene.start("introScene");
		});
	}
}

const game = new Phaser.Game({
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1920,
		height: 1080
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: [Intro, Level1, Level2, Level3, End],
	title: "Just push the button",
});
