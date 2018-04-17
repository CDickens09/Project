var Pause = pc.createScript('pause'); // Javascript Processor to create reference to script

Pause.prototype.initialize = function() { // Function which runs when script is first called
    this.paused = false;
};

Pause.prototype.update = function(dt) { // Function which runs every time step
    if (this.app.keyboard.wasPressed (pc.KEY_SPACE)) { // Checks if space was pressed and if so calls pause function
        this.togglePaused ();
    }
};

Pause.prototype.togglePaused = function () { // Pause function to pause and unpause the animation

    if (this.paused) {
        this.app.timeScale = 1;
    } else {
        this.app.timeScale = 0;
    }
    
    this.paused = !this.paused;
};