const https = require("https");
const host = "localhost";
const port = 8000;
const fs = require("fs");
// For ease of accessing each key/value pair we will use Node’s inbuilt querystring module to convert the data to an object:
const { parse } = require("querystring");

// SSL certificate and key
// I generated and used a selef signed certificate
// No certificate authority involved
// Notice that I'm reading the file synchrounously so that it blocks
// all other processes until it completes
const options = {
	key: fs.readFileSync("key.pem"),
	cert: fs.readFileSync("cert.pem"),
};
// Current Data
const names = [{ firstName: "Dancan", lastName: "Ngetich" }];

// Function listener for the https server
const requestListener = async (req, res) => {
	try {
		const methodType = req.method.toUpperCase();
		switch (methodType) {
			case "GET":
				const homePage = await readFile("./public/index.html");

				res.writeHead(200, {
					"Content-Type": "text/html",
					"Content-Length": homePage.length,
				});
				res.end(homePage);
				break;
			case "POST":
				checkContentType(req);
				getRequestandGiveResponse(req, res, postHandler);

				break;
			default:
				throw new Error("Resource not found");
		}
	} catch (error) {
		res.writeHead(500);
		res.end(error.message);
		return;
	}
};
// Creating our server instance
const server = https.createServer(options, requestListener);

server.listen(port, host, () => {
	console.log(`Server listening on https://${host}:${port}`);
});

// -----------------------------THESE ARE THE HELPER FUNCTIONS--------------------------
// -------------------Function to to handle post request and give a response
const getRequestandGiveResponse = (req, res, callback) => {
	let body = "";
	req.on("data", (chunk) => {
		body += chunk.toString();
	});
	req.on("end", () => {
		callback(res, parse(body));
	});
};
const postHandler = (res, body) => {
	try {
		let reqBody = body;
		addName(reqBody);
		let data = `We received ${reqBody.firstName} ${reqBody.lastName}`;

		res.writeHead(200, {
			"Content-Type": "text/html",
			"Content-Length": data.length,
		});
		res.end(data);
	} catch (erro) {}
};

//-------------------------- check if content type is application/x-www-form-urlencoded: TO BE USED INSIDE
// SWITCH STATEMENT FOR CASE POST
const checkContentType = function (req) {
	const contentType = req.headers["content-type"];
	console.log("type:", contentType);

	if (!contentType.includes("application/x-www-form-urlencoded")) {
		throw new Error("Sorry we only support content type as json format.");
	}
};

// ----------------------------------------Function to read file inside async await  TO BE USED INSIDE
// SWITCH STATEMENT FOR CASE get
const readFile = (fileName) => {
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, (err, data) => {
			if (err) {
				return reject(err);
			}

			resolve(data);
		});
	});
};
// -------------------function to add name when a post request is made: TO BE USED INSIDE THE postHandler()
const addName = (name) => {
	names.push(name);
};
