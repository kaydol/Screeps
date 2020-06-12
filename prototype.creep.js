var creepManager = require('creep.manager');

/*
    В этом модуле находятся функции, которые расширяют класс Creep
*/

module.exports = function() {
    
    Creep.prototype.GetDestination = function() {
        return this.memory.destination;
    },
    
    Creep.prototype.SetDestination = function(destination) {
        this.memory.destination = destination;
    },

    Creep.prototype.TryReachDestination = function() {
        var creep = this;
        var destination = Game.getObjectById(creep.memory.destination);
        if (destination) {
            if (!creep.pos.isNearTo(destination)) {
                creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffaa00'}});
                return false;
            } else {
                delete creep.memory.destination;
                return destination.id;
            }
        } else {
            delete creep.memory.destination;
            return false;
        };
    },
    
    Creep.prototype.FetchEnergy = function() {
        var creep = this;
        
        // Определяем куда ехать за ресурсами
        // Определяем 1 раз, после приезда на место стоим и пытаемся заполнится
        var destination = Game.getObjectById(creep.memory.destination);
    
        if (destination) {
            if (!creep.pos.isNearTo(destination)) {
                creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffaa00'}});
                return;
            } else {
                if (creep.store.getFreeCapacity() > 0 && !(creep.withdraw(destination, RESOURCE_ENERGY) == OK || creep.harvest(destination) == OK)) {
                    creep.say('🤔 '); // приехали за ресурсами, а их там нет. Едем в другое место
                } else {
                    delete creep.memory.destination;
                }
            }
        }
        
        // Пытаемся найти ближайший контейнер с ресурсами
        var containers = creep.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER });
        var containersWithEnergy = creep.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0 });
        var mineheads = _.filter(Game.creeps, (c) => c.memory.role == creepManager.Roles.MINEHEAD.roleName);
        
        if (containers.length && mineheads.length) {
            if (containersWithEnergy.length) {
                // Если нашли контейнер, едем к нему
                var closest = creep.pos.findClosestByPath(containersWithEnergy);
                creep.memory.destination = closest.id;
            } 
        } else {
             // Если в комнате нет контейнеров или шахтеров, которые их наполняют, едем к ближайщему источнику
            var closest = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            creep.memory.destination = closest.id;
        }
    },
    
    Creep.prototype.Idle = function() {
        var creep = this;
        creep.say('Idle');
        creep.moveTo(creep.pos.findClosestByPath(FIND_MY_SPAWNS));
    },
    
    Creep.prototype.GetRole = function() {
        return this.memory.role;
    }
};
