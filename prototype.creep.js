const defRoles = require('definitions.roles')();

/*
    В этом модуле находятся функции, которые расширяют класс Creep
*/

module.exports = function() {
    
    Creep.prototype.GetDestinationObject = function() {
        return Game.getObjectById(this.memory.destination);
    },
    Creep.prototype.GetDestination = function() {
        return this.memory.destination;
    },
    Creep.prototype.SetDestination = function(destination) {
        this.memory.destination = destination;
    },
    Creep.prototype.TryReachDestination = function() {
        const creep = this;
        const destination = creep.GetDestinationObject();
        if (destination) {
            if (!creep.pos.isNearTo(destination)) {
                creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffaa00'}});
                return false;
            } else {
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
    
    Creep.prototype.FetchEnergy = function(roomWithEnergy) {
        const creep = this;
        if (!roomWithEnergy) 
            roomWithEnergy = creep.room;
        
        
        // Определяем куда ехать за ресурсами
        // Определяем 1 раз, после приезда на место стоим и пытаемся заполнится
        const destination = creep.GetDestinationObject();
    
        if (destination) {
            if (!creep.pos.isNearTo(destination)) {
                let errorCode = creep.moveTo(destination, {visualizePathStyle: {stroke: '#ffaa00'}});
                if (errorCode == ERR_NO_PATH) {
                    creep.IncreaseMoveToFailures();
                } else {
                    creep.ClearMoveToFailures();
                }
                return;
            } else {
                // Если harvest возвращает ERR_NOT_OWNER значит комнату кто-то занял\зарезервировал и мы больше не можем в ней добывать 
                if (creep.store.getFreeCapacity() > 0 && !(creep.withdraw(destination, RESOURCE_ENERGY) == OK || creep.harvest(destination) == OK)) {
                    creep.say('🤔'); // приехали за ресурсами, а их там нет. Едем в другое место
                } else {
                    creep.ClearDestination();
                }
            }
        }
        
        // Пытаемся найти ближайший контейнер с ресурсами
        const containers = roomWithEnergy.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER });
        const containersWithEnergy = roomWithEnergy.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0 });
        // Ищем только тех шахтеров, которые находятся возле своего назначенного источника энергии
        const mineheads = _.filter(Game.creeps, (c) => c.GetRole() == defRoles.MINEHEAD && c.IsNearBoundSource());
        
        /*
        let nearestSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        let nearestContainer = creep.pos.findClosestByPath(containersWithEnergy);
        
        let containerIsCloser = true;
        if (nearestContainer) {
            let distToContainer = nearestContainer.pos.findPathTo(creep.pos).length;
            let distToSource = nearestSource.pos.findPathTo(creep.pos).length;
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
                const closest = creep.pos.findClosestByPath(containersWithEnergy);
                if (closest) {
                    creep.SetDestination(closest.id); 
                } else {
                    // Путь заблокирован крипами
                }
            } else {
                creep.Idle();
            }
        } else {
            // Если в комнате нет контейнеров или шахтеров, которые их наполняют, едем к ближайшему источнику
            const closest = creep.pos.findClosestByPath(roomWithEnergy.find(FIND_SOURCES_ACTIVE));
            if (closest) {
                creep.SetDestination(closest.id); 
            } else {
                // Путь заблокирован крипами
            }
        }
    },
    
    
    Creep.prototype.Idle = function() {
        const creep = this;
        creep.say('Idle');
        if (creep.getActiveBodyparts(MOVE) > 0)
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
        const obj = this.GetBoundSourceObject();
        if (!obj) 
            return false;
        return this.pos.inRangeTo(obj.pos, 2);
    },
    Creep.prototype.SetPullTowards = function(destination) {
        this.memory.pullTowards = destination;
    },
    Creep.prototype.GetPullTowards = function() {
        return this.memory.pullTowards;
    },
    Creep.prototype.GetPullTowardsObject = function() {
        return Game.getObjectById(this.memory.pullTowards);
    },
    Creep.prototype.ClearPullTowards = function() {
        if (this.memory.pullTowards) 
            delete this.memory.pullTowards;
    },
    
    
    Creep.prototype.IsDying = function() {
        const creep = this;
        return creep.ticksToLive < 50;
    },
    Creep.prototype.PrepareToDie = function() {
        const creep = this;
        if (creep.store[RESOURCE_ENERGY] > 0) {
            const closest = creep.FindClosestStorage();
            if (closest) {
                if (creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest);
                    creep.say('✝');
                };
            }
        }
    },
    Creep.prototype.FindClosestStorage = function(room, structureTypes=[STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_CONTAINER, STRUCTURE_STORAGE], canBeFull=false) {
        const creep = this;
        if (!room) 
            room = creep.room;
        const targets = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.my && (structureTypes.includes(structure.structureType))) || 
                        ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structureTypes.includes(structure.structureType))) &&
                        (canBeFull || structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });
        return creep.pos.findClosestByPath(targets);
    },
    
    Creep.prototype.GetSpawnerName = function() {
        return this.memory.spawner;
    },
    Creep.prototype.GetSpawnerObject = function() {
        return Game.spawns[this.memory.spawner];
    },
    
    // Возвращает true когда надо починиться, undefined когда не надо
    Creep.prototype.RenewIfNeeded = function(ticksToLive=1500, requiresPulling=false) {
        
        const creep = this;
        if (creep.ticksToLive <= ticksToLive) {
    	    creep.memory.renewing = true;
        }
        
        if (creep.memory.renewing) {
            creep.say('♻');
            let spawn = creep.GetSpawnerObject();
            
            if (!creep.pos.isNearTo(spawn, 1)) {
                creep.moveTo(spawn);
                if (requiresPulling) 
                    creep.SetPullTowards(spawn.id);
            } else {
                if (requiresPulling)
                    creep.ClearPullTowards();
            }
            let errorCode = spawn.renewCreep(creep); 
            if (errorCode == ERR_FULL || errorCode == ERR_NOT_ENOUGH_ENERGY) {
                delete creep.memory.renewing;
                if (requiresPulling)
                    creep.ClearPullTowards();
            }
        }
        return creep.memory.renewing;
    },
    Creep.prototype.IsRenewing = function() {
        return this.memory.renewing;
    }
    
};
