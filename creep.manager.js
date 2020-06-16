
const defRoles = require('definitions.roles')();

/*
    В массиве ROLES хранятся 
        spawnPriority - приоритет (очередность) постройки, чем ниже, тем важнее
        roleName - строковое название роли
        originalParts - массив частей,  из которых состоят представители роли
        originalAmount - какое количество крипов данной роли нужно поддерживать
        condition - условие, которое должно быть истинным, для того, чтобы данный крип рассматривался для спавна
*/

const ROLES = {
    HARVESTER : {spawnPriority: 0, roleName: defRoles.HARVESTER, originalParts: [WORK,CARRY,CARRY,MOVE,MOVE], originalAmount: 4, condition: true}, 
    HAULER : {spawnPriority: 1, roleName: defRoles.HAULER, originalParts: [CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], originalAmount: 1, condition: true},
    MINEHEAD : {spawnPriority: 2, roleName: defRoles.MINEHEAD, originalParts: [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE], originalAmount: 4, condition: true},
    BUILDER : {spawnPriority: 3, roleName: defRoles.BUILDER, originalParts: [WORK,CARRY,CARRY,MOVE,MOVE], originalAmount: 5, condition: true}, // TODO спавнить строителей на основе общего количества хитпоинтов которые надо построить в комнате
    COBBLER : {spawnPriority: 4, roleName: defRoles.COBBLER, originalParts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE], originalAmount: 2, condition: true},
    UPGRADER : {spawnPriority: 5, roleName: defRoles.UPGRADER, originalParts: [WORK,CARRY,CARRY,MOVE,MOVE], originalAmount: 1, condition: true},
    LONG_DISTANCE_MINER : {spawnPriority: 6, roleName: defRoles.LONG_DISTANCE_MINER, originalParts: [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], originalAmount: 4, condition: true},
    CLAIMER : {spawnPriority: 7, roleName: defRoles.CLAIMER, originalParts: [CLAIM,MOVE], originalAmount: 1, condition: true}//,
    //GUARD_
};

// TODO
// Use Room.energyAvailable and Room.energyCapacityAvailable to determine how much energy all the spawns and extensions in the room contain.
// Game.gcl 

const _visualizeNextSpawnedUnit = function(role) {
    // Визуализация - оглашение следующего претендента на спавн
    if(!Game.spawns['Spawn1'].spawning) { 
        Game.spawns['Spawn1'].room.visual.text(
            '🎉 Next: ️' + role.roleName,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }
};

const _determineCreepParts = function(maximumCost, pattern=[]) {
    let parts = [];
    const costs = new Map();
    costs.set(MOVE, 50).set(WORK, 100).set(CARRY, 50).set(ATTACK, 80).set(RANGED_ATTACK, 150).set(HEAL, 250).set(CLAIM, 600).set(TOUGH, 10);
    if (pattern.length) {
        let cost = 0;
        let i = 0;
        while (cost < maximumCost) {
            cost = 0;
            for (let j = 0; j < parts.length; ++j)
                cost += costs.get(parts[j]);
            const nextPart = pattern[i++ % pattern.length];
            if (cost + costs.get(nextPart) <= maximumCost)
                parts = parts.concat(nextPart)
            else
                cost = maximumCost; // вместо break, который почему-то здесь выдает ERROR Illegal Break Statement
        }
    }
    return parts;
};

const _determineCreepAmount = function(originalAmount, currentParts, originalParts) {
    return Math.max(1, Math.round(currentParts.length / originalParts.length * originalAmount)) ;
};

// создает копию ROLES, добавляет поля parts, amount и изменяет condition
_getRoles = function(room) {
    
    let copy = _.cloneDeep(ROLES);
    
    copy.HAULER.condition = 
        room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER }).length;
    copy.MINEHEAD.condition = 
        room.controller.level >= 2 && 
        room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER }).length;
    copy.LONG_DISTANCE_MINER.condition = 
        room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER || i.structureType == STRUCTURE_STORAGE }).length &&
        _.filter(Game.flags, (flag) => flag.color == COLOR_YELLOW/* && !flag.room.controller.reservation падает если нет вижна в комнате*/).length 
    copy.CLAIMER.condition = 
        _.filter(Game.flags, (flag) => flag.color == COLOR_YELLOW).length;
    
    const amountOfHarvesters = _.filter(Game.creeps, (creep) => creep.room == room && creep.GetRole() == defRoles.HARVESTER).length;
    const energyLimit = amountOfHarvesters > 0 ? room.energyCapacityAvailable : room.energyAvailable;
        
    for(let role of Object.values(copy)) {
        role.parts = _determineCreepParts(energyLimit, role.originalParts);
        role.amount = _determineCreepAmount(role.originalAmount, role.originalParts, role.parts);
    }
    
    return copy;
};

_visualizeCreepAmounts = function(room, creepManagerRoles) {
    let i = 0;
    for(let role of _.sortBy(Object.values(creepManagerRoles),'spawnPriority')) {
        const roleMembers = _.filter(Game.creeps, (creep) => creep.GetRole() == role.roleName);
        let text = role.roleName + ' ' + roleMembers.length + ' / ' + role.amount + ' (' + role.originalAmount + ')';
        room.visual.text(text, 1, 1 + i++, {align: 'left'}); 
    }
}

module.exports = {
    

    VisualizeSpawningUnits: function() {
        // Визуализация - показ юнита, который сейчас спавнится
        if(Game.spawns['Spawn1'].spawning) { 
            let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['Spawn1'].pos.x + 1, 
                Game.spawns['Spawn1'].pos.y, 
                {align: 'left', opacity: 0.8});
        }
    },
    
    ClearDeadCreepsMemory: function() {
        // Очистка памяти умерших юнитов
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('May your soul rest in piece, ', name);
            } 
            //else { delete Memory.creeps[name].paths; };
        }
    },
    
    SpawnUnitsIfNeeded: function(debugVisuals=true) {
        
        const spawn = Game.spawns['Spawn1'];
        let roles = _getRoles(spawn.room);
        
        if (debugVisuals) {
            _visualizeCreepAmounts(spawn.room, roles);
        }
        
        // Добавляем нехватающих крипов на основе их spawnPriority
        for(let role of _.sortBy(Object.values(roles),'spawnPriority')) 
        {
            const roleMembers = _.filter(Game.creeps, (creep) => creep.GetRole() == role.roleName);
            if (roleMembers.length < role.amount && role.condition) {
                const newName = role.roleName + Game.time;
                let errorCode = spawn.spawnCreep(role.parts, newName, { dryRun: true });
                if (errorCode == OK) {
                    console.log('Spawning new creep: ' + newName);
                    spawn.spawnCreep(role.parts, newName, { memory: {role: role.roleName, spawner: spawn.name}});
                    return; // очень важный return, чтобы spawnCreep не перезаписывался последующими итерациями в цикле (выходим, чтобы последующих итераций просто не было)
                }
                if (errorCode == ERR_NOT_ENOUGH_ENERGY) {
                    _visualizeNextSpawnedUnit(role);
                    return; // выходим, если не хватило эенергии на спавн приоритетного юнита (ждем пока появится энергия)
                }
            }
        }
    }
};