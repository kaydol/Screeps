

module.exports = function(creep) {
    var homeRoom = Game.spawns['Spawn1'].room;
    
    var longDistanceMiningFlags = _.filter(Game.flags, (flag) => flag.color == COLOR_YELLOW);
    if (longDistanceMiningFlags.length) {
        
        var flag = longDistanceMiningFlags[0];
        
        if (!Game.rooms[flag.pos.roomName] || creep.room != Game.rooms[flag.pos.roomName]) {
            creep.moveTo(flag.pos); // TODO иногда почему-то крип зависает в лимбо между мирами и возвращает -2 ERR_NO_PATH
        } 
        else {
            if (creep.room.controller) {
                if (creep.pos.isNearTo(creep.room.controller))
                    creep.moveTo(creep.room.controller);
                var errorCode = creep.claimController(creep.room.controller);
                if (errorCode == ERR_GCL_NOT_ENOUGH) {
                    creep.reserveController(creep.room.controller);
                }
            }
        }
        
    } else {
        console.log(creep.name + ': place a yellow flag for claiming!');
    }
};