!function (window) {
	function datepicker(options) {
		return new Datepicker(options);
	}
	function Datepicker(options) {
		var defaultOpts = {
			triEle:'date_input',
			format:'yyyy-mm-dd hh:ii:ss',//yyyy-mm-dd hh:ii:ss 两种可选
			showTime:false,
			start:'2010-12-13',
            invalid:function () {
                
            }
		};
		var opts = Datepicker.deepcopy(defaultOpts,options);
		opts.triEle = typeof opts.triEle === 'object' ? opts.triEle : document.getElementById(opts.triEle);
		opts.tarEle = typeof opts.tarEle === 'undefined'? opts.triEle : typeof opts.tarEle === 'object' ? opts.tarEle : document.getElementById(opts.tarEle);
		this.opts = opts;
		this.init();
	}
	Datepicker.deepcopy = function (target, origin) {
		target = target || {};
		for (var i in origin) {
			if (origin.hasOwnProperty(i)) {
				if (typeof (origin[i]) === 'object') {
					target[i] = origin[i].constructor === Array ? [] : {};
					Datepicker.deepcopy(target[i], origin[i]);
				} else {
					target[i] = origin[i];
				}
			}
		}
		return target;
	};
	Datepicker.on = function (ele,tevent,handlr) {
		document.addEventListener?ele.addEventListener(tevent,handlr,false):ele.attachEvent('on'+tevent,function () {
				handlr.call(ele,window.event);
			});
	};
	Datepicker.data = function (obj,key,value) {
		if(typeof document.documentElement.dataset !== 'undefined'){
			if(arguments.length === 2){
				return obj.dataset[key];
			}else{
				obj.dataset[key] = value
			}
		}else{
			if(arguments.length === 2){
				return obj.getAttribute('data-'+key);
			}else{
				obj.setAttribute('data-'+key,value);
			}
		}
	};
	Datepicker.stopPropagation = function (e) {
		e = e || window.event;
		e.stopPropagation?e.stopPropagation():e.cancelBubble = false;
	};
	Datepicker.prototype.init = function () {
		var _this = this;
		_this.creatDom();
		_this.initData(true);
		_this.render();
		_this.oYearDiv = document.getElementById('datepicker-year');
		_this.oMonthDiv = document.getElementById('datepicker-month');
		_this.oHourDiv = document.getElementById('datepicker-hour');
		_this.oMinuteDiv = document.getElementById('datepicker-minute');
		_this.oSecondDiv = document.getElementById('datepicker-second');
		_this.bindEvent();
	};
	Datepicker.prototype.initData = function (first) {
		var _this = this;
		var opts = _this.opts;
		var triEle = opts.tarEle;
		var triValue = (function (ele) {
			var triTagName = ele.tagName.toLowerCase();
			if(triTagName === 'input'){
				return triEle.value;
			}else {
				return triEle.innerText;
			}
		})(triEle);
		if(!first){
			var reg = _this.opts.format.replace(/yyyy|mm|dd|hh|ii|ss/g,'\\d+');
			if(triValue !== '' && !new RegExp(reg).test(triValue)){
                opts.invalid.call(_this);
			}
		}
		var dateArr = triValue.match(/\d+/g) || [];
		if(dateArr.length === 3){
			_this.timestamp = new Date(dateArr[0],dateArr[1]-1,dateArr[2]).getTime();
		}else if(dateArr.length > 3 && dateArr.length <= 6){
			dateArr.length = 6;
			dateArr[4] = dateArr[4]===undefined?'00':dateArr[4];
			dateArr[5] = dateArr[5]===undefined?'00':dateArr[5];
			_this.timestamp = new Date(dateArr[0],dateArr[1]-1,dateArr[2],dateArr[3],dateArr[4],dateArr[5]).getTime();
		}else{
			_this.timestamp = new Date().getTime();
		}
		_this.showDateObj = new Date(_this.timestamp);
	};
	Datepicker.prototype.fill = function (num) {
		return num < 10 ? '0' + (num|0) : num;
	};
	Datepicker.prototype.creatDom = function () {
		var _this = this,i = 0,j = 0;
		var weeks = [ '日', '一', '二', '三', '四', '五', '六'];
		_this.oDiv = document.createElement('div');
		_this.oDiv.id = 'datepicker-box';
		_this.oDiv.className = 'datepicker-box';
		_this.oDiv.style.display = 'none';
		var domStr = '';
		domStr += '<div id="datepicker-default" class="datepicker-default">'+
			'		<div class="datepicker-default-top">'+
			'			<a class="turn prev-year" href="javascript:;">&laquo;</a>'+
			'			<a class="turn prev-month" href="javascript:;">&lsaquo;</a>'+
			'			<div class="text">'+
			'				<a class="pick-year" href="javascript:;"></a>'+
			'				<a class="pick-month" href="javascript:;"></a>'+
			'			</div>'+
			'			<a class="turn next-month" href="javascript:;">&rsaquo;</a>'+
			'			<a class="turn next-year" href="javascript:;">&raquo;</a>'+
			'		</div>'+
			'       <div class="datepicker-default-middle">'+
			'<table id="datepicker-default-table"><thead><tr>'+(function () {
				var temstr = '';
				for(var i=0;i<weeks.length;i++){
					temstr += '<th>'+weeks[i]+'</th>';
				}
				return temstr;
			})()+'</tr></thead><tbody>'+(function () {
				var temstr = '';
				for(i=0;i<6;i++){
					for(j=0;j<7;j++){
						if(j === 0){
							temstr += '<tr><td>1</td>';
						}else if(j === 6){
							temstr += '<td>2</td></tr>';
						}else{
							temstr += '<td>3</td>';
						}
					}
				}
				return temstr;
			})()+'</tbody></table></div>'+
			'<div class="datepicker-default-bottom">'+
			'           <div class="opt">'+
			'			    <a class="clear" href="javascript:;">清空</a>'+
			'			    <a class="confirm" href="javascript:;">确定</a>'+
			'			    <a class="now" href="javascript:;">今日</a>'+
			'			</div>'+
			'			<div class="time">'+
			'				<a class="pick-hour" href="javascript:;"></a>'+
			'				<span>:</span>'+
			'				<a class="pick-minute" href="javascript:;"></a>'+
			'				<span>:</span>'+
			'				<a class="pick-second" href="javascript:;"></a>'+
			'			</div>'+
			'		</div>'+
			'	</div>'+
			'<div id="datepicker-year" class="datepicker-year">'+
			'		<div class="datepicker-year-top">'+
			'				<span class="year-group"></span>'+
			'	    </div>'+
			'       <div>'+
			'		    <table class="datepicker-year-middle">'+
			'			    <tbody>'+
			'                   <tr><td><a data-year="prev" href="javascript:;">&laquo;</a></td><td></td><td></td></tr>'+
		'                       <tr><td></td><td></td><td></td></tr>'+
			'                   <tr><td></td><td></td><td></td></tr>'+
			'                   <tr><td></td><td></td><td><a data-year="next" href="javascript:;">&raquo;</a></td></tr>'+
			'			    </tbody>'+
			'		    </table>'+
			'		</div>'+
			'	</div>'+
			'<div id="datepicker-month" class="datepicker-month">'+
			'		<div class="datepicker-year-top">'+
			'				<span class="month-group" href="javascript:;">1月</span>'+
			'		</div>'+
			'		<div class="datepicker-month-middle">'+
			'		<table>'+
			'			<tbody><tr>'+
			(function () {
				var i = 0,str = '';
				for(;i<12;i++){
					if((i+1)%3 === 0 && (i+1)!==12){
						str += '<td><a data-month="'+(i+1)+'" href="javascript:;">'+(i+1)+'月</a></td></tr><tr>'
					}else{
						str += '<td><a data-month="'+(i+1)+'" href="javascript:;">'+(i+1)+'月</a></td>'
					}
				}
				return str;
			})()+
			'			</tr></tbody>'+
			'		</table>'+
			'	    </div>'+
			'	</div>'+
			'<div id="datepicker-hour" class="datepicker-hour">'+
			'		<div class="datepicker-hour-top">选择时</div>'+
			'		<div class="datepicker-hour-middle">'+
			'		<table>'+
			'			<tbody><tr>'+
			(function () {
				var i = 0,str = '';
				for(;i<24;i++){
					if((i+1)%4 === 0 && (i+1)!==24){
						str += '<td><a data-hour="'+i+'" href="javascript:;">'+i+'时</a></td></tr><tr>'
					}else{
						str += '<td><a data-hour="'+i+'" href="javascript:;">'+i+'时</a></td>'
					}
				}
				return str;
			})()+
			'			</tr></tbody>'+
			'		</table>'+
			'	    </div>'+
			'	</div>'+
			'<div id="datepicker-minute" class="datepicker-minute">'+
			'		<div class="datepicker-minute-top">选择分</div>'+
			'		<div class="datepicker-minute-middle">'+
			'		<table>'+
			'			<tbody><tr>'+
			(function () {
				var i = 0,str = '';
				for(;i<60;i++){
					if((i+1)%10 === 0 && (i+1)!==60){
						str += '<td><a data-minute="'+i+'" href="javascript:;">'+_this.fill(i)+'</a></td></tr><tr>'
					}else{
						str += '<td><a data-minute="'+i+'" href="javascript:;">'+_this.fill(i)+'</a></td>'
					}
				}
				return str;
			})()+
			'			</tr></tbody>'+
			'		</table>'+
			'	    </div>'+
			'	</div>'+
			'<div id="datepicker-second" class="datepicker-second">'+
			'		<div class="datepicker-second-top">选择秒</div>'+
			'		<div class="datepicker-second-middle">'+
			'		<table>'+
			'			<tbody><tr>'+
			(function () {
				var i = 0,str = '';
				for(;i<60;i++){
					if((i+1)%10 === 0 && (i+1)!==60){
						str += '<td><a data-second="'+i+'" href="javascript:;">'+_this.fill(i)+'</a></td></tr><tr>'
					}else{
						str += '<td><a data-second="'+i+'" href="javascript:;">'+_this.fill(i)+'</a></td>'
					}
				}
				return str;
			})()+
			'			</tr></tbody>'+
			'		</table>'+
			'	    </div>'+
			'	</div>';
		_this.oDiv.innerHTML = domStr;
		document.body.insertBefore(_this.oDiv,document.body.children[0]);
	};
	Datepicker.prototype.render = function () {
		var _this = this;
		var opts = _this.opts;
		var oDiv = _this.oDiv;
		var tds = oDiv.getElementsByTagName('tbody')[0].getElementsByTagName('td');
		var showDateObj = _this.showDateObj;
		var monthDays = [31,28+_this.isLeap(showDateObj.getFullYear()),31,30,31,30,31,31,30,31,30,31];
        var showYear = showDateObj.getFullYear();
        var showMonth = showDateObj.getMonth()+1;
        var showHour = showDateObj.getHours();
        var showMinute = showDateObj.getMinutes();
        var showSecond = showDateObj.getSeconds();
		var showMonthFirstDay = new Date(showYear,showMonth-1,1).getDay();
		var activeDate = showDateObj.getDate();
		for(var i = 0; i<tds.length ; i++){
			var dataYear,dataMonth,dataDay,order = i+1;
            tds[i].className = '';
			if(order < showMonthFirstDay + 1){
				if(showMonth === 1){
					dataYear = showYear-1;
					dataMonth = 12;
				}else{
					dataYear = showYear;
					dataMonth = showMonth-1;
				}
				dataDay = monthDays[dataMonth-1] - showMonthFirstDay + order;
                tds[i].className = 'prev';
			}else if(order > showMonthFirstDay + monthDays[showMonth-1]){
				if(showMonth === 12){
					dataYear = showYear+1;
					dataMonth = 1;
				}else{
					dataYear = showYear;
					dataMonth = showMonth + 1;
				}
				dataDay = order-showMonthFirstDay - monthDays[showMonth-1];
				tds[i].className = 'next';
			}else{
				dataYear = showYear;
				dataMonth = showMonth;
				dataDay = order-showMonthFirstDay;
				if(order - showMonthFirstDay === activeDate){
					tds[i].className = 'today';
				}
			}
			tds[i].innerHTML = dataDay;
			Datepicker.data(tds[i],'year',dataYear);
			Datepicker.data(tds[i],'month',dataMonth);
			Datepicker.data(tds[i],'day',dataDay);
		}
        oDiv.querySelector('.pick-year').innerHTML = showYear + '年';
        oDiv.querySelector('.pick-month').innerHTML = showMonth + '月';
		oDiv.querySelector('.pick-hour').innerHTML = _this.fill(showHour);
		oDiv.querySelector('.pick-minute').innerHTML = _this.fill(showMinute);
		oDiv.querySelector('.pick-second').innerHTML = _this.fill(showSecond);
        if(opts.showTime === false){
	        oDiv.querySelector('.time').style.display = 'none';
        }
	};
	Datepicker.prototype.renderYearSelect = function (tYear) {
		var _this = this;
		var oYearDiv = _this.oYearDiv;
		var startYear;
		var endYear;
		var curYear = _this.showDateObj.getFullYear();
		if(tYear === 'prev'){
			_this.viewYearStart = _this.viewYearStart-10;
		}else if(tYear === 'next'){
			_this.viewYearStart = _this.viewYearStart+10;
		}else{
			_this.viewYearStart = curYear-curYear%10;
		}
		tYear = curYear;
		startYear = _this.viewYearStart;
		endYear = startYear+9;
		var i = 0 , tds = oYearDiv.getElementsByTagName('td');
		for(;i<tds.length;i++){
			tds[i].className = '';
			if(i !== 0 && i !== tds.length-1){
				tds[i].innerHTML = '<a data-year="'+(startYear+i-1)+'" href="javascript:;">'+(startYear+i-1)+'</a>';
				if(tYear === startYear+i-1){
					tds[i].className = 'cur';
				}
			}else if((startYear<=1900 && i === 0)  || (endYear >= 2100 && i === 11)){
				tds[i].className = 'disabled';
			}
		}
		_this.oYearDiv.querySelector('.year-group').innerHTML = startYear + '-' + endYear;
		_this.oYearDiv.style.display = 'block';
	};
	Datepicker.prototype.renderMonthSelect = function (tMonth) {
		var _this = this;
		var oMonthDiv = _this.oMonthDiv;
		var i = 0 , tds = oMonthDiv.getElementsByTagName('td');
		for(;i<tds.length;i++){
			tds[i].className = '';
			if(i+1 === tMonth){
				tds[i].className = 'cur';
			}
		}
		oMonthDiv.querySelector('.month-group').innerHTML = tMonth + '月';
		oMonthDiv.style.display = 'block';
	};
	Datepicker.prototype.renderHourSelect = function (tHour) {
		var _this = this;
		var oHourDiv = _this.oHourDiv;
		var i = 0 , tds = oHourDiv.getElementsByTagName('td');
		for(;i<tds.length;i++){
			tds[i].className = '';
			if(i === tHour){
				tds[i].className = 'cur';
			}
		}
		oHourDiv.style.display = 'block';
	};
	Datepicker.prototype.renderMinuteSelect = function (tMinute) {
		var _this = this;
		var oMinuteDiv = _this.oMinuteDiv;
		var i = 0 , tds = oMinuteDiv.getElementsByTagName('td');
		for(;i<tds.length;i++){
			tds[i].className = '';
			if(i === tMinute){
				tds[i].className = 'cur';
			}
		}
		oMinuteDiv.style.display = 'block';
	};
	Datepicker.prototype.renderSecondSelect = function (tSecond) {
		var _this = this;
		var oSecondDiv = _this.oSecondDiv;
		var i = 0 , tds = oSecondDiv.getElementsByTagName('td');
		for(;i<tds.length;i++){
			tds[i].className = '';
			if(i === tSecond){
				tds[i].className = 'cur';
			}
		}
		oSecondDiv.style.display = 'block';
	};
	Datepicker.prototype.isLeap = function (tYear) {
		return tYear%4 === 0 ? (tYear%100 === (tYear%400)?1:0?0:1):0;
	};
	Datepicker.prototype.now = function () {
		var _this = this,opts = _this.opts;
		_this.showDateObj = new Date();
		if(opts.showTime === false){
			_this.showDateObj.setHours(0,0,0);
		}
		_this.render();
		_this.returnDate();
	};
	Datepicker.prototype.clear = function () {
		var _this = this,opts = _this.opts,triEle = opts.triEle;
		(function (ele) {
			var triTagName = ele.tagName.toLowerCase();
			if(triTagName === 'input'){
				return triEle.value = '';
			}else {
				return triEle.innerText = '';
			}
		})(triEle);
		_this.oDiv.style.display = 'none';
	};
	Datepicker.prototype.bindEvent = function () {
		var _this = this;
		var oDiv = _this.oDiv;
		var oYearDiv = _this.oYearDiv;
		var oMonthDiv = _this.oMonthDiv;
		var oHourDiv = _this.oHourDiv;
		var oMinuteDiv = _this.oMinuteDiv;
		var oSecondDiv = _this.oSecondDiv;
		(function () {
			var i = 0 , tds = document.getElementById('datepicker-default-table').getElementsByTagName('td');
			for(;i<tds.length;i++){
				Datepicker.on(tds[i],'click',function (e) {
					Datepicker.stopPropagation(e);
					var dataYear = Datepicker.data(this,'year'),dataMonth = Datepicker.data(this,'month'),dataDay = Datepicker.data(this,'day');
					_this.showDateObj.setFullYear(dataYear);
					_this.showDateObj.setMonth(dataMonth-1);
					_this.showDateObj.setDate(dataDay);
					_this.returnDate();
				})
			}
		})();
		Datepicker.on(document, 'click', function(){
			if(_this.oDiv.style.display !== 'none'){
				_this.oDiv.style.display = 'none';
			}
		});
		Datepicker.on(_this.opts.triEle,'click',function (e) {
			Datepicker.stopPropagation(e);
			_this.show();
		});
		Datepicker.on(oDiv.querySelector('.confirm'),'click',function (e) {
			Datepicker.stopPropagation(e);
			_this.returnDate();
		});
		Datepicker.on(oDiv.querySelector('.now'),'click',function (e) {
			Datepicker.stopPropagation(e);
			_this.now();
		});
		Datepicker.on(oDiv.querySelector('.clear'),'click',function (e) {
			Datepicker.stopPropagation(e);
			_this.clear();
		});
		Datepicker.on(oDiv.querySelector('.prev-month'),'click',function (e) {
			Datepicker.stopPropagation(e);
			_this.prevMonth();
		});
		Datepicker.on(oDiv.querySelector('.next-month'),'click',function (e) {
			Datepicker.stopPropagation(e);
			_this.nextMonth();
		});
		Datepicker.on(oDiv.querySelector('.prev-year'),'click',function (e) {
			Datepicker.stopPropagation(e);
			_this.prevYear();
		});
		Datepicker.on(oDiv.querySelector('.next-year'),'click',function (e) {
			Datepicker.stopPropagation(e);
			_this.nextYear();
		});
		Datepicker.on(oDiv.querySelector('.pick-year'),'click',function (e) {
			Datepicker.stopPropagation(e);
			var tyear = parseInt(this.innerText);
			_this.renderYearSelect(tyear);
		});
		(function () {
			var i = 0 , oYearDivTds = oYearDiv.getElementsByTagName('td');
			for(;i<oYearDivTds.length;i++){
				Datepicker.on(oYearDivTds[i],'click',function (e) {
					Datepicker.stopPropagation(e);
					var oA = this.getElementsByTagName('a')[0];
					var temYear = Datepicker.data(oA,'year');
					if(temYear === 'prev' || temYear === 'next'){
						if(_this.viewYearStart && ((_this.viewYearStart > 1900 && temYear === 'prev') || _this.viewYearStart < 2090 && temYear === 'next')){
							_this.renderYearSelect(temYear);
						}
						return false;
					}else{
						_this.viewYearChoose = temYear;
						_this.showDateObj.setFullYear(temYear);
						_this.render();
						_this.oYearDiv.style.display = 'none';
					}
				})
			}
		})();
		Datepicker.on(oDiv.querySelector('.pick-month'),'click',function (e) {
			Datepicker.stopPropagation(e);
			var tMonth = parseInt(this.innerText);
			_this.renderMonthSelect(tMonth);
		});
		(function () {
			var i = 0 , oMonthDivTds = oMonthDiv.getElementsByTagName('td');
			for(;i<oMonthDivTds.length;i++){
				Datepicker.on(oMonthDivTds[i],'click',function (e) {
					Datepicker.stopPropagation(e);
					var oA = this.getElementsByTagName('a')[0];
					var temMonth = Datepicker.data(oA,'month');
					_this.viewMonthChoose = temMonth;
					_this.showDateObj.setMonth(temMonth-1);
					_this.render();
					oMonthDiv.style.display = 'none';
				})
			}
		})();
		Datepicker.on(oDiv.querySelector('.pick-hour'),'click',function (e) {
			Datepicker.stopPropagation(e);
			var tHour = parseInt(this.innerText);
			_this.renderHourSelect(tHour);
		});
		(function () {
			var i = 0 , oHourDivTds = oHourDiv.getElementsByTagName('td');
			for(;i<oHourDivTds.length;i++){
				Datepicker.on(oHourDivTds[i],'click',function (e) {
					Datepicker.stopPropagation(e);
					var oA = this.getElementsByTagName('a')[0];
					var temMonth = Datepicker.data(oA,'hour');
					_this.viewHourChoose = temMonth;
					_this.showDateObj.setHours(temMonth);
					_this.render();
					oHourDiv.style.display = 'none';
				})
			}
		})();
		Datepicker.on(oDiv.querySelector('.pick-minute'),'click',function (e) {
			Datepicker.stopPropagation(e);
			var tMinute = parseInt(this.innerText);
			_this.renderMinuteSelect(tMinute);
		});
		(function () {
			var i = 0 , oMinuteDivTds = oMinuteDiv.getElementsByTagName('td');
			for(;i<oMinuteDivTds.length;i++){
				Datepicker.on(oMinuteDivTds[i],'click',function (e) {
					Datepicker.stopPropagation(e);
					var oA = this.getElementsByTagName('a')[0];
					var temMinute = Datepicker.data(oA,'minute');
					_this.viewMinuteChoose = temMinute;
					_this.showDateObj.setMinutes(temMinute);
					_this.render();
					oMinuteDiv.style.display = 'none';
				})
			}
		})();
		Datepicker.on(oDiv.querySelector('.pick-second'),'click',function (e) {
			Datepicker.stopPropagation(e);
			var tSecond = parseInt(this.innerText);
			_this.renderSecondSelect(tSecond);
		});
		(function () {
			var i = 0 , oSecondDivTds = oSecondDiv.getElementsByTagName('td');
			for(;i<oSecondDivTds.length;i++){
				Datepicker.on(oSecondDivTds[i],'click',function (e) {
					Datepicker.stopPropagation(e);
					var oA = this.getElementsByTagName('a')[0];
					var temSecond = Datepicker.data(oA,'second');
					_this.viewSecondChoose = temSecond;
					_this.showDateObj.setSeconds(temSecond);
					_this.render();
					oSecondDiv.style.display = 'none';
				})
			}
		})();
	};
	Datepicker.prototype.show = function () {
		var _this = this;
		_this.initData();
		_this.render();
		_this.getPosition();
		_this.oDiv.style.display = 'block';
	};
	Datepicker.prototype.getPosition = function () {
		var _this = this;
		var triEle = _this.opts.triEle;
		var positionObj = (function (element) {
			var rect = element.getBoundingClientRect();
			var top = document.documentElement.clientTop;
			var left= document.documentElement.clientLeft;
			return{
				top    :   rect.top - top,
				bottom :   rect.bottom - top,
				left   :   rect.left - left,
				right  :   rect.right - left
			}
		})(triEle);
		var tHeight = triEle.offsetHeight;
		var tWidth = triEle.offsetWidth;
		var oHeight = _this.oDiv.offsetHeight;
		var oWidth = _this.oDiv.offsetWidth;
		_this.oDiv.style.top = (positionObj.top + tHeight) + 'px';
		_this.oDiv.style.left = positionObj.left+ 'px';
	};
	//返回最终日期
	Datepicker.prototype.returnDate = function(){
		var _this = this,opts = _this.opts,showDateObj = _this.showDateObj;
		var oTime ={
			y:showDateObj.getFullYear(),
			m:showDateObj.getMonth()+1,
			d:showDateObj.getDate(),
			h:showDateObj.getHours(),
			i:showDateObj.getMinutes(),
			s:showDateObj.getSeconds()
		};
		var str = opts.format.replace(/(y+|m+|d+|h+|i+|s+)/g,function(v){
			return ((v.length>1?"0":"")+eval('oTime.'+v.slice(-1))).slice(-(v.length>2?v.length:2))
		});
		opts.tarEle.value = str;
		_this.oDiv.style.display = 'none';
		/*if(!hide){
			Dates.close();
			typeof Dates.options.choose === 'function' && Dates.options.choose(getDates);
		}*/
	};
	Datepicker.prototype.prevMonth = function () {
		var _this = this;
        var showDateObj = _this.showDateObj;
		var showYear = showDateObj.getFullYear();
		var showMonth = showDateObj.getMonth();
		if(showMonth === 0){
			if(showYear<=1900)return false;
			showDateObj.setFullYear(showYear-1);
			showDateObj.setMonth(11);
		}else{
			showDateObj.setMonth(showMonth-1);
		}
		_this.render();
	};
	Datepicker.prototype.nextMonth = function () {
		var _this = this;
		var showDateObj = _this.showDateObj;
        var showYear = showDateObj.getFullYear();
		var showMonth = showDateObj.getMonth();
		if(showMonth === 11){
			if(showYear>=2099)return false;
			showDateObj.setFullYear(showYear+1);
			showDateObj.setMonth(0);
		}else{
			showDateObj.setMonth(showMonth+1);
		}
		_this.render();
	};
	Datepicker.prototype.prevYear = function () {
		var _this = this;
        var showDateObj = _this.showDateObj;
        var showYear = showDateObj.getFullYear();
        if(showYear <= 1900)return false;
		showDateObj.setFullYear(showYear-1);
		_this.render();
	};
	Datepicker.prototype.nextYear = function () {
		var _this = this;
        var showDateObj = _this.showDateObj;
        var showYear = showDateObj.getFullYear();
		if(showYear >= 2099)return false;
		showDateObj.setFullYear(showYear+1);
		_this.render();
	};
	if((typeof module === 'undefined'?'undifined':typeof (module)) === 'object' && typeof(module.exports) === 'object'){
		module.exports = datepicker;
	}else{
		window.datepicker = datepicker;
		if(typeof define === 'function' && define.amd){
			return datepicker;
		}
	}

}(window,undefined);
function DateFormat(option) {
	var defaultOpt = {
		dateStr:new Date(),
		firstDay:1,//每周第一天0为周日 1为周一
		format:'yyyy-mm-dd'//yyyy-mm-dd hh:ii:ss 两种可选
	};
	var opt = $.extend({},defaultOpt,option);
	this.dateStr = opt.dateStr;
	this.year = this.dateStr.getFullYear();
	this.month = this.dateStr.getMonth();
	this.date = this.dateStr.getDate();
	this.day = this.dateStr.getDay();
	this.firstDay = opt.firstDay;
	this.format = opt.format;
}
DateFormat.prototype.getToday = function(){
	return this.formatDate();
};
DateFormat.prototype.getWeekFirstDay = function (num){
	var week_num = num == undefined?0:num,
		weekFirstDayDate = new Date(this.year,this.month,this.date-(this.day-this.firstDay)+week_num*7);
	return this.formatDate(weekFirstDayDate);
};
DateFormat.prototype.getWeekLastDay = function (num){
	var week_num = num == undefined?0:num,
		weekLastDayDate = new Date(this.year,this.month,this.date+(7-this.day+this.firstDay)+week_num*7-1);
	return this.formatDate(weekLastDayDate);
};
DateFormat.prototype.getMonthFirstDay = function (num){
	var month_num = num == undefined?0:num,
		monthFirstDayDate = new Date(this.year,this.month+month_num,1);
	return this.formatDate(monthFirstDayDate);
};
DateFormat.prototype.getMonthLastDay = function (num) {
	var month_num = num == undefined?0:num,
		monthLastDayDate = new Date(this.year,this.month+1+month_num,0);
	return this.formatDate(monthLastDayDate);
};
DateFormat.prototype.formatDate = function (dateStr) {
	var _this = this,
		curDateStr = dateStr || this.dateStr;
	var oTime ={
		y:curDateStr.getFullYear(),
		m:curDateStr.getMonth()+1,
		d:curDateStr.getDate(),
		h:curDateStr.getHours(),
		i:curDateStr.getMinutes(),
		s:curDateStr.getSeconds()
	};
	return _this.format.replace(/(y+|m+|d+|h+|i+|s+)/g,function(v){
		return ((v.length>1?"0":"")+eval('oTime.'+v.slice(-1))).slice(-(v.length>2?v.length:2))
	});
};
/*(function() {
	// helpers
	var regExp = function(name) {
		return new RegExp('(^| )'+ name +'( |$)');
	};
	var forEach = function(list, fn, scope) {
		for (var i = 0; i < list.length; i++) {
			fn.call(scope, list[i]);
		}
	};

	// class list object with basic methods
	function ClassList(element) {
		this.element = element;
	}

	ClassList.prototype = {
		add: function() {
			forEach(arguments, function(name) {
				if (!this.contains(name)) {
					this.element.className += ' '+ name;
				}
			}, this);
		},
		remove: function() {
			forEach(arguments, function(name) {
				this.element.className =
					this.element.className.replace(regExp(name), '');
			}, this);
		},
		toggle: function(name) {
			return this.contains(name)
				? (this.remove(name), false) : (this.add(name), true);
		},
		contains: function(name) {
			return regExp(name).test(this.element.className);
		},
		// bonus..
		replace: function(oldName, newName) {
			this.remove(oldName), this.add(newName);
		}
	};

	// IE8/9, Safari
	if (!('classList' in Element.prototype)) {
		Object.defineProperty(Element.prototype, 'classList', {
			get: function() {
				return new ClassList(this);
			}
		});
	}

	// replace() support for others
	if (window.DOMTokenList && DOMTokenList.prototype.replace == null) {
		DOMTokenList.prototype.replace = ClassList.prototype.replace;
	}
})();*/