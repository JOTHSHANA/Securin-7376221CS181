const express = require("express");
const router = express.Router();

const cpeController = require("../controllers/cpe");


router.get("/", cpeController.getAllCPEs);
router.get("/search", cpeController.searchCPEs);
router.get("/import", cpeController.importCPEData);

module.exports = router



