var OrbitCamera = pc.createScript('orbitCamera'); // Javascript Processor to create reference to script

OrbitCamera.attributes.add('distanceMax', { // Adds distanceMax attribute to script with below properties
    type: 'number', 
    default: 0, 
    title: 'Distance Max', 
    description: 'Setting this at 0 will give an infinite distance limit'
});
OrbitCamera.attributes.add('distanceMin', { // Adds distanceMin attribute to script with below properties
    type: 'number', 
    default: 0, 
    title: 'Distance Min'
});
OrbitCamera.attributes.add('pitchAngleMax', { // Adds pitchAngleMax attribute to script with below properties
    type: 'number', 
    default: 90, 
    title: 'Pitch Angle Max (degrees)'
});
OrbitCamera.attributes.add('pitchAngleMin', { // Adds pitchAngleMin attribute to script with below properties
    type: 'number', 
    default: -90, 
    title: 'Pitch Angle Min (degrees)'
});

OrbitCamera.attributes.add('inertiaFactor', { // Adds inertiaFactor attribute to script with below properties
    type: 'number',
    default: 0,
    title: 'Inertia Factor',
    description: 'Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive.'
});

OrbitCamera.attributes.add('focusEntity', { // Adds focusEntity attribute to script with below properties
    type: 'entity',
    title: 'Focus Entity',
    description: 'Entity for the camera to focus on. If blank, then the camera will use the whole scene'
});

OrbitCamera.attributes.add('frameOnStart', { // Adds frameOnStart attribute to script with below properties
    type: 'boolean',
    default: true,
    title: 'Frame on Start',
    description: 'Frames the entity or scene at the start of the application."'
});

Object.defineProperty(OrbitCamera.prototype, "distance", { // Adds distance property to the camera entity
    get: function() { // Gets current target distance
        return this._targetDistance;
    },

    set: function(value) { // Sets target distance
        this._targetDistance = this._clampDistance(value);
    }
});

Object.defineProperty(OrbitCamera.prototype, "pitch", { // Adds pitch property to the camera entity
    get: function() { // Gets current target pitch
        return this._targetPitch;
    },

    set: function(value) { // Sets target pitch
        this._targetPitch = this._clampPitchAngle(value);
    }
});

Object.defineProperty(OrbitCamera.prototype, "yaw", { // Adds yaw property to the camera entity
    get: function() { // Gets current target yaw
        return this._targetYaw;
    },

    set: function(value) { // Sets target yaw
        this._targetYaw = value;
        var diff = this._targetYaw - this._yaw;
        var reminder = diff % 360;
        if (reminder > 180) { // If loop to ensure yaw is not greater than 360 as this will cause errors in PlayCanvas
            this._targetYaw = this._yaw - (360 - reminder);
        } else if (reminder < -180) {
            this._targetYaw = this._yaw + (360 + reminder);
        } else {
            this._targetYaw = this._yaw + reminder;
        }
    }
});

Object.defineProperty(OrbitCamera.prototype, "pivotPoint", { // Adds pivotPoint property to the camera entity
    get: function() {  // Gets current target pivotPoint
        return this._pivotPoint;
    },

    set: function(value) {  // Sets current target pivotPoint
        this._pivotPoint.copy(value);
    }
});

OrbitCamera.prototype.focus = function (focusEntity) { // Function to keep the focus of the camera to defined object when camera view is moved
    this._buildAabb(focusEntity, 0);

    var halfExtents = this._modelsAabb.halfExtents; // Sets variable to store half extents of entity

    var distance = Math.max(halfExtents.x, Math.max(halfExtents.y, halfExtents.z)); // Sets distance variable as distance from entity to focus
    distance = (distance / Math.tan(0.5 * this.entity.camera.fov * pc.math.DEG_TO_RAD));
    distance = (distance * 2);

    this.distance = distance; // Changes global distance variable

    this._removeInertia();

    this._pivotPoint.copy(this._modelsAabb.center);
};


