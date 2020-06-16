//const profiler = require('screeps-profiler');
//profiler.enable();

const defRoles = require('definitions.roles')();


const creepManager = require('creep.manager');
const defenceManager = require ('defence.manager');
const structureManager = require('structure.manager');

const roleHarvester = require('role.harvester');
const roleMineHead = require('role.minehead');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleCobbler = require('role.cobbler');
const roleHauler = require('role.hauler');
const roleLongDistanceMiner = require('role.longDistanceMiner');
const roleClaimer = require('role.claimer');

module.exports.loop = function () {
    //profiler.wrap(function() {
        defenceManager.EngageTowers();
        structureManager.BuildStructures();
    
        creepManager.ClearDeadCreepsMemory();
        //const roles = creepManager.CalculateCreepAmounts();
        //creepManager.VisualizeCreepAmounts(roles);
        creepManager.SpawnUnitsIfNeeded();
        creepManager.VisualizeSpawningUnits();
        
        // Здесь определяется какое поведение выполнять на крипах с соответствующей ролью
        const runners = [
            {name: defRoles.HARVESTER, runner: roleHarvester},
            {name: defRoles.MINEHEAD, runner: roleMineHead},
            {name: defRoles.UPGRADER, runner: roleUpgrader},
            {name: defRoles.BUILDER, runner: roleBuilder},
            {name: defRoles.COBBLER, runner: roleCobbler},
            {name: defRoles.HAULER, runner: roleHauler},
            {name: defRoles.LONG_DISTANCE_MINER, runner: roleLongDistanceMiner},
            {name: defRoles.CLAIMER, runner: roleClaimer}
        ];
        const dictionary = runners.reduce((r, o) => Object.assign(r, { [o.name]: o }), {})

        for(let name in Game.creeps) {
            const creep = Game.creeps[name];
            if (dictionary[creep.GetRole()].runner) {
                dictionary[creep.GetRole()].runner(creep);
            }
        }
    //});
}
