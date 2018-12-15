const moment 	 = require('moment');
const CronJob 	 = require('cron').CronJob;
const NotesModel = require('../models/NotesModel.js');

new CronJob('* * * * * *', (() => {
  NotesModel.findOne({ reminder_status: 'on', reminder_time: moment().format('X') }, (err, notes) => {
  	if (err) logger.error(`error reading reminders where err is ${err.message}`);
  	if (notes) {
  		notes.reminder_status = 'off';
  		notes.save((err) => {
  			logger.info(`Reminder status of notes with id ${notes._id} has been OFF`);
  		});
  	}
  });
}), null, true, 'Asia/Kolkata');
