var User = function (id,name,privilege,registered_by,max,holding,max_visiting,visiting){
    this.id = id;
    this.name = name;
    this.privilege = privilege;
    this.registered_by = registered_by;
    this.max = max;
    this.holding = holding;
    this.max_visiting = max_visiting;
    this.visiting = visiting;
};
module.exports = User;