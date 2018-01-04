/**********************************************************************/
/******************* Created by: Aditya Sharma ************************/
/******************* FileName: main.js ********************************/
/******************* Type: Uncompressed *******************************/
/******************* Email: adityakumarsharma1988@gmail.com ***********/
/**********************************************************************/

var localStorage1 ={};  // Only Global Variable

localStorage1.application = {};
localStorage1.application.player = {};
localStorage1.application.player.name = "";
localStorage1.application.player.truckNum = 2;
localStorage1.application.player.fund = 1000;
localStorage1.application.bet = {};

var load = (function (window) {

    /**** Hanblebar Helper ****/

    Handlebars.registerHelper('times', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });
    /************************/

    // This is the container node of all the templates
    var container = document.getElementsByClassName('container')[0];

    loadSetup(setupCallBack);

    // Calling Initial Setup Of The Application
    function loadSetup(){
        // Using Handlebar To Load The Setup Template
        var source   = document.getElementById('gameSetupTemplate').innerHTML;
        var template = Handlebars.compile(source);
        var html    = template({});
        container.innerHTML = html;
        setupCallBack()
    }

    // Holds The Business Logic And Event Handlers Of Setup Page
    function setupCallBack(){
        var startGameButton = document.getElementById("startGameButton");
        var playerName = document.getElementById("playerName");
        var truckNum = document.getElementById("truckNum");
        var initialFund = document.getElementById("initialFund");

        /**** When Start Game Button is Clicked ******/
        startGameButton.addEventListener("click",function() {
            /** Validate Input ***/
            if(playerName.value || playerName.value!==""){
                localStorage1.application.player.name = playerName.value;
                if(initialFund.value<=0){
                    alert("Enter The Initial Fund Greater Than $0");
                    return false;
                }else{
                    localStorage1.application.player.truckNum = truckNum.value;
                    localStorage1.application.player.fund = initialFund.value;
                }
            }else{
                alert("Enter The Player Name");
                return false;
            }

            /**** Below Line Creates A Copy Player Object, So That Changing In A attributeObject Doesnt Change Global Variable*******/

            var attributeObject = Object.create(localStorage1.application.player); // {name:"Aditya",truckNum:"2",fund:1000}
            attributeObject.truckNum = parseInt(attributeObject.truckNum); // change String to Number
            startGame(attributeObject);
        });
    }

    // Template Injection Of Game Page
    function startGame (attributeObject){
        // Using Handlebar To Start The Game Template
        var source   = document.getElementById('gameStartTemplate').innerHTML;
        var template = Handlebars.compile(source);
        var context = attributeObject; // Passing The {name:"Aditya",truckNum:"2",fund:1000} For Track and Player Card Formation
        var html    = template(context);
        container.innerHTML = html;
        startGameCallBack(attributeObject); // Calls The Business Logic For Game
    }

    // Holds The Business Logic Of Game Page
    function startGameCallBack(attributeObject){
        var modal = document.getElementById('myModal'); // For Setup PopUp/Modal
        var placeBetButton = document.getElementById("placeBetButton"); // Place Bet Button With Blue
        var resetButton = document.getElementById("resetButton"); // Reset Application With Red
        var startRaceButton = document.getElementById("startRaceButton"); // Race Start Button With OliveGreen
        var setup = document.getElementById("setup"); // Race Step Button With Yellow
        var truck = document.getElementsByClassName("truck"); //Get the NodeList of all the trucks
        var raceTrackUnit = document.getElementsByClassName("raceTrackUnit");
        var closeModel = document.getElementsByClassName("close")[0];// Get the <span> element that closes the modal
        var declareWinner =document.getElementById("declareWinner"); // Get declare winner section
        var fund = document.getElementsByClassName("playerBalance"); // Get the Fund left with Player on the PlayerCard


        // returns a floor random value
        var randomFinish = function(){
            return Math.floor(Math.random()*1000)
        }

        // returns a Number 900 if truck has finished the race (900 is the length of race track)
        var grooming = function(randomFinish){
            var randomFinishval = randomFinish();
            if(randomFinishval>900) {
                return 900;
            }else{
                return randomFinishval;
            }
        }

        // Function Returns The Total Gains And Loses Of The Player
        var winnersProfit = function(obj){
            var gain = 0;
            var loss = 0;
            var count = 0;
            var totalBet = 0;
            var allowedOnce = true;
            // Check If Any Of The Truck Has Completed And Whether It Match With The Players Betted Truck
            for(var key in obj){
                if(obj[key]==900 && allowedOnce){
                    allowedOnce = false;
                    startRaceButton.style.display = "none";
                    for(var i in localStorage1.application.bet){
                        totalBet = totalBet + parseInt(localStorage1.application.bet[i]);
                        if(key==i){
                            gain = gain + parseInt(localStorage1.application.bet[i]);
                            count++;
                        }
                    }
                }
            }

            // If The Count is Zero Then None Of Your Betted Truck has Finished The Race and You Have Lost You Money
            if(count===0){
                loss = totalBet;
                localStorage1.application.player.fund = parseInt(localStorage1.application.player.fund) - totalBet;
            }else{
                localStorage1.application.player.fund = parseInt(localStorage1.application.player.fund) + gain ;
            }

            return [gain,loss,localStorage1.application.player.fund];

        }

        // Function Displays The Total Gains/Loses Of The Player
        var renderWinnerProfit = function(isGain,isLoss,winnerProfit){
            if(isGain){
                declareWinner.innerHTML = "<h4>***Congratulations You Have Won $"+winnerProfit[0]+"***</h4>";
                fund[0].innerHTML = "$"+winnerProfit[2];
            }else if(isLoss){
                declareWinner.innerHTML = "<h4>***Sorry You Have Lost $"+winnerProfit[1]+"***</h4>";
                fund[0].innerHTML = "$"+winnerProfit[2];
            }
        }

        // When The Player Clicks The Place Bet Button, Open The Modal
        placeBetButton.addEventListener("click",function() {
            modal.style.display = "block";
            var modelPlaceBet = document.getElementById("modelPlaceBet");
            var modelReset = document.getElementById("modelReset");
            var trucker = document.getElementsByClassName("Trucker");

            // Place The Bet Event Handler On The Modal
            modelPlaceBet.addEventListener("click",function() {
                var total = 0;
                declareWinner.innerHTML="";


                // Code Snippet To Place The Bet On Truck and Update In The Gobal Space i.e. "localStorage1.application.bet ={truck1:200,truck4:450}"
                for(var i=0;i<trucker.length;i++){
                    total = total + parseInt(trucker[i].value===""?0:parseInt(trucker[i].value));
                    localStorage1.application.bet['truck'+i]=trucker[i].value==""?undefined:parseInt(trucker[i].value);
                    if(localStorage1.application.bet['truck'+i]==undefined){
                        delete localStorage1.application.bet['truck'+i];
                    }
                }

                // Notify Player Of Not Sufficient Fund To Bet
                if(total>parseInt(localStorage1.application.player.fund)){
                    document.getElementById("modalAlert").innerHTML="Insufficient Fund";
                }else{
                    modal.style.display = "none";
                    startRaceButton.style.display = "inline-block";
                    placeBetButton.style.display = "inline-block";
                }

                //Highlight The Betted Truck Track
                for(var key in localStorage1.application.bet){
                    document.getElementsByName(key)[0].style.backgroundColor = "lightcyan";
                    document.getElementsByName(key)[0].innerHTML = "You Have Betted $"+localStorage1.application.bet[key]+" On Me";
                }

            });

            // Place The Reset Bet Event Handler On The Modal
            modelReset.addEventListener("click",function() {
                declareWinner.innerHTML="";
                for(var i=0;i<trucker.length;i++){
                    trucker[i].value = "";
                    delete localStorage1.application.bet['truck'+i]
                }
                placeBetButton.style.display = "inline-block";
            });
        });


        // Event Handler , When Start Race Button Is Clicked
        startRaceButton.addEventListener("click",function() {
            var obj={};
            declareWinner.innerHTML="";

            // Below Loop Is To Place/Mark The Trucks On The Race Track Once The "Race Start Button" Is Clicked
            // Object{truck0: 900, truck1: 271, truck2: 700, truck3: 788}  (Reminder: 900 is the length of Race Track)
            for(var key=0;key<truck.length;key++){
                (function(key){
                    var leftPercentage = grooming(randomFinish);
                    truck[key].style.left=leftPercentage+"%";
                    obj[truck[key].id]= parseInt(leftPercentage);
                })(key)
            }

            // Calling "winnerProfit" Function Returns The Total Gains And Loses Of The Player
            var winnerProfit = winnersProfit(obj);

            // Calling "renderWinnerProfit" Function Displays The Total Gains/Loses Of The Player
            renderWinnerProfit(winnerProfit[0]>0?true:false,winnerProfit[1]>0?true:false,winnerProfit);
        });


        // Event Handler , To Reset The Positions Of The Trucks (Nothing Else , Special Button "Setup" Has Been Introduce To Do Reset All)
        resetButton.addEventListener("click",function() {
            var count=0;
            for(var key in localStorage1.application.bet){
                count = count + parseInt(localStorage1.application.bet[key]);
            }
            if(parseInt(localStorage1.application.player.fund) >= count){
                startRaceButton.style.display = "inline-block";
                placeBetButton.style.display = "inline-block";
                localStorage1.application.player.fund = attributeObject.fund;
                fund[0].innerHTML = "$"+attributeObject.fund;
                declareWinner.innerHTML="";
                for(let key=0;key<truck.length;key++){
                    (function(key){
                        var leftPercentage = 3;
                        truck[key].style.left=leftPercentage+"%";
                    })(key)
                }
            }else{
                alert("Insufficient Fund, Please Setup Again");
                startRaceButton.style.display = "none";
                return false;
            }
        });

        // Event Handler , Setup Loads The SetUp Page And Resets All The Values
        setup.addEventListener("click",function() {
            loadSetup();
        });

        // When The Player Clicks On <span> (x), Close The Setup Modal
        closeModel.addEventListener("click",function() {
            modal.style.display = "none";
        });

        // When The Player Clicks Anywhere Outside Of The Setup Modal, Close The Modal
        window.addEventListener("click",function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        })

        startRaceButton.style.display = "none";
    }

    /********* Revealing Modular Pattern *************/
    return {
        loadGame:loadSetup,
        startGame:startGame
    }

})(window)

// Load The Game API
load.loadGame();
