//HELPER FUNCTION THAT TRANSFORMS OBJECTS IN ARRAYS, IGNORING PROPERTY NAMES
exports.ObjValuesToArray = function (obj) {
    return Object.keys(obj).map(function(key) {
        return obj[key];
    });
};

