var currentNotice = "";
var k=0;
var tableSize = 10;

var PRN;

var poidArr = new Array();

var bAscending = true;

var colSort = "deadlineDate";

var selectedRow;

var noticeSize;
var tableCount; 

var currentHolderName;
var leftsize;

var bAnyDate;
var bAutomatedAction;
var bContactAction;
var bCreatedBetween;
var bDeadlineBetween;
var bDocAction;
var bDocVersion;
var dEndDate;
var bPostRoom;
var bSecurity;
var dStartDate;
var bWorkflow;
var proxy;

function init()
{
	initTable();

	commStart();

	API_getCurrentNoticeHolder_request(getCurrentNoticeHolder_Response, standardError);
}

function initTable()
{
	var tBody = tblNotices.tBodies[0];

	var row, cell;
	for (var i = 0; i < tableSize; i++)
	{
		row = document.createElement("tr");

		for (var j = 0; j < 6; j++)
			{
			cell = document.createElement("td");
			cell.innerHTML = "&nbsp;";
			cell.height = 16;
			
			if (j==0 | j==2)
				cell.setAttribute("align", "center");
			
			row.appendChild(cell);
			}

		tBody.appendChild(row);
	}	
}

function getCurrentNoticeHolder_Response(e)
{
	commEnd();

	currentHolderName = e;

	updateUserDept();
}

function updateUserDept()
{
	commStart();

	if (optUser.checked)
		{
		API_getAccessibleUsers_request(getAccessibleUsersOrDepts_Response, standardError);
		}
	else
		{
		API_getAccessibleDepartments_request(getAccessibleUsersOrDepts_Response, standardError);
		}
}

function getAccessibleUsersOrDepts_Response(sa)
{
	commEnd();

	while(cbxUserDept.options.length > 0) 
		{
		cbxUserDept.options.remove(0);
		}


	for (var i = 0; i < sa.length; i++)
		{
		cbxUserDept.options[i] = new Option(sa[i], sa[i], true, sa[i] == currentHolderName);
		}
	
	getInitNotices();
}

function getInitNotices()
{	
	initPageVarible();

	currentHolderName = getCbxSelectedValue(cbxUserDept);
	
	commStart();

	if (optUser.checked)
	{
		API_setNoticeHolderForUser_request(setNoticeHolderForUserDept_Response, standardError, currentHolderName);
	}
	else
	{
		API_setNoticeHolderForDept_request(setNoticeHolderForUserDept_Response, standardError, currentHolderName);
	}
}

function setNoticeHolderForUserDept_Response(e)
{
	commEnd();

	if(document.getElementById("rd1").checked)
	{
		document.getElementById("txtStartDate").value = "";
		document.getElementById("txtEndDate").value = "";
	}
	
	if( (document.getElementById("rd2").checked) && (document.getElementById("txtStartDate").value=="" || document.getElementById("txtEndDate").value==""))
	{
		alert("please enter the creation date and end date!")
	}

	if ( Date.parse(document.getElementById("txtEndDate").value) < Date.parse(document.getElementById("txtStartDate").value)) 
	{
		document.getElementById("txtStartDate").value = "";
		document.getElementById("txtEndDate").value = "";
		alert("please reenter for the deadline date");
	}

	if (document.getElementById("txtStartDate").value!="" || document.getElementById("txtStartDate").value!="")
	{
		checkDate();
	}
		
	proxy = new Array();

	proxy.anyDate = document.getElementById("rd1").checked;
	proxy.createdBetween = document.getElementById("rd2").checked;
	proxy.deadlineBetween = document.getElementById("rd3").checked;
	
	proxy.automatedActions = document.getElementById("ckAutoAction").checked;
	proxy.contactActions = document.getElementById("ckContAction").checked;	
	proxy.docActions = document.getElementById("ckDocAction").checked;
	proxy.docVersion = document.getElementById("ckDocVersion").checked;	
	proxy.postRoom = document.getElementById("ckPostRoom").checked;
	proxy.security = document.getElementById("ckSecurity").checked;
	proxy.workFlow = document.getElementById("ckWorkflow").checked;
	
	proxy.startDate = document.getElementById("txtStartDate").value;
	proxy.endDate = document.getElementById("txtEndDate").value;
	
	commStart();
	API_setNoticeBoardFiltersProxy_request(setNoticeBoardFiltersProxy_response, standardError, proxy);
}

function setNoticeBoardFiltersProxy_response(e)
{
	// no point in doing a commEnd followed by a commStart

	API_getNoticesSize_request(getNoticesSize_Response, standardError);
}

function getNoticesSize_Response(e)
{
	commEnd();
	noticeSize = e;	
	tableCount = Math.ceil(noticeSize/ tableSize);

	getNotices();
}

