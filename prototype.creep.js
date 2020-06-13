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
        var destination = Game.getObjectById(creep.GetDestination());
        if (destination) {
            if (!creep.pos.isNearTo(destination)) {
                creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffaa00'}});
                return false;
            } else {
                //delete creep.memory.destination;
                return destination.id;
            }
        } else {
            delete creep.memory.destination;
            return false;
        };
    },
    Creep.prototype.ClearDestination = function() {
        delete this.memory.destination;
    },
    Creep.prototype.IncreaseMoveToFailures = function() {
        if (this.memory.moveToFailures)
            this.memory.moveToFailures++;
        else
            this.memory.moveToFailures = 1;
    },
    Creep.prototype.ClearMoveToFailures = function() {
        this.memory.moveToFailures = 0;
    },
    
    Creep.prototype.FetchEnergy = function() {
        var creep = this;
        
        // Определяем куда ехать за ресурсами
        // Определяем 1 раз, после приезда на место стоим и пытаемся заполнится
        var destination = Game.getObjectById(creep.GetDestination());
    
        if (destination) {
            if (!creep.pos.isNearTo(destination)) {
                var errorCode = creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffaa00'}});
                if (errorCode == ERR_NO_PATH) {
                    creep.IncreaseMoveToFailures();
                } else {
                    creep.ClearMoveToFailures();
                }
                return;
            } else {
                if (creep.store.getFreeCapacity() > 0 && !(creep.withdraw(destination, RESOURCE_ENERGY) == OK || creep.harvest(destination) == OK)) {
                    creep.say('🤔 '); // приехали за ресурсами, а их там нет. Едем в другое место
                } else {
                    creep.ClearDestination();
                }
            }
        }
        
        // Пытаемся найти ближайший контейнер с ресурсами
        var containers = creep.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER });
        var containersWithEnergy = creep.room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0 });
        // Ищем только тех шахтеров, которые находятся возле своего назначенного источника энергии
        var mineheads = _.filter(Game.creeps, (c) => c.GetRole() == creepManager.Roles.MINEHEAD.roleName && c.IsNearBoundSource());
        
        /*
        var nearestSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        var nearestContainer = creep.pos.findClosestByPath(containersWithEnergy);
        
        var containerIsCloser = true;
        if (nearestContainer) {
            var distToContainer = nearestContainer.pos.findPathTo(creep.pos).length;
            var distToSource = nearestSource.pos.findPathTo(creep.pos).length;
            containerIsCloser = distToContainer <= distToSource;
        }
        
        if (containers.length && containerIsCloser && mineheads.length) {
            if (containersWithEnergy.length) {
                // Если нашли контейнер, едем к нему
                creep.SetDestination(nearestContainer.id);
            } 
        } else {
            // Если в комнате нет контейнеров, или шахтеры отсутствуют или находятся слишком далеко от источников, едем к ближайшему источнику и добываем сами
            creep.SetDestination(nearestSource.id);
        }
        */
        
        if (containers.length && mineheads.length) {
            if (containersWithEnergy.length) {
                // Если нашли контейнер, едем к нему
                var closest = creep.pos.findClosestByPath(containersWithEnergy);
                creep.memory.destination = closest.id;
            } 
        } else {
             // Если в комнате нет контейнеров или шахтеров, которые их наполняют, едем к ближайщему источнику
            var closest = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (closest) {
                creep.memory.destination = closest.id; 
            } else {
                // Путь заблокирован крипами
            }
        }
    },
    
    
    Creep.prototype.Idle = function() {
        var creep = this;
        creep.say('Idle');
        creep.moveTo(creep.pos.findClosestByPath(FIND_MY_SPAWNS, {ignoreCreeps: true}));
    },
    
    
    Creep.prototype.SetRole = function(role) {
        this.memory.role = role;
    },
    Creep.prototype.GetRole = function() {
        return this.memory.role;
    },
    
    
    Creep.prototype.GetBoundSourceObject = function() {
        return Game.getObjectById(this.memory.boundSource);
    },
    Creep.prototype.GetBoundSource = function() {
        return this.memory.boundSource;
    },
    Creep.prototype.SetBoundSource = function(boundSource) {
        this.memory.boundSource = boundSource;
    },
    Creep.prototype.IsNearBoundSource = function() {
        if (!this.GetBoundSource())
            return false;
        var obj = this.GetBoundSourceObject();
        if (!obj) 
            return false;
        return this.pos.inRangeTo(obj.pos, 3);
    }
};
