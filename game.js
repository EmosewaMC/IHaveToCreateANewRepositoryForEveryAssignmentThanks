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

class Level1 extends Phaser.Scene {
	constructor() {
		super("level1Scene");
	}
	create() {
		this.add.text(960, 540, "Level 1", {
			font: "96px Georgia",
			FontFace: "bold",
		}).setOrigin(0.5);
	}
}

const game = new Phaser.Game({
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 1920,
		height: 1080
	},
	scene: [Intro, Level1],
	title: "Just push the button",
});
