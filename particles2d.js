var Particles = pc.createScript('particles2d'); // Javascript Processor to create reference to script

Particles.attributes.add('count', { // Adds count attribute to script with below properties
    type: 'number', 
    default: 100 
});
Particles.attributes.add('redmaterial', { // Adds redmaterial attribute to script with below properties
    type: 'asset', 
    assetType: 'material' 
});
Particles.attributes.add('bluematerial', { // Adds bluematerial attribute to script with below properties
    type: 'asset',
    assetType: 'material' 
});
Particles.attributes.add('initTotalEnergy', { // Adds initTotalEnergy attribute to script with below properties
    type: 'number', 
    default: 100 
});

Particles.prototype.initialize = function() { // Function which runs when script is first called
    this.Particles = [];
    this.ParticleXVelocities = [];
    this.ParticleZVelocities = [];
    this.ParticleEnergy = [];
    this.TotalEnergy = 0;
    this.LTotalEnergy = 0;
    this.NewTotalEnergy = 0;
    this.EnergyChange = 0;
    this.EnergyPercent = 0;
    this.counttime = -1;
    this.totframes = 0;
    
    this.Velocities = this.app.root.findByName('Scripts').script.velocities; // Finds velocities script for later reference
    this.Energy = this.app.root.findByName('Scripts').script.energy; // Finds energy script for later reference
    
    for (var i = 0; i < this.count; i++) { // For loop to generate particles
        var newparticle = new pc.Entity(); // Creates new entity
        var folder = this.app.root.findByName('Particles'); // Finds folder to append particles to
        newparticle.addComponent("model", { // Adds model component to entity
            type: 'sphere',
        });
        if(i===0) { // If loop to set material of particles
            newparticle.model.material = this.bluematerial.resource; // Blue for particle with outputted velocity for checking
        }
        else {
            newparticle.model.material = this.redmaterial.resource;
        }
        newparticle.addComponent("collision", { // Adds collision component to entity
            type: 'sphere',
            radius: 0.05,
        });
        newparticle.addComponent("rigidbody", { // Adds rigidbody component to entity
            type: 'dynamic',
            mass: 0.01,
            friction: 0.00,
            restitution: 0.96,
        });
        newparticle.setLocalScale(0.1, 0.1, 0.1); // Sets scale of entity
        folder.addChild(newparticle); // Adds entity as a child to folder
        newparticle.rigidbody.teleport(Math.random() * 8 - 4, 0.1, Math.random() * 8 - 4); // Teleports particle to random initial location
        var linearfactor = new pc.Vec3(1.00, 0.00, 1.00);
        newparticle.rigidbody.linearFactor = linearfactor; // Sets linearfactors for particle
        var angularfactor = new pc.Vec3(0.00, 0.00, 0.00);
        newparticle.rigidbody.angularFactor = angularfactor; // Sets angularfactors for particle
        var initvel = Math.sqrt(this.initTotalEnergy / (2 * this.count)); // Calculates initial velocity for each particle
        var PorM1 = Math.random() < 0.5 ? -1 : 1; // Sets random -1 or 1
        var PorM2 = Math.random() < 0.5 ? -1 : 1; // Sets random -1 or 1
        var velocity = new pc.Vec3(PorM1 * initvel, 0, PorM2 * initvel); // Sets initial velocities with random directions
        newparticle.rigidbody.linearVelocity = velocity; // Applies velocity to particle
        this.ParticleXVelocities.push(newparticle.rigidbody.linearVelocity.x); // Saves particle x velocity to array
        this.ParticleZVelocities.push(newparticle.rigidbody.linearVelocity.z); // Saves particle z velocity to array
        this.Particles.push(newparticle); // Saves particle reference to array
    }
};

