var creepManager = require('creep.manager');
require('prototype.creep')();

module.exports = function(creep) {

    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
        creep.ClearDestination();
        creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
        creep.memory.building = true;
        creep.ClearDestination();
        creep.say('🚧 build');
    }

    if (creep.memory.building) {
        
        if (creep.GetDestination()) {
            var destination = creep.TryReachDestination();
            if (destination) {  
                var construction = Game.getObjectById(destination);
                var errorCode = creep.build(construction);
                if (errorCode == ERR_INVALID_TARGET) {
                    creep.ClearDestination();
                }
            }
        } else {
            // Дороги строим в последнюю очередь
            var constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (structure) => {return structure.my}});
            var notRoads = _.filter(constructionSites, (construction) => construction.structureType != STRUCTURE_ROAD);
            
            var destination;
            if (notRoads.length) 
                destination = creep.pos.findClosestByPath(notRoads);
            else
                destination = creep.pos.findClosestByPath(constructionSites);
            
            if (destination)
                creep.SetDestination(destination.id);
        }
        if (!creep.GetDestination()) 
        {
            // Если строить нечего, автоматически прокладываем дороги
            if (creep.memory.paths) {
                // Если оптимальные пути уже расчитаны, 
                // выбираем первую точку и пытаемся поставить дорогу
                var paths = creep.memory.paths;
                var constructionPos;
                
                for (var path of paths) {
                    for (var point of path) {
                        var errorCode = creep.room.createConstructionSite(point.x, point.y, STRUCTURE_ROAD)
                        if (errorCode == OK) {
                            constructionPos = point;
                            console.log(`No buildings to build, placing a road at x=${point.x} y=${point.y}...`);
                            return;
                        }
                    }
                }
                if (constructionPos)
                    return; 
            } else { 
                // Рассчитываем все пути для дорог только 1 раз в начале жизни крипа
                var spawns = creep.room.find(FIND_MY_SPAWNS);
                if (spawns.length) {
                    var energySources = creep.room.find(FIND_SOURCES_ACTIVE); 
                    var i = 0;
                    var paths = [];
                    for (var spawn of spawns) {
                        for (var source of energySources) {
                            const path = spawn.pos.findPathTo(source);
                            paths[i++] = path;
                        }
                    }
                    creep.memory.paths = paths;
                }
                return; // Завершаемся, чтобы не выполнился creep.Idle()
            }
            creep.Idle(); 
        }
    }
    else {
        creep.FetchEnergy();
    }
	
};