var Velocities = pc.createScript('velocities'); // Javascript Processor to create reference to script

Velocities.prototype.initialize = function() { // Function to run when script is first called
    var css = [
            '.vel {',
                    'color: orange;',
                    'position: absolute;',
                    'text-align: left;',
                    'font-size: xx-large;',
                    'font-weight: bold;',
                    'top: 20px;',
                    'left: 20px;',
                    'font-family: Andale Mono;',
                '}',
            ].join('\n'); // Defines css elements for UI Style

            var style = document.createElement('style'); // Creates style element
            style.innerHTML = css; // Sets HTML style to css
            document.getElementsByTagName("head")[0].appendChild(style); // Appends style as a child

            this.div = document.createElement('div'); // Creates HTML display element for container
            this.container = document.body;
            this.container.appendChild(this.div); // Adds div to container

            this.vel = document.createElement('div'); // Creates HTML display element for energy
            this.container.appendChild(this.vel); // Adds energy display to container as a child
};

Velocities.prototype.drawVel = function (velx, vely, velz) { // Function to redraw velocity display to be called in other scripts
    this.vel.innerHTML = pc.string.format("<div class='vel'><p> velocity x {0}</p><p> velocity y {1}</p><p> velocity z {2}</p></div>", velx, vely, velz);
};

Velocities.prototype.destroyVel = function () { // Function to remove velocity display when changing scenes to be called in other scripts
    this.vel.innerHTML = pc.string.format("");
};