function initPageVarible()
{
	k = 0;

	btnPrevious.disabled = true;
	btnFirst.disabled = true;
	btnNext.disabled = true;
	btnLast.disabled = true;
	btnDelete.disabled = true;
	btnMarkForRead.disabled = true;
}

function getNotices()
{
	var iStart = 0;
	var iEnd = 0;		

	if(noticeSize != 0)
	{	
		if( k == 0 )
		{
			btnFirst.disabled = true;
			btnPrevious.disabled = true;
		}
		else
		{
			btnFirst.disabled = false;
			btnPrevious.disabled = false;
		}

		pageCount.innerHTML = "Page " + ( k + 1) + " - " + tableCount;
		leftsize = noticeSize - (k * tableSize);
			
		if(leftsize > tableSize)
		{
			btnNext.disabled = false;
			btnLast.disabled = false;

			iStart = k * tableSize + 1;
			iEnd = k * tableSize + tableSize;
		}
		else
		{
			btnNext.disabled = true;
			btnLast.disabled = true;

			iStart = k * tableSize + 1;
			iEnd = k * tableSize + leftsize + 1;
		}

		commStart();
		API_getNotices_request(getNotices_response, standardError, iStart, iEnd);
	}
	else
	{
		var tBody = tblNotices.tBodies[0];

		var row, cell;
		for (var i = 0; i < tableSize; i++)
		{
			row = tBody.rows[i];
			row.className = "odd";

			row.onclick = function(){};
			row.ondblclick= function(){};	

			row.onmouseover = function(){};
			row.onmouseout = function(){};

			for (var j = 0; j < 6; j++)
				{
				cell = row.cells[j];
				cell.innerHTML = "&nbsp;";
				cell.style.color = "";
				cell.style.backgroundColor = "";
				}
		}	
		pageCount.innerHTML = "Page 0 - " + tableCount;
	}
}

function getNotices_response(aNotices)
{
	commEnd();
	//var PRN;
	var row, cell, img, text;
	var sRowClass, sLastCellClass;
	var tBody = tblNotices.tBodies[0];
	for (var i = 0; i < aNotices.length; i++)
	{ 
		PRN = aNotices[i];
		poidArr[i]= PRN.noticeOID;

		if (PRN.readStatus == "false")
		{
			sRowClass = "bold";
			sLastCellClass = "cellLast_bold";
		}
		else
		{
			sRowClass = "normal";
			sLastCellClass = "cellLast_normal";
		}

		row = tBody.rows[i];

		row.setAttribute("oid", poidArr[i]);
		row.setAttribute("selected", "false");

		row.onclick = function(){selectTableRow(this, this.getAttribute("oid"));};
		row.ondblclick= function(){openNotice(this.getAttribute("oid"));};	
		//row.onmouseover = function(){if(this.selected=="false"){this.style.backgroundColor = "#b9c5ff";}};
		row.onmouseover = function(){if(this.selected=="false"){this.className = "mouseOver";}};

		if ((i % 2) == 0)
		{	
			row.className = "odd";
			if(row.selected=="false"){row.style.backgroundColor = "transparent"; };
			//row.onmouseout = function(){if(this.selected=="false"){this.style.backgroundColor = "transparent";}};
			row.onmouseout = function(){if(this.selected=="false"){this.className = "odd";}};
		}
		else
		{
			row.className = "even";
			if(row.selected=="false"){row.style.backgroundColor = "#dfe4ff"; };
			//row.onmouseout = function(){if(this.selected=="false"){this.style.backgroundColor = "#dfe4ff"; }};
			row.onmouseout = function(){if(this.selected=="false"){this.className = "even";}};
		}

		// img
		cell = row.cells[0];
		cell.className = sRowClass;
		cell.innerText = "";
		
		img = document.createElement("img");
		img.setAttribute('src', getImage(PRN.type));
		cell.appendChild(img);
		
		// title
		cell = row.cells[1];
		cell.className = sRowClass;
		cell.innerHTML = PRN.title != ""? PRN.title : "&nbsp;";

		// urgency
		cell = row.cells[4];
		cell.className = sRowClass;
		cell.style.color = "#000";
		cell.style.backgroundColor = getUrgencyColour(PRN.urgency);
		cell.innerHTML = PRN.urgency != ""? PRN.urgency : "&nbsp;";
		
		// sending user
		cell = row.cells[2];
		cell.className = sRowClass;
		cell.innerHTML = PRN.sendingUser != ""? PRN.sendingUser : "&nbsp;";
		
		// creation date
		cell = row.cells[3];
		cell.className = sRowClass;
		cell.innerHTML = PRN.creationDate != ""? "&nbsp;" + PRN.creationDate : "&nbsp;";

		// deadline date
		cell = row.cells[5];
		cell.className = sLastCellClass;
		cell.style.color = "#000";
		cell.innerHTML = PRN.deadlineDate != ""? PRN.deadlineDate : "None";
		cell.style.backgroundColor = PRN.deadlineDateColour != "#FFFFFF"? PRN.deadlineDateColour : "transparent";
	}

	//clean up the rest
	if ( k == tableCount - 1 )
	{
		if( aNotices.length == 0)
		{
			for (var i = 0; i < tableSize; i++)
			{
				row = tBody.rows[i];
				poidArr[i] = "";

				//row.bgColor = "transparent";
				row.className = "odd";

				row.onclick = function(){};
				row.ondblclick= function(){};	

				row.onmouseover = function(){};
				row.onmouseout = function(){};

				for (var j = 0; j < 6; j++)
				{
					cell = row.cells[j];
					cell.innerHTML = "&nbsp;";
					cell.style.color = "";
					cell.style.backgroundColor = "";
				}
			}
		}
		else
		{
			for (var i = aNotices.length; i < tableSize; i++)
			{
				row = tBody.rows[i];
				poidArr[i] = "";

				//row.bgColor = "transparent";
				row.className = "odd";

				row.onclick = function(){};
				row.ondblclick= function(){};	

				row.onmouseover = function(){};
				row.onmouseout = function(){};

				for (var j = 0; j < 6; j++)
				{
					cell = row.cells[j];
					cell.innerHTML = "&nbsp;";
					cell.style.color = "";
					cell.style.backgroundColor = "";
				}
			}
		}
	}
}//end 

