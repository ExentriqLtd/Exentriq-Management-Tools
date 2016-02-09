Eml = {

	parse: function(statement){
		try{
		    
		    var result ={};
		    var regexpSpace = /\(([^\"^\(^\)]+)\)/g
		    var regexpUser = /(?:^|\s)@([^"^\s]+)\b/g;
		    var regexpUserDoubleQuote = /(?:^|\s)@\"([^\"]+)\"/g;
		    var regexpBoardDoubleQuote = /(?:^|\s)(#)\"([^\"]+)"/g;
		    var regexpBoard = /(?:^|\s)(#)([^"^\s]+)(?:$|\s)/g;
		    var regexpMilestone = /(?:^|\s)!([^\s]+)(?:$|\s)/g;
		    var regexpEta = /(?:^|\s)ETA([^\s]+)(?:$|\s)/g;
		    var regexpEffort = /(?:^|\s)~([^\s]+)(?:$|\s)/g;
		    var regexpProgress = /(?:^|\s)%([^\s]+)(?:$|\s)/g;
		    var regexpPriority = /(?:^|\s)\[([0-9]+)\](?:$|\s)/g;
		    var regexpBudget = /(?:^|\s)\$([^\s]+)(?:$|\s)/g;
		    var regexpCard = /(?:^|\s)&([^\s]+)(?:$|\s)/g;
		    var regexDays = /\b([0-9]+)(d|D|day|days|DAY|DAYS|Day|Days)\b/g;
			var regexHours = /\b([0-9]+)(h|H|hour|hours|HOUR|HOURS|Hour|Hours)\b/g;
			var regexMinutes = /\b([0-9]+)(m|M|minute|minutes|MINUTE|MINUTES|Minute|Minutes)\b/g;
			
			result.statement = statement;
			
			//set space
			var regexpSpaceResults; 
			while ((regexpSpaceResults = regexpSpace.exec(statement)) !== null) {
				result.cmpName = regexpSpaceResults[1].trim();
		    }
			statement = statement.replace("("+result.cmpName+")", "").trim();
			var clean = statement;
		    
			//set users
		    var regexpUserResults; 
		    var regexpUserDoubleQuoteResults; 
		    result.users = [];
		    while ((regexpUserResults = regexpUser.exec(statement)) !== null) {
		        result.users.push(regexpUserResults[1].trim());
		        clean = clean.replace("@"+regexpUserResults[1], "").trim();
		    }
		    while ((regexpUserDoubleQuoteResults = regexpUserDoubleQuote.exec(statement)) !== null) {
		        result.users.push(regexpUserDoubleQuoteResults[1].trim());
		        clean = clean.replace("@\""+regexpUserDoubleQuoteResults[1]+"\"", "").trim();
		    }
		    
		    // set project
			var regexpBoardDoubleQuoteResult = regexpBoardDoubleQuote.exec(statement);
			if (regexpBoardDoubleQuoteResult !== null) {
				result.project = regexpBoardDoubleQuoteResult[2].trim();
//				result.cmpName=regexpBoardDoubleQuoteResult[3];
//				if(regexpBoardDoubleQuoteResult[3] != null || typeof regexpBoardDoubleQuoteResult[3] != 'undefined'){
//					clean = clean.replace("(" + regexpBoardDoubleQuoteResult[3] + ")", "");
//				}
				clean = clean.replace(regexpBoardDoubleQuoteResult[1]+"\""+regexpBoardDoubleQuoteResult[2]+"\"", "").trim();
			}
			else{
				var regexpBoardResult = regexpBoard.exec(statement);
				if (regexpBoardResult !== null) {
					result.project = regexpBoardResult[2].trim();
					clean = clean.replace(regexpBoardResult[1]+regexpBoardResult[2], "").trim();
				}
			}
		    
			//set milestone
		    var regexpMilestoneResult = regexpMilestone.exec(statement);
		    if(regexpMilestoneResult!==null){
		        result.milestone=regexpMilestoneResult[1];
		        clean = clean.replace("!"+regexpMilestoneResult[1], "").trim();
		    }
		    //set eta
		    var regexpEtaResult = regexpEta.exec(statement);
		    if(regexpEtaResult!==null){
		        result.eta=regexpEtaResult[1];
		        clean = clean.replace("ETA"+regexpEtaResult[1], "").trim();
		    }
		    //set effort
		    var regexpEffortResult = regexpEffort.exec(statement);
		    if(regexpEffortResult!==null){
		        result.effort=regexpEffortResult[1];
		        clean = clean.replace("~"+regexpEffortResult[1], "").trim();
		    }
		    //set progress
		    var regexpProgressResult = regexpProgress.exec(statement);
		    if(regexpProgressResult!==null){
		        result.progress=regexpProgressResult[1];
		        clean = clean.replace("%"+regexpProgressResult[1], "").trim();
		    }
		    //set priority
		    var regexpPriorityResult = regexpPriority.exec(statement);
		    if(regexpPriorityResult!==null){
		        result.points=Number(regexpPriorityResult[1]);
		        clean = clean.replace("["+regexpPriorityResult[1]+"]", "").trim();
		    }
		    //set budjet
		    var regexpBudgetResult = regexpBudget.exec(statement);
		    if(regexpBudgetResult!==null){
		        result.budget=regexpBudgetResult[1];
		        clean = clean.replace("$"+regexpBudgetResult[1], "").trim();
		    }
		    //set card
		    var regexpCardResult = regexpCard.exec(statement);
		    if(regexpCardResult!==null){
		        result.card=regexpCardResult[1];
		        clean = clean.replace("&"+regexpCardResult[1], "").trim();
		    }
		    
		    // set days
			var regexDaysResult = regexDays.exec(statement);
			if (regexDaysResult !== null) {
				result.days = Number(regexDaysResult[1]);
				clean = clean.replace(regexDaysResult[1]+regexDaysResult[2], "").trim();
			} else {
				result.days = 0;
			}

			// set hours
			var regexHoursResult = regexHours.exec(statement);
			if (regexHoursResult !== null) {
				result.hours = Number(regexHoursResult[1]);
				clean = clean.replace(regexHoursResult[1]+regexHoursResult[2], "").trim();
			} else {
				result.hours = 0;
			}

			// set minutes
			var regexMinutesResult = regexMinutes.exec(statement);
			if (regexMinutesResult !== null) {
				result.minutes = Number(regexMinutesResult[1]);
				clean = clean.replace(regexMinutesResult[1]+regexMinutesResult[2], "").trim();
			} else {
				result.minutes = 0;
			}
			
		    result.seconds = result.days*28800 + result.hours*3600 + result.minutes*60;
			
			result.clean=clean.trim();
		    
		    return result;
		}
		catch(err){
			console.log(err);
		    return null;
		}
		return msg;
	},
	
	format : function(eml, field){
		//WORKS ONLY WITH USERS...
		var result = "";
		
		var usersStmt = "";
		var users = eml.users;
		users.forEach(function(username) {
			usersStmt += " @\""+username+"\" ";
		});
		result += usersStmt;
		
		if(field!=null && field=='users'){
			return usersStmt;
		}
		
		var projectStmt = (typeof eml.project != 'undefined' && eml.project!=null && eml.project!='')? " #\""+eml.project+"\" " : null;	
		result += projectStmt;
		if(field!=null && field=='project'){
			return projectStmt;
		}
		
		return result;
	}


}