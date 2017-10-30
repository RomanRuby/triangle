const triangleWidth  = 40;
const triangleHeight = 30;

const colors = [
  //oranges
  '#eb9000', '#f6b400', //'#f5cb00', '#fbde1a', '#feeb31', '#fff163',
  //reds
  '#440510', '#8a0a08', //'#c11e1f', '#e52822', '#f43d0d', '#fb5c28', '#ff8547',
  //greens
  '#05391e', '#004b25', //'#006d3c', '#059849', '#15ae44', '#52b933', '#78c340', '#b2cd53',
  //blues
  '#0c1a36', '#01235d', '#0b3f7a', '#0561a6', '#007ecb', '#32b2fa', '#54cefc', '#91dffa'
];

const categories = [
  'cat1',
  'cat2',
  'cat3',
  'cat4',
  'cat5',
  'cat6',
  'cat8',
  'cat9',
  'cat10',
  'cat11',
  'cat12',
  'cat13',
  'cat14',
  'cat15',
  'cat16',
  'cat17',
  'cat18',
  'cat19',
  'cat20'
];

class Category {
  constructor(name, subs, checked = false) {
    this.name    = name;
    this.subs    = subs;
    this.checked = checked;
  }

  set(value) {
    this.checked = !!value;
    if (this.subs) {
      this.subs.forEach(it => it.set(value))
    }
  }
}

const categoryList = [
  new Category('main 1', [
    new Category('sub 1', [
      new Category('sub sub 1'),
      new Category('sub sub 2'),
      new Category('sub sub 3'),
    ]),
    new Category('sub 2', [
      new Category('sub sub 4'),
      new Category('sub sub 5'),
      new Category('sub sub 6'),
    ]),
    new Category('sub 3', [
      new Category('sub sub 7'),
      new Category('sub sub 8'),
      new Category('sub sub 9'),
    ])
  ]),
  new Category('main 2', [
    new Category('sub 4', [
      new Category('sub sub 10'),
      new Category('sub sub 11'),
      new Category('sub sub 12'),
    ]),
    new Category('sub 5', [
      new Category('sub sub 13'),
      new Category('sub sub 14'),
      new Category('sub sub 15'),
    ]),
    new Category('sub 6', [
      new Category('sub sub 16'),
      new Category('sub sub 17'),
      new Category('sub sub 18'),
    ])
  ]),
  new Category('main 3', [
    new Category('sub 7', [
      new Category('sub sub 19'),
      new Category('sub sub 20'),
      new Category('sub sub 21'),
    ]),
    new Category('sub 8', [
      new Category('sub sub 22'),
      new Category('sub sub 23'),
      new Category('sub sub 24'),
    ]),
    new Category('sub 9', [
      new Category('sub sub 25'),
      new Category('sub sub 26'),
      new Category('sub sub 27'),
    ])
  ]),
];

class ContextManager {
  constructor(elementId) {
    this.element    = document.getElementById(elementId);
    this.context    = this.element.getContext('2d');
    this.shapeList  = [];
    this.maxRows    = parseInt(this.element.height / triangleHeight);
    this.maxColumns = parseInt(this.element.width / triangleWidth * 2);

    this.element.onmousemove = event => this._mouseOverHandler(event);
    this.element.onclick     = event => this._mouseClickHandler(event);

    TweenLite.ticker.addEventListener("tick", () => this.draw());
  }

  clear() {
    this.context.clearRect(0, 0, this.element.width, this.element.height);
  }

  hide() {
    this.shapeList.filter(() => Math.random() > .5)
        .forEach(it => it.hide());
  }

  show() {
    this.shapeList.filter(() => Math.random() > .5)
        .forEach(it => it.show());
  }

  /**
   * redraw whole stage
   */
  draw() {
    this.clear();
    this.shapeList.forEach(it => it.draw());
    if (this.tooltip) {
      this.context.font = '48px serif';
      if (this.element.width - this.tooltip.x < this.context.measureText(this.tooltip.text).width) {
        this.context.textAlign = 'right';
      }else{
        this.context.textAlign = 'left';}
      this.context.fillStyle = `rgba(0,0,0,.5)`;
      this.context.fillText(this.tooltip.text, this.tooltip.x, this.tooltip.y);

    }
  }

