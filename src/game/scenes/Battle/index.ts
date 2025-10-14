import Phaser, { Scene } from 'phaser';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';

import BattleCharacter from './BattleCharacter';
import { sceneStarter, sceneFinisher } from '../../components/CircleSceneTransition';
import { originalHeight, originalWidth } from '../../constants';
import { Menu } from './Menu';
import { KeyboardHandler } from '@/game/handlers/KeyboardHander';
import { EventBus } from '@/game/EventBus';


const introduction: Record<string, string> = {
  default: '就是個沙包',
  beibei: '她是來自貞貞俱樂部的貝貝！\n創作者是實況主貞尼鹹粥！',
  shangshang: '他是來自貞貞俱樂部的上上！\n創作者是實況主貞尼鹹粥！',
  jennie: '他是實況主貞尼鹹粥！最喜歡吃拉麵！',
  currycat: '他是咖哩貓！是這個小遊戲的作者！\n在這個遊戲發生的所有bug都要怪他！',
  maoramei: '貓辣妹',

  bbb: '他是最喜歡數碼寶貝的插畫家兼實況主BBB！是貞貞俱樂部的',
  daradara: '她是插畫家兼實況主橙踏青！',
  xiaodie: '她是插畫家兼實況主橙踏青！',
  lilia: '哩哩',
  pachinko: '啊爬',
  quai: '啊快',
  p13p04: '問問',
  veg: '她們是龐淇和小幽靈們！創作者是實況主兼插畫家R菜！',
  touching: '她是插畫家兼實況主橙踏青！',
  ai4: 'ㄐㄎ',
}

const promoteContent = '喜歡這個小遊戲嗎？\n歡迎加入貞貞俱樂部！'

const actionOptions = ['攻擊', '恢復', '你是誰'];
const finishingOptions = ['繼續戰鬥', '關於遊戲', '離開'];
const battleListOptions = [
  { text: '貞尼鹹粥', value: 'jennie' },
  { text: '貝貝', value: 'beibei' },
  { text: '上上', value: 'shangshang' },
  { text: '貓辣妹', value: 'maoramei' },
  { text: '咖哩貓', value: 'currycat' },
];

export default class Battle extends Scene {
  opponentName: string = 'default';
  background?: Phaser.GameObjects.Rectangle;
  self?: BattleCharacter;
  opponent?: BattleCharacter;
  menu?: Menu;
  dialogue?: PrimaryDialogue;
  keyboardHandler?: KeyboardHandler;

  constructor() {
    super('Battle');
  }

  preload() {
    this.load.setPath('assets');
  }

  create() {
    // background
    this.background = this.add.rectangle(0, 0, originalWidth, originalHeight, 0xeeeeee)
    .setDepth(0)
    .setOrigin(0);

    // 支援 restart 傳入 data.opponentName，否則 fallback 到 URL params
    let opponentName = 'default';
    const data = this.scene.settings.data as { opponentName?: string } | undefined;
    if (data && typeof data.opponentName === 'string') {
      opponentName = data.opponentName;
    } else {
      const params = new URLSearchParams(document.location.search);
      opponentName = params.get('opponent') || 'default';
    }
    this.opponentName = opponentName;

    // init characters
    this.opponent = new BattleCharacter(
      this,
      `battle_${opponentName}_opponent`,
      'opponent',
    );
    this.opponent.setDepth(1);
    this.opponent.board?.setDepth(1);

    this.self = new BattleCharacter(
      this,
      'battle_afk_self',
      'self',
    );
    this.self.setDepth(1);
    this.self.board?.setDepth(1);

    this.keyboardHandler = new KeyboardHandler(this, {
      onUp: () => this.handleControlButton('up'),
      onDown: () => this.handleControlButton('down'),
      onSpace: () => this.handleControlButton('space')
    });
    EventBus.on('game-up-keydown', () => {this.handleControlButton('up')})
    EventBus.on('game-down-keydown', () => this.handleControlButton('down'))
    EventBus.on('game-select-keydown', () => this.handleControlButton('space'))
    
    // default hide status board
    this.self.hideBoard();
    this.opponent.hideBoard();

    // init dialogue
    this.dialogue = new PrimaryDialogue(this);
    this.dialogue.initDialogue();
    this.dialogue.setDepth(2);

    // init Menu
    this.menu = new Menu(this, {
      actions: [...actionOptions]
    });
    this.menu.init();
    this.menu.hideMenu();
    this.menu.setDepth(3);
    
    sceneStarter(this);
    this.handleStartGameScene();

    this.events.on('shutdown', this.shutdown, this);
  }

  update() {
    this.self?.characterHandler();
    this.opponent?.characterHandler();
    this.keyboardHandler?.update();
  }

