import Phaser, { Scene } from 'phaser';
import { PrimaryDialogue } from '../../components/PrimaryDialogue';

import BattleCharacter from './BattleCharacter';
import { sceneStarter, sceneFinisher } from '../../components/CircleSceneTransition';
import { originalHeight, originalWidth } from '../../constants';
import { Menu } from './Menu';
import { KeyboardHandler } from '@/game/handlers/KeyboardHander';
import { EventBus } from '@/game/EventBus';


type TAnimation = {
  prefix: string;
  qty: number;
  freq: number;
  repeat: number;
  duration: number;
  repeat_delay: number;
};


const introduction: { [key: string]: { portrait: string, text: string }[] } = {
  default: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '就是個沙包。',
    }
  ],
  beibei: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '她是來自貞貞俱樂部的貝貝！\n創作者是實況主貞尼鹹粥！',
    }
  ],
  shangshang: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '他是來自貞貞俱樂部的上上！\n創作者是實況主貞尼鹹粥！',
    }
  ],
  jennie: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '安迪就是實況主貞尼鹹粥！畫風很精緻又復古！\n平常會開台陪大家線上工作聊聊天，也會玩恐怖遊戲給大家看！\n還很喜歡吃拉麵！快去追蹤他！',
    }
  ],
  currycat: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '他是咖哩貓！\n是這個小遊戲的作者！在這個遊戲發生的所有bug都要怪他！',
    },
    {
      portrait: 'battle_currycat_opponent_face_sad',
      text: '不要再來bug啦！！',
    }
  ],
  maoramei: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '她是超有才華的實況主貓辣妹！\n常常舉辦超有創意的實況節目！\n大家的最愛貓辣妹！快去追蹤她！',
    }
  ],

  bbb: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '他是最喜歡數碼寶貝的插畫家兼實況主BBB！',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '超會畫細節滿滿的數碼寶貝大圖！',
    },
  ],
  dara: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '搭拉是俱樂部的插畫家成員之一！\n常常跟R菜一起擺攤！',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: 'OC超可愛！',
    }
  ],
  touching: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '橙踏青是一顆超會畫畫的橘子（？）',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '畫風超精緻又很會作可愛動畫！\n太讚了吧！',
    }
  ],
  ka: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '小咖是哩哩的愛犬！\n來俱樂部看看哩哩曬可愛小咖 >///<',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '哩哩手工力超厲害會做手工藝品！\n也很會吵架千萬不能惹她生氣！\n超感謝哩哩做超好看實用電子書小包給我！',
    }
  ],
  pachin: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '爬慶狗是俱樂部的神秘人物！\n沒人見過他的長相超神秘！',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '講話很幽默但常常講假話！\n真的會來台創祭嗎？',
    }
  ],
  hudeijun: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '小蝶是打烊後俱樂部小老師（？',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '連經濟學問題都難不倒她！\n有問題就找聰明的小蝶老師！',
    }
  ],
  fast: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '還要更快是俱樂部成員之一！\n雖然手拿著雙刀，但更喜歡被BBB大劍砍！',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '超滿意我畫的阿快8bit版本！有夠喜歡！',
    }
  ],
  pumpkin: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '她們是小魔女龐淇和小幽靈們！\n創作者是實況主兼插畫家R菜！',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '我超喜歡R菜的畫圖風格！每次看都覺得療癒又可愛！',
    }
  ],
  p13p04: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: '問問是俱樂部的實況主兼插畫家之一！\n常在無迪時間會開台工作線上陪大家聊天！',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '會分享有趣的創作工作甘苦談！\n也很會跟觀眾聊天！快去追蹤他！',
    }
  ],
  ai4vupwjp: [
    {
      portrait: 'battle_afk_self_face_normal',
      text: 'ㄐㄎ是為大家換水的水媽！\n也很喜歡玩魂系遊戲！\n一起連動魂系遊戲靠他罩！',
    },
    {
      portrait: 'battle_currycat_opponent_face_normal',
      text: '最近也很會放閃撒糖給大家！',
    }
  ],
}

const promoteContent = '喜歡這個小遊戲嗎？\n歡迎加入貞貞俱樂部！'

const actionOptions = ['行動', '你是誰', '你是誰'];
const finishingOptions = ['繼續戰鬥', '關於遊戲', '離開'];
const battleListOptions = [
  { text: '安迪', value: 'jennie' },
  { text: '貝貝', value: 'beibei' },
  { text: '上上', value: 'shangshang' },
  { text: '貓辣妹', value: 'maoramei' },
  { text: '咖哩貓', value: 'currycat' },
  { text: 'ㄐㄎ', value: 'ai4vupwjp' },
  { text: '小咖', value: 'ka' },
  { text: '搭拉', value: 'dara' },
  { text: '還要更快', value: 'fast' },
  { text: '是小蝶', value: 'hudeijun' },
  { text: '問問', value: 'p13p04' },
  { text: '爬慶狗', value: 'pachin' },
  { text: '龐琪', value: 'pumpkin' },
  { text: 'BBB', value: 'bbb' },
  { text: '橙踏青', value: 'touching' },
];

let recoverCount = 0;

function getCurrentOptions() {
  const menu = [...actionOptions];
  if (recoverCount === 0) {
    menu.push('休息');
  }
  return menu;
}

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
    const battleConfig = this.cache.json.get('config').battle;
    const {animations} = battleConfig['battle_currycat_opponent'];
    animations.forEach((_ani: TAnimation) => {
      const animationName = `battle_currycat_opponent_${_ani.prefix}`;
      if (this.anims.exists(animationName)) return;

      const data: Phaser.Types.Animations.Animation = {
        key: animationName,
        frames: this.anims.generateFrameNames('battle_currycat_opponent', {
          prefix: `${_ani.prefix}_`,
          start: 1,
          end: _ani.qty,
        }),
        repeat: _ani.repeat,
      };

      if (typeof _ani.freq !== "undefined") data.frameRate = _ani.freq;
      if (typeof _ani.duration !== "undefined") data.duration = _ani.duration;
      if (typeof _ani.repeat_delay !== "undefined")
        data.repeatDelay = _ani.repeat_delay;

      this.anims.create(data);
    });
    
    
    // background
    this.background = this.add.rectangle(0, 0, originalWidth, originalHeight, 0xeeeeee)
    .setDepth(0)
    .setOrigin(0);

    let opponentName = 'default';
    const data = this.scene.settings.data as { opponentName?: string } | undefined;
    if (data && typeof data.opponentName === 'string') {
      opponentName = data.opponentName;
    } else {
      const params = new URLSearchParams(document.location.search);
      opponentName = params.get('opponent') || opponentName;
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

    recoverCount += 1;
    this.handleSelectAction();
  }

  private async applyTalking() {
    await this.dialogue!.runDialogue(introduction[this.opponentName]);
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
        if (menuAction === '行動') {
          await this.applyAttackTurn();
        }
        else if (menuAction === '休息') {
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
      text: '下一位挑戰者來了！',
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
    const currentOptions = getCurrentOptions();
    console.log({ currentOptions })
    this.menu?.setActions(currentOptions);
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
