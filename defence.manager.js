

module.exports = {
    
    EngageTowers: function() {
        for(var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            var towers = Game.rooms[roomName].find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}
                );
            var hostiles = room.find(FIND_HOSTILE_CREEPS);
            
            if (hostiles.length > 0) {
                var username = hostiles[0].owner.username;
                Game.notify(`User ${username} spotted in room ${roomName}`);
                towers.forEach(tower => tower.attack(hostiles[0]));
            } else {
                // Чиним здания башней
                var targets = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.hits < structure.hitsMax;
                    }
                });
                if (targets.length) {
                    targets.sort((a,b) => a.hits - b.hits);
                    var hitPointsToRepair = 0; 
                    var i = targets.length; while (i--) hitPointsToRepair += targets[i].hitsMax - targets[i].hits;
                    // Возле башни рисуем количество HP, которые нужно отремонтировать в комнате
                    towers.forEach(tower => {
                        tower.repair(targets[0]);
                        tower.room.visual.text(
                            hitPointsToRepair,
                            tower.pos.x + 1, 
                            tower.pos.y, 
                            {align: 'left', opacity: 0.8});
                    });
                    
                }
                
            }
        }
    }
    
};