  private async applyAttackTurn() {
    const turns = ['self', 'opponent'];
    for (let i = 0; i < turns.length; i++) {
      const from = turns[i];
      // action movement
      const actionCharacter = from === 'self' ? this.self : this.opponent;
      const currentAction = actionCharacter!.getRandomAction();
      const actionResult = actionCharacter!.runAction(currentAction);

      if (!actionResult) return;
      const { effect, dialog: actionDialog } = actionResult;
      
      if (!effect) return;
      const { type, target, value } = effect;
      await this.dialogue!.runDialogue(actionDialog);
  
      // reaction movement
      const sufferCharacter = target === 'self' ? this.self : this.opponent;
      const reactionResult = await sufferCharacter!.runReaction(type, value || 0);
  
      if (!reactionResult) return;
      const { dialog: sufferDialog, isDead } = reactionResult;
      await this.dialogue!.runDialogue(sufferDialog);
  
      
      if (isDead) {
        const winResult = actionCharacter!.runResult('win');
        if (!winResult) return;
        const { dialog: winnerDialog } = winResult;
        await this.dialogue!.runDialogue(winnerDialog);
  
        sufferCharacter!.runResult('lose');
        const loseResult = sufferCharacter!.runResult('lose');
  
        
        if (!loseResult) return;
        const { dialog: loserDialog } = loseResult;
        await this.dialogue!.runDialogue(loserDialog);
  
        this.handleFinishGame();
        return;
      }
      else {
        this.handleSelectAction();
      }
    }
    
  }
  private async applyRecoverTurn() {
    const actionCharacter = this.self;
    const currentAction = actionCharacter!.getRecoverAction();
    const actionResult = actionCharacter!.runAction(currentAction);

    if (!actionResult) return;
    const { effect, dialog: actionDialog } = actionResult;
    
    if (!effect) return;
    const { type, target, value } = effect;
    await this.dialogue!.runDialogue(actionDialog);

    // reaction movement
    const sufferCharacter = target === 'self' ? this.self : this.opponent;
    const reactionResult = await sufferCharacter!.runReaction(type, value || 0);

    if (!reactionResult) return;
    const { dialog: sufferDialog } = reactionResult;
    await this.dialogue!.runDialogue(sufferDialog);

    this.handleSelectAction();
  }

  private async applyTalking() {
    await this.dialogue!.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: introduction[this.opponentName],
    }]);

    this.handleSelectAction();
  }

  private async continueGame() {
    await this.dialogue!.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: '你要跟誰戰鬥呢？',
    }]);

    this.menu?.setActions(battleListOptions.map(({ text }) => text));
    this.menu?.showMenu();
  }

  private async handleControlButton(key: 'up' | 'down' | 'space') {
    if (key === 'up') {
      this.menu?.prevAction();
    } else if (key === 'down') {
      this.menu?.nextAction();
    } else if (key === 'space') {
      const menuAction = this.menu?.select();
      if (menuAction) {
        this.menu?.hideMenu();
        if (menuAction === '攻擊') {
          await this.applyAttackTurn();
        }
        else if (menuAction === '恢復') {
          await this.applyRecoverTurn();
        }
        else if (menuAction === '你是誰') {
          await this.applyTalking();
        }
        else if (menuAction === '關於遊戲') {
          await this.dialogue!.runDialogue([{
            portrait: 'battle_afk_self_face_normal',
            text: '這是咖哩貓做的貞貞俱樂部二創小遊戲\n滿足小小的想做遊戲的願望\n希望你有喜歡！',
          }]);
          this.menu?.showMenu();
        }
        else if (menuAction === '離開') {
          await this.dialogue!.runDialogue([{
            portrait: 'battle_afk_self_face_normal',
            text: '88888888',
          }]);
          sceneFinisher(this);
        }
        else if (menuAction === '繼續戰鬥') {
          await this.continueGame();
        }
        else if (battleListOptions.map(({ text }) => text).includes(menuAction)) {
          const result = battleListOptions.find(({ text }) => text === menuAction);
          if (result) {
            this.restartBattle(result.value);
          }
        }
      }
    }
  }

  private async restartBattle(opponentName: string) {
    await this.dialogue?.runDialogue([{
      portrait: 'battle_afk_self_face_angry',
      text: '繼續戰鬥！',
    }]);
    await sceneFinisher(this);
    this.scene.restart({ opponentName });
  }

  private async handleStartGameScene() {
    await this.openingCharacterMovement();
    this.handleSelectAction();
  }

  private async handleSelectAction() {
    await this.dialogue?.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: '要做什麼呢？',
    }]);
    // this.menu?.setActions(battleListOptions.map(({ text }) => text));
    // this.menu?.setActions(finishingOptions);
    this.menu?.showMenu();
  }

  private async handleFinishGame() {
    await this.dialogue!.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: promoteContent,
    }])
    this.menu?.setActions(finishingOptions);
    this.menu?.showMenu();
  }

  private async openingCharacterMovement() {
    this.self!.character.setAlpha(0);
    this.opponent!.character.setAlpha(0);

    // run self opening animation
    this.self!.character.setAlpha(1);
    await this.self!.openingCharacter();

    // run battle introduce
    const selfStartDialog = this.self!.runStart();

    if (selfStartDialog) {
      await this.dialogue!.runDialogue(selfStartDialog);
    };

    // run opponent opening animation
    this.opponent!.character.setAlpha(1);
    await this.opponent!.openingCharacter();

    const opponentStartDialog = this.opponent!.runStart();
    if (opponentStartDialog) {
      await this.dialogue!.runDialogue(opponentStartDialog);
    };

    // show status board for both
    this.self?.showBoard()
    this.opponent?.showBoard()

  }
  shutdown() {
    this.menu?.destroy();
    this.keyboardHandler?.destroy();
    this.opponent!.destroy();
    this.self!.destroy();
    EventBus.off('game-up-keydown')
    EventBus.off('game-down-keydown')
    EventBus.off('game-select-keydown')
  }
}