OrbitCamera.distanceBetween = new pc.Vec3(); // Creates distance between vector

OrbitCamera.prototype.resetAndLookAtPoint = function (resetPoint, lookAtPoint) { // Function to reset camera and focus on desired entity
    this.pivotPoint.copy(lookAtPoint); // Resets orientation of camera
    this.entity.setPosition(resetPoint); // Resets position of camera

    this.entity.lookAt(lookAtPoint);

    var distance = OrbitCamera.distanceBetween; // Works out distance from focus
    distance.sub2(lookAtPoint, resetPoint);
    this.distance = distance.length(); // Changes global distance variable

    this.pivotPoint.copy(lookAtPoint);

    var cameraQuat = this.entity.getRotation(); // Retrieves rotation of camera entity
    this.yaw = this._calcYaw(cameraQuat);
    this.pitch = this._calcPitch(cameraQuat, this.yaw);

    this._removeInertia();
    this._updatePosition(); // Runs update position function
};

OrbitCamera.prototype.resetAndLookAtEntity = function (resetPoint, entity) { // Function to reset and look at a specific entity
    this._buildAabb(entity, 0);
    this.resetAndLookAtPoint(resetPoint, this._modelsAabb.center);
};

OrbitCamera.prototype.reset = function (yaw, pitch, distance) { // Function to reset but set entity properties to specific values
    this.pitch = pitch;
    this.yaw = yaw;
    this.distance = distance;

    this._removeInertia();
};

OrbitCamera.prototype.initialize = function () { // Function to run when script is first called
    var self = this; // Sets self variable to camera entity
    var onWindowResize = function () { // Resets aspect ratio if window is resized
        self._checkAspectRatio();
    };

    window.addEventListener('resize', onWindowResize, false); // Adds listener to check if window is resized

    this._checkAspectRatio();

    this._modelsAabb = new pc.BoundingBox();
    this._buildAabb(this.focusEntity || this.app.root, 0);

    this.entity.lookAt(this._modelsAabb.center); // Makes camera look at focus entity

    this._pivotPoint = new pc.Vec3();
    this._pivotPoint.copy(this._modelsAabb.center); // Sets pivot point for camera

    var cameraQuat = this.entity.getRotation(); // Gets current rotation of camera

    this._yaw = this._calcYaw(cameraQuat);
    this._pitch = this._clampPitchAngle(this._calcPitch(cameraQuat, this._yaw));
    this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0); // Sets rotation of camera

    this._distance = 0;

    this._targetYaw = this._yaw;
    this._targetPitch = this._pitch;

    if (this.frameOnStart) { // If loop to make sure camera is the correct distance from focus entity
        this.focus(this.focusEntity || this.app.root);
    } else {
        var distanceBetween = new pc.Vec3();
        distanceBetween.sub2(this.entity.getPosition(), this._pivotPoint);
        this._distance = this._clampDistance(distanceBetween.length());
    }

    this._targetDistance = this._distance;

    this.on('attr:distanceMin', function (value, prev) {
        this._targetDistance = this._clampDistance(this._distance); // Makes sure target distance is not less than min
    });

    this.on('attr:distanceMax', function (value, prev) {
        this._targetDistance = this._clampDistance(this._distance); // Makes sure target distance is not more than max
    });

    this.on('attr:pitchAngleMin', function (value, prev) {
        this._targetPitch = this._clampPitchAngle(this._pitch); // Makes sure pitchAngle is not less than min
    });

    this.on('attr:pitchAngleMax', function (value, prev) {
        this._targetPitch = this._clampPitchAngle(this._pitch); // Makes sure pitchAngle is not more than max
    });

    this.on('attr:focusEntity', function (value, prev) {
        if (this.frameOnStart) {
            this.focus(value || this.app.root);
        } else {
            this.resetAndLookAtEntity(this.entity.getPosition(), value || this.app.root); // Resets camera to look at focus entity
        }
    });

    this.on('attr:frameOnStart', function (value, prev) {
        if (value) {
            this.focus(this.focusEntity || this.app.root); // Focuses on focus entity
        }
    });

    this.on('destroy', function() {
        window.removeEventListener('resize', onWindowResize, false); // Removes event listeners if entity is destroyed
    });
};