  addShape(shape) {
    this.shapeList.push(shape)
  }

  /**
   * supposed to be used for opening shapes by category list
   * @param categories
   */
  selectCategories(categories) {
    this.shapeList.forEach(it => {
      if (categories.includes(it.category)) {
        it.show()
      } else {
        it.hide()
      }
    })
  }

  _mouseOverHandler({layerX, layerY}) {
    const triangle = this._findShapeByCoords(layerX, layerY);
    if (triangle) {
      this.tooltip = {
        text: triangle.category,
        x:    layerX,
        y:    layerY
      }
    } else {
      this.tooltip = null
    }
  }

  _mouseClickHandler({layerX, layerY}) {
    const triangle = this._findShapeByCoords(layerX, layerY);
    if (!triangle) {
      return
    }
    if (triangle.open) {
      triangle.hide()
    } else {
      triangle.show()
    }
  }

  _findShapeByCoords(x, y) {
    // todo: narrow find area by aprox coords in table
    return this.shapeList.find(it => it.isOver(x, y))
  }
}

class Triangle {

  static shape(x1, y1, x2, y2, x3, y3, context) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.closePath();
  }

  static draw(x1, y1, x2, y2, x3, y3, {r, g, b, alpha}, {context}, text) {
    Triangle.shape(x1, y1, x2, y2, x3, y3, context);
    context.fillStyle = `rgba(${r},${g},${b},${alpha})`;

    // context.font = '15px serif';
    // context.fillText(text, x1, y1);

    context.fill();
    context.strokeStyle = 'blue';
    context.lineWidth   = .1;
    context.stroke();
  }

  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  constructor(row, column, contextManager, category) {
    this.category       = category;
    this.contextManager = contextManager;
    this.row            = row;
    this.column         = column;
    this.rgb            = Triangle.hexToRgb(colors[Math.floor(Math.random() * colors.length)]); // rand color
    this.alpha          = 0;
    this.open           = 0;
    this.calculate();
    this.draw();
  }

  calculate() {
    if (this.row % 2) {
      if (this.column % 2) {
        this.x2 = this.column === 1 ? this.column * triangleWidth : (this.column + 1) / 2 * triangleWidth;
        this.x1 = this.x2 - triangleWidth;
        this.y1 = this.row * triangleHeight;
        this.y2 = this.y1;
        this.x3 = this.x2 - (triangleWidth / 2);
        this.y3 = this.y2 - triangleHeight;
      } else {
        this.x2 = (this.column === 1 ? this.column * triangleWidth : (this.column) / 2 * triangleWidth) + triangleWidth / 2;
        this.x1 = this.x2 - triangleWidth;
        const y = this.row * triangleHeight;
        this.y1 = y - triangleHeight;
        this.y2 = this.y1;
        this.x3 = this.x2 - (triangleWidth / 2);
        this.y3 = this.y2 + triangleHeight;
      }
    } else {
      if (this.column % 2) {
        this.x2 = this.column === 1 ? this.column * triangleWidth : (this.column + 1) / 2 * triangleWidth;
        this.x1 = this.x2 - triangleWidth;
        const y = this.row * triangleHeight;
        this.y1 = y - triangleHeight;
        this.y2 = this.y1;
        this.x3 = this.x2 - (triangleWidth / 2);
        this.y3 = this.y2 + triangleHeight;
      } else {
        this.x2 = this.column === 1 ? this.column * triangleWidth : (this.column + 1) / 2 * triangleWidth;
        this.x1 = this.x2 - triangleWidth;
        this.y1 = this.row * triangleHeight;
        this.y2 = this.y1;
        this.x3 = this.x2 - (triangleWidth / 2);
        this.y3 = this.y2 - triangleHeight;
      }
    }

  }

  draw() {
    Triangle.draw(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3, {
      ...this.rgb,
      alpha: this.alpha
    }, this.contextManager, `${this.row}:${this.column}`);
  }

  show() {
    if (this.open === 1) {
      return
    }

    this.open = 1;
    TweenMax.to(this, 1.5, {
      x1:    this.x1,
      x2:    this.x2,
      x3:    this.x3,
      y1:    this.y1,
      y2:    this.y2,
      y3:    this.y3,
      alpha: 1,
      ease:  Strong.easeInOut,
      delay: 0
    });
  }

  hide() {
    if (this.open === 0) {
      return
    }

    this.open = 0;
    TweenMax.to(this, 1.5, {
      x1:    this.x1,
      x2:    this.x2,
      x3:    this.x3,
      y1:    this.y1,
      y2:    this.y2,
      y3:    this.y3,
      alpha: 0,
      ease:  Strong.easeInOut,
      delay: 0
    });
  }

  isOver(x, y) {
    Triangle.shape(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3, this.contextManager.context);
    return this.contextManager.context.isPointInPath(x, y);
  }
}

