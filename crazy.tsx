/* COLORS */
let colorPlayer1: string = 'blue';
let colorPlayer2: string = 'red';
const fontStyle: string = "45px Courier New";
const backgroundColor: string = "green";
const ballColor: string = "yellowgreen"
const defaultColor: string = "white";
/* VALUES */
const startMessage: string = "Press any key to begin";
const netInterval: number = 5;
const netWidth: number = 2;

const ballRadius: number = 9;
const ballSpeed: number = 7;
const ballSpeedPace: number = 0.2;

const paddleHeight: number = 100;
const paddleWidth: number = 10;

const framePerSecond: number = 50;
const computerLevel: number = 0.1;

const roundsMax: number = 2;

const hex: (number | string)[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "A", "B", "C", "D", "E", "F"];


/* SELECT CANVAS */
//const canvas = document.getElementById("pong");
const canvas: HTMLCanvasElement | null = document.getElementById("pong") as HTMLCanvasElement | null;
//const context = canvas.getContext("2d");
const context: CanvasRenderingContext2D | null = canvas?.getContext("2d");

/* GAME */
const game = {
    running: false
}

/* USER PADDLE */

const user = {
    x: 0,
    y: canvas.height/2 - paddleHeight/2,
    width: paddleWidth,
    height: paddleHeight,
    color: colorPlayer1,
    score: 0
}

/* COMPUTER PADDLE */

const com = {
    x: canvas.width - paddleWidth,
    y: canvas.height/2 - paddleHeight/2,
    width: paddleWidth,
    height: paddleHeight,
    color: colorPlayer2,
    score: 0
}

/* BALL */

const ball = {
    x: canvas.width/2,
    y: canvas.height - ballRadius ,
    radius: ballRadius,
    speed: ballSpeed,
    color: ballColor,
    velocityX: 3,
    velocityY: 3
}

/* DRAW RECT */

function drawRect(x, y, w, h, color){
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

/* CREATE THE NET */

const net = {
    x: canvas.width/2 - netWidth/2,
    y: 0,
    width: netWidth,
    height: netInterval,
    color: defaultColor
}

const obstacle = {
    x: canvas.width/2 - 10,
    y: canvas.height/2 - 100,
    width: 20,
    height: 200,
    color: defaultColor
}

/* DRAW NET */
function drawNet(){
    for(let i = 0; i <= canvas.height; i+=netInterval+2){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}
/* DRAW CIRCLE */

function drawCircle(x, y, r, color){
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI*2, false);
    context.closePath();
    context.fill();
}

/* DRAW TEXT */

function drawText(text, x, y, color){
    context.fillStyle = color;
    context.font = fontStyle;
    context.fillText(text, x, y);
}



/* RENDER THE GAME */
function render(){
    //clear canvas
    drawRect(0, 0, canvas.width/2, canvas.height, colorPlayer2);
    drawRect(canvas.width/2, 0, canvas.width, canvas.height, colorPlayer1);
    //draw net
    drawNet();
    //draw obstacle
    drawRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.color);
    //draw score
    drawText(user.score, canvas.width/4, canvas.height/5, colorPlayer1);
    drawText(com.score, (3 * canvas.width/4), canvas.height/5, colorPlayer2);
    //draw paddles
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    //draw ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

}

canvas.addEventListener("mousemove", movePaddle);
canvas.addEventListener("keydown", start);

function movePaddle(evt){
    let rect = canvas.getBoundingClientRect();

    user.y = evt.clientY - rect.top - user.height/2;
}

/* BALL RESET */
function resetBall(player){
    ball.speed = ballSpeed;
    ball.x = canvas.width/2;
    ball.y = canvas.height - ballRadius;

    if (player != com)
        ball.velocityX = -ball.velocityX;
    
}

function getRandomNumber(){
    return Math.floor(Math.random() * hex.length);
}

