var SceneSwitch = pc.createScript('sceneswitch'); // Javascript Processor to create reference to script

SceneSwitch.attributes.add("sceneId", {type: "string", default: "0", title: "Scene ID to Load"}); // Adds sceneID attribute to script to set which scene to switch too

SceneSwitch.prototype.update = function(dt) { // Function to run every system time step
    if (this.app.keyboard.wasPressed(pc.KEY_UP)) {
        this.switchScene(); // Switches scene if up arrow is pressed
    }
};

SceneSwitch.prototype.switchScene = function() { // Function to switch scene, called if spacebar was pressed in that time step
    this.Velocities = this.app.root.findByName('Scripts').script.velocities; // Finds velocities.js script
    this.Velocities.destroyVel(); // Destroys velocity display
    this.Energy = this.app.root.findByName('Scripts').script.energy; // Finds energy.js script
    this.Energy.destroyEnergy(); // Destroys energy display
    var oldHierarchy = this.app.root.findByName('Root'); // Finds old root folder
    oldHierarchy.destroy(); // Destroys old root folder
    this.loadScene (this.sceneId); // Calls load function
};

SceneSwitch.prototype.loadScene = function (id, callback) { // Load function to load new scene with id from attribute
    var url = id  + ".json"; // Sets url to load
    this.app.loadSceneHierarchy(url, function (err, parent) {
        if (!err) {
            callback(parent); // If there isnt an error loads new root folder
        } else {
            console.error (err); // Outputs to console if there is an error
        }
    });
};