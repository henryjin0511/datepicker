/* jshint expr: true */
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
            invalid:null,
			change:null
		};
		var opts = Datepicker.deepcopy(defaultOpts,options);
		opts.triEle = typeof opts.triEle === 'object' ? opts.triEle : document.getElementById(opts.triEle);
		opts.tarEle = typeof opts.tarEle === 'undefined'? opts.triEle : typeof opts.tarEle === 'object' ? opts.tarEle : document.getElementById(opts.tarEle);
		this.opts = opts;
		this.init();
	}

	//深度拷贝
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

	//事件绑定
	Datepicker.on = function (ele,tevent,handlr) {
		document.addEventListener?ele.addEventListener(tevent,handlr,false):ele.attachEvent('on'+tevent,function () {
				handlr.call(ele,window.event);
			});
	};

	//data函数
	Datepicker.data = function (obj,key,value) {
		if(typeof document.documentElement.dataset !== 'undefined'){
			if(arguments.length === 2){
				return obj.dataset[key];
			}else{
				obj.dataset[key] = value;
			}
		}else{
			if(arguments.length === 2){
				return obj.getAttribute('data-'+key);
			}else{
				obj.setAttribute('data-'+key,value);
			}
		}
	};

	//停止冒泡
	Datepicker.stopPropagation = function (e) {
		e = e || window.event;
		e.stopPropagation?e.stopPropagation():e.cancelBubble = false;
	};

	//阻止默认行为
	Datepicker.preventDefault = function (e) {
		e = e || window.event;
		e.preventDefault?e.preventDefault():e.returnValue = false;
	};
	
	//根据class获取元素
	Datepicker.getByClass = function () {
		var oParent = arguments.length === 1?document:arguments[0];
		var sClass = arguments.length === 1?arguments[0]:arguments[1];
		if(document.getElementsByClassName){
			return oParent.getElementsByClassName(sClass);
		}else{
			var aTmp = oParent.getElementsByTagName('*'),aRes=[],arr =[];
			for(var i=0;i<aTmp.length;i++){
				arr = aTmp[i].className.split(' ');
				for (var j=0;j<arr.length;j++){
					if(arr[j] === sClass){
						aRes.push(aTmp[i]);
					}
				}
			}
			return aRes;
		}
	};

	Datepicker.fill = function (num) {
		return num < 10 ? '0' + (num|0) : num;
	};

	Datepicker.getTarget = function (event) {
		var e = event || window.event;
		return e.target || e.srcElement;
	};
	//共有方法 - 初始化
	Datepicker.prototype.init = function () {
		var _this = this;
		_this.oDiv = document.getElementById('datepicker-box');
		if(!_this.oDiv){
			_this.createDom();
		}
		_this.oYearDiv = Datepicker.getByClass(_this.oDiv,'datepicker-year')[0];
		_this.oMonthDiv = Datepicker.getByClass(_this.oDiv,'datepicker-month')[0];
		_this.oHourDiv = Datepicker.getByClass(_this.oDiv,'datepicker-hour')[0];
		_this.oMinuteDiv = Datepicker.getByClass(_this.oDiv,'datepicker-minute')[0];
		_this.oSecondDiv = Datepicker.getByClass(_this.oDiv,'datepicker-second')[0];
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
		//alert(dateArr);
		if(dateArr.length === 3){
			_this.timestamp = new Date(dateArr[0],dateArr[1]-1,dateArr[2]).getTime();
		}else if(dateArr.length > 3 && dateArr.length <= 6){
			dateArr.length = 6;
			dateArr[4] = dateArr[4] === undefined?'00':dateArr[4];
			dateArr[5] = dateArr[5] === undefined?'00':dateArr[5];
			_this.timestamp = new Date(dateArr[0],dateArr[1]-1,dateArr[2],dateArr[3],dateArr[4],dateArr[5]).getTime();
		}else{
			_this.timestamp = (function(){var temDate = new Date();temDate.setHours(0,0,0);return temDate;})().getTime();
		}
		_this.showDateObj = new Date(_this.timestamp);
	};

	Datepicker.prototype.createDom = function () {
		var _this = this,i = 0,j = 0;
		var weeks = [ '日', '一', '二', '三', '四', '五', '六'];
		_this.oDiv = document.createElement('div');
		_this.oDiv.id = 'datepicker-box';
		_this.oDiv.className = 'datepicker-box';
		_this.oDiv.style.display = 'none';
		var domStr = '';
		domStr += '<div id="datepicker-default" class="datepicker-default">'+
			'		<div class="datepicker-default-top">'+
			'			<a class="datepicker-default-prev-year" href="javascript:;">&laquo;</a>'+
			'			<a class="datepicker-default-prev-month" href="javascript:;">&lsaquo;</a>'+
			'			<a class="datepicker-default-select-year" href="javascript:;"></a>'+
			'			<a class="datepicker-default-select-month" href="javascript:;"></a>'+
			'			<a class="datepicker-default-next-month" href="javascript:;">&rsaquo;</a>'+
			'			<a class="datepicker-default-next-year" href="javascript:;">&raquo;</a>'+
			'		</div>'+
			'       <div class="datepicker-default-middle">'+
			'<table class="datepicker-default-table"><thead><tr>'+(function () {
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
							temstr += '<tr><td><span></span></td>';
						}else if(j === 6){
							temstr += '<td><span></span></td></tr>';
						}else{
							temstr += '<td><span></span></td>';
						}
					}
				}
				return temstr;
			})()+'</tbody></table></div>'+
			'<div class="datepicker-default-bottom">'+
			'       <div class="datepicker-default-opt">'+
			'			  <a class="datepicker-default-opt-clear" href="javascript:;">清空</a>'+
			'			  <a class="datepicker-default-opt-confirm" href="javascript:;">确定</a>'+
			'			  <a class="datepicker-default-opt-today" href="javascript:;">今日</a>'+
			'		</div>'+
			'		<div class="time">'+
			'			<a class="datepicker-default-select-hour" href="javascript:;"></a>'+
			'			<span>:</span>'+
			'			<a class="datepicker-default-select-minute" href="javascript:;"></a>'+
			'			<span>:</span>'+
			'			<a class="datepicker-default-select-second" href="javascript:;"></a>'+
			'		</div>'+
			'	</div>'+
			'</div>'+
			'<div class="datepicker-year">'+
			'		<div class="datepicker-year-top">'+
			'			<span class="datepicker-month-show-year"></span>'+
			'	    </div>'+
			'       <div>'+
			'		    <table class="datepicker-year-middle">'+
			'			    <tbody>'+
			'                   <tr><td><span data-view="year" data-year="prev" href="javascript:;">&laquo;</span></td><td></td><td></td></tr>'+
		'                       <tr><td></td><td></td><td></td></tr>'+
			'                   <tr><td></td><td></td><td></td></tr>'+
			'                   <tr><td></td><td></td><td><span data-view="year" data-year="next" href="javascript:;">&raquo;</span></td></tr>'+
			'			    </tbody>'+
			'		    </table>'+
			'		</div>'+
			'	</div>'+
			'<div class="datepicker-month">'+
			'		<div class="datepicker-year-top">'+
			'			<span class="datepicker-month-show-month"></span>'+
			'		</div>'+
			'		<div class="datepicker-month-middle">'+
			'		<table>'+
			'			<tbody><tr>'+
			(function () {
				var i = 0,str = '';
				for(;i<12;i++){
					if((i+1)%3 === 0 && (i+1)!==12){
						str += '<td><span data-view="month" data-month="'+(i+1)+'">'+(i+1)+'月</span></td></tr><tr>';
					}else{
						str += '<td><span data-view="month" data-month="'+(i+1)+'">'+(i+1)+'月</span></td>';
					}
				}
				return str;
			})()+
			'			</tr></tbody>'+
			'		</table>'+
			'	    </div>'+
			'	</div>'+
			'<div class="datepicker-hour">'+
			'		<div class="datepicker-hour-top">选择时</div>'+
			'		<div class="datepicker-hour-middle">'+
			'		<table>'+
			'			<tbody><tr>'+
			(function () {
				var i = 0,str = '';
				for(;i<24;i++){
					if((i+1)%4 === 0 && (i+1)!==24){
						str += '<td><span data-view="hour" data-hour="'+i+'">'+i+'</span></td></tr><tr>';
					}else{
						str += '<td><span data-view="hour" data-hour="'+i+'">'+i+'</span></td>';
					}
				}
				return str;
			})()+
			'			</tr></tbody>'+
			'		</table>'+
			'	    </div>'+
			'	</div>'+
			'<div class="datepicker-minute">'+
			'		<div class="datepicker-minute-top">选择分</div>'+
			'		<div class="datepicker-minute-middle">'+
			'		<table>'+
			'			<tbody><tr>'+
			(function () {
				var i = 0,str = '';
				for(;i<60;i++){
					if((i+1)%10 === 0 && (i+1)!==60){
						str += '<td><span data-view="minute" data-minute="'+i+'">'+Datepicker.fill(i)+'</span></td></tr><tr>';
					}else{
						str += '<td><span data-view="minute" data-minute="'+i+'">'+Datepicker.fill(i)+'</span></td>';
					}
				}
				return str;
			})()+
			'			</tr></tbody>'+
			'		</table>'+
			'	    </div>'+
			'	</div>'+
			'<div class="datepicker-second">'+
			'		<div class="datepicker-second-top">选择秒</div>'+
			'		<div class="datepicker-second-middle">'+
			'		<table>'+
			'			<tbody><tr>'+
			(function () {
				var i = 0,str = '';
				for(;i<60;i++){
					if((i+1)%10 === 0 && (i+1)!==60){
						str += '<td><span data-view="second" data-second="'+i+'">'+Datepicker.fill(i)+'</span></td></tr><tr>';
					}else{
						str += '<td><span data-view="second" data-second="'+i+'">'+Datepicker.fill(i)+'</span></td>';
					}
				}
				return str;
			})()+
			'			</tr></tbody>'+
			'		</table>'+
			'	    </div>'+
			'	</div>';
		_this.oDiv.innerHTML = domStr;
		document.body.appendChild(_this.oDiv);
	};

	Datepicker.prototype.bindEvent = function () {
		var _this = this;
		var oDiv = _this.oDiv;

		Datepicker.on(document, 'click', function(){
			_this.oDiv && _this.close();
		});

		Datepicker.on(_this.opts.triEle,'click',function (e) {
			Datepicker.stopPropagation(e);
			Datepicker.preventDefault(e);
			if(_this.open === true)return false;
			_this.oDiv && _this.show();
		});

		Datepicker.on(oDiv,'click',function(e){
			Datepicker.preventDefault(e);
			Datepicker.stopPropagation(e);
			var target = Datepicker.getTarget(e);
			var view = Datepicker.data(target,'view');
			var dataYear = 0,dataMonth = 0,dataDay = 0,dataHour = 0,dataMinute = 0,dataSecond = 0;
			switch (target.nodeName.toLowerCase()){
				case 'span':
					switch (view){
						case 'day':
							dataYear = Datepicker.data(target,'year');
							dataMonth = Datepicker.data(target,'month');
							dataDay = Datepicker.data(target,'day');
							_this.showDateObj.setFullYear(dataYear);
							_this.showDateObj.setMonth(dataMonth-1);
							_this.showDateObj.setDate(dataDay);
							_this.returnDate();
							break;
						case 'month':
							dataMonth = Datepicker.data(target,'month');
							_this.showDateObj.setMonth(dataMonth-1);
							_this.render();
							_this.oMonthDiv.style.display = 'none';
							break;
						case 'year':
							dataYear = Datepicker.data(target,'year');
							if(dataYear === 'prev' || dataYear === 'next'){
								if(_this.viewYearStart && (_this.viewYearStart > 101 && dataYear === 'prev')){
									_this.renderYearSelect(dataYear);
								}
								return false;
							}else{
								_this.showDateObj.setFullYear(dataYear);
								_this.render();
								_this.oYearDiv.style.display = 'none';
							}
							break;
						case 'hour':
							dataHour = Datepicker.data(target,'hour');
							_this.showDateObj.setHours(dataHour);
							_this.render();
							_this.oHourDiv.style.display = 'none';
							break;
						case 'minute':
							dataMinute = Datepicker.data(target,'minute');
							_this.showDateObj.setMinutes(dataMinute);
							_this.render();
							_this.oMinuteDiv.style.display = 'none';
							break;
						case 'second':
							dataSecond = Datepicker.data(target,'second');
							_this.showDateObj.setSeconds(dataSecond);
							_this.render();
							_this.oSecondDiv.style.display = 'none';
							break;
					}
					break;
				case 'a':
					switch (target.className){
						case 'datepicker-default-prev-year':
							_this.prevYear();
							break;
						case 'datepicker-default-prev-month':
							_this.prevMonth();
							break;
						case 'datepicker-default-next-month':
							_this.nextMonth();
							break;
						case 'datepicker-default-next-year':
							_this.nextYear();
							break;
						case 'datepicker-default-select-year':
							var tyear = parseInt(target.innerText);
							_this.renderYearSelect(tyear);
							break;
						case 'datepicker-default-select-month':
							var tMonth = parseInt(target.innerText);
							_this.renderMonthSelect(tMonth);
							break;
						case 'datepicker-default-select-hour':
							var thour = parseInt(target.innerText);
							_this.renderHourSelect(thour);
							break;
						case 'datepicker-default-select-minute':
							var tminute = parseInt(target.innerText);
							_this.renderMinuteSelect(tminute);
							break;
						case 'datepicker-default-select-second':
							var tsecond = parseInt(target.innerText);
							_this.renderSecondSelect(tsecond);
							break;
						case 'datepicker-default-opt-confirm':
							_this.returnDate();
							break;
						case 'datepicker-default-opt-clear':
							_this.clear();
							break;
						case 'datepicker-default-opt-today':
							_this.today();
							break;
					}
					break;
			}
		});
	};

	Datepicker.prototype.render = function () {
		var _this = this;
		var opts = _this.opts;
		var oDiv = _this.oDiv;
		var oTable = Datepicker.getByClass(oDiv,'datepicker-default-table')[0];
		var spans = oTable.getElementsByTagName('span');
		var showDateObj = _this.showDateObj;
		var monthDays = [31,28+_this.isLeap(showDateObj.getFullYear()),31,30,31,30,31,31,30,31,30,31];
		var showYear = showDateObj.getFullYear();
		var showMonth = showDateObj.getMonth()+1;
		var showHour = showDateObj.getHours();
		var showMinute = showDateObj.getMinutes();
		var showSecond = showDateObj.getSeconds();
		var showMonthFirstDay = new Date(showYear,showMonth-1,1).getDay();
		var activeDate = showDateObj.getDate();
		for(var i = 0; i<spans.length ; i++){
			var dataYear,dataMonth,dataDay,order = i+1;
			spans[i].className = '';
			if(order < showMonthFirstDay + 1){
				if(showMonth === 1){
					dataYear = showYear-1;
					dataMonth = 12;
				}else{
					dataYear = showYear;
					dataMonth = showMonth-1;
				}
				dataDay = monthDays[dataMonth-1] - showMonthFirstDay + order;
				spans[i].className = 'prev';
			}else if(order > showMonthFirstDay + monthDays[showMonth-1]){
				if(showMonth === 12){
					dataYear = showYear+1;
					dataMonth = 1;
				}else{
					dataYear = showYear;
					dataMonth = showMonth + 1;
				}
				dataDay = order-showMonthFirstDay - monthDays[showMonth-1];
				spans[i].className = 'next';
			}else{
				dataYear = showYear;
				dataMonth = showMonth;
				dataDay = order-showMonthFirstDay;
				if(order - showMonthFirstDay === activeDate){
					spans[i].className = 'today';
				}
			}
			spans[i].innerHTML = dataDay;
			Datepicker.data(spans[i],'view','day');
			Datepicker.data(spans[i],'year',dataYear);
			Datepicker.data(spans[i],'month',dataMonth);
			Datepicker.data(spans[i],'day',dataDay);
		}
		Datepicker.getByClass(oDiv,'datepicker-default-select-year')[0].innerHTML = showYear + '年';
		Datepicker.getByClass(oDiv,'datepicker-default-select-month')[0].innerHTML = showMonth + '月';
		Datepicker.getByClass(oDiv,'datepicker-default-select-hour')[0].innerHTML = Datepicker.fill(showHour);
		Datepicker.getByClass(oDiv,'datepicker-default-select-minute')[0].innerHTML = Datepicker.fill(showMinute);
		Datepicker.getByClass(oDiv,'datepicker-default-select-second')[0].innerHTML = Datepicker.fill(showSecond);
		if(opts.showTime === false){
			oDiv.querySelector('.time').style.display = 'none';
		}
	};

	Datepicker.prototype.renderYearSelect = function (tYear) {
		var _this = this;
		var oDiv = _this.oDiv;
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
				tds[i].innerHTML = '<span data-view="year" data-year="'+(startYear+i-1)+'">'+(startYear+i-1)+'</span>';
				if(tYear === startYear+i-1){
					tds[i].className = 'cur';
				}
			}else if(startYear<=101 && i === 0){
				tds[i].className = 'disabled';
			}
		}
		Datepicker.getByClass(oDiv,'datepicker-month-show-year')[0].innerHTML = startYear + '-' + endYear;
		_this.oYearDiv.style.display = 'block';
	};

	Datepicker.prototype.renderMonthSelect = function (tMonth) {
		var _this = this;
		var oMonthDiv = _this.oMonthDiv;
		var i = 0 , spans = oMonthDiv.getElementsByTagName('span');
		for(;i<spans.length;i++){
			spans[i].className = '';
			if(i+1 === tMonth){
				spans[i].className = 'cur';
			}
		}
		Datepicker.getByClass(oMonthDiv,'datepicker-month-show-month')[0].innerHTML = tMonth + '月';
		oMonthDiv.style.display = 'block';
	};

	Datepicker.prototype.renderHourSelect = function (tHour) {
		var _this = this;
		var oHourDiv = _this.oHourDiv;
		var i = 0 , spans = oHourDiv.getElementsByTagName('span');
		for(;i<spans.length;i++){
			spans[i].className = '';
			if(i === tHour){
				spans[i].className = 'cur';
			}
		}
		oHourDiv.style.display = 'block';
	};

	Datepicker.prototype.renderMinuteSelect = function (tMinute) {
		var _this = this;
		var oMinuteDiv = _this.oMinuteDiv;
		var i = 0 , spans = oMinuteDiv.getElementsByTagName('span');
		for(;i<spans.length;i++){
			spans[i].className = '';
			if(i === tMinute){
				spans[i].className = 'cur';
			}
		}
		oMinuteDiv.style.display = 'block';
	};

	Datepicker.prototype.renderSecondSelect = function (tSecond) {
		var _this = this;
		var oSecondDiv = _this.oSecondDiv;
		var i = 0 , spans = oSecondDiv.getElementsByTagName('span');
		for(;i<spans.length;i++){
			spans[i].className = '';
			if(i === tSecond){
				spans[i].className = 'cur';
			}
		}
		oSecondDiv.style.display = 'block';
	};

	Datepicker.prototype.isLeap = function (tYear) {
		return tYear%4 === 0 ? (tYear%100 === (tYear%400)?1:0?0:1):0;
	};

	Datepicker.prototype.today = function () {
		var _this = this,opts = _this.opts;
		_this.showDateObj = new Date();
		if(opts.showTime === false){
			_this.showDateObj.setHours(0,0,0);
		}
		_this.returnDate();
	};

	Datepicker.prototype.clear = function () {
		var _this = this,opts = _this.opts,triEle = opts.triEle;
		(function (ele) {
			var triTagName = ele.tagName.toLowerCase();
			if(triTagName === 'input'){
				triEle.value = '';
			}else {
				triEle.innerText = '';
			}
		})(triEle);
		_this.close();
	};

	Datepicker.prototype.close = function(){
		var _this = this;
		_this.open = false;
		_this.oDiv.style.display = 'none';
	};

	Datepicker.prototype.show = function () {
		var _this = this;
		_this.open = true;
		_this.oYearDiv.style.display = 'none';
		_this.oMonthDiv.style.display = 'none';
		_this.oHourDiv.style.display = 'none';
		_this.oMinuteDiv.style.display = 'none';
		_this.oSecondDiv.style.display = 'none';
		_this.initData();
		_this.render();
		_this.oDiv.style.display = 'block';
		_this.oDiv.style.left = '-9999px';
		_this.oDiv.style.top = '-9999px';
		_this.getPosition();
	};

	Datepicker.prototype.getPosition = function () {
		var _this = this;
		var triEle = _this.opts.triEle;
		var windowHeight = document.documentElement.scrollHeight;
		var positionObj = (function (element) {
			var rect = element.getBoundingClientRect();
			var top = document.documentElement.clientTop;
			var left= document.documentElement.clientLeft;
			return{
				top    :   rect.top - top,
				bottom :   rect.bottom - top,
				left   :   rect.left - left,
				right  :   rect.right - left
			};
		})(triEle);
		var tHeight = triEle.offsetHeight;
		var oHeight = _this.oDiv.offsetHeight;
		var top = ((positionObj.top + tHeight + oHeight) > windowHeight) && (positionObj.top > oHeight) ?(windowHeight - oHeight - tHeight):(positionObj.top + tHeight);
		_this.oDiv.style.top = top + 'px';
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
		var returnValue = opts.format.replace(/(y+|m+|d+|h+|i+|s+)/g,function(v){
			return ('0'+oTime[v.slice(-1)]).slice(parseInt('-'+v.length));
		});
		opts.tarEle.value = returnValue;
		_this.close();
		typeof opts.change === 'function' && opts.change.call(_this,returnValue);
	};
	Datepicker.prototype.prevMonth = function () {
		var _this = this;
        var showDateObj = _this.showDateObj;
		var showYear = showDateObj.getFullYear();
		var showMonth = showDateObj.getMonth();
		if(showMonth === 0){
			if(showYear<=100)return false;
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
        if(showYear <= 101)return false;
		showDateObj.setFullYear(showYear-1);
		_this.render();
	};
	Datepicker.prototype.nextYear = function () {
		var _this = this;
        var showDateObj = _this.showDateObj;
        var showYear = showDateObj.getFullYear();
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

}(window);
