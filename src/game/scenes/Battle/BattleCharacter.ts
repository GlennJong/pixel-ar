import Phaser from 'phaser';
import { runTween } from '../../utils/runTween';
import { StatusBoard } from './StatusBoard';
import { Character } from '../../components/Character';
import { TDialogData } from '../../components/PrimaryDialogue';
import { selectFromPriority } from '../../utils/selectFromPriority';

type TDialogItem = {
  priority: number;
  dialog: TDialogData[];
};

export type TEffect = {
  type: 'damage' | 'recover';
  target: 'self' | 'opponent';
  value?: number;
  basic: number;
};

type TReaction = {
  animation: 'damage' | 'recover' | string | { key: string };
  dialogues: TDialogItem[];
};

type TAction = {
  animation: 'attack' | string;
  dialogues: TDialogItem[];
  priority: number;
  effect: TEffect;
};

type TResult = {
  icon: { key: string; frame: string };
  dialogues: TDialogItem[];
};

export type TRunAction = {
  dialog: TDialogData[];
} & TAction;

export type TRunReaction = {
  dialog: TDialogData[];
  isDead: boolean;
} & TReaction;

export type TRunResult = {
  dialog: TDialogData[];
} & TResult;

const fullWidth = 160;

const defaultCharacterPosition = {
  self: { x: 10, y: 70 },
  opponent: { x: 96, y: 12 },
};

const defaultStatusBoardPosition = {
  self: { x: 80, y: 70 },
  opponent: { x: 10, y: 10 },
};

export default class BattleCharacter extends Character {
  public hp: { current: number; max: number } = { current: 0, max: 0 };
  private actions?: { [key: string]: TAction };
  private reactions?: { [key: string]: TReaction };
  private common?: { [key: string]: TDialogItem[] };
  private results?: { [key: string]: TResult };
  private role: 'self' | 'opponent' = 'self';
  public board?: StatusBoard;
  public avaliableActions?: string[];
  // private shadow: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    key: string,
    role: 'self' | 'opponent',
  ) {
    // get current character config
    const battleConfig = scene.cache.json.get('config').battle;
    
    const currentBattleCharacterConfig =
      battleConfig[key] ||
      battleConfig['default'];

    if (!currentBattleCharacterConfig) return;

    const { animations, base, actions, reactions, common, results } = currentBattleCharacterConfig;

    const characterProps = {
      ...defaultCharacterPosition[role],
      animations: animations,
    };

    super(scene, key, characterProps);


    // define role
    this.role = role;

    // define config
    this.avaliableActions = Object.keys(actions);
    this.actions = actions;
    this.reactions = reactions;
    this.common = common;
    this.results = results;

    // define current action
    this.hp = {
      current: base.max_hp,
      max: base.max_hp,
    };


    // set default character status board and character animation
    const { name } = base;
    const boardPosition = defaultStatusBoardPosition[role];
    this.board = new StatusBoard(scene, boardPosition.x, boardPosition.y, {
      hp: this.hp,
      name,
    });

    this.playAnimation('idle');

    this.getRandomAction();
  }

  public async openingCharacter() {
    const position = defaultCharacterPosition[this.role];
    const distance = this.role === 'self' ? fullWidth : fullWidth * -1;

    this.character.setPosition(position.x + distance, position.y);
    await runTween(this.character, { x: position.x }, 1000);
  }

  private handlePlayKeyFrameAnimation = async (key: string) => {
    await this.board!.setAlpha(0);
    await this.playAnimation(key, 1000);
    this.playAnimation('idle');
    await this.board!.setAlpha(1);
  };

  private handlePlayAttackReaction = async () => {
    const distance = this.role === 'self' ? 8 : -8;
    const position = defaultCharacterPosition[this.role];

    await this.board!.setAlpha(0);
    await runTween(this.character, { x: position.x + distance }, 200);
    await runTween(this.character, { x: position.x }, 200);
    await this.board!.setAlpha(1);
  };

  public runAction(action = 'sp'): TRunAction | undefined {
    const currentAction = this.actions![action];

    if (!currentAction) return;

    const { animation, dialogues } = currentAction;

    // Run key frame animation
    if (animation === 'attack') {
      this.handlePlayAttackReaction();
    } else {
      this.handlePlayKeyFrameAnimation(animation);
    }

    return {
      ...currentAction,
      dialog: selectFromPriority(dialogues).dialog,
    };
  }

  private handlePlayDamageReaction = async (value: number) => {
    function easeInOutCubic(x: number): number {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    const result = Math.max(0, this.hp.current - value);
    this.hp.current = result;
    await runTween(
      this.character,
      { alpha: 0, repeat: 3 },
      100,
      easeInOutCubic,
    );
    this.character.setAlpha(1);
    await this.board!.setHP(this.hp.current);
  };

  private handlePlayRecoverReaction = async (value: number) => {
    const result = Math.min(this.hp.max, this.hp.current + value);
    this.hp.current = result;
    this.character.setOrigin(0.5);
    const originX = this.character.x;
    const originY = this.character.y;
    this.character.setPosition(this.character.x + this.character.width/2, this.character.y + this.character.height/2);
    await runTween(this.character, { scale: 1.15, yoyo: 1 }, 200);
    this.character.setPosition(originX, originY);
    this.character.setOrigin(0);
    this.character.setScale(1);
    await this.board!.setHP(this.hp.current);
  };

  public runReaction(
    reaction = 'damage',
    value: number,
  ): TRunReaction | undefined {
    const currentReaction = this.reactions![reaction];

    if (!currentReaction) return;

    const { animation, dialogues } = currentReaction;

    // Run key frame animation
    if (typeof animation !== 'string' && animation.key) {
      this.handlePlayKeyFrameAnimation(animation.key);
    }
    if (animation === 'damage') {
      this.handlePlayDamageReaction(value);
    } else if (animation === 'recover') {
      this.handlePlayRecoverReaction(value);
    }

    return {
      ...currentReaction,
      dialog: selectFromPriority(dialogues).dialog,
      isDead: this.hp.current <= 0,
    };
  }

  public runResult(action: string): TRunResult | undefined {
    const currentResult = this.results![action];
    if (!currentResult) return;

    if (action === 'lose') {
      this.setAlpha(0.5);
    }
    this.board!.setAlpha(0);

    const { dialogues } = currentResult;

    return {
      ...currentResult,
      dialog: selectFromPriority(dialogues).dialog,
    };
  }

  public runStart() {
    const startDialog = this.common!['start'];
    if (!startDialog) return;

    return selectFromPriority(startDialog).dialog;
  }

  public runFinish() {
    const finishDialog = this.common!['finish'];
    if (!finishDialog) return;

    return selectFromPriority(finishDialog).dialog;
  }

  public getRandomAction() {
    if (!this.actions) return;
    const allAction = Object.keys(this.actions);
    let sumPriority = 0;

    const allActionPoint: { [key: string]: number } = {};

    allAction.forEach((key) => {
      allActionPoint[key] = sumPriority += this.actions![key].priority;
    });

    const randomPoint = sumPriority * Math.random();

    allAction.forEach((key) => {
      allActionPoint[key] = Math.abs(allActionPoint[key] - randomPoint);
    });

    const closestPoint = Math.min(...Object.values(allActionPoint));
    const selectedAction = Object.keys(allActionPoint).find(
      (key) => allActionPoint[key] === closestPoint,
    );

    return selectedAction;
  }

  public showBoard() {
    this.board?.setAlpha(1);
  }
  public hideBoard() {
    this.board?.setAlpha(0);
  }
  
  public characterHandler() {
    this.board!.updateStatusBoard();
  }
}
