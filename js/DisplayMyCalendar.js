/*
calObj = {
    dateFieldID1: 'fromDate_hidden',          // id of input date 1 (hidden field)
    dateFieldID2: 'toDate_hidden',            // id of input date 2 (hidden field and optional)
    dateRangeOptions: true,                   // default false, set true to display button of 'This Month', 'Last Month', 'Last 90 Days' (this option is for date range so it also needs dateFieldID1 and dateFieldID2)
    datePlaceHolderID:'displayDateInput',     // id of the fake input box that display date
    numberOfCalDropdown: 2,                   // number of calendar to be displayed, default 1
    dateFormat: 'DDD MMM DD YYYY'             // default dateFormat MM/DD/YYYY
    minDate: true,                            // default minDate false, set true to disable past date
    maxDate: true                             // default maxDate false, set true to disable future date
}
*/
class DisplayMyCalendar {
    constructor(calObj) {
        var that = this;
        var smallScreen = 768;
        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        var hiddenDateField='';

        that.isSmallScreen = (width <= smallScreen) ? true : false;
        that.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        that.weeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        that.dateFormat = (typeof calObj !== 'undefined' && typeof calObj.dateFormat !== 'undefined') ? calObj.dateFormat : 'MM/DD/YYYY';
        that.countClicksOnDayCell = 0;
        that.dateRangeOptions = false;
        that.numberOfCalDropdown = (typeof calObj !== 'undefined' && typeof calObj.numberOfCalDropdown !== 'undefined') ? calObj.numberOfCalDropdown : 1;
        that.datePlaceHolderID = (typeof calObj !== 'undefined' && typeof calObj.datePlaceHolderID !== 'undefined') ? calObj.datePlaceHolderID : 'displayDateInput';
        that.minDate = (typeof calObj !== 'undefined' && typeof calObj.minDate !== 'undefined' && calObj.minDate) ? true : false;
        that.maxDate = (typeof calObj !== 'undefined' && typeof calObj.maxDate !== 'undefined' && calObj.maxDate) ? true : false;

        if(typeof calObj !== 'undefined' && typeof calObj.dateFieldID1 === 'undefined' && typeof calObj.dateFieldID2 === 'undefined') {
			var calDt = 'calDate';
			hiddenDateField = '<input type="hidden" id="'+calDt+'" name="'+calDt+'">';		    
		    that.dateFieldID1 = calDt;	
            that.selectedStartDate = that.getCurrentDate();
		    
		    document.getElementById(that.datePlaceHolderID).insertAdjacentHTML("afterend", hiddenDateField);
		} else if(typeof calObj !== 'undefined' && typeof calObj.dateFieldID1 !== 'undefined' && typeof calObj.dateFieldID2 === 'undefined') {
			that.dateFieldID1 = calObj.dateFieldID1;
			that.selectedStartDate = (document.getElementById(calObj.dateFieldID1).value!="")? document.getElementById(calObj.dateFieldID1).value : that.getCurrentDate();

		} else if(typeof calObj !== 'undefined' && typeof calObj.dateFieldID1 !== 'undefined' && typeof calObj.dateFieldID2 !== 'undefined') {
			that.dateFieldID1 = calObj.dateFieldID1;
			that.dateFieldID2 = calObj.dateFieldID2;
			that.selectedStartDate = (document.getElementById(calObj.dateFieldID1).value!="")? document.getElementById(calObj.dateFieldID1).value : that.getCurrentDate();
			that.selectedEndDate   = (document.getElementById(calObj.dateFieldID2).value!="")? document.getElementById(calObj.dateFieldID2).value : "";
			that.dateRangeOptions = (typeof calObj.dateRangeOptions !== 'undefined' && calObj.dateRangeOptions)? true : false;
        }      
        that.init();
    }
    init() {
        var that = this;
		var calWrapperID = that.datePlaceHolderID+'_calendarWrapper';
	    
	    that.dateFieldID2 = '';
	    that.selectedEndDate = '';
	    //that.today = new Date();
	    that.today= that.getCurrentDate();

		document.getElementById(that.datePlaceHolderID).insertAdjacentHTML("afterend",'<div class="abs-pos hidden calendarDropdown" id="'+calWrapperID+'"></div>');
        document.getElementById(that.datePlaceHolderID).parentNode.setAttribute("style","position:relative;");
        
        that.calendarPlaceHolderID = calWrapperID;
		that.calendarOnClick();
	}
    showCalendar() {
        var that = this;
        var dtForNavigationArr;
        var myMonthIndex;
        var _calWrapper = document.createElement("div");

        var mySelectedStartDate = new Date(that.selectedStartDate);
        
        var mySelectedStartDateArr = that.selectedStartDate.split("/");
        var mySelectedStartMonth = parseInt(mySelectedStartDateArr[0]);
        var mySelectedStartDay = parseInt(mySelectedStartDateArr[1]);
        var mySelectedStartYear = mySelectedStartDateArr[2];
        
        if(typeof that.dateForNavigation==="undefined") {
        	myMonthIndex = parseInt(mySelectedStartMonth)-1;
        	that.dateForNavigation = mySelectedStartDateArr[0]+"/01/"+mySelectedStartDateArr[2];
        	dtForNavigationArr = that.dateForNavigation.split("/");
        	_calWrapper.appendChild(that.getCalendarNav(that.dateForNavigation));
        	
        } else {
        	dtForNavigationArr = that.dateForNavigation.split("/");
        	myMonthIndex = parseInt(dtForNavigationArr[0])-1;
        	_calWrapper.appendChild(that.getCalendarNav(that.dateForNavigation));
        }

        var mySelectedEndDate;
        
        var mySelectedEndDateArr;
        var mySelectedEndMonth;
        var mySelectedEndDay;
        var mySelectedEndYear; 
        
        if(that.selectedEndDate!="") {
            mySelectedEndDate = new Date(that.selectedEndDate);
            
            mySelectedEndDateArr = that.selectedEndDate.split("/");
            mySelectedEndMonth = parseInt(mySelectedEndDateArr[0]);
            mySelectedEndDay = parseInt(mySelectedEndDateArr[1]);
            mySelectedEndYear = mySelectedEndDateArr[2];
        }
              
        var myYear = dtForNavigationArr[2];
        for(var k=0; k < that.numberOfCalDropdown; k++) {         
        	var myMonth = that.addLeadingZero(mySelectedStartDateArr[0]);

            if(myMonthIndex>11) {
                myMonth = 1;
                myMonthIndex = 0;
                myYear = parseInt(myYear)+1;
            } else {
                myMonth = that.addLeadingZero(myMonthIndex+1);
            }

            var totalDaysInMonth = that.getDaysInMonth(myMonthIndex, myYear);
            var firstDay = (new Date(myYear, myMonthIndex)).getDay();
            
            var firstCal = (k==0)? ' firstCal ' : '';
            var lastCal = (k==that.numberOfCalDropdown-1)? ' lastCal ' : '';
            
            var thisCalWrapper = document.createElement("div");
            var calendarWrapClass = (that.isSmallScreen)? "calendarEle calendarWrap_small" : "calendarEle calendarWrap"+firstCal+lastCal;
            thisCalWrapper.setAttribute("class", calendarWrapClass);

            var monthAndYear = document.createElement("div");
            monthAndYear.setAttribute("class","calendar-monthYearRow borderBottom-platinum borderTop-platinum center semibold")
            var monthAndYearText = document.createTextNode(that.months[myMonthIndex] + " " + myYear);
            monthAndYear.appendChild(monthAndYearText);
            
            thisCalWrapper.appendChild(monthAndYear);
            thisCalWrapper.appendChild(that.getCalendarWeekDays());
            
            var divWrapper = document.createElement("div");
            divWrapper.setAttribute("style","text-align:center;margin:0 auto;");

            // creating all cells
            var ctdate = 1;
            for (var i = 0; i < 6; i++) {
                var emptyRow = false;
                var row = document.createElement("div");
                row.setAttribute("style", "display:flex;justify-content:center;");
                //creating individual cells, filing them up with data.
                for (var j = 0; j < 7; j++) {
                    if ((i === 0 && j < firstDay) || (ctdate > totalDaysInMonth)) {
                        var cell = document.createElement("div");
                        cell.className = 'calendar-dayCell-empty';
                        var cellText = document.createTextNode("");
                        cell.appendChild(cellText);
                        row.appendChild(cell);
                    } else {
                        var cell = document.createElement("div");                        
                        
                        var thisDay = that.addLeadingZero(ctdate);
                        var thisDt = myMonth+'/'+thisDay+'/'+myYear;
                        var thisDate = new Date(thisDt);
                        
                        cell.className = (that.isPastDate(thisDate) || that.isFutureDate(thisDate))? 'calendar-dayCell-disabled' : 'calendar-dayCell';
                                                
                        if((mySelectedStartMonth==myMonth && mySelectedStartDay==ctdate && mySelectedStartYear==myYear) || 
                            (mySelectedEndMonth==myMonth && mySelectedEndDay==ctdate && mySelectedEndYear==myYear)) {
                            cell.className += ' dtRangeSelected ';
                        } else if(thisDate>mySelectedStartDate && thisDate<mySelectedEndDate) {
                            cell.className += ' dtRangeSelected2 ';
                        }
                
                        cell.setAttribute("data-dt",thisDt);
                        var cellText = document.createTextNode(ctdate);
                        cell.appendChild(cellText);
                        row.appendChild(cell);
                        ctdate++;
                        
                        if(i==5 && j==0) emptyRow = true;
                    }
                }  
                if(i == 5 && ctdate > totalDaysInMonth && !emptyRow) continue;
                divWrapper.appendChild(row);
            }
            myMonthIndex++;

            thisCalWrapper.appendChild(divWrapper);
            _calWrapper.appendChild(thisCalWrapper);
        }        
        if(that.dateRangeOptions) _calWrapper.appendChild(that.getCalendarDateRangeOptions());
        return _calWrapper;
    }
    getDaysInMonth(month, year) {
        return 32 - new Date(year, month, 32).getDate();
    }
    isPastDate(dt) {
        var that = this;
    	if(that.minDate && new Date(that.today) > new Date(dt)) return true;
    	else return false;
    }
    isFutureDate(dt) {
        var that = this;
    	if(that.maxDate && new Date(that.today) < new Date(dt)) return true;
    	else return false;
    }
    getCalendarWeekDays() {
        var that = this;
        var calWeekDaysWrapper = document.createElement("div");
        calWeekDaysWrapper.setAttribute("class", "borderBottom-platinum calendar-weekCellWrap");
        var weekdays = '';
        for(var i=0; i<that.weeks.length; i++) {
        	weekdays += '<div class="calendar-weekCell">'+that.weeks[i]+'</div>';
        }
        calWeekDaysWrapper.innerHTML = weekdays;
        return calWeekDaysWrapper;
    }
    getCalendarNav(fromDt) {
        var that = this;
        var myNumOfCalDropdown = that.numberOfCalDropdown-1;
        var dt = new Date(fromDt);
        var endDt = new Date(dt.setMonth(dt.getMonth() + myNumOfCalDropdown));
        var endDt_month = endDt.getMonth()+1;
        var endDt_yr = endDt.getFullYear();
        var toDt = endDt_month+"/01/"+endDt_yr;
        var calNavWrapper = document.createElement("div");      
        
        var navArrow_left = (that.isPastDate(fromDt))? ' navArrow_disabled ' : ' navArrow ';
        var navArrow_right = (that.isFutureDate(toDt))? ' navArrow_disabled ' : ' navArrow ';
        
        calNavWrapper.setAttribute("id", "calendarNavWrapper");
        calNavWrapper.innerHTML = ('<div class="rel-pos calendarNav">' +
            '<div class="abs-pos '+navArrow_left+' calendarNav_left" data-date="'+fromDt+'" data-direction="left" style="font-weight:bold;">&#706;</div>' +
            '<div class="abs-pos '+navArrow_right+' calendarNav_right" data-date="'+toDt+'" data-direction="right" style="font-weight:bold;">&#707;</div>' +
        '</div>');
        return calNavWrapper;
    }
    getCalendarDateRangeOptions() {
        var that = this;
    	var currentDt = new Date();
    	/*last 30 days from current date******
    	var dtLast30Day = currentDt.setDate(currentDt.getDate() - 30);
    	var dtLast30DayFormatted = formatDate(dtLast30Day);
    	*/
    	var dateRangeCurrentDateFormatted = that.formatDate(currentDt);
    	var dateRangeLast90Day = currentDt.setDate(currentDt.getDate() - 90);
    	var dateRangeLast90DayFormatted = that.formatDate(dateRangeLast90Day);
    	
    	var dateArr = dateRangeCurrentDateFormatted.split("/");

    	var lastMonth,year = '';
    	if(dateArr[0]=='01') {
    		lastMonth = '12';
    		year = dateArr[2]-1;
    	} else {
    		lastMonth = dateArr[0]-1;
    		year = dateArr[2];
    	}

    	var monthIndex = lastMonth-1;
    	var totalDaysInMonth = that.getDaysInMonth(monthIndex, year);
    	
    	lastMonth = that.addLeadingZero(lastMonth); 	
    	var lastMonthFromDate = lastMonth+"/01/"+year;
    	var lastMonthToDate = lastMonth+"/"+totalDaysInMonth+"/"+year;
    	
    	var thisMonthFromDate = dateArr[0]+"/01/"+dateArr[2];
    	var thisMonthToDate = that.getCurrentDate();
    	var small = (that.isSmallScreen)? " small " : "";
    	
    	var dateRangeOptions = document.createElement("div");
    	dateRangeOptions.setAttribute("id", "calendarDateRangeOptions");

    	dateRangeOptions.innerHTML = ('<span><button class="btn bg-secondary mar-bottom-0 calDateOptionsButton '+small+'" type="button" data-from="'+thisMonthFromDate+'" data-to="'+thisMonthToDate+'">This Month</button></span>' +
            '<span><button class="btn bg-secondary mar-bottom-0 calDateOptionsButton '+small+'" type="button" data-from="'+lastMonthFromDate+'" data-to="'+lastMonthToDate+'">Last Month</button></span>' +
            '<span><button class="btn bg-secondary mar-bottom-0 calDateOptionsButton '+small+'" type="button" data-from="'+dateRangeLast90DayFormatted+'" data-to="'+thisMonthToDate+'">Last 90 Days</button></span>');
    	
    	return dateRangeOptions;
    }
    formatDateForDisplay(dt) {
        var that = this;
    	var dtArr = dt.split('/');

		if(that.dateFormat.toUpperCase()=='YYYY-MM-DD') {           
            return dtArr[2]+"-"+dtArr[0]+"-"+dtArr[1];
            
        } else if(that.dateFormat.toUpperCase()=='MMM DD YYYY') {
        	var d = new Date(dt);
        	var myMonth = that.months[d.getMonth()];
            return myMonth + " " +  dtArr[1] +  " " + dtArr[2];
            
        } else if(that.dateFormat.toUpperCase()=='DD-MMM-YYYY') {
        	var d = new Date(dt);
        	var myMonth = that.months[d.getMonth()];
            return dtArr[1] +  "-" + myMonth + "-" + dtArr[2];
            
        } else if(that.dateFormat.toUpperCase()=='DDD MMM DD YYYY') {
        	var d = new Date(dt);
        	var myMonth = that.months[d.getMonth()];
        	var myDay = that.weeks[d.getDay()];
            return myDay + ", " + myMonth + " " + dtArr[1] + ", " + dtArr[2];
            
        } else if(that.dateFormat.toUpperCase()=='MM/DD/YYYY') {
            return dtArr[0]+"/"+dtArr[1]+"/"+dtArr[2];   
            
        } else if(that.dateFormat.toUpperCase()=='DD/MM/YYYY') {
        	return dtArr[1]+"/"+dtArr[0]+"/"+dtArr[2];
        }
    }
    formatDate(dt) {
        var that = this;
    	var d = new Date(dt);
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var year = d.getFullYear();

        month = that.addLeadingZero(month);
        day = that.addLeadingZero(day);

        return [month,day,year].join('/'); 
    }
    addLeadingZero(num) {
    	var myNum = parseInt(num);
    	return (myNum<10)? '0'+myNum : myNum;
    }
    getCurrentDate() {
        var dt = new Date();
        var mth = dt.getMonth()+1;
        var yr = dt.getFullYear();
        var dy = dt.getDate();
        return mth+"/"+dy+"/"+yr;
    }
    getGoLeftDateSet(dt) {
        var that = this;
        var d = new Date(dt);
        var startDt = new Date(d.setMonth(d.getMonth() - that.numberOfCalDropdown));
        var startDt_month = startDt.getMonth()+1;
        var startDt_yr = startDt.getFullYear();
        return startDt_month+"/01/"+startDt_yr;
    }
    getGoRightDateSet(dt) {
	    var d = new Date(dt);
	    var endDt = new Date(d.setMonth(d.getMonth() + 1));
	    var endDt_month = endDt.getMonth()+1;
	    var endDt_yr = endDt.getFullYear();
	    return endDt_month+"/01/"+endDt_yr;
    }
    setDateAndHideCalendar(fromDt,toDt) {
        var that = this;
    	if(typeof fromDt !== 'undefined') {
    		var showToDt = '';
    		var showFromDt = that.formatDateForDisplay(fromDt);
    		if(typeof toDt !== 'undefined') {
        		showToDt = " to " + that.formatDateForDisplay(toDt);
        		document.getElementById(that.dateFieldID2).value = toDt;
        	}
    		document.getElementById(that.datePlaceHolderID).innerHTML = showFromDt + showToDt;
    		document.getElementById(that.dateFieldID1).value = fromDt;
    	}	
    	document.getElementById(that.datePlaceHolderID).classList.remove("focus");
		document.getElementById(that.calendarPlaceHolderID).classList.add("hidden");
    }
    isInViewport(elem) {
    	var distance = elem.getBoundingClientRect();
    	return (
    		distance.top >= 0 &&
    		distance.left >= 0 &&
    		distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    		distance.right <= (window.innerWidth || document.documentElement.clientWidth)
    	);
    }
    calendarOnClick() {
        var that = this;
    	document.addEventListener("click", function(e) {
            var eTarget = e.target;
    		if(eTarget.id==that.datePlaceHolderID) {
    			var calPlaceHolder = document.getElementById(that.calendarPlaceHolderID);
    			if(calPlaceHolder.classList.contains("hidden")) {
                    var thisVal = document.getElementById(that.dateFieldID1).value;
                    var thatVal = (that.dateFieldID2!="")? document.getElementById(that.dateFieldID2).value : "";

                    if(thisVal.trim()!="") that.selectedStartDate = thisVal;  
                    if(thatVal.trim()!="") that.selectedEndDate = thatVal;
                    
                    eTarget.classList.add("focus");

                    calPlaceHolder.classList.remove("hidden");
                    calPlaceHolder.innerHTML = that.showCalendar().innerHTML;
                    
                    if(!that.isInViewport(calPlaceHolder)) {
                    	calPlaceHolder.scrollIntoView({block: 'center',behavior: 'smooth'});
                    }
        		}
    		} else if(eTarget.classList.contains("navArrow")) {
    			var dataDt = eTarget.dataset.dt;
	            var dt = eTarget.dataset.date;
	            var dir = eTarget.dataset.direction;
	            var thisVal = document.getElementById(that.dateFieldID1).value;
	            var thatVal = (that.dateFieldID2!='')? document.getElementById(that.dateFieldID2).value : '';
	            
	            if(thisVal.trim()!='') that.selectedStartDate = thisVal;
	            if(thatVal.trim()!='') that.selectedEndDate = thatVal;

	            that.dateForNavigation = (dir=='left')? that.getGoLeftDateSet(dt) : that.getGoRightDateSet(dt);           
	            document.getElementById(that.calendarPlaceHolderID).innerHTML = that.showCalendar().innerHTML; 
    		} 
    		else if(!eTarget.closest("#"+that.calendarPlaceHolderID)) {
    			that.setDateAndHideCalendar();
            } 
    		else if(eTarget.classList.contains("calDateOptionsButton")) {
				var fromDt = eTarget.dataset.from;
				var toDt = eTarget.dataset.to; 			
    			that.setDateAndHideCalendar(fromDt, toDt);
    		}
    		else if(eTarget.classList.contains("calendar-dayCell")) {
    			if(that.dateFieldID2=='') {
    				var dataDt = eTarget.dataset.dt;
	    			that.setDateAndHideCalendar(dataDt);
    			} else {
    				var thisFromDt = '';
    				var thisToDt = '';
    				that.countClicksOnDayCell++;
    				if(that.countClicksOnDayCell<2) {
    					document.querySelectorAll('.calendar-dayCell').forEach(function(ele) {
    						ele.classList.remove("dtRangeSelected");
    						ele.classList.remove("dtRangeSelected2");
    					}); 					
    					eTarget.classList.add("dtRangeSelected");
    					sessionStorage.setItem('dateRange_fromDt', eTarget.dataset.dt);
    					
    				} else {			
    					thisFromDt = sessionStorage.getItem('dateRange_fromDt');
    					thisToDt = eTarget.dataset.dt;
    					var validDt = true;
    					
    					if(new Date(thisFromDt) >= new Date(thisToDt)) {
    						that.countClicksOnDayCell=1;
    						validDt = false;	

        					document.querySelectorAll('.calendar-dayCell').forEach(function(ele) {
        						ele.classList.remove("dtRangeSelected");
        						ele.classList.remove("dtRangeSelected2");
        					}); 					
        					eTarget.classList.add("dtRangeSelected");
        					sessionStorage.setItem('dateRange_fromDt', eTarget.dataset.dt);
    					} else {
    						document.querySelectorAll('.calendar-dayCell').forEach(function(ele) {
        						ele.classList.remove("dtRangeSelected2");
        						
        						var thisDt = ele.dataset.dt;
    							if(new Date(thisDt) > new Date(thisFromDt)) {
    								ele.classList.add("dtRangeSelected2");
    							}	
    							if(ele.dataset.dt==thisToDt) {
    								ele.classList.remove("dtRangeSelected2");
    								ele.classList.add("dtRangeSelected");
    								return false;
    							}
        					}); 
    						
    					}	 
    					//startDt & endDt already set, reset that.countClicksOnDayCell to 0
    					if(validDt) {
    						that.countClicksOnDayCell=0;
    						sessionStorage.removeItem('dateRange_fromDt');
    						that.setDateAndHideCalendar(thisFromDt, thisToDt);
    					}
    				}
    			}	
    		}

        });
    }
}