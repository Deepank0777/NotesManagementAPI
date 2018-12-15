const express =	require('express');
const multer = require('multer');

const router = express.Router();

const NotesController = require('../controllers/NotesController.js');


// Handle Files in uploads folder
const upload = multer({
  dest: 'uploads/',
  limits: {
  	fileSize: 10 * 1024 * 1024, // no larger than 10mb
  },
}).any();

function uploadMiddleware(req, res, next) {
  upload(req, res, (err) => {
    req.uploadError = err;
    	// getting uploaded files path
    req.attchmentPath = [];
    for (const i of req.files) {
      req.attchmentPath.push(i.filename);
    }
    return next();
  });
}
/*
 * POST
 */
router.post('/create-notes', uploadMiddleware, NotesController.addNotes);
/*
 * GET
 */
router.get('/read-all-notes', NotesController.readAllNotes);
router.get('/read-notes/:id', NotesController.readNotes);
/*
 * DELETE
 */
router.delete('/delete-notes/:id', NotesController.deleteNotes);
/*
 * PUT(UPDATE)
 */
router.put('/update-notes/:id', uploadMiddleware, NotesController.updateNotes);

module.exports = router;
