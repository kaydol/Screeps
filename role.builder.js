var creepManager = require('creep.manager');
require('prototype.creep')();

module.exports = function(creep) {

    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
        creep.say('🔄 harvest');
    }
    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
        creep.memory.building = true;
        creep.say('🚧 build');
    }

    if(creep.memory.building) {
        // Ищем обьект, который можем построить, и строим
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES); // TODO findClosestByPath
        if(targets.length) {
            if(creep.build(creep.pos.findClosestByPath(targets)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        // Если строить нечего, едем стоять на спавне с текстом Idle
        } else {
            creep.Idle();
        }
    }
    else {
        creep.FetchEnergy();
    }
	
};