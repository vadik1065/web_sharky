class RiskBox extends GameItem {

  riskMain;
  maskCardParam;
  orientation;
  opened = false;

  riskCardDiller = {};
  openCards = {};
  riskCards = {
    podiums: [],
    podiumTitle: [],
    masks: [],
    params: [],
    faces: [],
    numbers: [],
    suil: [],
  };
  alreadyCards = [];
  chosedCard = false;
  step = 1;

  static suit = ["clubs", "diamonds", "hearts", "spades"];

  static dataTitles = {
    vertical: {
      gamble: {
        title: "GAMBLE ",
        options: {
          x: 385,
          y: 350,
          width: 100,
          height: 107,
          color: 0xffffff,
          align: "centerX",
          fontFamily: 'Times New Roman',
          fontSize: 30,
          shadow: {
              color: 0,
              angle: 0,
              blur: 10,
              distance: 0
          }
        },
      },
      dealer: {
        title: "DEALER",
        options: {
          x: 60,
          y: 17,
          width: 100,
          height: 107,
          color: 0xF0F622,
          align: "centerX",
          fontFamily: 'Times New Roman',
          fontSize: 22,
          shadow: {
              color: 0,
              angle: 0,
              blur: 10,
              distance: 0
          }
        },
      },
    },
    horizontal: {
      gamble: {
        title: "GAMBLE ",
        options: {
          x: 570,
          y: 530,
          width: 100,
          height: 107,
          color: 0xFFFFFF,
          align: "centerX",
          fontFamily: 'Times New Roman',
          fontSize: 36,
          fontWeight: 'bold',
          shadow: {
              color: 0,
              angle: 0,
              blur: 10,
              distance: 0
          }
        },
      },
      dealer: {
        title: "DEALER",
        options: {
          x: 95,
          y: 28,
          width: 100,
          height: 107,
          color: 0xF0F622,
          align: "centerX",
          fontFamily: 'Times New Roman',
          fontSize: 26,
          shadow: {
              color: 0,
              angle: 0,
              blur: 10,
              distance: 0
          }
        },
      },
    },
  };

  static dataCards = {
    dealer: {
      vertical: {
        x: 70,
        y: 80,
        width: 110,
        height: 165,
      },
      horizontal: {
        x: 130,
        y: 110,
        width: 150,
        height: 230,
      },
      urls: [],
    },
    maskCard: {
      vertical: {
        x: 265,
        y: 80,
        width: 110,
        height: 165,
      },
      horizontal: {
        x: 390,
        y: 110,
        width: 150,
        height: 230,
      },
      urls: [],
    },
  };

  static pickTitle = {
    vertical: {
      title: "PICK",
      options: {
        x: 55,
        y: 15,
        width: 100,
        height: 107,
        color: 0xfffe40,
        align: "centerX",
        fontFamily: 'Times New Roman',
        fontSize: 22,
        lineHeight: 36,
        shadow: {
            color: 0,
            angle: 0,
            blur: 10,
            distance: 0
        }
      },
    },
    horizontal: {
      title: "PICK",
      options: {
        x: 85,
        y: 25,
        width: 100,
        height: 107,
        color: 0xfffe40,
        align: "centerX",
        fontFamily: 'Times New Roman',
        fontSize: 26,
        lineHeight: 36,
        shadow: {
            color: 0,
            angle: 0,
            blur: 10,
            distance: 0
        }
      },
    },
  };

  static dataRisk = {
    pickPodium: [
      {
        horizontal: { x: 340, y: 350, width: 250, height: 90 },
        vertical: { x: 220, y: 250, width: 200, height: 60 },
      },
      {
        horizontal: { x: 540, y: 350, width: 250, height: 90 },
        vertical: { x: 360, y: 250, width: 200, height: 60 },
      },
      {
        horizontal: { x: 740, y: 350, width: 250, height: 90 },
        vertical: { x: 500, y: 250, width: 200, height: 60 },
      },
      {
        horizontal: { x: 940, y: 350, width: 250, height: 90 },
        vertical: { x: 640, y: 250, width: 200, height: 60 },
      },
    ],
  };

  constructor(parent, options) {
    super(parent);
    this.options = options;

    const getOpjParam = (orientation) => ({
      x: options[orientation].x,
      y: options[orientation].y,
      width: options[orientation].width,
      height: options[orientation].height,
    });

    let pageOptions = {
      vertical: getOpjParam("vertical"),
      horizontal: getOpjParam("horizontal"),
      urls: options.bkgImage.urls,
    };

    this.riskMain = new ImageItem(this, pageOptions);
    this.riskMain.setVisible(false);
    // создаём блок на котором будут все изображения

    this.riskMain.textItems = [];

    let game = Game.instance();
    this.orientation = game.isVertical() ? "vertical" : "horizontal";
    let data = RiskBox.dataTitles[this.orientation] || {};
    let names = Object.keys(data);

    this.getTitles(data, names);
    this.drawCard();
  }


  draw() {

    let game = Game.instance();
    this.orientation = game.isVertical() ? "vertical" : "horizontal";
    let data = RiskBox.dataTitles[this.orientation] || {};
    let names = Object.keys(data);

    let riskMain = this.riskMain;
    riskMain.textItems.forEach((item) => riskMain.pixiObj.removeChild(item.pixiObj));

    riskMain.textItems = [];
    this.getTitles(data, names);
    this.drawCard();

    if (!this.riskCardDiller.mask?.rotate) {
      let curParam = RiskBox.dataCards.dealer;
      if (!this.riskCardDiller.param) this.riskCardDiller.param = curParam;

      let urls = this.riskCardDiller.param.urls;
      this.riskCardDiller.param.urls = [];

      this.riskCardDiller.mask = this.updateRiskCard(
        this.riskCardDiller.mask,
        this.riskCardDiller.param,
        0
      );

      this.riskCardDiller.param.urls = urls;

      this.riskCardDiller.face = this.updateImage(
        this.riskCardDiller.face,
        this.riskCardDiller.param
      );
    }

    super.draw();
  }

  // возвращает валидный урл
  getValidNumber(curNumb) {
    return +curNumb === 1 ? 15 : curNumb;
  }

  // удаляет старое и рождает новое изображение
  updateImage(curImage, struct) {
    if (curImage) this.riskMain.pixiObj.removeChild(curImage.pixiObj);
    return new ImageItem(this.riskMain, Tools.clone(struct));
    // if(curImage)
    // return curImage;
    // return new ImageItem(this.riskMain, struct);
  }

  // обновляет текст
  updateTextItem(curImage, parent, ttitle) {
    if (curImage) this.riskMain.pixiObj.removeChild(curImage.pixiObj);
    return new TextItem(parent, ttitle.title, ttitle.options);
  }

  // удаляет старое и рождает новый элемент  RiskCard
  updateRiskCard(curImage, params, id) {
    if (curImage) this.riskMain.pixiObj.removeChild(curImage.pixiObj);
    return new RiskCard(this.riskMain, id, params, this);

    // if(curImage){

    //   let game = Game.instance();
    //   let scale = Tools.clone(game.scale());

    //     let bkgPos = game.background.pos();
    //     let orient = this.orientation;

    //     let curRiskOption = this.options[orient];
    //     let curThisOption =  params[orient];

    //     curImage.anime.x = bkgPos.x + curRiskOption.x * scale.x + curThisOption.x * scale.x;
    //     curImage.anime.y =
    //     bkgPos.y + curRiskOption.y * scale.y + curThisOption.y * scale.y - 14 * scale.y;
    //     curImage.anime.width = RiskCard.animeParams[orient].width * scale.x;
    //     curImage.anime.height = RiskCard.animeParams[orient].height * scale.y;
    //     return curImage;
    //   }else{
    //     return new RiskCard(this.riskMain, id, params, this);
    //   }
  }

  // возвращает вариант продолжения игры
  continuatioGame(id) {
    let left =  this.getValidNumber(this.riskCards.numbers[id]);
    let right =  this.riskCardDiller.number;

    switch (true) {
      case left > right:
        return "WIN";
      case left < right:
        return "LOSS";
      case left === right:
        return "PARITY";
    }
  }

  // показываем закрытые
  showClosedCards() {
    this.riskCards.masks.forEach((curfaces, i) => {
      if (this.chosedCard !== i) curfaces.rotateCard(i, this);
    });
    this.emit("allCardOpened");
  }

  // переварачиваем все карты
  async rotateAllCard() {
    for (let i = this.riskCards.masks.length; i > 0; i--) {
      this.riskCards.faces[i]?.setVisible(false);
      this.riskCards.podiums[i]?.setVisible(false);
      await this.riskCards.masks[i]?.rotateCard();
    }
    this.chosedCard = false;
    super.draw();
  }

  // открывает карты пользователя
  openUserCard( num, suit = null ) {

    // num =6;
    // suit = 'hearts';

    let id = this.chosedCard;
    this.openCards = { ...this.openCards, pick: num };

    this.choseOnlyRiskCard(id, num, suit);

    this.riskCards.masks[id].shownPodium();
    this.riskCards.masks[id].clickCardMask(id, this);
    this.emit("userCardOpened")
  }

  setClickedCard( id ) {
    this.chosedCard = id;
  }

  // логика при клике на карту
  async onClickCard(id) {

    if (!!this.chosedCard) {
        Log.out( 'Card already choosed: ' + this.chosedCard );
        return;
    }

    this.chosedCard = id;
    this.emit("userCardClicked", { index: id });
  }

  // отрисовка карт
  drawCard() {
    let pickPodiums = RiskBox.dataRisk.pickPodium;
    pickPodiums.forEach((chosedRisk, i) => {
      i = i + 1;

      chosedRisk.urls = this.options.pickButton.urls;
      let pickTitle = RiskBox.pickTitle[this.orientation];

      this.riskCards.podiums[i] = this.updateImage(this.riskCards.podiums[i], chosedRisk);
      // инициализация подиумов

      this.riskCards.podiumTitle[i] = this.updateTextItem(
        this.riskCards.podiumTitle[i],
        this.riskCards.podiums[i],
        pickTitle
      );
      this.riskCards.podiums[i].setVisible(false);

      // let urls =  this.riskCards.params[i]?.urls;

      // инициализация надпись на подиуме
      this.riskCards.params[i] = Tools.clone(RiskBox.dataCards.maskCard);
      this.riskCards.params[i].horizontal.x += i * 200 - 200;
      this.riskCards.params[i].vertical.x += i * 140 - 140;

      // if(this.riskCards.masks[i]){
      //   let game = Game.instance();
      //   let scale = Tools.clone(game.scale());

      //   let bkgPos = game.background.pos();
      //   let riskBox = game.riskBox;
      //   let orient = riskBox.orientation;
      //   // this.riskCards.masks[i]?.x = 0;

      //   let curRiskOption = riskBox.options[orient];
      //   let curThisOption =  this.riskCards.params[i][orient];

      //   this.riskCards.masks[i].anime.x = bkgPos.x + curRiskOption.x * scale.x + curThisOption.x * scale.x;
      //   this.riskCards.masks[i].anime.y =
      //     bkgPos.y + curRiskOption.y * scale.y + curThisOption.y * scale.y - 14 * scale.y;
      //     this.riskCards.masks[i].anime.width = RiskCard.animeParams[orient].width * scale.x;
      //     this.riskCards.masks[i].anime.height = RiskCard.animeParams[orient].height * scale.y;


      //   // this.riskCards.masks[i].x = this.riskCards.params[i].x
      // } else{

      console.log( 18,this.riskCards.masks[i]);

      this.riskCards.masks[i] = this.updateRiskCard(
          this.riskCards.masks[i],
          this.riskCards.params[i],
        i
        );
      // }
      // инициализация риск карты

      // if(urls)this.riskCards.params[i].urls = urls;

      let curCardMaskSprite = this.riskCards.masks[i].imageSprite;
      curCardMaskSprite.interactive = true;
      curCardMaskSprite.on("pointerdown", async () => this.onClickCard(i));
      // вешаем обработчик на клик

      // if(!this.riskCards.faces[i]){

        this.riskCards.faces[i] = this.updateImage(
          this.riskCards.faces[i],
          this.riskCards.params[i]
        );

      let visible = !!this.chosedCard;
      // если есть выбраная карта то отображаем все

      this.riskCards.podiums.forEach((curPodium) => curPodium.setVisible(false));
      this.riskCards.faces.forEach((curfaces) => curfaces.setVisible(visible));
      // this.riskCards.faces.forEach((curfaces) => curfaces.setVisible(false));
      if (visible) this.riskCards.podiums[this.chosedCard].setVisible(true);
    });
  }

  // добавляем на блок все надписи
  getTitles(data, names) {
    let delarImg = new ImageItem(this.riskMain, this.options.dealerButton);

    data.dealer.parent = delarImg; // на подиум

    for (let i = 0; i < names.length; ++i) {
      let name = names[i];
      let title = `${data[name].title} ${name === "gamble" ? this.step : ""}`;
      // let title = data[name].title ;
      let parentTitle = data?.[name]?.parent || this.riskMain;
      let item = new TextItem(parentTitle, title, data[name].options);
      this.riskMain.textItems.push(item);
    }
  }

  // переключатель который отражает риск блок
  toggleVisible(toggle) {
    this.opened = toggle;
    this.riskMain.setVisible(toggle);
    if (toggle) {
      this.draw();
      super.draw();
    }

    this.riskCards.podiums.forEach((curPodium) => curPodium.setVisible(false));
    this.riskCards.faces.forEach((curfaces) => curfaces.setVisible(false));
    this.riskCardDiller?.face?.setVisible(false);
  }

  // получаем масть
  getSuits(suils = RiskBox.suit) {
    return suils[Math.floor(Math.random() * suils.length)];
  }

  initUrl( number, cardSuit = null ) {
      const fileName = (n, s) => ( n === 1 ? '1_clubs.png' : ('' + n + '_' + s + '.png') );
      const imagePath = this.options.cards.path;

      // Если масть карты задана, сразу возвращаем адрес картинки
      if ( cardSuit != null && cardSuit != undefined ) {
          let url = imagePath + fileName( number, cardSuit );
          this.alreadyCards.push( url );
          return [url];
      }

      // Формируем случайную масть карты
      let suit = this.getSuits();
      let url = imagePath + fileName( number, suit );
      let attempt = 0;
      while ( this.alreadyCards.some((el) => el === url) && attempt < 5000 ) {
          suit = this.getSuits();
          url = imagePath + fileName( number, suit );
          attempt++;
      }
      this.alreadyCards.push( url );

      return [ url ];
  }


  // инициализируем риск карты имея масть и номер
  choseOtherRiskCard( suits ) {
    let clickID = this.chosedCard;
    this.alreadyCards = [this.alreadyCards[0]];

    let j = 0;
    for (let i = 1; i <= 4; i++) {
      if (i !== clickID) {
        let cards = this.openCards;
        let curNumb = cards.cards[j];
        let curParam = this.riskCards.params[i];
        this.riskCards.numbers[i] = this.getValidNumber(curNumb);
        this.riskCards.params[i].urls = this.initUrl(curNumb, suits[j] );
        this.riskCards.faces[i] = this.updateImage(this.riskCards.faces[i], curParam);
        this.riskCards.faces[i].setVisible(false);
        super.draw();
        j++;
      }
    }
  }

  // инициализирует одну риск карту  имея масть и номер
  choseOnlyRiskCard(id, num, suit) {
    this.alreadyCards = [this.alreadyCards[0]];

    let curParam = this.riskCards.params[id];
    this.riskCards.numbers[id] = this.getValidNumber(num);
    this.riskCards.params[id].urls = this.initUrl( num, suit );

    this.riskCards.faces[id] = this.updateImage(this.riskCards.faces[id], curParam);
    this.riskCards.faces[id].setVisible(false);
    super.draw();
  }

  // открытие закрытых карт
  openClosedCards( cards, suits ) {

    // cards = [9,12,3];
    // suits=["clubs","clubs","hearts"];

    Log.out( 'Open closed cards ' + JSON.stringify( cards) + ', suits ' + JSON.stringify( suits ) );
    this.openCards.cards = cards;
    this.choseOtherRiskCard( suits );
    this.showClosedCards();
    setTimeout( () => this.emit("allCardsOpened"), 150 );
  }

  // инициализируем риск карты
  initRiskCard() {
    for (let i = 1; i <= 4; i++) {
      let curImage = this.riskCards.masks[i];
      let curParam = this.riskCards.params[i];
      if (!curImage) this.riskCards.masks[i] = this.updateRiskCard(curImage, curParam, i);
    }
  }

  // инициализируем карту дилера
  initCardDiller(curNumb, suit) {
    let curParam = RiskBox.dataCards.dealer;
    if (!this.riskCardDiller.param) this.riskCardDiller.param = curParam;

    if (curNumb) this.riskCardDiller.param.urls = [];
    this.riskCardDiller.mask = this.updateRiskCard(
      this.riskCardDiller.mask,
      this.riskCardDiller.param,
      0
    );
    if (curNumb) this.riskCardDiller.param.urls = this.initUrl(curNumb, suit);
    this.riskCardDiller.face = this.updateImage(
      this.riskCardDiller.face,
      this.riskCardDiller.param
    );
    if (curNumb) this.riskCardDiller.mask.toggleDiler(this);
    super.draw();
 }

 // закрыть все карты
  async closeAllCards() {
      this.step++;
      await this.rotateAllCard();
      this.draw();
      this.riskCards.podiums.forEach((el) => el?.setVisible(false));

      this.emit("allCardsClosed");
  }

  // открыние риск бокса
  open( stepNum = null ) {
    this.step = stepNum ? stepNum : 1;

    this.openCards = { pick: 0, cards: [0, 0, 0] };
    this.opened = true;

    this.initRiskCard();
    this.toggleVisible(true);
  }

  // открыть карту дилера
  openDealerCard( num, suit = null ) {
// num =6;
// suit = 'hearts';
    this.chosedCard = false;
    this.riskCardDiller.number = this.getValidNumber(num);
    this.initCardDiller(num, suit);
  }

  scale() {
    return this.parent.scale();

  }

  close() {
    this.opened = false;
    this.toggleVisible(false);
  }

  isOpened() {
    return this.opened;
  }

  pos() {
    return Game.instance().background.pos();
  }

  size() {
    return Game.instance().background.size();
  }
}