function getUrgencyColour(urgency)
{
	if (urgency <= 33)
	{
		return "#00FF00";
	}
	else if (urgency <= 66)
	{
		return "FFFF00";
	}
	else
	{
		return "FF0000";
	}
}

function getImage(noticeType)
{
	if ( noticeType == "Security Notice")
		return "img/nb_sec.gif";
	else if ( noticeType == "Archive Notice")
		return "img/nb_arc.gif";
	else if ( noticeType == "Contact Action Notice")
		return "img/nb_con_act.gif";
	else if ( noticeType == "Document Action Message Notice")
		return "img/nb_doc_act_msg.gif";
	else if ( noticeType == "Contact Action Message Notice")
		return "img/nb_con_act_msg.gif";
	else if ( noticeType == "Document Action Notice")
		return "img/nb_doc_act.gif";
	else if ( noticeType == "Version Control Notice")
		return "img/nb_doc_ver.gif";
	else if ( noticeType == "Workflow Task Notice")
		return "img/nb_wrk_asi.gif";	
	else if ( noticeType == "Workflow Status Notice")
		return "img/nb_wrk_own.gif";
	else if ( noticeType == "Workflow Message Notice")
		return "img/nb_wrk_msg.gif";
	else 
		return "img/nb_pos_rom.gif";
}

function sortType()
{
	bAscending = !bAscending;
	colSort ="Type";
	commStart();
	API_sortNoticeBoard_request(sortNoticeBoard_response, standardError, colSort, bAscending);
}

function sortUrgency()
{
	bAscending = !bAscending;
	colSort = "Urgency";
	commStart();
	API_sortNoticeBoard_request(sortNoticeBoard_response, standardError, colSort, bAscending);
}

function sortTitle()
{
	bAscending = !bAscending;
	colSort = "Title";
	commStart();
	API_sortNoticeBoard_request(sortNoticeBoard_response, standardError, colSort, bAscending);
}

function sortCreationDate()
{
	bAscending = !bAscending;
	colSort = "CreationDate";
	commStart();
	API_sortNoticeBoard_request(sortNoticeBoard_response, standardError, colSort, bAscending);
}

function sortSendingUser()
{
	bAscending = !bAscending;
	colSort = "SendingUser";
	commStart();
	API_sortNoticeBoard_request(sortNoticeBoard_response, standardError, colSort, bAscending);
}

function sortDeadline()
{
	bAscending = !bAscending;
	colSort = "Deadline";
	commStart();
	API_sortNoticeBoard_request(sortNoticeBoard_response, standardError, colSort, bAscending);
}

function sortNoticeBoard_response()
{
	commEnd();
	getInitNotices();
}

function checkDate()
{
	var dateExp = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
	var arrayExp1 = document.getElementById("txtStartDate").value.match(dateExp);
	var arrayExp2 = document.getElementById("txtEndDate").value.match(dateExp);
	if(!arrayExp1 || !arrayExp2 )
	{
		alert("Invalid Date style, please check the date entry.");
		return;
	}
}

