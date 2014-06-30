App = Ember.Application.create();

App.Router.map(function()
{
	this.resource('menus', function() {
		this.resource('menu', { path: ':itemno'});
	});
	this.resource('cafe');
	this.resource('parking');
	this.resource('about');
	this.resource('eatout');
});

App.IndexRoute=Ember.Route.extend({
	beforeModel: function() {
		this.transitionTo('menus');
	}
});

App.NavigationView = Ember.View.extend({
	templateName: 'navigation',
	selectedBinding: 'controller.selected',
	NavItemView: Ember.View.extend({
		tagName: 'li',
		classNameBindings: 'isActive:active'.w(),
		isActive: function() {
			return this.get('item') === this.get('parentView.selected');
		}.property('item', 'parentView.selected').cacheable()
	})
});

App.MenusView=Ember.View.extend({
	click: function () {
		$("html, body").animate({ scrollTop: 0}, 600);
	}
});

var MenusData=getMenusData("menu/csv_export_utf8.csv");

App.MenusRoute = Ember.Route.extend({
	model: function() {
		return MenusData;
	},
	actions: {
		menunow: function () {
			this.transitionTo('menu',date2itemno());
		}
	},
});

App.MenuRoute = Ember.Route.extend({
	model: function(params) {
		return MenusData.findBy('itemno', params.itemno);
	}
});

Ember.Handlebars.helper('format-date', function(date){
	var d = new Date(date);
	var week = new Array('일', '월', '화', '수', '목', '금', '토');
	var str=(week[d.getDay()]);
	return new Ember.Handlebars.SafeString(date+' ('+str+')');
});

function getMenusData(Url) {
	var csv= showGetResult(Url);
	var retval=CSV2JSON(csv);
	var jsondata=$.parseJSON(retval);
	return jsondata;
};

App.CafeController = Ember.Controller.extend({
	selectedMenuCount: null,
	selectedMenuItem: null,
	menusCount: [
		{ label: "1", value: "1"},
		{ label: "2", value: "2"},
		{ label: "3", value: "3"},
		{ label: "4", value: "4"},
		{ label: "5", value: "5"},
		{ label: "6", value: "6"},
		{ label: "7", value: "7"},
		{ label: "8", value: "8"},
		{ label: "9", value: "9"}
	],
	menusItem: [
		{ label: "에스프레소", value: "에스프레소" },
		{ label: "아메리카노", value: "아메리카노" },
		{ label: "카푸치노", value: "카푸치노" },
		{ label: "카라멜마키아또", value: "카라멜마키아또" },
		{ label: "카페모카", value: "카페모카" },
		{ label: "-------", value: null },
		{ label: "카페라떼", value: "카페라떼" },
		{ label: "바닐라라떼", value: "바닐라라떼" },
		{ label: "녹차라떼", value: "녹차라떼" },
		{ label: "고구마라떼", value: "고구마라떼" },
		{ label: "-------", value: null },
		{ label: "카모마일", value: "카모마일" },
		{ label: "페퍼민트", value: "페퍼민트" },
		{ label: "-------", value: null },
		{ label: "우유", value: "우유" },
		{ label: "아이스티", value: "아이스티" },
		{ label: "율무차", value: "율무차" },
		{ label: "유자차", value: "유자차" },
		{ label: "쌍화차", value: "쌍화차" },
		{ label: "-------", value: null },
		{ label: "오렌지쥬스", value: "오렌지쥬스" },
		{ label: "사과쥬스", value: "사과쥬스" },
		{ label: "자몽쥬스", value: "자몽쥬스" },
		{ label: "-------", value: null },
		{ label: "청포도에이드", value: "청포도에이드 "}
	],
	actions: {
		addCurrentOrder: function() {
			var selectedMenuItem=this.get('selectedMenuItem.value');
			var selectedMenuCount=this.get('selectedMenuCount.value');
			if (selectedMenuItem != null) {
				var OrderItem=({item:selectedMenuItem, count:selectedMenuCount});
				App.OrderComponent.create(OrderItem).appendTo($('#orderlisttable'));
			}
		}
	}
});

App.OrderComponent=Ember.Component.extend({
	templateName: "components/cafeOrders",
	didInsertElement: function(){
		console.debug('didInsertElement - OrderComponent');
	},
	actions: {
		remove: function() {
			this.remove();
		}
	}
});

var currentPP=getCookie("parkingplace");

