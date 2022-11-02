//Import necessary modules for server creation
const express = require("express");
const fs = require("fs");
const bp = require("body-parser");
const app = express();
const port = process.env.port || 1234;
let emails = {
	inbox: [],
	sent: [],
	trash: [],
};
emails = JSON.stringify(emails);

// Render static files such as images,CSS and JS from "public" folder.
app.use(express.static("public"));

// Render HTML file when "/index.html" is requested in URL.
app.use("/index(.html)?", express.static(__dirname + "/public"));

// Transform JSON input into Javascript-accessible variables
app.use(bp.json());

/* Transform URL encoded request into Javascript-accessible variables under request.body
 * body-parser's extended property is set to false to make sure it only accepts strings and arrays.
 */
app.use(bp.urlencoded({ extended: false }));

// Load HTML file when server is loaded without any request.
app.get("/", (request, response) => {
	response.sendFile("index.html");
});

/* Validate username of the user when user logs in by checking if the user is already registered.
 * If the person is not an existing user return a message asking the person to register.
 * If the person is an existing user validate username with password.
 * If successful return success message otherwise return error message.
 */
app.post("/login", (request, response) => {
	let userList = fs.readFileSync("users.json", "utf-8");
	userList = JSON.parse(userList);
	if (request.body.username in userList) {
		if (request.body.password === userList[request.body.username])
			response.json(request.body);
		else {
			response.status(404);
			response.json({ Error: "Not Found" });
		}
	} else {
		response.status(400);
		response.json({ Error: "User not found" });
	}
});

/* Add the name of the new user when a person fills and submits the registration form.
 * Create a new json file in the name of the user to store their emails.
 */
app.post("/register", (request, response) => {
	let userList = fs.readFileSync("users.json", "utf-8");
	userList = JSON.parse(userList);
	if (request.body.newusername in userList) {
		response.status(400).send({ message: "Name already in use" });
	} else {
		userList[request.body.newusername] = request.body.newpassword;
		userList = JSON.stringify(userList);
		fs.writeFileSync("./users.json", userList, "utf-8");
		fs.writeFileSync(`./${request.body.newusername}.json`, emails, "utf-8");
		response.status(200).send({ message: "Registered Successfully" });
	}
});

/* Validate if the receiver of the email is an existing user.
 * If not respond with bad request and message of "Recipient not found".
 * If validated successfully add the email in sender's json file and receiver's json file.
 */
app.post("/sendmail", (request, response) => {
	let userList = fs.readFileSync("users.json", "utf-8");
	userList = JSON.parse(userList);
	if (!request.body.to in userList) {
		response.status(400).send({ message: "Recipient not found" });
	} else {
		let sender = fs.readFileSync(`${request.body.from}.json`, "utf-8");
		let receiver = fs.readFileSync(`${request.body.to}.json`, "utf-8");
		sender = JSON.parse(sender);
		receiver = JSON.parse(receiver);
		sender.sent.push(request.body);
		receiver.inbox.push(request.body);
		sender = JSON.stringify(sender);
		receiver = JSON.stringify(receiver);
		fs.writeFileSync(`${request.body.from}.json`, sender, "utf-8");
		fs.writeFileSync(`${request.body.to}.json`, receiver, "utf-8");
		response.json({ message: "Message Transferred" });
	}
});

// Send the user's data from their respective json file with inbox,sent and trash emails.
app.get("/userdata", (request, response) => {
	let user = request.query.user;
	let userData = fs.readFileSync(`./${user}.json`);
	userData = JSON.parse(userData);
	userData = JSON.stringify(userData);
	response.json(userData);
});

/* Remove the selected message to be deleted from inbox or sent and add it in trash.
 * If the message is to be deleted from trash then delete it from the file permanantly.
 */
app.post("/deletemessage", (request, response) => {
	let username = request.body.username;
	let userData = fs.readFileSync(`./${username}.json`, "utf-8");
	userData = JSON.parse(userData);
	if (request.body.tab != "trash") {
		let tab = request.body.tab;
		let deleted = userData[tab][request.body.index];
		userData.trash.push(deleted);
		userData[tab].splice(parseInt(request.body.index), 1);
	} else if (request.body.tab === "trash") {
		userData.trash.splice(parseInt(request.body.index), 1);
	}
	userData = JSON.stringify(userData);
	fs.writeFileSync(`${username}.json`, userData, "utf-8");
	response.json({ message: "Message Deleted" });
});
app.listen(port);
