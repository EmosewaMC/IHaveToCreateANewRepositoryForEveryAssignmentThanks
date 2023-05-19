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

function run(scene) {
	let vel = 0;

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
	scene.platform = scene.physics.add.image(200, 500, 'player').setMaxVelocity(0, 0).setImmovable(true);
	scene.platform2 = scene.physics.add.image(600, 800, 'player').setMaxVelocity(0, 0).setImmovable(true);
	scene.physics.add.collider(scene.player, scene.platform, () => {
		resetJumpIfOnTopOfObject(scene, scene.player, scene.platform);
	});
	scene.physics.add.collider(scene.player, scene.platform2, () => {
		resetJumpIfOnTopOfObject(scene, scene.player, scene.platform2);
	});
}

function initDoor(scene, x, y) {
	scene.doorPhantom = scene.add.image(x, y, 'player');
}

function initControls(scene) {
	scene.wKey = scene.input.keyboard.addKey('W');
	scene.aKey = scene.input.keyboard.addKey('A');
	scene.dKey = scene.input.keyboard.addKey('D');
	scene.wKey.addListener('down', () => {
		if (scene.doorUnlocked) {
			// Check if the player is intersecting with the door
			if (scene.wKey.isDown && Phaser.Geom.Intersects.RectangleToRectangle(scene.player.getBounds(), scene.doorPhantom.getBounds()) && scene.jumpNum == 0) {
				scene.scene.start(scene.nextScene);
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
		if (scene.jumpNum > 0) scene.jumpNum = 0;
	});
}

function initButton(scene, x, y) {
	scene.button = scene.physics.add.staticImage(x, y, 'player');
	scene.physics.add.collider(scene.player, scene.button, () => {
		scene.buttonIndex++;
		if (scene.buttons == undefined || scene.buttons[scene.buttonIndex] == undefined) {
			scene.button.destroy();
			scene.doorUnlocked = true;
		} else {
			scene.button.destroy();
			initButton(scene, scene.buttons[scene.buttonIndex].x, scene.buttons[scene.buttonIndex].y);
			// also set rotation here for the button at some point
		}
	});
}

function initPlayer(scene) {
	scene.player = scene.physics.add.image(100, 100, 'player').setGravityY(0).setMaxVelocity(1250, 1250).setVelocityY(1250).setAccelerationY(4000);
	scene.player.setCollideWorldBounds(true, 0, 0, true);
}

class Level1 extends Phaser.Scene {
	constructor() {
		super("level1Scene");
	}
	preload() {
		// Load in the background
		this.load.image('player', './circle.png');
	}

	create() {
		this.doorUnlocked = false;
		this.nextScene = "level2Scene";
		this.add.text(960, 540, "Level 1", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		// Create a player which is just a circle
		initPlayer(this);
		initPlatforms(this);
		initDoor(this, 1800, 950);
		initButton(this, 100, 1000);
		initControls(this);
	}

	update() {
		run(this);
	}
}

// Create level 2 the same way as level 1 except instead of stepping on the button, you need to step on the door and exit through the button

class Level2 extends Phaser.Scene {
	constructor() {
		super("level2Scene");
	}
	preload() {
		// Load in the background
		this.load.image('player', './circle.png');
	}

	create() {
		this.doorUnlocked = false;
		this.nextScene = "level3Scene";
		this.add.text(960, 540, "Level 2", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		// Create a player which is just a circle
		initPlayer(this);
		initPlatforms(this);
		initDoor(this, 100, 1000);
		initButton(this, 1800, 950);
		initControls(this);
	}

	update() {
		run(this);
	}
}

class Level3 extends Phaser.Scene {
	constructor() {
		super("level3Scene");
	}
	preload() {
		// Load in the background
		this.load.image('player', './circle.png');
	}

	create() {
		this.doorUnlocked = false;
		this.nextScene = "introScene";
		this.buttonIndex = 0;
		this.buttons = [
			{
				x: 100,
				y: 1000
			},
			{
				x: 1000,
				y: 100
			},
			{
				x: 500,
				y: 500
			},
		]
		this.add.text(960, 540, "Level 3", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		// Create a player which is just a circle
		initPlayer(this);
		initPlatforms(this);
		initDoor(this, 1800, 950);
		initButton(this, this.buttons[0].x, this.buttons[0].y);
		initControls(this);
	}

	update() {
		run(this);
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
			debug: true,
			gravity: {
				x: 0,
				y: 0
			}
		}
	},
	scene: [Intro, Level1, Level2, Level3],
	title: "Just push the button",
});