function obstacleCollision(ball, obstacle, player) {
    if (
        ball.x + ball.radius > obstacle.x && // Ball's right edge is to the right of the obstacle's left edge
        ball.x - ball.radius < obstacle.x + obstacle.width && // Ball's left edge is to the left of the obstacle's right edge
        ball.y + ball.radius > obstacle.y && // Ball's bottom edge is below the obstacle's top edge
        ball.y - ball.radius < obstacle.y + obstacle.height // Ball's top edge is above the obstacle's bottom edge
    ) {
        // CHanging the drection

        ball.velocityX = -ball.velocityX;
        ball.velocityY = -ball.velocityY;
        

        //changing the opposite side color
        let hexColor = '#';
        for (let i = 0; i < 6; i++){
            hexColor += hex[getRandomNumber()];
        }
        if (player === user)
            hexColor != user.color ? com.color = colorPlayer2 = hexColor : obstacleCollision(ball, obstacle, player);
        if (player === com)
            hexColor != com.color ? user.color = colorPlayer1 = hexColor : obstacleCollision(ball, obstacle, player);
        //console.log(hexColor);
    }
}



function collision(ball, paddle){
    ball.top = ball.y - ball.radius;
    ball.bottom = ball.y + ball.radius;
    ball.left = ball.x - ball.radius;
    ball.right = ball.x + ball.radius;

    paddle.top = paddle.y + 1;
    paddle.bottom = paddle.y + paddle.height + 1;
    paddle.left = paddle.x + 1;
    paddle.right = paddle.x + paddle.width + 1;
    //returns true or falce for the collision
    return ball.right > paddle.left
        && ball.bottom > paddle.top
        && ball.left < paddle.right 
        && ball.top < paddle.bottom;
}


/* UPDATE GAME  */
function gameUpdate(){
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    ///AI
    com.y += (ball.y - (com.y + com.height/2)) * computerLevel;

    
    let player = (ball.x + ball.radius < canvas.width/2) ? user : com;

    obstacleCollision(ball, obstacle, player);
    
    if (collision( ball, player)){
        //where the ball hit the player
        let collidePoint = (ball.y - (player.y + player.height/2));
        //normalization
        collidePoint = collidePoint/(player.height/2);
        
        //calculate angle in Radian
        let angleRad = collidePoint * (Math.PI/4);
        
        // X direction of the ball when it's hit
        let direction = ((ball.x + ball.radius) < canvas.width/2) ? 1 : -1;
        
        //change velocity X an y
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        ball.speed += ballSpeedPace;
    }
    
    //changing direction
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0){
        ball.velocityY = -ball.velocityY;
    }

    if (ball.x + 1 - ball.radius < 0){
        com.score++;
        resetBall(com);
    }
    else if(ball.x + 1 + ball.radius > canvas.width){ 
        user.score++;
        resetBall(user);}
    if (com.score === roundsMax || user.score === roundsMax){
        game.running = false;
        user.color = colorPlayer2;
        com.color = colorPlayer1;

    }

    console.log(game.running);

}
function listen(){
    render();
    if (game.running === false){
        start();
    }
    else{
        gameUpdate();
    }
}

function start (){
    render();
    context.font = fontStyle;
    context.fillStyle = "black";
    context.fillRect(
        canvas.width/2 - 300,
        canvas.height/2 - 50,
        700,
        100
    );
    // Change the canvas color;
    context.fillStyle = defaultColor;

    let message;

    if (com.score === roundsMax || user.score === roundsMax)
        com.score === roundsMax ? message = "GAME OVER" : message = "YOU WIN";
    else
        message = startMessage;
 
    // Draw the "press any key to begin" text
    context.textAlign = "center";
    context.fillText(message,
    canvas.width/2,
    canvas.height / 2 + 15
    );

    document.addEventListener("keydown", function(){
        if (game.running === false && user.score === 0 && com.score === 0){
            game.running = true;
            console.log(game.running);
            /* LOOP */
            setInterval(listen, 1000/framePerSecond);
        }
    });
}

start();
