const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collision = document.getElementById('collision');
const collisionctx = collision.getContext('2d');

collision.width = window.innerWidth;
collision.height = window.innerHeight;

let score = 0;
let gameOver = false;
ctx.font = '50px Impact';

let timetonextRav = 0;
let raveninterval = 500;
let lastTime = 0;

let ravens = [];

class Raven {
  constructor(){
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModerator = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModerator;
    this.height = this.spriteHeight * this.sizeModerator;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.direcX = Math.random() * 5 + 3;
    this.direcY = Math.random() * 5 - 2.5;
    this.markedfordel = false;
    this.image = new Image();
    this.image.src = 'raven.png';
    this.frame = 0;
    this.maxFrame = 4;
    this.timetoflap = 0;
    this.flapinterval = Math.random() * 50 + 50;
    this.randomColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    this.color = 'rgb('+ this.randomColor[0] + ',' + this.randomColor[1] + ',' + this.randomColor[2] + ')';

  }
  update(deltatime){
    if(this.y < 0 || this.y > canvas.height - this.height){
      this.direcY = this.direcY * -1;
    }
    this.x -= this.direcX;
    this.y += this.direcY;
    if(this.x < 0 - this.width) this.markedfordel = true;

    this.timetoflap += deltatime;
    if(this.timetoflap > this.flapinterval){
      if(this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timetoflap = 0;
    }
    if(this.x < 0 - this.width) gameOver = true;

  }
  draw(){
    collisionctx.fillStyle = this.color;
    collisionctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight ,this.x, this.y,this.width, this.height);
  }
}



window.addEventListener('click', function(e){
  const detectPixelColor = collisionctx.getImageData(e.x, e.y, 1, 1);
  // console.log(detectPixelColor);
  const pc = detectPixelColor.data;
  ravens.forEach(object =>{
    if(object.randomColor[0] === pc[0] && object.randomColor[1] === pc[1] && object.randomColor[2] === pc[2]){
      object.markedfordel = true;
      score++;
      explosion.push(new Explosion(object.x, object.y, object.width));
    }
  });

})

let explosion = [];
class Explosion {
  constructor(x, y, size){
    this.image = new Image();
    this.image.src = 'boom.png';
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "Fireimpact1.wav";
    this.timelastframe = 0;
    this.frameinterval = 200;
    this.markedtodel = false;
  }

  update(deltatime){
    if(this.frame === 0) this.sound.play();
    this.timelastframe += deltatime;
    if(this.timelastframe > this.frameinterval){
      this.frame++;
      this.timelastframe = 0;
      if(this.frame > 5) this.markedtodel = true;
    }
  }

  draw(){
    ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size);
  }
}


function drawGameOver(){
  ctx.textAlign = 'center';
  ctx.fillStyle = 'grey';
  ctx.fillText('GAME OVER, You Killed ' + score  + ' Ravens', canvas.width/2, canvas.height/2 + 5);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText('GAME OVER, You Killed ' + score + ' Ravens', canvas.width/2, canvas.height/2);
}

function drawScore(){
  ctx.fillStyle = 'black';
  ctx.fillText('Killed: ' + score, 50, 80);
  ctx.fillStyle = 'white';
  ctx.fillText('Killed: ' + score, 50, 75);
}

function animate(timestamp){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionctx.clearRect(0, 0, canvas.width, canvas.height);
  let deltatime = timestamp - lastTime;
  lastTime = timestamp;
  timetonextRav += deltatime;
  if(timetonextRav > raveninterval){
    ravens.push(new Raven());
    timetonextRav = 0;
    ravens.sort(function(a,b){
      return a.width - b.width;
    });
  };
  drawScore();
  [...ravens, ...explosion].forEach(object => object.update(deltatime));
  [...ravens, ...explosion].forEach(object => object.draw());
  ravens = ravens.filter(object => !object.markedfordel);
  explosion = explosion.filter(object => !object.markedfordel);

  if(!gameOver) requestAnimationFrame(animate);
  else drawGameOver();
}

animate(0);