const contextManager = new ContextManager('myCanvas');
for (let row = 1; row < contextManager.maxRows; row++) {
  for (let column = 1; column < contextManager.maxColumns; column++) {

    const categoryListMain = categoryList[Math.floor(Math.random() * categoryList.length)];
    const categoryListSub  = categoryListMain.subs[Math.floor(Math.random() * categoryListMain.subs.length)];
    const categoryListItem = categoryListSub.subs[Math.floor(Math.random() * categoryListSub.subs.length)];

    contextManager.addShape(
      new Triangle(
        row,
        column,
        contextManager,
        categoryListItem.name
      )
    );
  }
}

const menu = document.getElementById('menu');

function categoryRender(category, categoryList) {
  const containerLI = document.createElement('li');
  if (category.subs) {
    containerLI.className = 'icon icon-arrow-left';
  }
  const place     = document.createElement('a');
  place.href      = '#';
  place.innerHTML = category.name;

  place.onclick = () => {
    categoryList.forEach(it => {
      it.set(it.checked = false);
    });

    category.set(category.checked = true);
    drawPicture();
  };
  containerLI.appendChild(place);
  return containerLI;
}

function categoryListRender(categoryList, parent) {

  categoryList.forEach(it => {
    it.set(it.checked = true);
    const container = categoryRender(it, categoryList);

    if (it.subs) {
      const containerDiv     = document.createElement('div');
      containerDiv.className = 'mp-level';

      const containerH2     = document.createElement('h2');
      containerH2.innerHTML = it.name;

      const containerA     = document.createElement('a');
      containerA.className = 'mp-back';
      containerA.href      = '#';
      containerA.innerHTML = 'back';
      containerA.onclick   = () => {
        let check = 0;
        it.subs.forEach((sub) => {
          if (sub.checked === true) {
            check++;
          }
          if (check === it.subs.length) {
            reDraw(categoryList);
          }
          else {
            sub.set(sub.checked = true);
          }

        });

        drawPicture();
      };

      const containerUL = document.createElement('ul');
      containerDiv.appendChild(containerH2);
      containerDiv.appendChild(containerUL);
      containerDiv.appendChild(containerA);


      container.appendChild(containerDiv);
      categoryListRender(it.subs, (container.childNodes[1].childNodes[0]));

    }

    parent.appendChild(container);

  });
}

function reDraw(categoryList) {
  categoryList.forEach(it => {
    it.set(it.checked = true);
    if (it.subs) {
      reDraw(it.subs);
    }

  });
}

function reRender() {

  const containerUL = document.createElement('ul');
  menu.innerHTML    = '';
  menu.appendChild(containerUL);
  categoryListRender(categoryList, menu.childNodes[0]);
  drawPicture();
}

function drawPicture() {
  contextManager.selectCategories(
    categoryList
      .map(it => it.subs)
      .reduce((a, b) => a.concat(b), [])
      .map(it => it.subs)
      .reduce((a, b) => a.concat(b), [])
      .filter(it => it.checked)
      .map(it => it.name)
  );
}

reRender();