Particles.prototype.update = function(dt) { // Function which runs every time step
     if (this.app.timeScale !== 0) {
        for (var i = 0; i < this.Particles.length; i++) { // For loop to run for every particle
            var particle = this.Particles[i];
            var oldx = this.ParticleXVelocities[i]; // Sets oldx variable to save previous x velocity
            var oldz = this.ParticleZVelocities[i]; // Sets oldz variable to save previous z velocity
            var pos = particle.getPosition(); // Gets current particle postion
            if (pos.x < -4) { // Negative x boundary condition
                particle.rigidbody.teleport(3.9, 0.1, particle.position.z);
            }
             if (pos.x > 4) { // Positive x boundary condition
                particle.rigidbody.teleport(-3.9, 0.1, particle.position.z);
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
            this.ParticleZVelocities[i] = particle.rigidbody.linearVelocity.z;
            this.ParticleEnergy[i] = Math.pow(this.ParticleXVelocities[i], 2) + Math.pow(this.ParticleZVelocities[i], 2); // Calculates particle energy
            this.TotalEnergy += this.ParticleEnergy[i]; // Calculates total energy
            if (this.totframes === 0 || this.totframes == 100 || this.totframes == 1000 || this.totframes == 10000) { // Outputs particle energy to console
                console.log((i + 1) + " " + this.ParticleEnergy[i]); 
            }
        }
        this.totframes += 1; // Adds one to frame counter
        for (i = 0; i < this.Particles.length; i++) { // For loop to run for all particles
            this.EnergyChange = this.TotalEnergy - this.initTotalEnergy; // Calculates energy change
            var xvel = this.Particles[i].rigidbody.linearVelocity.x;
            var zvel = this.Particles[i].rigidbody.linearVelocity.z;
            var Velchange = this.EnergyChange / (2 * this.count); // Calculates necessary velocity change for thermostat
            var presvelocity = new pc.Vec3(xvel - Math.sign(xvel) * Velchange, 0, zvel - Math.sign(zvel) * Velchange);
            this.Particles[i].rigidbody.linearVelocity = presvelocity; // Sets new particle velocity
            this.ParticleEnergy[i] = Math.pow(this.Particles[i].rigidbody.linearVelocity.x, 2) + Math.pow(this.Particles[i].rigidbody.linearVelocity.z, 2); // Calculates new particle energy
            this.NewTotalEnergy += this.ParticleEnergy[i]; // Calculates new total energy
        }
    
        if (this.counttime == -1) { // Writes initial energy and velocity of blue particle to user interface
            this.Energy.drawEnergy(parseFloat(this.initTotalEnergy).toFixed(2),
                parseFloat(0).toFixed(2),
                parseFloat(0).toFixed(2));
            this.Velocities.drawVel(parseFloat(this.Particles[0].rigidbody.linearVelocity.x).toFixed(2), 
                parseFloat(this.Particles[0].rigidbody.linearVelocity.y).toFixed(2),
                parseFloat(this.Particles[0].rigidbody.linearVelocity.z).toFixed(2));
            this.counttime = 0; // Sets timer to 0
        }
        if (this.counttime == 30) { // Every 30 frames updates the energy and velocity displays
            this.EnergyChange = this.NewTotalEnergy - this.initTotalEnergy;
            this.EnergyPercent = this.EnergyChange / this.NewTotalEnergy * 100;
            this.Energy.drawEnergy(parseFloat(this.NewTotalEnergy).toFixed(2),
                parseFloat(this.EnergyChange).toFixed(2),
                parseFloat(this.EnergyPercent).toFixed(2));
            this.Velocities.drawVel(parseFloat(this.Particles[0].rigidbody.linearVelocity.x).toFixed(2), 
                parseFloat(this.Particles[0].rigidbody.linearVelocity.y).toFixed(2),
                parseFloat(this.Particles[0].rigidbody.linearVelocity.z).toFixed(2));
            this.counttime = 0; // Sets timer to 0
        }
        else {
            this.counttime += 1; // Otherwise adds 1 to times
        }  
        this.TotalEnergy = 0; // Zeroes total energy for next frames calculations
        this.NewTotalEnergy = 0; // Zeroes new total energy for next frames calculations 
    }
};
