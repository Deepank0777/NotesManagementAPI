const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;

const notesSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  attachment_ref: [String],
  reminder_time: {
    type: Number,
  },
  reminder_status: {
    type: String,
  },
}, { collection: 'NotesSchema', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Notes', notesSchema);
