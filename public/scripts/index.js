const login = getElement("login-form"),
	register = getElement("register-form"),
	signupRedirectButton = getElement("signup-redirect-button"),
	loginRedirectButton = getElement("login-redirect-button"),
	loginWindow = getElement("login-window"),
	registerWindow = getElement("register-window"),
	composeWindow = getElement("compose-window"),
	emailWindow = getElement("email-window"),
	composeButton = getElement("compose"),
	composeForm = getElement("compose-mail-form"),
	inboxTab = getElement("inbox"),
	sentTab = getElement("sent"),
	trashTab = getElement("trash"),
	emailsContainer = getElement("view-emails"),
	refreshButton = getElement("refresh"),
	deleteButton = getElement("delete"),
	logoutButton = getElement("logout"),
	closeComposeButton = getElement("close-compose"),
	closeFilterButton = getElement("close-filter"),
	sortOption = getElement("sort-options"),
	filterButton = getElement("filter"),
	filterWindow = getElement("filter-window"),
	filterForm = getElement("filter-form"),
	filterOption = getElement("filter-options"),
	filterValue = getElement("filter-value");
var currentUserName = "",
	currentUserData,
	UserData = {},
	selectedTab = "inbox",
	selectedEmail;

/**
 * Display the contents of the email when an email is clicked.
 * Highlight the clicked email.
 *
 * @param {Event} event The triggered click event.
 */
const selectEmail = (event) => {
	if (event.target.parentNode.className == "message") {
		selectedEmail = parseInt(event.target.parentNode.id);
		displayEmail(event.target.parentNode.id);
		highlightEmail(event.target.parentNode.id);
	} else if (event.target.className == "message") {
		selectedEmail = parseInt(event.target.id);
		displayEmail(event.target.id);
		highlightEmail(event.target.id);
	}
};

/**
 * Display the filter criteria window to enter the basis to filter mails.
 *
 * */
filterButton.addEventListener("click", () => {
	filterWindow.classList.remove("inactive");
	filterValue.value = "";
});

/**
 * Change the sort order of the mails when a sort option is selected.
 *
 * */
sortOption.addEventListener("change", () => {
	updateMails(null, selectedTab, sortOption.value);
});

/**
 * Delete email from a particular tab when an email is selected and delete button is clicked.
 * Deleted email is moved to trash. If deleted from trash it is deleted permanantly.
 *
 * */
deleteButton.addEventListener("click", () => {
	fetch("http://localhost:1234/deletemessage", {
		method: "POST",
		headers: {
			Accept: "application/json, text/plain,*/*",
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			tab: selectedTab,
			username: currentUserName,
			index: selectedEmail,
		}),
	}).then((data) => {
		if (data.ok) {
			alert("Message Deleted");
			storeUserData();
			stopDisplayEmail();
		}
	});
});

/**
 * Display the emails in inbox after retrieving data from server and highlight the inbox tab.
 *
 * */
inboxTab.addEventListener("click", () => {
	selectTab("inbox");
	storeUserData();
});

/**
 *Display the emails in sent after retrieving data from server and highlight the sent tab.
 *
 * */
sentTab.addEventListener("click", () => {
	selectTab("sent");
	storeUserData();
});

/**
 *Display the emails in trash after retrieving data from server and highlight the trash tab.
 *
 * */
trashTab.addEventListener("click", () => {
	selectTab("trash");
	storeUserData();
});

/**
 * Update the selected tab's emails by retrieving latest data from the server.
 *
 * */
refreshButton.addEventListener("click", () => {
	selectTab(selectedTab);
	storeUserData();
});

/**
 * Redirect to login window when logout button is clicked and remove stored data of last user.
 *
 * */
logoutButton.addEventListener("click", () => {
	redirectWindow(loginWindow, emailWindow);
	currentUserName = "";
	UserData = {};
	getElement("username").value = "";
	getElement("password").value = "";
});

/**
 * Redirect to email window when a user successfully logs in with right credentials.
 * The credentials are checked with the data in the server.
 *
 * */
