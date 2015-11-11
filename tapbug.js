var c = document.getElementById("myCanvas");
var ctx;
var level = 1;


if(c == null){

	function storeLevel(){	
		var genders = document.getElementsByName("myLevel");
		for(var i = 0; i < genders.length; i++) {
		   if(genders[i].checked == true) {
		       level = genders[i].value;
		       console.log(level);
		   }
		 }
		 localStorage.setItem("level", level);
	}
}
else{
	level = localStorage.getItem("level");
	console.log(level);
	ctx = c.getContext("2d");

	sessionStorage.setItem("reloadPage", "True");
	
	

	c.width = 400;
	c.height = 600;


	var dim = {
		w : 10,
		h : 10,
		r : 8,
		hr: 13
	};
	var countDown = 60;
	var play = 0;
	var game_over = 0;
	var pause = 0;
	var timer;
	var gameTimer;
	var scoreKeep;
	var count_to_bug_call = 0;
	var timer2;
	var score = 0;
	var highestScore = 0;
	var bugAttachTimer = 200*Math.floor(Math.random()*(3-1+1)+1);;
	var min_eaten_dist = 37;
	var bugProb = [1,1,1,2,2,2,3,3,3,3]


	//Arrays for food and bugs
	var foodArr = [];
	var foodLocation = [];
	var numFood = 5;
	var bugArr = [];

	function init() {
		play = 1;
		countDown = 60;
		foodCreate();
		score = 0;
		//timer2=setInterval(bugAttack,1000);
		timer=setInterval(draw, 5);
		c.addEventListener('click', clickHandler, false);
		gameTimer = setInterval(timeCounter,1000);
		scoreKeep = setInterval(scoreKeeper,50);
	  	return timer;
	}

	/*Clear all variables before exiting*/
	function exitGame(){
		countDown = 60;
		play = 0;
		game_over = 0;
		pause = 0;
		score = 0;
		game_over = 1;
		foodArr = [];
		foodLocation = [];
		bugArr = [];
		c = null;
		localStorage.setItem("level", 1);
		window.location.href = "a2.html";
	}

	function draw() {
		if(game_over == 1){
			//window.alert("Game Over");
			ctx.clearRect(0,0,c.width,c.height);
			drawBugs();
			stopTimer();
		}
		else{
			if(bugAttachTimer == 0){
				bugAttack();
				bugAttachTimer = 200*Math.floor(Math.random()*(3-1+1)+1);
				console.log(bugAttachTimer);
			}
			else{
				bugAttachTimer--;
			}
			checkFood();
			fetchFood();
			count_to_bug_call = 0;
			ctx.clearRect(0,0,c.width,c.height);
			drawFood();
			drawBugs();
		}
	}

	function restartGame(){
		window.location.href = "index.html";
	}
	function pauseGame(){
		if(game_over == 0 && play == 1 && pause == 0){
			clearInterval(timer);
			clearInterval(timer2);
			clearInterval(gameTimer);
			document.getElementById("pauseGame").innerHTML="Play";
			pause = 1;
			play = 0;
			return;
		}
		else if(game_over == 0 && play == 0 && pause == 1){
			pause = 0;
			play = 1;
			document.getElementById("pauseGame").innerHTML="Pause";
			timer2=setInterval(bugAttack,1000);
			timer=setInterval(draw, 10);
			gameTimer=setInterval(timeCounter,1000);
		}

	}

	function clickHandler (e){
		var mouseClick = {
			x: e.pageX - c.offsetLeft,
			y: e.pageY - c.offsetTop
		};
		if(play == 1)
			isBugShot(mouseClick);
		//console.log(mouseClick.x,mouseClick.y);
	}

	function timeCounter(){
		countDown -= 1;
		document.getElementById("counter").innerHTML="Timer: "+countDown;
		if(countDown == 0){
			if(level == 1){
				clearInterval(gameTimer);
				clearTimeout(timer);
				clearTimeout(timer2);
				level = 2;
				init();
			}
			else {
				clearInterval(gameTimer);
				clearTimeout(timer);
				clearTimeout(timer2);
				optionsWindow();
			}
		}
	}
	function stopTimer(){
		clearTimeout(timer);
		clearTimeout(timer2);

		optionsWindow();
	}

	function optionsWindow(){
		var x;
		if (typeof(Storage) !== "undefined") {
			if(localStorage.getItem("HighScore") === null) {
				console.log("first time");
				localStorage.setItem("HighScore", score);
				highestScore = score;
			}
			else{
				highestScore = localStorage.getItem("HighScore");
				console.log("High  ",localStorage.getItem("HighScore"));
				if(score > highestScore){
					localStorage.setItem("HighScore", score);
					highestScore = score;
				}
			}
		}
		else{
			console.log("sorry...");
		}
	    if (confirm("Your score: " + score
	    			+"\nHigh Score: " + highestScore
	    			+"\nPress OK to Restart"
	    			+"\nPress Cancel to Exit") == true) {
	        restartGame();
	    } else {
	        exitGame();
	    }
	    document.getElementById("demo").innerHTML = x;
	}
	function scoreKeeper(){
		var scoreDisplay = "Score: " + score;
		document.getElementById("score").innerHTML=scoreDisplay;
	}


	/*FOOD Functions
	TODO: Make sure that the balls do not interfere*/
	function foodCreate(){
		var x,y;
		for (var i=0; i<numFood; i++){
			var taken = 1;
			if(i == 0){
				x = Math.floor(Math.random()*(388-12+1)+12),
				y = Math.floor(Math.random()*(588-130+1)+130),
				foodLocation.push({
					x_c 	: x,
					y_c 	: y
				})
			}
			else{
				taken = 1;
				while(taken == 1){
					var break_out=0;
					x = Math.floor(Math.random()*(388-12+1)+12);
					y = Math.floor(Math.random()*(588-130+1)+130);
					for(var m=0; m<foodLocation.length; m++){
						if((x >= (foodLocation[m].x_c - 25))&& (x <= (foodLocation[m].x_c + 25)) && (y >= (foodLocation[m].y_c - 25)) && (y <= (foodLocation[m].y_c + 25))) {
								break_out = 1;
								break;
							}
					}
					if(m == foodLocation.length && break_out == 0)
						taken = 0;
					else
						taken = 1;	
				}
				foodLocation.push({
					x_c 	: x,
					y_c 	: y
				})
			}

			foodArr.push({
				shape	: new Path2D(),
				id		: Math.floor(Math.random()*(400-1+1)+1),
				color	: "brown",
				radius	: 10,
				eaten	: false,
				buns	: 2,
				x_coor	: foodLocation[i].x_c,//Math.floor(Math.random()*(450-50+1)+50),
				y_coor	: foodLocation[i].y_c,//Math.floor(Math.random()*(450-150+1)+150),
				drawMe	: 	function(){
								ctx.beginPath();
								ctx.moveTo(this.x_coor-this.radius, this.y_coor - this.buns); // A1
								ctx.bezierCurveTo(
							    	this.x_coor - this.radius, this.y_coor - this.radius - this.buns , // C1
							    	this.x_coor + this.radius, this.y_coor - this.radius - this.buns , // C2
							    	this.x_coor + this.radius, this.y_coor - this.buns); // A2

								ctx.fillStyle = this.color;
							  	ctx.fill();
							  	ctx.beginPath();

							  	ctx.moveTo(this.x_coor-this.radius, this.y_coor + this.buns); // A1
								ctx.bezierCurveTo(
							    	this.x_coor - this.radius, this.y_coor + this.radius + this.buns , // C1
							    	this.x_coor + this.radius, this.y_coor + this.radius + this.buns , // C2
							    	this.x_coor + this.radius, this.y_coor +  this.buns); // A2
								ctx.fillStyle = this.color;
							  	ctx.fill();
							  	ctx.beginPath();
							  	ctx.fillStyle = "orange";
							  	ctx.fillRect(this.x_coor-this.radius, this.y_coor - this.buns, this.radius*2, this.buns*2);
							}
			});
		}
	}

	/*BUG FUNCTIONS*/
	function bugAttack(){
		var bugType = bugProb[Math.floor(Math.random()*bugProb.length)];
		var typeScore;
		var typeSpeed;
		var typeColor;
		if(bugType == 1){
			typeScore = 5;
			typeColor = "rgba(0,0,0,";
			if(level == 1)
				typeSpeed = 1.5;
			else
				typeSpeed = 2;
		}
		else if(bugType == 2){
			typeScore = 3;
			typeColor = "rgba(255,0,0,";
			if(level == 1)
				typeSpeed = 0.75;
			else
				typeSpeed = 1;
		}
		else if(bugType == 3){
			typeScore = 1;
			typeColor = "rgba(255,165,0,";
			if(level == 1)
				typeSpeed = 0.6;
			else
				typeSpeed = 0.8;
		}
		console.log("creating bug");
		bugArr.push({
			score 		: typeScore,
			target_food_index	: null,
			color		: typeColor,
			dis_to_food	: 10000,
			type 		: bugType,
			speed 		: typeSpeed/2,
			dead		: false,
			angle		: Math.PI,
			prev_angle 	: 0,
			dest_set	: 0,
			fade		: 1,
			stop 		: 0,
			x_coor		: Math.floor(Math.random()*(390-10+1)+10),
			y_coor		: 0,
			dx 			: 0,
			dy 			: 0
		});
	}


	/*
	TODO: */
	function drawFood() {
		for(var i=0; i<numFood; i++){
			if(foodArr[i] != null){//.eaten == false){
				foodArr[i].drawMe();
			}
		}
	}

	function isBugShot(xy){
		for(var i=0; i<bugArr.length; i++){
			if(bugArr[i].dead == false){
			if(xy.x >=bugArr[i].x_coor - dim.r -15 && xy.x <= bugArr[i].x_coor + dim.r + 15)
				if(xy.y >=bugArr[i].y_coor - dim.r -15 && xy.y <= bugArr[i].y_coor + dim.r +15){
					bugArr[i].dead = true;
					score += bugArr[i].score;
				}
			}
		}
	}

	function drawBugs() {
		for(var i=0; i<bugArr.length; i++){
			if(bugArr[i].dead == false){
				ctx.beginPath();
				ctx.fillStyle = "rgba(255,0,0," + bugArr[i].fade + ")";
				bugArr[i].x_coor += bugArr[i].dx;
				bugArr[i].y_coor += bugArr[i].dy;
				bugDrawing(i);
			}
			else if(bugArr[i].dead == true){
				if(bugArr[i].fade == 0){
					//Bug is dead, remove it from array
				} 
				else{
					ctx.beginPath();
					bugArr[i].fade -= 0.005;
					bugDrawing(i);
				}
			}
		}
	}


	function checkFood (){
		for(var i=0; i<foodArr.length; i++){
			if(foodArr[i] != null) 
				return;
		}
		game_over = 1;
	}
	/*
	TODO: might be a problem because i move by more than one pixel while my coordinates are exact*/
	function fetchFood(){
		for(var i=0; i<bugArr.length; i++) 
		{
			if(bugArr[i].dead == 1)
				continue;

				for(var j=0; j<foodArr.length; j++) 
				{
					if(foodArr[j] != null)//.eaten == false) 
					{
						var distance_to_i = Math.floor(Math.sqrt((bugArr[i].x_coor-foodArr[j].x_coor)*(bugArr[i].x_coor-foodArr[j].x_coor)+(bugArr[i].y_coor-foodArr[j].y_coor)*(bugArr[i].y_coor-foodArr[j].y_coor)));
						if(distance_to_i < bugArr[i].dis_to_food){
							bugArr[i].dest_set = 0;
							bugArr[i].target_food_index = j;
							bugArr[i].dis_to_food = distance_to_i;
						}
					}
					else if(bugArr[i].target_food_index == j){
						bugArr[i].dis_to_food = 1000000;
					}
				}
				//Done finding the distance, now give the dx and dy
				var dist = bugArr[i].dis_to_food;
				var target_food_index_2 = bugArr[i].target_food_index;
				if(dist < min_eaten_dist){
					//foodArr[target_food_index_2].eaten = true;
					bugArr[i].dest_set = 0;
					foodArr[target_food_index_2] = null;
					avoidCollision(i);
				}
				else if(bugArr[i].stop == 1){
					bugArr[i].dx = 0;
					bugArr[i].dy = 0;
					avoidCollision(i);
				}
				else if(foodArr[target_food_index_2] != null && bugArr[i].dest_set == 0){
					//Find velocity and direction of travel
					var dx = foodArr[target_food_index_2].x_coor - bugArr[i].x_coor;
					var dy = foodArr[target_food_index_2].y_coor - bugArr[i].y_coor;
					var x_axis_vel = (dx/dist)*bugArr[i].speed;
					var y_axis_vel = (dy/dist)*bugArr[i].speed;
					bugArr[i].dx = x_axis_vel;
					bugArr[i].dy = y_axis_vel;
					var angle = Math.asin(dy/dist);
					//console.log(angle*180/Math.PI);
					if(isNaN(angle))
						angle = Math.PI;
					else if(dy > 0 && dx > 0)
						angle = angle + Math.PI/2;
					else if(dy > 0 && dx < 0)
						angle = Math.PI +(Math.PI/2 - angle);
					else if(dy < 0 && dx > 0)
						angle += (Math.PI)/2;
					else if(dy < 0 && dx < 0){
						angle = ((Math.PI)/2 - angle) + (Math.PI);
					}
					else if(dx == 0 && dy > 0)
						angle = Math.PI;
					else if (dx == 0 && dy < 0)
						angle = 0;
					else if(dy == 0 && dx >0)
						angle = Math.PI/2;
					else if(dy == 0 && dx < 0)
						angle = 3*(Math.PI)/2;


					if(bugArr[i].prev_angle == 0) //Assuming that this only happens at the very beginning when bug is created, there will never be a case when angle = 0 (straight up movement)
						bugArr[i].prev_angle = bugArr[i].angle;



					else if(bugArr[i].prev_angle < (bugArr[i].angle - Math.PI/35))
				  		bugArr[i].prev_angle += Math.PI/40;
				  	else if (bugArr[i].prev_angle > (bugArr[i].angle + Math.PI/35))
				  		bugArr[i].prev_angle -= Math.PI/40;
				  	else
				  		bugArr[i].prev_angle = bugArr[i].angle;
				  	bugArr[i].dest_set = 1;
					bugArr[i].angle = angle;
					avoidCollision(i);
				}
				else
					avoidCollision(i);
		}
	}

	function avoidCollision(i){
		for(var j=0; j<bugArr.length; j++) 
		{
			if(i == j)//That will be me
				continue;
			else if(Math.floor(Math.sqrt((bugArr[i].x_coor-bugArr[j].x_coor)*(bugArr[i].x_coor-bugArr[j].x_coor)+(bugArr[i].y_coor-bugArr[j].y_coor)*(bugArr[i].y_coor-bugArr[j].y_coor))) < 50)
			{
				if(bugArr[i].speed < bugArr[j].speed && bugArr[j].dead == 0 && bugArr[i].dead == 0){
					bugArr[i].stop = 1;
					break;
				}
				else if(bugArr[i].speed == bugArr[j].speed && bugArr[j].dead == 0 && bugArr[i].dead == 0){
					//if it on my right
					if(bugArr[i].dis_to_food > bugArr[j].dis_to_food){
						bugArr[i].stop = 1;
						break;
					}
				}
			}
			else
				bugArr[i].stop = 0;
		}


	}
	function bugDrawing (i){

		var cX = bugArr[i].x_coor;
	  	var cY = bugArr[i].y_coor;
	  	var offset = 7;
	  	var height = 13;
	  	var width = 12;
	  	var hradius = 4;
	  	var hoffset = 12;

	  	ctx.save();
	  	ctx.translate(cX, cY);

		ctx.rotate(bugArr[i].prev_angle);
	  	ctx.translate(-cX, -cY);
	  	cY = cY - offset
	  	ctx.moveTo(cX, cY - height/2); 
	  
	  	//body
	  	//right curve
	  	ctx.bezierCurveTo(
	    	cX + width/2, cY - height/2 ,
	    	cX + width/2, cY + height/2, 
	    	cX, cY + height/2); 
	  	//left curve
	  	ctx.bezierCurveTo(
	    	cX - width/2, cY + height/2, 
	    	cX - width/2, cY - height/2, 
	    	cX, cY - height/2); 

	  	cY = cY + 2*offset;
	  	ctx.moveTo(cX, cY - height/2); 
	  
	  //body
	  //right curve
	  
	  	ctx.bezierCurveTo(
	    	cX + width/2, cY - height/2 , 
	    	cX + width/2, cY + height/2,
	    	cX, cY + height/2); 
	  	//left curve
	  	ctx.bezierCurveTo(
	    	cX - width/2, cY + height/2, 
	    	cX - width/2, cY - height/2, 
	    	cX, cY - height/2); 

	  	ctx.fillStyle = bugArr[i].color + bugArr[i].fade + ")";
	  	ctx.fill();
	  	ctx.beginPath();

	  	cY = bugArr[i].y_coor;

		//legs
	  	ctx.moveTo(cX+5,cY + offset );
	  	ctx.lineTo(cX+7,cY + offset + height/2+ 3);

	  	ctx.moveTo(cX-5,cY + offset );
	  	ctx.lineTo(cX-7,cY + offset + height/2 + 3);

		//ears
	  	ctx.moveTo(cX-1,cY - hoffset - 3*hradius);
	  	ctx.lineTo(cX-5,cY - hoffset - 3*hradius - 5);

	  	ctx.moveTo(cX+1,cY - hoffset - 3*hradius);
	  	ctx.lineTo(cX+5,cY - hoffset - 3*hradius - 5);

		//Hands
	  	ctx.moveTo(cX-2, cY);
		ctx.lineTo(cX -8, cY);

	  	ctx.moveTo(cX+2, cY);
	  	ctx.lineTo(cX+8, cY);

	  	ctx.lineWidth = 1.5;
	  	ctx.strokeStyle = bugArr[i].color + bugArr[i].fade + ")";
	  	ctx.stroke();

		//head
	  	ctx.moveTo(cX, cY - height/2 - hoffset);
	  	ctx.arc(cX,cY - height/2 - 12,hradius,0,2*Math.PI);
	  	ctx.fillStyle = bugArr[i].color + bugArr[i].fade + ")";
	  	ctx.fill();
	  	ctx.restore();
	}
}