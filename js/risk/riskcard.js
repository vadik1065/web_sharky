class RiskCard extends ImageItem {

  static choosed = false;
  static animEnd = false;
  static delayOpenAllCard = 1000;
  static delayClose = 2500;

  thisBox;
  index;
  anime;
  face = false;
  rotate = false;
  riskCards = [];
  textures = [];
  longFeatur = [];

  static animeParams = {
    horizontal: { width: 150, height: 260 },
    vertical: { width: 110, height: 190 },
  };

  constructor(parent, index, options, thisBox = {}) {

    super(parent, options);

    // загружаем тайлсет анимации

    let game = Game.instance();
    const fullTexture = PIXI.Texture.from( game.riskGameDef.cards.openSprite );
    const fullLongFeature = PIXI.Texture.from( game.riskGameDef.cards.closeSprite );

    let dilerImg = "";

    // if (!!options.urls?.length && index == 0) {
    //   dilerImg = new ImageItem(parent, options);
    //   options.urls = [];
    //   // убираем урл и создаём изображение
    // }

    this.index = index;
    this.thisBox = thisBox;
    this.dilerImg = dilerImg;
    this.riskCards = this.thisBox.riskCards;

    for (let i = 0; i < 10; i++) {
      let rectangle = new PIXI.Rectangle(i * 156, 0, 156, 263);
      const texture = new PIXI.Texture(fullTexture.baseTexture, rectangle);
      this.textures.push(texture);

      const longTexture = new PIXI.Texture(fullLongFeature.baseTexture, rectangle);
      this.longFeatur.push(longTexture);
      // нарезаем тайлсет
    }

    this.anime = new PIXI.AnimatedSprite(this.textures);
    this.longAnim = new PIXI.AnimatedSprite(this.longFeatur);
    // this.anime.animationSpeed = 0.45;
    this.anime.animationSpeed = 0.65;
    this.longAnim.animationSpeed = 0.65;
    // this.anime.animationSpeed = 0.15;
    this.anime.loop = true;
    this.longAnim.loop = true;
    this.longAnim.visible = false;
    this.pixiObj.addChild(this.anime);
    this.pixiObj.addChild(this.longAnim);
  }

  initAnimPosition() {
    // инициализируем анимацию
    if (!!this.anime && !this.animEnd) {
      let game = Game.instance();
      let scale = Tools.clone(game.scale());

      let bkgPos = game.background.pos();
      let riskBox = game.riskBox;
      let orient = riskBox.orientation;
      let curRiskOption = riskBox.options[orient];
      let curThisOption = this.options[orient];

      this.anime.x = bkgPos.x + curRiskOption.x * scale.x + curThisOption.x * scale.x;
      this.anime.y =
        bkgPos.y + curRiskOption.y * scale.y + curThisOption.y * scale.y - 14 * scale.y;
      this.anime.width = RiskCard.animeParams[orient].width * scale.x;
      this.anime.height = RiskCard.animeParams[orient].height * scale.y;

      this.longAnim.x = bkgPos.x + curRiskOption.x * scale.x + curThisOption.x * scale.x;
      this.longAnim.y =
        bkgPos.y + curRiskOption.y * scale.y + curThisOption.y * scale.y - 14 * scale.y;
      this.longAnim.width = RiskCard.animeParams[orient].width * scale.x;
      this.longAnim.height = RiskCard.animeParams[orient].height * scale.y;

      this.animEnd = true;
    }
  }

  draw() {
    this.initAnimPosition();
    super.draw();
  }

  // анимация открытия
  async animationCard(longAnim) {
    return new Promise(async (resolve, reject) => {
      this.rotate = true;

      if(longAnim){
        this.longAnim.visible = true;
        this.anime.visible = false;
        this.longAnim.play();
        this.longAnim.onLoop = () => {
          this.rotate = false;
          this.longAnim.gotoAndStop(0);
          this.anime.visible = true;
          this.longAnim.visible = false;
          resolve();
        };
      }else{
        this.anime.visible = true;
        this.anime.play();
        this.anime.onLoop = () => {
          this.rotate = false;
          this.anime.gotoAndStop(0);
          resolve();
        };
      }
    });
  }

  // открываем карту дилера
  async toggleDiler(thisBox) {
    thisBox.riskCardDiller.face.setVisible?.(false);
    Game.instance().startPlay("23_btd_card_open");
    await this.animationCard();
    thisBox.riskCardDiller.face.setVisible?.(true);
    this.anime.visible = false;
  }

  // логика при перевороте
  async rotateCard() {
    let id = this.index;
    Game.instance().startPlay("23_btd_card_open");
    if (this.face) {
      this.riskCards.faces[id]?.setVisible(false);
      if (this.anime) await this.animationCard(true);
    } else {
      if (this.anime) await this.animationCard();
      this.riskCards.faces[id]?.setVisible(true);
      this.anime.visible = false;
    }

    this.face = !this.face;
    this.thisBox.emit("rotateFinished", { index: this.index, face: this.face });
  }

  // логика при клике на карту
  async clickCardMask() {
    await this.rotateCard();
    this.thisBox.emit("userChoosed", { case: this.thisBox.continuatioGame(this.index) });
  }

  // показываем подиум
  shownPodium() {
    this.thisBox.riskCards.podiums[this.index]?.setVisible(true);
  }

  show(face) {
    this.riskCards.faces[this.index]?.setVisible(face);
    this.face = face;
  }

  state() {
    let stateStatus = "";

    if (this.rotate) stateStatus = "ROTATED";
    else if (this.face) stateStatus = "FACE_UP";
    else stateStatus = "FACE_DOWN";
  }
}
