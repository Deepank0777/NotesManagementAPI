const request = require('request');

module.exports = {
  log_request(req) {
    	const payload = {};
    	payload.date 	= new Date().toUTCString();
    	payload.headers = req.headers;
    	payload.query 	= req.query;
    	payload.params = req.params;
    	payload.body = req.body;
    	logger.info(payload);
  },
  httpRequest(options) {
	    return new Promise(((resolve, reject) => {
	        request(options, (err, res, body) => {
	            err ? reject(err) : resolve(body);
	        });
	    }));
  },
  getTime(offset, date = new Date()) {
    // example : getTime('+5.5') will return Asia/Kolkata
    	utc 		= 	date.getTime() + (date.getTimezoneOffset() * 60000);
	    offsetTime 	= 	new Date(utc + (3600000 * offset));

	    // return time as a string
	    return offsetTime.toLocaleString();
  },

};
