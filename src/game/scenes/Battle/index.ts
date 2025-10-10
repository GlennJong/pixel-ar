import Phaser, { Scene } from 'phaser';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';

import BattleCharacter from './BattleCharacter';
import { sceneStarter } from '../../components/CircleSceneTransition';
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

const promoteContent = '喜歡這個小遊戲嗎？\n快去追蹤貞尼鹹粥！！\n加入貞貞俱樂部！！'


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

    const params = new URLSearchParams(document.location.search);
    
    const opponent = params.get('opponent') || 'default';
    this.opponentName = opponent;

    // init characters
    this.opponent = new BattleCharacter(
      this,
      `battle_${opponent}_opponent`,
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
      actions: [
        '攻擊',
        '你是誰',
        'AR模式',
      ]
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

  private async applyTalking() {
    await this.dialogue!.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: introduction[this.opponentName],
    }]);

    this.handleSelectAction();
  }

  private async applyARTalking() {
    await this.dialogue!.runDialogue([
      {
        portrait: 'battle_afk_self_face_normal',
        text: '點擊下面AR按鈕後會進入AR模式！\n將鏡頭對準卡片上的圖案就可以看到角色喔！',
      },
      {
        portrait: 'battle_afk_self_face_angry',
        text: '但目前這只是beta功能！\n可能圖像會辨識不出來喔！',
      }
    ]);

    this.handleSelectAction();
  }
  

  private async handleControlButton(key: 'up' | 'down' | 'space') {
    if (key === 'up') {
      this.menu?.prevAction();
    } else if (key === 'down') {
      this.menu?.nextAction();
    } else if (key === 'space') {
      const action = this.menu?.select();

      if (action) {
        this.menu?.hideMenu();
        if (action === '攻擊') {
          await this.applyAttackTurn();
        }
        else if (action === '你是誰') {
          await this.applyTalking();
          // 你是誰？
        }
        else if (action === 'AR模式') {
          await this.applyARTalking();
          // 點擊下方按鈕，可以進入 AR 模式
        }

      }
    }
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
    this.menu?.showMenu();
  }

  private async handleFinishGame() {
    await this.dialogue!.runDialogue([{
      portrait: 'battle_afk_self_face_normal',
      text: promoteContent,
    }])
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
  }
}
