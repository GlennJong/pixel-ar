import Phaser from 'phaser';

const defaultX = 96;
const defaultY = 96;
const defaultArrowOffset = 10;

const defaultWidth = 64;
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
  private actionStartIndex: number = 0; // 新增：目前顯示的 action 起始 index
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

    // 固定建立 3 個 action option（可視窗），即使 actions 少於 3 也保留 slot
    const visibleCount = 3;
    for (let i = 0; i < visibleCount; i++) {
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
        text: this.actions[i] || '',
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
      // 如果沒有對應 action，預設隱藏文字/箭頭
      if (!this.actions[i]) {
        text.setAlpha(0);
        arrow.setAlpha(0);
      }
      this.actionOptions.push({ arrow, text });
    }
    this.scene.add.existing(this);
  }

  public showMenu = () => {
    this.isEnable = true;
    this.setAlpha(1);
    this.updateVisibleActions();
    // guard: 只有在有至少一個 action 可選時顯示箭頭
    if (this.actions.length > 0) {
      // clamp indices
      const visibleCount = this.actionOptions.length || 3;
      this.currentOptionIndex = Math.max(0, Math.min(this.currentOptionIndex, Math.max(0, this.actions.length - 1)));
      this.actionStartIndex = Math.max(0, Math.min(this.actionStartIndex, Math.max(0, this.actions.length - visibleCount)));
      const localIndex = this.currentOptionIndex - this.actionStartIndex;
      this.actionOptions[localIndex]?.arrow.setAlpha(1);
    }
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
    if (this.currentOptionIndex < this.actions.length - 1) {
      this.currentOptionIndex++;
      // 若超過可視範圍，actionStartIndex++
      const visibleCount = this.actionOptions.length || 3;
      if (this.currentOptionIndex > this.actionStartIndex + (visibleCount - 1)) {
        this.actionStartIndex = Math.min(this.actionStartIndex + 1, Math.max(0, this.actions.length - visibleCount));
        this.updateVisibleActions();
      }
    } else {
      // 循環到第一個
      this.currentOptionIndex = 0;
      this.actionStartIndex = 0;
      this.updateVisibleActions();
    }
    this.actionOptions.forEach(({ arrow }) => arrow.setAlpha(0));
    const localIdx = this.currentOptionIndex - this.actionStartIndex;
    this.actionOptions[localIdx]?.arrow.setAlpha(1);
  };
  
  public prevAction = () => {
    if (!this.isEnable) return;
    if (this.currentOptionIndex > 0) {
      this.currentOptionIndex--;
      if (this.currentOptionIndex < this.actionStartIndex) {
        this.actionStartIndex = Math.max(0, this.actionStartIndex - 1);
        this.updateVisibleActions();
      }
    } else {
      // 循環到最後一個
      this.currentOptionIndex = this.actions.length - 1;
      this.actionStartIndex = Math.max(0, this.actions.length - (this.actionOptions.length || 3));
      this.updateVisibleActions();
    }
    this.actionOptions.forEach(({ arrow }) => arrow.setAlpha(0));
    const localIdx2 = this.currentOptionIndex - this.actionStartIndex;
    this.actionOptions[localIdx2]?.arrow.setAlpha(1);
  };

  public setActions(newActions: string[]) {
    this.actions = newActions;
    this.currentOptionIndex = 0;
    this.actionStartIndex = 0;
    this.updateVisibleActions();
    this.actionOptions.forEach(({ arrow }) => arrow.setAlpha(0));
    // 顯示第一個可用的箭頭（若有）
    if (this.actions.length > 0) {
      const idx = 0 - this.actionStartIndex;
      this.actionOptions[idx]?.arrow.setAlpha(1);
    }
  }

  // 新增：更新可見 actions
  private updateVisibleActions() {
    for (let i = 0; i < this.actionOptions.length; i++) {
      const idx = this.actionStartIndex + i;
      if (idx < this.actions.length) {
        this.actionOptions[i].text.setText(this.actions[idx]);
        this.actionOptions[i].text.setAlpha(1);
        this.actionOptions[i].arrow.setAlpha(0);
      } else {
        this.actionOptions[i].text.setAlpha(0);
        this.actionOptions[i].arrow.setAlpha(0);
      }
    }
  }

  public destroy(): void {
    this.background?.destroy();
    this.actionOptions.forEach(({ arrow, text}) => {
      arrow.destroy();
      text.destroy();
    });
    this.actionOptions = [];
  }
  
}
