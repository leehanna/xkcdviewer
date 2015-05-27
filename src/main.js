var THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');

var whiteSkin = new Skin({fill:"white"});
var titleStyle = new Style({font:"bold 70px", color:"black"});
var bigText = new Style({font:"bold 30px", color:"#333333"});
THEME.labeledButtonStyle = new Style( { font: "20px", color:"white" } );

var comicPic = new Picture ({left: 0, right: 0, height: 700});
var currNum = 0;
var mostCurrentNum = 0;
var currUrl = "http://xkcd.com/info.0.json";
var isFlickr = 0;


//nextButton

var nextButton = BUTTONS.Button.template(function(){ return{
	top:0, bottom:0, left:0, right:0,
	contents:[
		new Label({left:0, right:0, height:10, string:"Next", style:bigText})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value:  function(button){
			currNum -= 1;
			updateImage();
		}}
	})
}});


//prevButtom

var prevButton = BUTTONS.Button.template(function(){ return{
	top:0, bottom:0, left:0, right:0,
	contents:[
		new Label({left:0, right:0, height:10, string:"Previous", style:bigText})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value:  function(button){
			currNum += 1;
			updateImage();
		}}
	})
}});


//randomButton

var randomButton = BUTTONS.Button.template(function(){ return{
	top:0, bottom:0, left:0, right:0,
	contents:[
		new Label({left:0, right:0, height:10, string:"Random", style:bigText})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value:  function(button){
			currNum = Math.floor((Math.random() * mostCurrentNum) + 1);
			updateImage();
		}}
	})
}});


// Picture button

var picButton = BUTTONS.Button.template(function(){ return{
	top:0, bottom:0, left:0, right:0,
	contents:[
		new Label({left:0, right:0, height:10, string:"Picture", style:bigText})
	],
	behavior: Object.create(BUTTONS.ButtonBehavior.prototype, {
		onTap: { value:  function(button){
			if (isFlickr == 0) {
				application.invoke(new Message("/getFlickr"));
				isFlickr = 1;
			} else {
				isFlickr = 0;
				updateImage();
			}
		}}
	})
}});

function updateImage() {
	currUrl = "http://xkcd.com/" + currNum.toString() + "/info.0.json";
	application.invoke(new Message("/getComic"));
}


//column

var mainColumn = new Column({
	left: 0, right: 0, top: 0, bottom: 0,
	skin: whiteSkin,
	contents:[
		new Label({left: 0, right: 0, height: 70, string: "Comic title", style: titleStyle, name: "title"}),
		comicPic,
		new Line({
			left: 0, right: 0, top: 0, bottom: 0, height: 10,
			skin: whiteSkin,
			contents: [ new prevButton, new randomButton, new nextButton, new picButton ]
		})
	]
});


//handlers

Handler.bind("/getComicInit", {
	onInvoke: function(handler, message){
		handler.invoke(new Message(currUrl), Message.JSON);
	},
	onComplete: function(handler, message, json){
		mainColumn.title.string = json.title;
		mostCurrentNum = json.num;
		currNum = mostCurrentNum;
		trace(mostCurrentNum + ": " + json.img + "\n");
		comicPic.load(json.img);
	}
});

Handler.bind("/getComic", {
	onInvoke: function(handler, message){
		handler.invoke(new Message(currUrl), Message.JSON);
	},
	onComplete: function(handler, message, json){
		mainColumn.title.string = json.title;
		currNum = json.num;
		trace(json.num + ": " + json.img + "\n");
		comicPic.url = json.img;
	}
});

Handler.bind("/getFlickr", {
	onInvoke: function(handler, message){
		var flickrUrl = "https://api.flickr.com/services/feeds/photos_public.gne?" 
			+ serializeQuery( { 
				format: "json", nojsoncallback: 1, tags: mainColumn.title.string
			} );
		handler.invoke(new Message(flickrUrl), Message.JSON);
	},
	onComplete: function(handler, message, json){
		trace(mainColumn.title.string + ": " + json.items[0].media.m + "\n");
		comicPic.url = json.items[0].media.m;
	}
});


//main application

application.behavior = Object.create(Behavior.prototype, {	
	onLaunch: { value: function(application, data){
		application.add(mainColumn);
		application.invoke(new Message("/getComicInit"));
	}}
});