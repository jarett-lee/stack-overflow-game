const p2 = require('p2');

module.exports = class Engine {

    constructor(player1, player2) {
        this.players = {};
        this.players[player1] = {};
        this.players[player2] = {};
        
        // Create a World
        const world = new p2.World({
            gravity: [0, -1000]
        });

        this.world = world;

        // Set high friction so the wheels don't slip
        world.defaultContactMaterial.friction = 100;

        // Physics properties
        this.maxSubSteps = 5; // Max physics ticks per render frame
        this.fixedDeltaTime = 1 / 60; // Physics "tick" delta time

        /*
        // Init players
        this.initPlayer(player1, -5);
        this.initPlayer(player2, 5);
        */

        // Create a platform
        let platformShape = new p2.Box({
            width: 50,
            height: 5
        });
        let platformBody = new p2.Body({
            position: [-100, -50],
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);
        
        this.players[player1].platformBody = platformBody;

        // Create a platform
        platformShape = new p2.Box({
            width: 50,
            height: 5
        });
        platformBody = new p2.Body({
            position: [100, -50],
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);

        this.players[player2].platformBody = platformBody;
        
        this.createFakeWorld();
    }

    createFakeWorld() {
        const world = this.world;

        // Create blocks
        this.players[Object.keys(this.players)[0]].blockBodies = [];
        for (let i = 0; i < 5; i++) {
           let blockShape = new p2.Box({
                width: 30,
                height: 30
            });
            let blockBody = new p2.Body({
                angle: Math.random() * 360,
                position: [-100 + i * 35, 5],
                mass: 1
            });
            blockBody.addShape(blockShape);
            this.players[Object.keys(this.players)[0]].blockBodies.push(blockBody);
            world.addBody(blockBody);
        }

        // Create blocks
        this.players[Object.keys(this.players)[1]].blockBodies = [];
        
        for (let i = 0; i < 5; i++) {
            let blockShape = new p2.Box({
                width: 30,
                height: 30
            });
            let blockBody = new p2.Body({
                angle: Math.random() * 360,
                position: [-100 + i * 35, 5],
                mass: 1
            });
            blockBody.addShape(blockShape);
            this.players[Object.keys(this.players)[1]].blockBodies.push(blockBody);
            world.addBody(blockBody);
        }
    
        // Create bullets
        this.bulletBodies = [];
        
        // for (let i = 0; i < 5; i++) {
        //     let bulletShape = new p2.Circle({
        //         radius: .05
        //     });
        //     let bulletBody = new p2.Body({
        //         position: [-4, 1 + i],
        //         velocity: [5, 9],
        //         mass: .3
        //     });
        //     bulletBody.addShape(bulletShape);
        //     this.bulletBodies.push(bulletBody);
        //     world.addBody(bulletBody);
        // }

        // Create bullets
        // for (let i = 0; i < 5; i++) {
        //     let bulletShape = new p2.Circle({
        //         radius: .05
        //     });
        //     let bulletBody = new p2.Body({
        //         position: [4, 1.5 + i],
        //         velocity: [-5, 9],
        //         mass: .3
        //     });
        //     bulletBody.addShape(bulletShape);
        //     this.bulletBodies.push(bulletBody);
        //     world.addBody(bulletBody);
        // }
    }

    initPlayer(playerId, x) {
        const world = this.world;

        // Add platform
        const platformShape = new p2.Box({
            width: 3,
            height: 1
        });
        const platformBody = new p2.Body({
            position: [x, 0],
            mass: 0
        });
        platformBody.addShape(platformShape);
        world.addBody(platformBody);

        // Write properties
        this.players[playerId] = {};
        this.players[playerId].platformShape = platformShape;
        this.players[playerId].platformBody = platformBody;
    }

    step() {
        let bullets = this.getBulletBodies().map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[1],
                radius: bb.shapes[0].radius,
                angle: bb.angle
            }
        ));

        let blocks = this.getBlockBodies().map((bb) => (
            {
                x: bb.position[0],
                y: bb.position[1],
                width: bb.shapes[0].width,
                height: bb.shapes[0].height,
                angle: bb.angle
            }
        ));

        let platforms = this.getPlatformBodies().map((pb) => (
            {
                x: pb.position[0],
                y: pb.position[1],
                width: pb.shapes[0].width,
                height: pb.shapes[0].height,
                angle: pb.angle
            }
        ));
        
        const hrTime = process.hrtime();
        const milli = hrTime[0] * 1000 + hrTime[1] / 1000000;
        this.updatePhysics(milli);
        return {
            bullets: bullets,
            blocks: blocks,
            platforms: platforms
        };
    }

    updatePhysics(time) {
        const world = this.world;
        const lastTime = this.lastTime;
        const maxSubSteps = this.maxSubSteps;
        const fixedDeltaTime = this.fixedDeltaTime;
        
        /*
        const bulletBodies = this.bulletBodies;

        // allowShipCollision = true;
        // if(keyShoot && !hideShip && world.time - lastShootTime > shipReloadTime){
        //   shoot();
        // }

        for (let i = 0; i < bulletBodies.length; i++) {
            const b = bulletBodies[i];
            // If the bullet is old, delete it
            if (b.dieTime <= world.time) {
                bulletBodies.splice(i, 1);
                world.removeBody(b);
                i--;
                continue;
            }
        }

        // Remove bodies scheduled to be removed
        for (let i = 0; i < removeBodies.length; i++) {
            world.removeBody(removeBodies[i]);
        }
        removeBodies.length = 0;

        // Add bodies scheduled to be added
        for (let i = 0; i < addBodies.length; i++) {
            world.addBody(addBodies[i]);
        }
        addBodies.length = 0;

        // Delete all out of bound bodies
        // for (var i=0; i < world.bodies.length; i++){
        //   deleteIfOutOfBounds(world.bodies[i]);
        // }
        */

        // Get the elapsed time since last frame, in seconds
        let deltaTime = lastTime ? (time - lastTime) / 1000 : 0;
        // Make sure the time delta is not too big (can happen if user switches browser tab)
        deltaTime = Math.min(1 / 10, deltaTime);
        // Move physics bodies forward in time
        // world.step(fixedDeltaTime, deltaTime, maxSubSteps);
        world.bodies.forEach((body) => {
            if(body.position[1] < -200){
                this.removeBody(body);
                
            }
        });

        

        world.step(fixedDeltaTime);
        this.lastTime = time;
    }

    removeBody(body){
        this.world.removeBody(body);
        Object.keys(this.players).forEach((playerKey) => {
            let player = this.players[playerKey];
            let index = -1;
            if((index = player.blockBodies.indexOf(body)) != -1){
                player.blockBodies.splice(index, 1);
                
            }
            index = -1;
            if((index = this.bulletBodies.indexOf(body)) != -1){
                this.bulletBodies.splice(index, 1);
            }
        });
    }

    addBlock(playerId, x, y) {
        let blockShape = new p2.Box({
            width: 30,
            height: 30
        });
        let blockBody = new p2.Body({
            // angle: Math.random() * 360,
            position: [x, y],
            velocity: [0, 0],
            mass: 10
        });
        blockBody.addShape(blockShape);
        this.players[playerId].blockBodies.push(blockBody);
        this.world.addBody(blockBody);
        return true; // failed to place the block
    }

    getBlockBodies(){
        let blockBodies = [];
        for (let [ key, val ] of Object.entries(this.players)) {
            blockBodies = blockBodies.concat(val.blockBodies);
        }

        return blockBodies;
    }

    getBulletBodies(){
        return this.bulletBodies;
    }

    getPlatformBodies(){
        const platformBodies = [];
        for (let [ key, val ] of Object.entries(this.players)) {
            platformBodies.push(val.platformBody);
        }

        return platformBodies;
    }

}
