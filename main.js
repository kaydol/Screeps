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

// Здесь определяется какое поведение выполнять на крипах с соответствующей ролью
const runners = [
    {name: creepManager.Roles.HARVESTER.roleName, runner: roleHarvester},
    {name: creepManager.Roles.MINEHEAD.roleName, runner: roleMineHead},
    {name: creepManager.Roles.UPGRADER.roleName, runner: roleUpgrader},
    {name: creepManager.Roles.BUILDER.roleName, runner: roleBuilder},
    {name: creepManager.Roles.COBBLER.roleName, runner: roleCobbler},
    {name: creepManager.Roles.HAULER.roleName, runner: roleHauler},
    {name: creepManager.Roles.LONG_DISTANCE_MINER.roleName, runner: roleLongDistanceMiner},
    {name: creepManager.Roles.CLAIMER.roleName, runner: roleClaimer}
];
const dictionary = runners.reduce((r, o) => Object.assign(r, { [o.name]: o }), {})

module.exports.loop = function () {
    
    creepManager.VisualizeSpawningUnits();
    creepManager.ClearDeadCreepsMemory();
    creepManager.SpawnUnitsIfNeeded();
    
    defenceManager.EngageTowers();
    
    structureManager.BuildStructures();
    
    for(let name in Game.creeps) {
        const creep = Game.creeps[name];
        if (dictionary[creep.GetRole()].runner) {
            dictionary[creep.GetRole()].runner(creep);
        }
    }
}
