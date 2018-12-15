const moment = require('moment');
const NotesModel = require('../models/NotesModel.js');

// return timestamp for reminder time
function getReminderTimestamp(req) {
  return new Promise(((resolve, reject) => {
    let reminder_timestamp;
    if (req.body.reminder) {
      reminder_timestamp = moment(req.body.reminder).format('X');
    } else {
      // getting current timestamp
      reminder_timestamp = parseInt(moment().format('X'));
      reminder_timestamp = parseInt(moment().format('X')) + (parseInt(req.body.reminder_hr) || 0) * 3600
          + (parseInt(req.body.reminder_min) || 0) * 60 + (parseInt(req.body.reminder_sec) || 0) * 1;
    }
    if (reminder_timestamp >= moment().format('X')) {
      logger.info(`reminder set for  ${reminder_timestamp}  ${moment.unix(reminder_timestamp)}`);
      resolve(reminder_timestamp);
    } else {
      reject('can\'t set previous reminder ');
    }
  }));
}

// add new attachment during update notes process
function updateAddAttachments(req) {
  return NotesModel.findOneAndUpdate({ _id: req.params.id },
    { $push: { attachment_ref: req.attchmentPath } }).exec();
}

// remove attachment during update notes process
function updateRemoveAttachemnt(req) {
  return NotesModel.findOneAndUpdate({ _id: req.params.id },
    { $pull: { attachment_ref: req.body.removeAttachment } }).exec();
}
module.exports = {
  /**
     * NotesController.addNotes()
     */
  addNotes(req, res) {
    if (req.uploadError) return res.status(400).send('No file or Invalid file uploaded.');

    if (req.body.reminder || req.body.reminder_hr || req.body.reminder_min || req.body.reminder_sec) {
      getReminderTimestamp(req).then((timestamp) => {
        const notesModel = new NotesModel({
          title: req.body.title,
          description: req.body.description,
          attachment_ref: req.attchmentPath, // Managed in  middleware
          reminder_time: timestamp,
          reminder_status: 'on',
        });

        // create notes inside database
        notesModel.save((err, notesModel) => {
          if (err) {
            return res.status(500).json({
              status: 'failed',
              message: 'Error when creating Notes',
              error: err.message,
            });
          }
          return res.status(200).json({
            status: 'success',
            message: 'Notes Created successfully',
            data: notesModel,
          });
        });
      }).catch(err => res.status(400).json({
        status: 'failed',
        message: err,
      }));
    } else {
      const notesModel = new NotesModel({
        title: req.body.title,
        description: req.body.description,
        attachment_ref: req.attchmentPath,
      });

      // create notes inside database
      notesModel.save((err, notesModel) => {
        if (err) {
          return res.status(500).json({
            status: 'failed',
            message: 'Error when creating Notes',
            error: err.message,
          });
        }
        return res.status(200).json({
          status: 'success',
          message: 'Notes Created successfully',
          data: notesModel,
        });
      });
    }
  },
  /**
     * NotesController.readAllNotes()
     */
  readAllNotes(req, res) {
    // return res.sendFile(path.join(__dirname, '../uploads/9cece6931658443ab721f01ccc4ea33b'));
    const queryObj = {};

    if (req.query.reminder) {
      if (req.query.reminder == 'now') {
        queryObj.reminder_time = moment().format('X');
      } else {
        queryObj.reminder_status = req.query.reminder;
      }
    }

    if (req.query.title) queryObj.title = req.query.title;

    NotesModel.find(queryObj, (err, notes) => {
      if (err) {
        return res.status(500).json({
          Status: 'failed',
          Message: 'error reading notes',
          Error: err.message,
        });
      }

      if (!notes) {
        return res.status(404).json({
          Status: 'failed',
          Message: 'Notes not Found !',
        });
      }

      return res.status(200).json({
        Status: 'success',
        Message: 'Requested Notes',
        Data: notes,
      });
    });
  },
  /**
     * NotesController.readNotes()
     */
  readNotes(req, res) {
    // return res.sendFile(path.join(__dirname, '../uploads/9cece6931658443ab721f01ccc4ea33b'));
    NotesModel.find({ _id: req.params.id }, (err, notes) => {
      if (err) {
        return res.status(500).json({
          Status: 'failed',
          Message: 'error reading notes',
          Error: err.message,
        });
      }

      if (!notes) {
        return res.status(404).json({
          Status: 'failed',
          Message: 'Notes not Found !',
        });
      }

      logger.info(moment.unix(notes.reminder_time));

      return res.status(200).json({
        Status: 'success',
        Message: 'Required Notes',
        Data: notes,
      });
    });
  },

  /**
     * NotesController.deleteNotes()
     */
  deleteNotes(req, res) {
    NotesModel.findByIdAndRemove({ _id: req.params.id }, (err, result) => {
      if (err) {
        return res.status(500).json({
          Status: 'failed',
          Message: 'error deleting notes',
          Error: err.message,
        });
      }

      if (!result) {
        return res.status(404).json({
          Status: 'failed',
          Message: 'Notes with given id does not exist',
        });
      }

      return res.status(200).json({
        Status: 'success',
        Message: 'Notes Removed successfully',
      });
    });
  },

  /**
     * NotesController.updateNotes()
     */
  updateNotes(req, res) {
    NotesModel.findOne({ _id: req.params.id }, (err, notes) => {
      if (err) {
        return res.status(500).json({
          Status: 'failed',
          Message: 'error getting notes',
          Error: err.message,
        });
      }

      if (!notes) {
        return res.status(404).json({
          Status: 'failed',
          Message: 'Notes with given id does not exist',
        });
      }

      if (req.body.reminder || req.body.reminder_hr || req.body.reminder_min || req.body.reminder_sec) {
        Promise.all([updateAddAttachments(req), updateRemoveAttachemnt(req), getReminderTimestamp(req)])
          .then((data) => {
            logger.info(`update timestamp ${data[2]}`);
            notes.reminder_status = 'off';
            notes.reminder_time = data[2];
            notes.title = req.body.title || notes.title;
            notes.description = req.body.description || notes.description;

            notes.save((err, updatedNotes) => {
              if (!updatedNotes) {
                return res.status(400).json({
                  Status: 'failed',
                  Message: 'Update failed',
                });
              }

              return res.status(200).json({
                Status: 'success',
                Message: 'Notes Updated successfully',
                UpdatedNotes: updatedNotes,
              });
            });
          }).catch(err => res.status(400).json({
            status: 'failed',
            message: err,
          }));
      } else {
        Promise.all([updateAddAttachments(req), updateRemoveAttachemnt(req)]).then(() => {
          notes.title = req.body.title || notes.title;
          notes.description = req.body.description || notes.description;

          notes.save((err, updatedNotes) => {
            if (!updatedNotes) {
              return res.status(400).json({
                Status: 'failed',
                Message: 'Update failed',
              });
            }

            return res.status(200).json({
              Status: 'success',
              Message: 'Notes Updated successfully',
            });
          });
        });
      }
    });
  },

};
