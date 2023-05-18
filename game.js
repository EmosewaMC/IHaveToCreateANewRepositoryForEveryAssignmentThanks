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

		console.log(this.title);
	}
}

function resetJumpIfOnTopOfObject(scene, player, object) {
	if (Math.abs(player.body.bottom - object.body.top) < 10) {
		scene.jumpNum = 0;
	}
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
		this.add.text(960, 540, "Level 1", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
		// Create a player which is just a circle
		this.player = this.physics.add.image(100, 100, 'player').setGravityY(0).setMaxVelocity(1250, 1250).setVelocityY(1250).setAccelerationY(4000);
		this.player.setCollideWorldBounds(true, 0, 0, true);
		// Now create a rectangular platform at the top left
		this.platform = this.physics.add.image(200, 500, 'player').setMaxVelocity(0, 0).setImmovable(true);
		this.platform2 = this.physics.add.image(600, 800, 'player').setMaxVelocity(0, 0).setImmovable(true);
		this.physics.add.collider(this.player, this.platform, () => {
			resetJumpIfOnTopOfObject(this, this.player, this.platform);
		});
		this.physics.add.collider(this.player, this.platform2, () => {
			resetJumpIfOnTopOfObject(this, this.player, this.platform2);
		});
		// If the player will move left or right into the platform, set the horizontal velocity to 0
		// If the player will jump into the platform, set the vertical velocity to 0
		this.jumpNum = 0;
		// When a onWorldBounds event is triggered, set the boolean on this canJump to true
		this.physics.world.on('worldbounds', () => {
			if (this.jumpNum > 0) this.jumpNum = 0;
		});
		this.wKey = this.input.keyboard.addKey('W');
		this.aKey = this.input.keyboard.addKey('A');
		this.dKey = this.input.keyboard.addKey('D');
		this.wKey.addListener('down', () => {
			if (this.jumpNum < 2) {
				this.player.body.setVelocityY(-3000);
				this.player.setAccelerationY(4000);
				this.jumpNum++;
			}
		}, this);
		this.wKey.addListener('up', () => {
			this.player.setAccelerationY(8000);
		});
	}

	update() {
		let vel = 0;
		if (this.aKey.isDown){
			vel -= 600;
		}
		if (this.dKey.isDown){
			vel += 600;
		}
		if (this.jumpNum == 0 && this.player.body.velocity.y > 1000) {
			this.jumpNum = 1;
		}

		this.player.body.setVelocityX(vel);
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
	scene: [/*Intro,*/ Level1],
	title: "Just push the button",
});
