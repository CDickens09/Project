var Particles = pc.createScript('particles3d2box'); // Javascript Processor to create reference to script

Particles.attributes.add('count', { // Adds count attribute to script with below properties
    type: 'number', 
    default: 250 
});
Particles.attributes.add('redmaterial', { // Adds redmaterial attribute to script with below properties
    type: 'asset', 
    assetType: 'material' 
});
Particles.attributes.add('initTotalEnergyBox1', { // Adds initTotalEnergyBox1 attribute to script with below properties
    type: 'number', 
    default: 250 
});
Particles.attributes.add('initTotalEnergyBox2', { // Adds initTotalEnergyBox2 attribute to script with below properties
    type: 'number', 
    default: 250 
});

Particles.prototype.initialize = function() { // Function which runs when script is first called
    this.Particles = [];
    this.ParticleXVelocities = [];
    this.ParticleYVelocities = [];
    this.ParticleZVelocities = [];
    this.ParticleEnergy = [];
    this.TotalEnergy = 0;
    this.initTotalEnergy = this.initTotalEnergyBox1 + this.initTotalEnergyBox2;
    this.initTotalEnergybox = [this.initTotalEnergyBox1, this.initTotalEnergyBox2];
    this.LTotalEnergy = 0;
    this.NewTotalEnergy = 0;
    this.EnergyChange = 0;
    this.EnergyPercent = 0;
    this.counttime = -1;
    this.totframes = 0;
    
    this.Velocities = this.app.root.findByName('Scripts').script.velocities; // Finds velocities script for later reference
    this.Energy = this.app.root.findByName('Scripts').script.energy; // Finds energy script for later reference
    
    for (var i = 0; i < this.count; i++) { // For loop to generate particles
        var halfcheck;
        if (i < this.count / 2) { // If loop to check whether half the particles have been generated
            halfcheck = 1;
        }
        else {
            halfcheck = 0;
        }
        var newparticle = new pc.Entity(); // Creates new entity
        var folder = this.app.root.findByName('Particles'); // Finds folder to append particles to
        newparticle.addComponent("model", {  // Adds model component to entity
            type: 'sphere',
        });
        newparticle.model.material = this.redmaterial.resource; // Adds material to entity
        newparticle.addComponent("collision", {  // Adds collision component to entity
            type: 'sphere',
            radius: 0.05,
        });
        newparticle.addComponent("rigidbody", {  // Adds rigidbody component to entity
            type: 'dynamic',
            mass: 0.01,
            friction: 0.00,
            restitution: 0.96,
        });
        newparticle.setLocalScale(0.1, 0.1, 0.1); // Sets scale of entity
        folder.addChild(newparticle); // Adds entity as a child to folder
        newparticle.rigidbody.teleport(Math.random() * 8 + (- 8 * halfcheck), Math.random() * 8 - 4, Math.random() * 8 - 4); // Teleports particle to random initial location
        var linearfactor = new pc.Vec3(1.00, 0.00, 1.00);
        newparticle.rigidbody.linearFactor = linearfactor; // Sets linearfactors for particle
        var angularfactor = new pc.Vec3(0.00, 0.00, 0.00);
        newparticle.rigidbody.angularFactor = angularfactor; // Sets angularfactors for particle
        var initvel = Math.sqrt(this.initTotalEnergybox[halfcheck] / (3 * this.count)); // Calculates initial velocity for each particle
        var PorM1 = Math.random() < 0.5 ? -1 : 1; // Sets random -1 or 1
        var PorM2 = Math.random() < 0.5 ? -1 : 1; // Sets random -1 or 1
        var PorM3 = Math.random() < 0.5 ? -1 : 1; // Sets random -1 or 1
        var velocity = new pc.Vec3(PorM1 * initvel, PorM2 * initvel, PorM3 * initvel); // Sets initial velocities with random directions
        this.ParticleXVelocities.push(newparticle.rigidbody.linearVelocity.x);
        this.ParticleYVelocities.push(newparticle.rigidbody.linearVelocity.y);
        this.ParticleZVelocities.push(newparticle.rigidbody.linearVelocity.z);
        this.Particles.push(newparticle);
        newparticle.rigidbody.linearVelocity = velocity; // Applies velocity to particle
        this.ParticleXVelocities.push(newparticle.rigidbody.linearVelocity.x); // Saves particle x velocity to array
        this.ParticleYVelocities.push(newparticle.rigidbody.linearVelocity.y); // Saves particle y velocity to array
        this.ParticleZVelocities.push(newparticle.rigidbody.linearVelocity.z); // Saves particle z velocity to array
        this.Particles.push(newparticle); // Saves particle reference to array
    }
};
Particles.prototype.update = function(dt) { // Function which runs every time step
    if (this.app.timeScale !== 0) {
         for (var i = 0; i < this.Particles.length; i++) { // For loop to run for every particle
            var particle = this.Particles[i];
            var oldx = this.ParticleXVelocities[i]; // Sets oldx variable to save previous x velocity
            var oldy = this.ParticleYVelocities[i]; // Sets oldz variable to save previous y velocity
            var oldz = this.ParticleZVelocities[i]; // Sets oldz variable to save previous z velocity
            var pos = particle.getPosition(); // Gets current particle postion
            if (pos.x < -8) { // Negative x boundary condition
                particle.rigidbody.teleport(7.9, 0.1, particle.position.z);
            }
             if (pos.x > 8) { // Positive x boundary condition
                particle.rigidbody.teleport(-7.9, 0.1, particle.position.z);
            }
            if (pos.y < 0) { // Negative y boundary condition
                particle.rigidbody.teleport(particle.position.x, 7.9, particle.position.z);
            }
            if (pos.y > 8) { // Positive y boundary condition
                particle.rigidbody.teleport(particle.position.x, 0.1, particle.position.z);
            }
             if (pos.z < -4) { // Negative z boundary condition
                particle.rigidbody.teleport(particle.position.x, 0.1, 3.9);
            }
             if (pos.z > 4) { // Positive z boundary condition
                particle.rigidbody.teleport(particle.position.x, 0.1, -3.9);
            }
            if (particle.rigidbody.linearVelocity.x === 0 && particle.rigidbody.linearVelocity.z === 0) { // If loop to stop particles stopping completely
                var velocity = new pc.Vec3(oldx , 0, oldz);
                particle.rigidbody.linearVelocity = velocity;
            }
            this.ParticleXVelocities[i] = particle.rigidbody.linearVelocity.x;
            this.ParticleYVelocities[i] = particle.rigidbody.linearVelocity.y;
            this.ParticleZVelocities[i] = particle.rigidbody.linearVelocity.z;
            this.ParticleEnergy[i] = Math.pow(this.ParticleXVelocities[i], 2) + Math.pow(this.ParticleYVelocities[i], 2) + Math.pow(this.ParticleZVelocities[i], 2); // Calculates particle energy
            this.TotalEnergy += this.ParticleEnergy[i]; // Calculates total energy
            if (this.totframes === 0 || this.totframes == 100 || this.totframes == 1000 || this.totframes == 10000) { // Outputs particle energy to console
               console.log((i + 1) + " " + this.ParticleEnergy[i]); 
            }
        }
        this.totframes += 1; // Adds one to frame counter
        for (i = 0; i < this.Particles.length; i++) { // For loop to run for all particles
            this.EnergyChange = this.TotalEnergy - this.initTotalEnergy; // Calculates energy change
            var xvel = this.Particles[i].rigidbody.linearVelocity.x;
            var yvel = this.Particles[i].rigidbody.linearVelocity.y;
            var zvel = this.Particles[i].rigidbody.linearVelocity.z;
            var Velchange = this.EnergyChange / (3 * this.count); // Calculates necessary velocity change for thermostat
            var presvelocity = new pc.Vec3(xvel - Math.sign(xvel) * Velchange, yvel - Math.sign(yvel) * Velchange, zvel - Math.sign(zvel) * Velchange);
            this.Particles[i].rigidbody.linearVelocity = presvelocity; // Sets new particle velocity
            this.ParticleEnergy[i] = Math.pow(this.Particles[i].rigidbody.linearVelocity.x, 2) + Math.pow(this.Particles[i].rigidbody.linearVelocity.y, 2) + Math.pow(this.Particles[i].rigidbody.linearVelocity.z, 2); // Calculates new particle energy
            this.NewTotalEnergy += this.ParticleEnergy[i]; // Calculates new total energy
        }
        if (this.counttime == -1) { // Writes initial energy and velocity of blue particle to user interface
            this.Energy.drawEnergy(parseFloat(this.initTotalEnergy).toFixed(2),
                parseFloat(0).toFixed(2),
                parseFloat(0).toFixed(2));
            this.counttime = 0; // Sets timer to 0
        }
        if (this.counttime == 30 && this.app.timeScale !== 0) { // Every 30 frames updates the energy and velocity displays
            this.EnergyChange = this.NewTotalEnergy - this.initTotalEnergy;
            this.EnergyPercent = this.EnergyChange / this.NewTotalEnergy * 100;
            this.Energy.drawEnergy(parseFloat(this.NewTotalEnergy).toFixed(2),
                parseFloat(this.EnergyChange).toFixed(2),
                parseFloat(this.EnergyPercent).toFixed(2));
            this.counttime = 0; // Sets timer to 0
        }
        else {
            this.counttime += 1; // Otherwise adds 1 to times
        }  
        this.TotalEnergy = 0; // Zeroes total energy for next frames calculations
        this.NewTotalEnergy = 0; // Zeroes new total energy for next frames calculations
    }
};