OrbitCamera.prototype.update = function(dt) { // Function that runs every time step
    var t = this.inertiaFactor === 0 ? 1 : Math.min(dt / this.inertiaFactor, 1);
    this._distance = pc.math.lerp(this._distance, this._targetDistance, t);
    this._yaw = pc.math.lerp(this._yaw, this._targetYaw, t);
    this._pitch = pc.math.lerp(this._pitch, this._targetPitch, t);

    this._updatePosition(); // Calls function to update position
};


OrbitCamera.prototype._updatePosition = function () { // Function to update position of camera
    this.entity.setLocalPosition(0,0,0); // Sets position to centre
    this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0); // Sets rotation of camera

    var position = this.entity.getPosition();
    position.copy(this.entity.forward);
    position.scale(-this._distance);
    position.add(this.pivotPoint);
    this.entity.setPosition(position); // Sets new position for camera
};


OrbitCamera.prototype._removeInertia = function () { // Function to remove inertia when camera stops moving
    this._yaw = this._targetYaw;
    this._pitch = this._targetPitch;
    this._distance = this._targetDistance;
};


OrbitCamera.prototype._checkAspectRatio = function () { // Function to check aspect ratio of device/window
    var height = this.app.graphicsDevice.height;
    var width = this.app.graphicsDevice.width;

    this.entity.camera.horizontalFov = height > width;
};


OrbitCamera.prototype._buildAabb = function (entity, modelsAdded) { // Function to build focus entity if one hasnt been set
    var i = 0;

    if (entity.model) { // Creates a mesh if entity has model element
        var mi = entity.model.meshInstances;
        for (i = 0; i < mi.length; i++) {
            if (modelsAdded === 0) {
                this._modelsAabb.copy(mi[i].aabb);
            } else {
                this._modelsAabb.add(mi[i].aabb);
            }

            modelsAdded += 1; // Counts number of models that have been added
        }
    }

    for (i = 0; i < entity.children.length; ++i) {
        modelsAdded += this._buildAabb(entity.children[i], modelsAdded); // Builds all models
    }

    return modelsAdded;
};


OrbitCamera.prototype._calcYaw = function (quat) { // Calculates new yaw
    var transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};


OrbitCamera.prototype._clampDistance = function (distance) { // Sets clamp distance so camera cant move towards or away from focus by accident
    if (this.distanceMax > 0) {
        return pc.math.clamp(distance, this.distanceMin, this.distanceMax);
    } else {
        return Math.max(distance, this.distanceMin);
    }
};


OrbitCamera.prototype._clampPitchAngle = function (pitch) { // Sets clamp distance so camera cant move around focus by accident
    return pc.math.clamp(pitch, -this.pitchAngleMax, -this.pitchAngleMin);
};


OrbitCamera.quatWithoutYaw = new pc.Quat();
OrbitCamera.yawOffset = new pc.Quat();

OrbitCamera.prototype._calcPitch = function(quat, yaw) { // Function to caluclate pitch of camera
    var quatWithoutYaw = OrbitCamera.quatWithoutYaw;
    var yawOffset = OrbitCamera.yawOffset;

    yawOffset.setFromEulerAngles(0, -yaw, 0); // Offsets the yaw angle
    quatWithoutYaw.mul2(yawOffset, quat);

    var transformedForward = new pc.Vec3();

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(transformedForward.y, -transformedForward.z) * pc.math.RAD_TO_DEG; // Returns the transformed pitch of the camera
};