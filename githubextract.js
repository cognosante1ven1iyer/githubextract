//Authored by Ven Iyer on 6/22 for VA/COMS/Cognosante
//Usage: $ node githubextract
//Extracts project information from GitHub for the user

//Setting up the environment
var fs = require('fs');
var await = require('await');
const util = require('util');
const jq = require('node-jq');
var fs = require('fs');
const homedir = require('os').homedir(); 
const eol = require('os').EOL; 

//Setting up the program
var configInfo;
var usernameS;
var passwordS;
var tokenS;
var projectIDToExtract;
//Config info is at ~/.gitHubExtract.config
var data = fs.readFileSync(homedir + '/.gitHubExtract.config','utf8')
var fileAsString = data.toString();
configInfo = fileAsString.split("\n");
usernameS=configInfo[0].split("=")[1];
passwordS=configInfo[1].split("=")[1];
tokenS=configInfo[2].split("=")[1];
projectIDToExtract=configInfo[3].split("=")[1];
const Octokit = require('@octokit/rest')

const octokit = new Octokit({
 auth: `token ${tokenS}`
})

// Register new endpoint in octokit (issues/{id} endpoints aren't implemented.)
    octokit.registerEndpoints({
        issues: {
          getIssue: {
            method: 'GET',
            url: '/repos/department-of-veterans-affairs/azure-management/issues/{issue_id}',
            params: {
              issue_id: {
                required: true,
                type: 'string'
              }
            }
          }
        }
      })

console.log("projectID to extract is" +  projectIDToExtract)
//This function gets list of projects for the user in blocking form

//This function gets list of projects for the user in blocking form
const getProjects = async (usernameS) => {
	try {
	    const result = await octokit.projects.listForUser({
	username: usernameS})
	    if(result.status === 200) {
	        return {
	            status: true, 
	            data: result.data
	        }
	    } else {
	        return {
	            status: false,
	            data: data
	        }
	    }
	} catch (error) {
	    return {
	        status: false,
	        data: data
	    }
	}  
}

//This function gets a project with its id
const getProjectWithID = async (projectID) => {
	try {
	    const result = await octokit.projects.get({
	project_id: projectID})
	    if(result.status === 200) {
	        return {
	            status: true, 
	            data: result.data
	        }
	    } else {
	        return {
	            status: false,
	            data: data
	        }
	    }
	} catch (error) {
	    return {
	        status: false,
	        data: data
	    }
	}  
}


//get issue with id
const getIssueWithID = async (issueID) => {
	try {
	    const result = await octokit.issues.getIssue({
	issue_id: issueID})
	    if(result.status === 200) {
	        return {
	            status: true, 
	            data: result.data
	        }
	    } else {
	        return {
	            status: false,
	            data: data
	        }
	    }
	} catch (error) {
	    return {
	        status: false,
	        data: data
	    }
	}  
}

//This function gets all the columns in a project
const getColumnsInProject = async (projectID) => {
	try {
	    const result = await octokit.projects.listColumns({
	project_id: projectID})
	    if(result.status === 200) {
	        return {
	            status: true, 
	            data: result.data
	        }
	    } else {
	        return {
	            status: false,
	            data: data
	        }
	    }
	} catch (error) {
	    return {
	        status: false,
	        data: data
	    }
	}  
}

//This function gets all the cards in a column
const getCardsInColumn = async (columnID) => {
	try {
	    const result = await octokit.projects.listCards({
	column_id: columnID})
	    if(result.status === 200) {
	        return {
	            status: true, 
	            data: result.data
	        }
	    } else {
	        return {
	            status: false,
	            data: data
	        }
	    }
	} catch (error) {
	    return {
	        status: false,
	        data: data
	    }
	}  
}

//This function gets all the repos for a user
const getReposForUser = async () => {
	try {
	    const result = await octokit.repos.list()
	    if(result.status === 200) {
	        return {
	            status: true, 
	            data: result.data
	        }
	    } else {
	        return {
	            status: false,
	            data: data
	        }
	    }
	} catch (error) {
	    return {
	        status: false,
	        data: data
	    }
	}  
}

