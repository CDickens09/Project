var Energy = pc.createScript('energy'); // Javascript Processor to create reference to script

Energy.prototype.initialize = function() { // Function to run when script is first called
    var css = [
            '.energy {',
                    'color: orange;',
                    'position: absolute;',
                    'text-align: right;',
                    'font-size: xx-large;',
                    'font-weight: bold;',
                    'top: 20px;',
                    'bottom: 20px;',
                    'right: 20px;',
                    'font-family: Andale Mono;',
                '}',
            ].join('\n'); // Defines css elements for UI Style

            var style = document.createElement('style'); // Creates style element
            style.innerHTML = css; // Sets HTML style to css
            document.getElementsByTagName("head")[0].appendChild(style); // Appends style as a child

            this.div = document.createElement('div'); // Creates HTML display element for container
            this.container = document.body;
            this.container.appendChild(this.div); // Adds div to container

            this.energy = document.createElement('div'); // Creates HTML display element for energy
            this.container.appendChild(this.energy); // Adds energy display to container as a child
};

Energy.prototype.drawEnergy = function (energy, energyc, energyp) { // Function to redraw energy display to be called in other scripts
    this.energy.innerHTML = pc.string.format("<div class='energy'><p> Energy {0}</p><p> Energy Change {1}</p><p> Energy Change (%) {2}</p></div>", energy, energyc, energyp);
};

Energy.prototype.destroyEnergy = function () { // Function to remove energy display when changing scenes to be called in other scripts
    this.energy.innerHTML = pc.string.format("");
};
