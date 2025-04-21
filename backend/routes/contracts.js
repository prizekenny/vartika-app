import express from "express";
import {
  getAllContracts,
  getContractById,
  getContractsByUserId,
  createContract,
  updateContract,
  deleteContract,
  updateContractStatus,
  getExpiringContracts,
  getTopValueClients,
  getActiveContracts,
  getDraftContracts,
  getNewBusinesses,
  getContractAmountDistribution,
  getContractStatusDistribution,
} from "../services/contractService.js";

const router = express.Router();

/**
 * @route   GET /api/contracts/expiring/soon
 * @desc    Get contracts that are about to expire
 * @access  Private
 */
router.get("/expiring/soon", async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const contracts = await getExpiringContracts(parseInt(limit));
    res.json(contracts);
  } catch (error) {
    console.error("Failed to get expiring contracts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/contracts/clients/top-value
 * @desc    Get top value clients
 * @access  Private
 */
router.get("/clients/top-value", async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const clients = await getTopValueClients(parseInt(limit));
    res.json(clients);
  } catch (error) {
    console.error("Failed to get top value clients:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/contracts/stats/active
 * @desc    Get active contracts statistics
 * @access  Private
 */
router.get("/stats/active", async (req, res) => {
  try {
    const stats = await getActiveContracts();
    res.json(stats);
  } catch (error) {
    console.error("Failed to get active contracts statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/contracts/stats/draft
 * @desc    Get draft contracts statistics
 * @access  Private
 */
router.get("/stats/draft", async (req, res) => {
  try {
    const stats = await getDraftContracts();
    res.json(stats);
  } catch (error) {
    console.error("Failed to get draft contracts statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/contracts/stats/new-businesses
 * @desc    Get new businesses statistics
 * @access  Private
 */
router.get("/stats/new-businesses", async (req, res) => {
  try {
    const stats = await getNewBusinesses();
    res.json(stats);
  } catch (error) {
    console.error("Failed to get new business statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/contracts/stats/amount-distribution
 * @desc    Get contract amount distribution statistics
 * @access  Private
 */
router.get("/stats/amount-distribution", async (req, res) => {
  try {
    const stats = await getContractAmountDistribution();
    res.json(stats);
  } catch (error) {
    console.error(
      "Failed to get contract amount distribution statistics:",
      error
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/contracts/stats/status-distribution
 * @desc    Get contract status distribution statistics
 * @access  Private
 */
router.get("/stats/status-distribution", async (req, res) => {
  try {
    console.log("Received request for contract status distribution");
    const distribution = await getContractStatusDistribution();
    res.json(distribution);
  } catch (error) {
    console.error("Failed to get contract status distribution:", error);
    res
      .status(500)
      .json({ message: "Failed to get contract status distribution" });
  }
});

/**
 * @route   GET /api/contracts
 * @desc    Get all contracts
 * @access  Private (Admin)
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const contracts = await getAllContracts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    res.json(contracts);
  } catch (error) {
    console.error("Failed to get all contracts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/contracts/:id
 * @desc    Get a single contract by ID
 * @access  Private
 */
router.get("/:id", async (req, res) => {
  try {
    const contract = await getContractById(req.params.id);
    res.json(contract);
  } catch (error) {
    console.error("Failed to get contract details:", error);
    if (error.message === "Contract not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   GET /api/contracts/user/:userId
 * @desc    Get all contracts for a user
 * @access  Private
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const contracts = await getContractsByUserId(req.params.userId);
    res.json(contracts);
  } catch (error) {
    console.error("Failed to get user contracts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   POST /api/contracts
 * @desc    Create a new contract
 * @access  Private
 */
router.post("/", async (req, res) => {
  try {
    // Validate required fields
    const { user_id, subject, content, amount, start_date, expiration_date } =
      req.body;

    if (
      !user_id ||
      !subject ||
      !content ||
      !amount ||
      !start_date ||
      !expiration_date
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate amount is positive
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const expirationDate = new Date(expiration_date);

    if (isNaN(startDate.getTime()) || isNaN(expirationDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (startDate >= expirationDate) {
      return res
        .status(400)
        .json({ message: "Start date must be earlier than expiration date" });
    }

    const newContract = await createContract(req.body);
    res.status(201).json(newContract);
  } catch (error) {
    console.error("Failed to create contract:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   PUT /api/contracts/:id
 * @desc    Update a contract
 * @access  Private
 */
router.put("/:id", async (req, res) => {
  try {
    const contractId = req.params.id;

    // Validate dates
    if (req.body.start_date && req.body.expiration_date) {
      const startDate = new Date(req.body.start_date);
      const expirationDate = new Date(req.body.expiration_date);

      if (isNaN(startDate.getTime()) || isNaN(expirationDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      if (startDate >= expirationDate) {
        return res
          .status(400)
          .json({ message: "Start date must be earlier than expiration date" });
      }
    }

    // Validate amount
    if (
      req.body.amount &&
      (isNaN(req.body.amount) || parseFloat(req.body.amount) <= 0)
    ) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    const updatedContract = await updateContract(contractId, req.body);
    res.json(updatedContract);
  } catch (error) {
    console.error("Failed to update contract:", error);
    if (error.message === "Contract not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   DELETE /api/contracts/:id
 * @desc    Delete a contract
 * @access  Private
 */
router.delete("/:id", async (req, res) => {
  try {
    await deleteContract(req.params.id);
    res.json({ message: "Contract successfully deleted" });
  } catch (error) {
    console.error("Failed to delete contract:", error);
    if (error.message === "Contract not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route   PATCH /api/contracts/:id/status
 * @desc    Update contract status
 * @access  Private
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Missing status field" });
    }

    if (!["Accept", "Pending", "Active", "Expired"].includes(status)) {
      return res.status(400).json({ message: "Invalid contract status" });
    }

    const updatedContract = await updateContractStatus(req.params.id, status);
    res.json(updatedContract);
  } catch (error) {
    console.error("Failed to update contract status:", error);
    if (error.message === "Contract not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
