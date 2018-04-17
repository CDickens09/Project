var Energy = pc.createScript('energy');

Energy.prototype.initialize = function() {
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
            ].join('\n');

            var style = document.createElement('style');
            style.innerHTML = css;
            document.getElementsByTagName("head")[0].appendChild(style);

            this.div = document.createElement('div');
            this.container = document.body;
            this.container.appendChild(this.div);

            this.energy = document.createElement('div');
            this.container.appendChild(this.energy);    
};

Energy.prototype.drawEnergy = function (energy, energyc, energyp) {
    this.energy.innerHTML = pc.string.format("<div class='energy'><p> Energy {0}</p><p> Energy Change {1}</p><p> Energy Change (%) {2}</p></div>", energy, energyc, energyp);
};

Energy.prototype.destroyEnergy = function () {
    this.energy.innerHTML = pc.string.format("");
};