// REQUIRES ============================================================
const { Router } = require("express");
const { inventoryController } = require("../controllers");

// CONSTANTS ===========================================================
const inventoryRouter = new Router({mergeParams:true});

// REQUEST DEFINITIONS =================================================
inventoryRouter.get("/getall", inventoryController.getAllInventories);
inventoryRouter.get("/getinventoryslots", inventoryController.getInventorySlots);
inventoryRouter.get("/gettodaysinventory", inventoryController.getTodaysInventory);
inventoryRouter.get("/getinventorycounts", inventoryController.getRangeBasedInventory);
inventoryRouter.post("/add", inventoryController.createNewInventory);


// EXPORTS =============================================================
module.exports = inventoryRouter;