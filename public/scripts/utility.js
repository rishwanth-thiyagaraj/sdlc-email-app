let sortedList;
/**
 * Get the element with the argument id.
 *
 * @param {string} id
 * @return {Element} HTML element with the given id.
 */
function getElement(id) {
	return document.getElementById(id);
}

/**
 * Display the proper window after certain actions.
 * Example: Display the email page after successful login.
 *
 * @param {Element} active The section to be displayed.
 * @param {Element} inactive The section to be hidden.
 */
function redirectWindow(active, inactive) {
	inactive.classList.add("inactive");
	active.classList.remove("inactive");
}

/**
 * Highlight the selected email with different style.
 *
 * @param {string} id ID of the selected email.
 */
function highlightEmail(id) {
	for (let i = 0; i < emailsContainer.childNodes.length; i++) {
		if (emailsContainer.childNodes[i].classList)
			emailsContainer.childNodes[i].classList.remove("selected");
	}
	getElement(id).classList.add("selected");
}
function sortByCriteria(list, criteria) {
	list.sort((a, b) => {
		let fa = a[criteria].toLowerCase(),
			fb = b[criteria].toLowerCase();
		return fb > fa ? 1 : -1;
	});
	return list;
}
/**
 * Display the emails of a respective tab when a tab is clicked.
 *
 * @param {string} tab The name of the tab.
 */
function updateMails(filterObject, tab, sortValue) {
	if (sortValue == "sortByTime") {
		sortedList = UserData[tab].slice();
	} else if (sortValue == "sortByName") {
		sortedList = UserData[tab].slice();
		if (tab == "sent" || tab == "trash") {
			sortedList = sortByCriteria(sortedList, "to");
		} else {
			sortedList = sortByCriteria(sortedList, "from");
		}
	}
	if (filterObject) {
		sortedList = sortedList.filter((element) => {
			return element[filterObject.filterOption] == filterObject.filterValue;
		});
	}
	emailsContainer.replaceChildren();
	if (UserData[tab].length != 0) {
		for (let i = 0; i < sortedList.length; i++) {
			let senderInfo = document.createElement("div"),
				message = document.createElement("div"),
				name = document.createElement("div"),
				date = document.createElement("div"),
				subject = document.createElement("div"),
				email = document.createElement("div");
			message.className = "message";
			name.className = "name";
			date.className = "date";
			subject.className = "subject";
			senderInfo.className = "sender-info";
			email.className = "short-message";
			if (tab == "inbox") {
				name.innerText = sortedList[i].from;
			} else {
				if (sortedList[i].from == currentUserName)
					name.innerText = `>> ${sortedList[i].to}`;
				else name.innerText = sortedList[i].from;
			}
			subject.innerText = sortedList[i].subject;
			email.innerText = sortedList[i].message;
			date.innerText = sortedList[i].date;
			senderInfo.appendChild(name);
			senderInfo.appendChild(date);
			message.appendChild(senderInfo);
			message.appendChild(subject);
			message.appendChild(email);
			message.id = i;
			emailsContainer.appendChild(message);
		}
	} else {
		emailsContainer.innerHTML = `<h3>No messages yet</h3>`;
	}
}

/**
 * Fetch the data of the current user to update the contents of the page.
 *
 * @return {promise} Result of fetch i.e., If the data was fetched successfully or not.
 */
function getUserData() {
	let promise = new Promise((resolve, reject) => {
		fetch(`http://localhost:1234/userdata/?user=${currentUserName}`, {
			method: "GET",
		})
			.then((response) => resolve(response.json()))
			.catch((err) => {
				reject(err);
			});
	});
	return promise;
}

/**
 * Store the data fetched data in a variable.
 * Update the selected selected tab mails after storing the data.
 */
async function storeUserData() {
	let userData = await getUserData(username.value);
	UserData = JSON.parse(userData);
	updateMails(null, selectedTab, sortOption.value);
}

/**
 * Change the style of selected tab when clicked.
 *
 * @param {string} id ID of the selected tab.
 */
function selectTab(id) {
	inboxTab.classList.remove("selected");
	sentTab.classList.remove("selected");
	trashTab.classList.remove("selected");
	document.getElementById(id).classList.add("selected");
	selectedTab = id;
	stopDisplayEmail();
}

/**
 * Display the contents of the email when an email is clicked.
 *
 * @param {string} index ID of the email that has to be displayed.
 */
function displayEmail(index) {
	index = parseInt(index);
	let sender = getElement("sender"),
		recipient = getElement("recipient"),
		subject = getElement("email-subject"),
		emailContent = getElement("main-email-content");
	sender.value = sortedList[index].from;
	recipient.value = sortedList[index].to;
	subject.value = sortedList[index].subject;
	emailContent.innerHTML = sortedList[index].message;
}

/**
 * Nullify the contents of the displayed email when the tab is switched.
 *
 */
function stopDisplayEmail() {
	let sender = getElement("sender"),
		recipient = getElement("recipient"),
		subject = getElement("email-subject"),
		emailContent = getElement("main-email-content");
	sender.value = recipient.value = subject.value = emailContent.innerText = "";
}
