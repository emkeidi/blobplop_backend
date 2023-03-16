const { listen } = require('./app');

const port = process.env.PORT || 5000;
listen(port, () => {
	/* eslint-disable no-console */
	console.log(`Listening: http://localhost:${port}`);
	/* eslint-enable no-console */
});