App.ParkingController = Ember.Controller.extend({
	selectedParkingPlace: function () { 
		var parkingplace= getCookie("parkingplace");
		if (parkingplace=='') { return null };
		return parkingplace;
	},
	parkingPlaces: [
		{ label: "Reset", value: null},
		{ label: "B2", value: "B2"},
		{ label: "B3", value: "B3"},
		{ label: "B4", value: "B4"}
	],
	actions: {
		setParkingPlace: function() {
			var selectedParkingPlace=this.get('selectedParkingPlace.value');
			if (selectedParkingPlace != null) {
				var ParkingPlace=({parkingplace:selectedParkingPlace});
				App.ParkingComponent.create(ParkingPlace).appendTo($('#parkingTable'));
				console.debug(selectedParkingPlace);
				setCookie("parkingplace", selectedParkingPlace, 2, "926.1kko.com");
			} else {
				delCookie("parkingplace");
			}
		}
	},
	current: currentPP
});


App.ParkingComponent=Ember.Component.extend({
	templateName: "components/Parking",
	didInsertElement: function(){
		console.debug('didInsertElement - ParkingComponent');
	},
	actions: {
		remove: function() {
			this.remove();
		}
	}
});


function getCookie( name ) {
	var start = document.cookie.indexOf( name + "=" );
	var len = start + name.length + 1;
	if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
		return null;
	}
	if ( start == -1 ) return null;
	var end = document.cookie.indexOf( ';', len );
	if ( end == -1 ) end = document.cookie.length;
	return unescape( document.cookie.substring( len, end ) );
}
 
function setCookie( name, value, expires, path, domain, secure ) {
	var today = new Date();
	today.setTime( today.getTime() );
	if ( expires ) {
		expires = expires * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date( today.getTime() + (expires) );
	document.cookie = name+'='+escape( value ) +
		( ( expires ) ? ';expires='+expires_date.toGMTString() : '' ) + //expires.toGMTString()
		( ( path ) ? ';path=' + path : '' ) +
		( ( domain ) ? ';domain=' + domain : '' ) +
		( ( secure ) ? ';secure' : '' );
}
 
function delCookie( name, path, domain ) {
	if ( getCookie( name ) ) document.cookie = name + '=' +
			( ( path ) ? ';path=' + path : '') +
			( ( domain ) ? ';domain=' + domain : '' ) +
			';expires=Thu, 01-Jan-1970 00:00:01 GMT';
}

// Source: http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.

function CSVToArray(strData, strDelimiter) {
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");
	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp((
	// Delimiters.
	"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
	// Quoted fields.
	"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
	// Standard fields.
	"([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];
	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;
	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec(strData)) {
		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[1];
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push([]);
		}
		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[2]) {
			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[2].replace(
			new RegExp("\"\"", "g"), "\"");
		} else {
			// We found a non-quoted value.
			var strMatchedValue = arrMatches[3];
		}
		// Now that we have our value string, let's add
		// it to the data array.
		arrData[arrData.length - 1].push(strMatchedValue);
	}
	// Return the parsed data.
	return (arrData);
}

function CSV2JSON(csv) {
	var array = CSVToArray(csv);
	var objArray = [];
	for (var i = 1; i < array.length-1; i++) {
		objArray[i - 1] = {'itemno':String(i)};
		for (var k = 0; k < array[0].length && k < array[i].length; k++) {
			var key = array[0][k];
			objArray[i - 1][key] = array[i][k]
		}
	}
	var json = JSON.stringify(objArray);
	var str = json.replace(/},/g, "},\r\n");

	return json;
}

function showGetResult( Url )
{
	var result = null;
	$.ajax({
		url: Url,
		type: 'get',
		//contentType: "text/csv; charset=MS949",  // KSC5601 8859_1 ascii UTF-8 EUC-KR MS949
		//charset: 'MS949',
		dataType: 'html',
		async: false,
		success: function(data) {
			result = data;
			result = result.replace('시작 날짜','start_date');
			result = result.replace('시작 시간','start_time');
			result = result.replace('끝 날짜','end_date');
			result = result.replace('끝 시간','end_time');
			result = result.replace('제목','subject');
			result = result.replace('설명','description');
		}
	});
	return result;
}

function date2itemno()
{
	var now = new Date();
	var week = new Array(99, 1, 4, 7, 10, 13, 99);
	var base = (week[now.getDay()]);

	var hour= now.getHours();
	if (hour >= 9) { base+=1; };
	if (hour >=13) { base+=1; };
	if (base >=16) { base=1; };
	return String(base);
}

function displayGoogleAds() {
	$('ins').each(function(){
		(adsbygoogle = window.adsbygoogle || []).push({});
	});
}