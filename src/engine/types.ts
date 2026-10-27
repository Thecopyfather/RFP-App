/** Source-linked content contracts. No React, DOM, storage or game text belongs here. */
export const STAT_KEYS = ['CR', 'TA', 'RE', 'NE', 'TS'] as const;
export type StatKey = typeof STAT_KEYS[number];
export type Stats = Record<StatKey, number>;
export type CreationStep = 'attributes' | 'perk' | 'mentor' | 'summary';
export type Condition =
  | {kind:'mentor'; id:string}
  | {kind:'flag'; key:string; value:boolean}
  | {kind:'capital'; operator:'gte'|'lt'; value:number}
  | {kind:'all'; conditions:Condition[]};
export type Effect = (
  | {kind:'capital'; amount:number; category:'gain'|'setback'|'purchase'|'lose-all'}
  | {kind:'stat'; stat:StatKey; amount:number}
  | {kind:'flag'; key:string; value:boolean}
) & {id:string; reason:string; when?:Condition};
export interface NarrativeBlock {text:string; condition?:Condition}
export interface Choice {id:string; label:string; target:string; condition?:Condition}
export interface RollOutcome {min?:number; max?:number; label:string; target:string; rank:'success'|'mixed'|'failure'; effects?:Effect[]}
export interface DiceCheck {id:string; stat:StatKey; intro:string; outcomes:RollOutcome[]}
export interface Scene {
  id:string; heading:string; paragraphs:NarrativeBlock[]; choices:Choice[];
  check?:DiceCheck; effects?:Effect[]; illustration:string; sourcePages:number[];
  ending?:'victory';
}
export interface Perk {id:string; name:string; description:string; stats:Partial<Stats>; capital:number; sourcePages:number[]}
export interface Mentor {
  id:string; name:string; tagline:string; description:string; quote:string;
  passive:{name:string; text:string; stats:Partial<Stats>; lossReduction?:number};
  power:{name:string; text:string; kind:'reroll-loss'|'halve-loss'|'neutral-result'};
  sourcePages:number[];
}
export interface GameDefinition {
  id:string; version:string; title:string; attributes:{key:StatKey; name:string; description:string}[];
  initialCapital:number; winCapital:number; startSection:string; victorySection:string;
  scenes:Record<string,Scene>; perks:Perk[]; mentors:Mentor[];
}
export interface PendingRoll {
  id:string; sectionId:string; dice:[number,number]; stat:StatKey; modifier:number; total:number;
  outcomeIndex:number; previousDice?:[number,number]; power?:Mentor['power']['kind'];
}
export interface HistoryEntry {id:string; sectionId:string; label:string; capitalChange:number; statChanges:Partial<Stats>}
export interface GameState {
  schemaVersion:1; gameId:string; contentVersion:string; runId:string; revision:number;
  phase:'creation'|'adventure'|'roll-result'|'boundary'|'game-over'|'victory';
  creationStep:CreationStep; name:string; baseStats:Stats; rolled:StatKey[];
  perkId:string|null; mentorId:string|null; capital:number; statChanges:Stats;
  sectionId:string; visit:number; flags:Record<string,boolean>; history:HistoryEntry[];
  applied:string[]; powerUsed:boolean; pendingRoll:PendingRoll|null;
  boundary:{from:string; target:string; label:string}|null;
  lastOutcome:{label:string; capitalChange:number; statChanges:Partial<Stats>; power?:string}|null;
}
type CommandPayload =
  | {type:'SET_NAME'; name:string}
  | {type:'ROLL_ATTRIBUTE'; stat:StatKey}
  | {type:'ROLL_ALL_ATTRIBUTES'}
  | {type:'SET_CREATION_STEP'; step:CreationStep}
  | {type:'SELECT_PERK'; perkId:string}
  | {type:'SELECT_MENTOR'; mentorId:string}
  | {type:'START_ADVENTURE'}
  | {type:'CHOOSE'; choiceId:string}
  | {type:'ROLL_CHECK'}
  | {type:'USE_MENTOR'}
  | {type:'CONFIRM_ROLL'};
export type GameCommand = CommandPayload & {id:string};
export type CommandInput = CommandPayload;
export type DiceSource = () => number;
export interface StorageLike {getItem(key:string):string|null; setItem(key:string,value:string):void; removeItem(key:string):void}