login.addEventListener("submit", (e) => {
	const username = getElement("username"),
		password = getElement("password");
	e.preventDefault();
	fetch("http://localhost:1234/login", {
		method: "POST",
		headers: {
			Accept: "application/json, text/plain,*/*",
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			username: username.value,
			password: password.value,
		}),
	})
		.then((data) => {
			if (data.status == 404) {
				alert("Invalid username or password");
			} else if (data.status == 400) {
				alert("User not found.\nPlease signup to continue ");
			} else {
				alert("Login successful");
				currentUserName = username.value;
				redirectWindow(emailWindow, loginWindow);
				stopDisplayEmail();
				storeUserData();
				let currentUser = getElement("user");
				currentUser.innerText = currentUserName;
			}
		})
		.catch((err) => console.log(err));
});

/**
 * Send the data given by the user to server as a request to store the data.
 * Redirect the user to login window.
 *
 * */
register.addEventListener("submit", (e) => {
	e.preventDefault();
	let newUsername = getElement("new-username"),
		newPassword = getElement("new-password"),
		confirmPassword = getElement("confirm-password");
	if (newPassword.value !== confirmPassword.value) {
		confirmPassword.setCustomValidity("Passwords Do Not Match");
	} else {
		fetch("http://localhost:1234/register", {
			method: "POST",
			headers: {
				Accept: "application/json, text/plain,*/*",
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				newusername: newUsername.value,
				newpassword: newPassword.value,
				confirm: confirmPassword.value,
			}),
		})
			.then((data) => {
				if (!data.ok) {
					alert("Existing user");
				} else {
					alert("Registration successful");
					redirectWindow(loginWindow, registerWindow);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
});

/**
 * Highlight the email that is clicked on and display it.
 *
 * */
emailsContainer.addEventListener("click", selectEmail);

/**
 * Close the compose window when it's close button is clicked.
 *
 * */
closeComposeButton.addEventListener("click", (e) => {
	e.preventDefault();
	composeWindow.classList.add("inactive");
});

/**
 * Close the filter window when it's close button is clicked.
 *
 * */
closeFilterButton.addEventListener("click", (e) => {
	e.preventDefault();
	filterWindow.classList.add("inactive");
});

/**
 * Open the compose mail window to get the details of the email that is to be transferred.
 *
 * */
composeButton.addEventListener("click", (e) => {
	e.preventDefault();
	composeWindow.classList.remove("inactive");
	let from = getElement("from"),
		to = getElement("to"),
		subject = getElement("subject"),
		message = getElement("email-content");
	from.value = currentUserName;
	to.value = "";
	subject.value = "";
	message.value = "";
});

/**
 * Display the filtered emails when the filter criteria is submitted by the user.
 *
 * */
filterForm.addEventListener("submit", (e) => {
	e.preventDefault();
	updateMails(
		{ filterOption: filterOption.value, filterValue: filterValue.value },
		selectedTab,
		sortOption.value
	);
	stopDisplayEmail();
	filterWindow.classList.add("inactive");
});

/**
 * Send the email details to the server to store the emails in both user's
 * inbox and sent tabs respectively.
 *
 * */
composeForm.addEventListener("submit", (e) => {
	e.preventDefault();
	redirectWindow(emailWindow, composeWindow);
	let date = new Date();
	let dateFormat = date.getDate() + "/" + date.getMonth();
	let from = getElement("from"),
		to = getElement("to"),
		subject = getElement("subject"),
		message = getElement("email-content");
	fetch("http://localhost:1234/sendmail", {
		method: "POST",
		headers: {
			Accept: "application/json, text/plain,*/*",
			"Content-type": "application/json",
		},
		body: JSON.stringify({
			from: from.value,
			to: to.value,
			subject: subject.value,
			message: message.value,
			date: dateFormat,
		}),
	})
		.then((data) => {
			if (!data.ok) {
				alert("Invalid recipient");
			} else {
				alert("Email sent successfully");
				storeUserData();
			}
		})
		.catch((err) => {
			console.log(err);
		});
});

/**
 * Redirect to register user window when sign up button is clicked in login window.
 *
 * */
signupRedirectButton.addEventListener("click", (e) => {
	e.preventDefault();
	redirectWindow(registerWindow, loginWindow);
});

/**
 * Redirect to log in window when login button is clicked in register window.
 *
 * */
loginRedirectButton.addEventListener("click", (e) => {
	e.preventDefault();
	redirectWindow(loginWindow, registerWindow);
});
