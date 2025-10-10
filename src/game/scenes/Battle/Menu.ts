import Phaser from 'phaser';

const defaultX = 96;
const defaultY = 90;
const defaultArrowOffset = 10;

const defaultWidth = 60;
const defaultHeight = 48;
const paddingX = 8;
const paddingY = 8;

const textFontFamily = 'BoutiqueBitmap';
const textFontSize = 10;
const textBottomPadding = 2;
const textFontResolution = 4;

export type MenuProps = {
  actions: string[];
};

export class Menu extends Phaser.GameObjects.Container {
  private isEnable = false;
  private actions: string[];
  private background?: Phaser.GameObjects.NineSlice;
  private currentOptionIndex: number = 0;
  private actionOptions: {
    text: Phaser.GameObjects.Text;
    arrow: Phaser.GameObjects.Image;
  }[] = [];

  constructor(
    scene: Phaser.Scene,
    data: MenuProps,
  ) {
    super(scene);
    this.scene = scene;
    this.actions = data.actions;
    scene.add.existing(this);
  }

  public init() {
    
    this.background = this.scene.make
      .nineslice({
        key: 'dialogue_frame',
        frame: 'frame',
        width: defaultWidth,
        height: defaultHeight,
        leftWidth: 8,
        rightWidth: 8,
        topHeight: 8,
        bottomHeight: 8,
        x: defaultX,
        y: defaultY
      })
      .setOrigin(0)
      .setDepth(1);

    this.add(this.background);

    if (this.actions) {
      for (let i = 0; i < this.actions.length; i++) {
        const x = defaultX + paddingX;
        const y = defaultY + paddingY + i * (textFontSize + textBottomPadding);
        const text = this.scene.make.text({
          x: x + defaultArrowOffset,
          y: y,
          style: {
            fontFamily: textFontFamily,
            fontSize: textFontSize,
            color: '#000',
          },
          text: this.actions[i],
        })
        .setDepth(2)
        .setOrigin(0);
        text.setResolution(textFontResolution);
        this.add(text);

        const arrow = this.scene.add.image(x, y, 'arrow')
        .setDepth(2)
        .setAlpha(0)
        .setOrigin(0);
        this.add(arrow);
        
        this.actionOptions.push({
          arrow,
          text
        });
      }
    }
    this.scene.add.existing(this);
  }

  public showMenu = () => {
    this.isEnable = true;
    this.setAlpha(1);
    this.actionOptions[this.currentOptionIndex].arrow.setAlpha(1);
  }
  
  public hideMenu = () => {
    this.setAlpha(0);
    this.actionOptions.forEach(({ arrow }) => arrow.setAlpha(0));
    this.isEnable = false;
  }

  public select = () => {
    if (!this.isEnable) return;
    return this.actions[this.currentOptionIndex];
  }

  public nextAction = () => {
    if (!this.isEnable) return;
    this.currentOptionIndex = this.currentOptionIndex + 1  > this.actions.length - 1 ? 0 : this.currentOptionIndex + 1;
    this.actionOptions.forEach(({ arrow }) => arrow.setAlpha(0));
    this.actionOptions[this.currentOptionIndex].arrow.setAlpha(1);
  };
  
  public prevAction = () => {
    if (!this.isEnable) return;
    this.currentOptionIndex = this.currentOptionIndex - 1 < 0 ? this.actions.length - 1 : this.currentOptionIndex - 1;
    this.actionOptions.forEach(({ arrow }) => arrow.setAlpha(0));
    this.actionOptions[this.currentOptionIndex].arrow.setAlpha(1);
  };

  public destroy(): void {
    this.background?.destroy();
    this.actionOptions.forEach(({ arrow, text}) => {
      arrow.destroy();
      text.destroy();
    });
  }
  
}