//This function gets all the repos for a user
const getIssuesInRepo = async (owner, repoName) => {
	try {
	    const result = await octokit.issues.listForRepo({owner: usernameS,repo: repoName})
	    if(result.status === 200) {
	    	
	        return {
	            status: true, 
	            data: result.data
	        }
	    } else {
	        return {
	            status: false,
	            data: data
	        }
	    }
	} catch (error) {
	    return {
	        status: false,
	        data: data
	    }
	}  
}

//Main of the program
const start = async function() {
  //First get the projects for the user
  console.log("Project to extract ---  " + projectIDToExtract);
  const result = await getProjectWithID(projectIDToExtract);
  var project = util.inspect(result.data, {depth: null});

  //Setup the file with csv file column names
  var writeData = 'Type' + ',' + 'ID' + ',' + 'Name' + ',' + 'columnID' + ',' + 'columnName' + ',' + 'ContentType' + ',' + 'ContentID' + ',' + 'Content'; 	 
  fs.appendFile('project_extract.csv', writeData + eol, function (err) {
					if (err) {
					// append failed
					} else {
					// done
					}
				})

  		var i = 0;
  	  //For the retrieved project do this
	  var projectName = await jq.run('.name', result.data, { input: 'json' });
	  var projectID = await jq.run('.id', result.data, { input: 'json' });
	  var projectState = await jq.run('.state', result.data, { input: 'json' });
	  
	  //console.log("Found" + projectName + projectID + projectState)

      //Prepare to get columns in a project
	  const getColumnsInProjectResult = await getColumnsInProject(projectID);
	  var listOfColumns = util.inspect(getColumnsInProjectResult.data, {depth: null});
	  //console.log(listOfColumns);

	  for(var j = 0; j < getColumnsInProjectResult.data.length; j++) {
	  	  //For each column do this
		  var columnName = await jq.run('.['+j+'].name', getColumnsInProjectResult.data, { input: 'json' });
		  var columnID = await jq.run('.['+j+'].id', getColumnsInProjectResult.data, { input: 'json' });
		  
		  //console.log("Found" + columnName + columnID)

		   //Prepare to get the cards in the project
		   const getCardsInColumnResult = await getCardsInColumn(columnID);
		   var listOfCards = util.inspect(getCardsInColumnResult.data, {depth: null});
		   //console.log(listOfCards);

		  for(var k = 0; k < getCardsInColumnResult.data.length; k++) {
		  	  //For each card in the column do this
			  var cardName = await jq.run('.['+k+'].note', getCardsInColumnResult.data, { input: 'json' });
			  var cardID = await jq.run('.['+k+'].id', getCardsInColumnResult.data, { input: 'json' });
			  if(cardName != 'null' )
			  {
			  	//Write the card data to the csv file
			  	writeData = 'Project' + ',' + projectID + ',' + projectName + ',' + columnID + ',' + columnName + ',' + 'Note' + ',' + cardID + ',' + cardName;
			  }
			  else
			  {
			  	var contentURL = await jq.run('.['+k+'].content_url', getCardsInColumnResult.data, { input: 'json' });
			  	var issueID  = contentURL.split("/")[contentURL.split("/").length-1];
			  	//console.log("getting issue with " + issueID);
			  	const resultIssue = await getIssueWithID(issueID);
				var issue = util.inspect(resultIssue.data, {depth: null});
				//console.log("Found issue ************" + issue);

				var issueTitle = '';
				var issueBody = '';
				issueTitle = resultIssue.data.title;
				issueBody = resultIssue.data.body.replace(/\r?\n|\r/g, " ");
				issueBody = issueBody.replace(/,/g, ';');
				issueID = issueID.replace('\"', "");
				//issueTitle = await jq.run('.[0].title', resultIssue.data, { input: 'json' });
			    //issueBody = await jq.run('.[0].body', resultIssue.data, { input: 'json' });
			    
			  	//Write the card data to the csv file
			  	writeData = 'Project' + ',' + projectID + ',' + projectName + ',' + columnID + ',' + columnName + ',' + 'Incident' + ',' + issueID + ',' + issueTitle + '-' + issueBody;
			  
			  }
			  console.log("Writing..." + writeData)
				fs.appendFile('project_extract.csv', writeData + eol, function (err) {
					if (err) {
					// append failed
					} else {
					// done
					}
				})
		  }

	  }


	//Get started on extract of repos and issues



}
//Starting the program here
start();
    