function btnFirst_click()
{
	history.go(0);
}

function btnPrevious_click()
{
	var eaRows = tblNotices.getElementsByTagName("tr");

	if (eaRows != null && eaRows.length > 0)
	{	
		for (var i = 0; i < eaRows.length; i++)
		{
			if ((i%2) == 0)
			{
				eaRows[i].className = "even";
			} 
			else
			{
				eaRows[i].className = "odd";
			}
		}
	}
	k--;
	getNotices();
}

function btnNext_click()
{
	clearSelectedNotice();
	k++;
	getNotices();


}

function btnLast_click()
{
	clearSelectedNotice();
	k= tableCount-1;
	getNotices();
}

function btnDelete_click()
{	
	var deleteConfirm= confirm("Do you really want to delete this notice?");
	if (deleteConfirm == true)
	{
		commStart();
		API_deleteNotice_request(deleteNotice_response, standardError, currentNotice);
	}
}

function deleteNotice_response(e)
{
	commEnd();
	
	getInitNotices();
}

function btnMarkForRead_click()
{
	clearSelectedNotice();
	commStart();
	API_setNoticeReadUnreadStatus_request(setNoticeReadUnreadStatus_response, standardError, currentNotice);
}

function setNoticeReadUnreadStatus_response(e)
{
	commEnd();
	getInitNotices();
} 
	

function clearSelectedNotice()
{
	var eaRows = tblNotices.getElementsByTagName("tr");

	if (eaRows != null && eaRows.length > 0)
	{	
		for (var i = 0; i < eaRows.length; i++)
		{
			if (eaRows[i].className == "selectedRow")
			{
			    if ((i%2) == 0)
				{
				    eaRows[i].className = "even";
			    } 
			    else
				{
				    eaRows[i].className = "odd";
			    }
				    
				eaRows[i].selected = "false";
			}
		}
	}
}

function selectTableRow(pTableRow, poid)
{
	clearSelectedNotice();
	
	pTableRow.className = "selectedRow";
	pTableRow.selected = "true";
	
	commStart();

	API_getNoticeReadUnreadStatus_request(getNoticeReadUnreadStatus_response, standardError, poid);

	currentNotice = poid;
}

function getNoticeReadUnreadStatus_response(e)
{
	commEnd();

	if(e == "true"){
		btnMarkForRead.value = "Mark as Unread";
	}
	else
	{
		btnMarkForRead.value = "Mark as Read";
	}

	btnMarkForRead.disabled = false;
	btnDelete.disabled = false;
}


function openNotice(poid)
{
	window.status = "Opening the page..."
	commStart();
	API_getNoticeType_request(getNoticeType_response, standardError, poid);
	currentNotice = poid;
}

function getNoticeType_response(e)
{
	commEnd();
	if (e == "ContactActionNotice")
	{
		window.location = "contactActionDetails.html?CApoid=" + currentNotice;
	}

	else if ( e == "DocumentVersionNotice")
	{
		window.location = "docVersionDetail.html?noticeOID=" + currentNotice;
	}

	else if ( e == "DocumentActionNotice")
	{
		window.location = "docActionN.html?noticeOID=" + currentNotice;
	}
								
	else if ( e == "SimpleActionMessageNotice" )
	{
		var col = PRN.deadlineDateColour.slice(1,7);
		
		window.location = "forwardedNotice.html?noticeOID=" + currentNotice + "&holder=" + currentHolderName + "&dead=" + PRN.deadlineDate + "&urg=" + PRN.urgency + "&deadCol=" + col;
	}
	else if( e == "WorkflowOwnerNotice")
	{
		window.location = "workflowOwnerN.html?noticeOID=" + currentNotice;
	}
	else if ( e == "WorkflowAssignedNotice")
	{
		window.location = "workflowAssignedN.html?noticeOID=" + currentNotice;
	}
	else if ( e == "WorkflowMessageNotice")
	{
		window.location = "workflowMsgN.html?noticeOID="+ currentNotice;
	}
	else if ( e =="PostRoomNotice")
	{
		window.location = "postroomnotice.html?noticeOID="+ currentNotice;
	}
	else if ( e =="ArchiveNotice")
	{
		alert("This Notice type is not currently supported by the FileVision Web Client. Please use the FileVision Thin Client if you wish to view this Notice.");
		return;
	}
	else if ( e =="SecurityNotice")
	{
		alert("This Notice type is not currently supported by the FileVision Web Client. Please use the FileVision Thin Client if you wish to view this Notice.");
		return;
	}
	else if ( e == null)
	{
		window.alert("Not a docActionNotice. others coming soon.");
		return;
	}
}
