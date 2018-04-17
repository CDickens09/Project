var MouseInput = pc.createScript('mouseInput'); // Javascript Processor to create reference to script

MouseInput.attributes.add('orbitSensitivity', { // Adds orbitsensitivity attribute to script with below properties
    type: 'number', 
    default: 0.3, 
    title: 'Orbit Sensitivity', 
    description: 'How fast the camera moves around the orbit. Higher is faster'
});

MouseInput.attributes.add('distanceSensitivity', { // Adds distancesensitivity attribute to script with below properties
    type: 'number', 
    default: 0.15, 
    title: 'Distance Sensitivity', 
    description: 'How fast the camera moves in and out. Higher is faster'
});

MouseInput.prototype.initialize = function() { // Function to run when script is first called
    this.orbitCamera = this.entity.script.orbitCamera; // Sets local variable for easier calling
        
    if (this.orbitCamera) { // Checks if orbitCamera is assigned to a camera entity
        var self = this; // Sets local variable self as the entity it is attached to
        
        var onMouseOut = function (e) { // Adds function to listen for mouse events
           self.onMouseOut(e);
        };
        
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this); // Listener to call mousedown script
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this); // Listener to call mouseup script
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this); // Listener to call mousemove script
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this); // Listener to call mousewheel script

        window.addEventListener('mouseout', onMouseOut, false);

        this.on('destroy', function() { // Turns off listeners on destruction of this script to ensure no errors occur
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
            this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
            this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

            window.removeEventListener('mouseout', onMouseOut, false);
        });
    }

    this.app.mouse.disableContextMenu();
  
    this.lookButtonDown = false;
    this.panButtonDown = false;
    this.lastPoint = new pc.Vec2(); // Saves location of mouse to check if there is a change each frame
};


MouseInput.fromWorldPoint = new pc.Vec3(); // Variable to save start mouse location
MouseInput.toWorldPoint = new pc.Vec3(); // Variable to save finish mouse location
MouseInput.worldDiff = new pc.Vec3(); // Variable to save difference in mouse location


MouseInput.prototype.pan = function(screenPoint) { // Function that runs when mouse is panned
    var fromWorldPoint = MouseInput.fromWorldPoint; // Sets local variable to save start mouse location
    var toWorldPoint = MouseInput.toWorldPoint; // Sets local variable to save finish mouse location
    var worldDiff = MouseInput.worldDiff; // Sets local variable to save difference in mouse location

    var camera = this.entity.camera; // Sets variable to reference camera entity
    var distance = this.orbitCamera.distance; // Sets variable to reference camera distane
    
    camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint);  // Takes mouse location from screen and applies it to the world
    camera.screenToWorld(this.lastPoint.x, this.lastPoint.y, distance, toWorldPoint); // Takes previous mouse location from screen and applies it to the world

    worldDiff.sub2(toWorldPoint, fromWorldPoint); // Checks difference in world points
       
    this.orbitCamera.pivotPoint.add(worldDiff); // Pivots camera 
};


MouseInput.prototype.onMouseDown = function (event) { // Function that runs when mouse is moved down
    switch (event.button) { // Switch lop to run for different cases of button press
        case pc.MOUSEBUTTON_LEFT: {
            this.lookButtonDown = true;
        } break;
            
        case pc.MOUSEBUTTON_MIDDLE: 
        case pc.MOUSEBUTTON_RIGHT: {
            this.panButtonDown = true;
        } break;
    }
};


MouseInput.prototype.onMouseUp = function (event) { // Function that runs when mouse is moved up
    switch (event.button) { // Switch lop to run for different cases of button press
        case pc.MOUSEBUTTON_LEFT: {
            this.lookButtonDown = false;
        } break;
            
        case pc.MOUSEBUTTON_MIDDLE: 
        case pc.MOUSEBUTTON_RIGHT: {
            this.panButtonDown = false;            
        } break;
    }
};


MouseInput.prototype.onMouseMove = function (event) { // Function that runs when mouse is moved
    var mouse = pc.app.mouse; // Saves local variable to reference mouse
    if (this.lookButtonDown) {
        this.orbitCamera.pitch -= event.dy * this.orbitSensitivity; // Changes camera pitch
        this.orbitCamera.yaw -= event.dx * this.orbitSensitivity; // Changes camera yaw
        
    } else if (this.panButtonDown) {
        this.pan(event);   
    }
    
    this.lastPoint.set(event.x, event.y); // Sets last location of mouse for next time step change
};


MouseInput.prototype.onMouseWheel = function (event) { // Function that runs when mouse wheel is scrolled in
    this.orbitCamera.distance -= event.wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1); // Changes the orbit camera distance
    event.event.preventDefault();
};


MouseInput.prototype.onMouseOut = function (event) { // Function that runs when mouse is moved away from screen
    this.lookButtonDown = false;
    this.panButtonDown = false;
};